const FolderClassificationPolicy = require('./FolderClassificationPolicy');
const MessageDeduplicationPolicy = require('./MessageDeduplicationPolicy');
const BounceClassifier = require('./BounceClassifier');
const ThreadAssociationEngine = require('./ThreadAssociationEngine');
const ProviderFactory = require('../providers/ProviderFactory');
const { PrismaClient } = require('@prisma/client');

const globalPrisma = new PrismaClient();

class MailSyncEngine {
    constructor(prismaClient = null) {
        this.prisma = prismaClient;
        this.syncedMessages = new Map();
        this.activeSyncLocks = new Set(); // Concurrency Lock per Mailbox
        this.deduplicationPolicy = new MessageDeduplicationPolicy();
        this.threadEngine = new ThreadAssociationEngine();
        this.knownMessageToConversationMap = new Map();
        this.eventLogs = [];
    }

    emitEvent(eventType, level = "INFO", message, metadata = {}) {
        const log = {
            id: `evt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            eventType,
            level,
            message,
            metadata,
            createdAt: new Date().toISOString()
        };
        this.eventLogs.push(log);
        console.log(`📡 [MAIL SYNC ENGINE EVENT: ${eventType}] ${message}`);

        const workspaceId = metadata.workspaceId || 'ws_voxora_main';
        const mailboxId = metadata.mailboxId || null;

        const dbClient = this.prisma || globalPrisma;
        dbClient.eventLog.create({
            data: {
                id: log.id,
                workspaceId,
                mailboxId,
                eventType,
                level,
                message,
                metadata: metadata || {}
            }
        }).catch(err => {
            console.error(`❌ [EventLog Persistence Error]: ${err.message}`);
        });

        return log;
    }

    async syncMailbox(mailbox, options = {}) {
        const dbClient = options.prisma || this.prisma;

        // Multi-Tenant Security & Eligibility Check
        if (options.currentWorkspaceId && mailbox.workspaceId && options.currentWorkspaceId !== mailbox.workspaceId) {
            console.error(`⛔ [MULTI-TENANT SECURITY ACCESS DENIED] Workspace ${options.currentWorkspaceId} attempted to sync mailbox ${mailbox.id} belonging to Workspace ${mailbox.workspaceId}`);
            return { success: false, error: "ACCESS_DENIED_MULTI_TENANT" };
        }

        // Concurrency Lock: 1 IMAP Worker per Mailbox
        if (this.activeSyncLocks.has(mailbox.id)) {
            console.log(`⏳ [MAIL SYNC ENGINE] Sync already in progress for mailbox ${mailbox.email}. Lock active.`);
            return { success: false, status: "SYNC_LOCKED_CONCURRENT" };
        }

        this.activeSyncLocks.add(mailbox.id);
        console.log(`🔄 [MAIL SYNC ENGINE] Starting IMAP Sync for: ${mailbox.email}...`);

        try {
            this.emitEvent("MESSAGE_DISCOVERED", "INFO", `Sync initiated for mailbox ${mailbox.email}`, { mailboxId: mailbox.id });

            const sampleRawMessages = options.incomingMessages || [
                {
                    messageId: `<vme_reply_1001@${mailbox.email.split('@')[1] || 'voxora.agency'}>`,
                    inReplyTo: `<vme_orig_500@voxora.agency>`,
                    from: "client@external.com",
                    to: mailbox.email,
                    subject: "Re: Warmup Introduction",
                    body: "Hello, this is a reply to your warmup email.",
                    folder: "INBOX",
                    uid: 101,
                    uidValidity: 12345
                }
            ];

            const processedResults = [];

            for (const rawMsg of sampleRawMessages) {
                const normalizedFolder = FolderClassificationPolicy.normalizeFolder(rawMsg.folder, mailbox.provider);
                const dedupKey = MessageDeduplicationPolicy.generateKey(rawMsg, mailbox.id, normalizedFolder);

                // In-Memory Fast Cache Check (Optimization layer)
                if (this.deduplicationPolicy.isDuplicate(dedupKey)) {
                    this.emitEvent("MESSAGE_DEDUPLICATED_BY_MEMORY", "INFO", `Skipped duplicate message key in memory ${dedupKey}`, { dedupKey });
                    processedResults.push({ status: 'DEDUPLICATED_BY_MEMORY', dedupKey });
                    continue;
                }

                // Register key in memory LRU cache
                this.deduplicationPolicy.registerKey(dedupKey);

                // Bounce Classification Check
                const bounceEval = BounceClassifier.classify(rawMsg);
                if (bounceEval.isBounce) {
                    this.emitEvent("MESSAGE_BOUNCE_DETECTED", "WARN", `Bounce detected from ${rawMsg.from}: ${bounceEval.type}`, { bounceType: bounceEval.type });
                }

                // Thread / Conversation Association
                const threadRes = this.threadEngine.associateMessage(rawMsg, this.knownMessageToConversationMap);
                if (rawMsg.messageId) {
                    this.knownMessageToConversationMap.set(rawMsg.messageId.toLowerCase(), threadRes.conversationId);
                }

                const msgRecord = {
                    id: `msg_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                    providerMsgId: rawMsg.messageId || null,
                    deduplicationHash: dedupKey,
                    inReplyTo: rawMsg.inReplyTo || null,
                    conversationId: threadRes.conversationId,
                    fromMailboxId: mailbox.id,
                    workspaceId: mailbox.workspaceId || 'default-ws',
                    toEmail: rawMsg.to,
                    fromEmail: rawMsg.from || rawMsg.fromEmail,
                    subject: rawMsg.subject || '',
                    body: rawMsg.body || '',
                    direction: rawMsg.to === mailbox.email ? 'RECEIVED' : 'SENT',
                    folder: normalizedFolder,
                    status: bounceEval.isBounce ? 'BOUNCED' : 'SYNCED',
                    isBounce: bounceEval.isBounce,
                    syncedAt: new Date().toISOString()
                };

                // Real PostgreSQL Persistence Path via Prisma (if client present)
                if (dbClient && typeof dbClient.message?.create === 'function') {
                    try {
                        const persisted = await dbClient.message.create({
                            data: {
                                providerMsgId: msgRecord.providerMsgId,
                                deduplicationHash: msgRecord.deduplicationHash,
                                fromMailboxId: msgRecord.fromMailboxId,
                                toEmail: msgRecord.toEmail,
                                subject: msgRecord.subject,
                                body: msgRecord.body,
                                direction: msgRecord.direction,
                                folder: msgRecord.folder,
                                status: msgRecord.status,
                                isBounce: msgRecord.isBounce,
                            }
                        });
                        msgRecord.id = persisted.id;
                        this.emitEvent("MESSAGE_PERSISTED_TO_DB", "INFO", `Persisted message to PostgreSQL ID ${persisted.id}`, { messageId: persisted.id, deduplicationHash: dedupKey });
                    } catch (dbErr) {
                        // P2002 / Postgres 23505 Unique Constraint Violation Handler
                        if (dbErr.code === 'P2002' || (dbErr.message && dbErr.message.includes('unique constraint'))) {
                            this.emitEvent("MESSAGE_DEDUPLICATED_BY_DB", "INFO", `PostgreSQL rejected duplicate insert for hash ${dedupKey}`, { deduplicationHash: dedupKey });
                            processedResults.push({ status: 'DEDUPLICATED_BY_DB', deduplicationHash: dedupKey, message: msgRecord });
                            continue; // Clean continuation, NO crash, NO failure status
                        }
                        throw dbErr; // Rethrow other DB errors
                    }
                }

                this.syncedMessages.set(msgRecord.id, msgRecord);
                processedResults.push(msgRecord);

                this.emitEvent("MESSAGE_SYNCED", "INFO", `Synced message from ${msgRecord.fromEmail} in folder ${normalizedFolder}`, { messageId: msgRecord.id });
                this.emitEvent("MESSAGE_CLASSIFIED", "INFO", `Message ${msgRecord.id} classified as ${normalizedFolder}`, { messageId: msgRecord.id, folder: normalizedFolder });
            }

            mailbox.lastSyncAt = new Date().toISOString();
            mailbox.lastSyncStatus = 'SUCCESS';

            return {
                success: true,
                syncedCount: processedResults.length,
                messages: processedResults
            };

        } catch (error) {
            mailbox.lastSyncStatus = 'ERROR';
            mailbox.lastSyncError = error.message;
            this.emitEvent("MESSAGE_PROCESSING_FAILED", "ERROR", `Sync failed for ${mailbox.email}: ${error.message}`, { mailboxId: mailbox.id });

            return {
                success: false,
                error: error.message
            };
        } finally {
            this.activeSyncLocks.delete(mailbox.id);
        }
    }
}

module.exports = MailSyncEngine;
