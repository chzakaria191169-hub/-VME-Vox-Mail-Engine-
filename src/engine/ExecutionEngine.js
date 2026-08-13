const ProviderFactory = require('../providers/ProviderFactory');
const RetryPolicy = require('./RetryPolicy');
const { PrismaClient } = require('@prisma/client');

const globalPrisma = new PrismaClient();


class ExecutionEngine {
    constructor(jobScheduler) {
        this.scheduler = jobScheduler;
        this.activeConnections = {
            global: 0,
            workspaces: new Map(),
            domains: new Map(),
            mailboxes: new Map()
        };

        // Hierarchical Concurrency Limits (Configurable)
        this.limits = {
            global: parseInt(process.env.GLOBAL_CONCURRENCY_LIMIT || "50", 10),
            workspace: parseInt(process.env.WORKSPACE_CONCURRENCY_LIMIT || "10", 10),
            domain: parseInt(process.env.DOMAIN_CONCURRENCY_LIMIT || "5", 10),
            mailbox: parseInt(process.env.MAILBOX_CONCURRENCY_LIMIT || "1", 10)
        };

        this.eventLogs = [];
        this.sentFolderMockStore = new Set(); // MOCKED Sent folder store for recovery tests
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
        console.log(`📡 [EXECUTION ENGINE EVENT: ${eventType}] ${message}`);

        const workspaceId = metadata.workspaceId || 'ws_voxora_main';
        const mailboxId = metadata.mailboxId || null;

        globalPrisma.eventLog.create({
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

    canAcquireConcurrencyLock(job, mailbox) {
        if (this.activeConnections.global >= this.limits.global) return false;
        
        const wsCount = this.activeConnections.workspaces.get(mailbox.workspaceId || 'default-ws') || 0;
        if (wsCount >= this.limits.workspace) return false;

        const domCount = this.activeConnections.domains.get(mailbox.domainId || 'default-domain') || 0;
        if (domCount >= this.limits.domain) return false;

        const mbCount = this.activeConnections.mailboxes.get(mailbox.id) || 0;
        if (mbCount >= this.limits.mailbox) return false;

        return true;
    }

    acquireConcurrencyLock(job, mailbox) {
        this.activeConnections.global++;
        
        const wsId = mailbox.workspaceId || 'default-ws';
        this.activeConnections.workspaces.set(wsId, (this.activeConnections.workspaces.get(wsId) || 0) + 1);

        const domId = mailbox.domainId || 'default-domain';
        this.activeConnections.domains.set(domId, (this.activeConnections.domains.get(domId) || 0) + 1);

        this.activeConnections.mailboxes.set(mailbox.id, (this.activeConnections.mailboxes.get(mailbox.id) || 0) + 1);
    }

    releaseConcurrencyLock(job, mailbox) {
        this.activeConnections.global = Math.max(0, this.activeConnections.global - 1);

        const wsId = mailbox.workspaceId || 'default-ws';
        this.activeConnections.workspaces.set(wsId, Math.max(0, (this.activeConnections.workspaces.get(wsId) || 1) - 1));

        const domId = mailbox.domainId || 'default-domain';
        this.activeConnections.domains.set(domId, Math.max(0, (this.activeConnections.domains.get(domId) || 1) - 1));

        this.activeConnections.mailboxes.set(mailbox.id, Math.max(0, (this.activeConnections.mailboxes.get(mailbox.id) || 1) - 1));
    }

    /**
     * Atomic Conditional Job Claiming
     * Only 1 worker can claim a PENDING/RETRYING job
     */
    atomicClaimJob(job, workerId = 'worker_1') {
        if (!['PENDING', 'RETRYING'].includes(job.status)) {
            return false;
        }

        job.status = 'RUNNING';
        job.claimedBy = workerId;
        job.startedAt = new Date().toISOString();
        job.leaseExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5-minute lease
        return true;
    }

    /**
     * IMAP Sent Folder Check for Message-ID Header Recovery
     */
    async verifyMessageInSentFolder(messageId) {
        return this.sentFolderMockStore.has(messageId);
    }

    async executeJob(job, mailbox, options = {}) {
        // 1. Check Concurrency Limits
        if (!this.canAcquireConcurrencyLock(job, mailbox)) {
            console.log(`⏳ [EXECUTION ENGINE] Concurrency limit reached for mailbox ${mailbox.email}. Job ${job.id} postponed.`);
            return { status: 'POSTPONED_CONCURRENCY' };
        }

        // 2. Atomic Job Claiming
        const claimed = this.atomicClaimJob(job, options.workerId || 'worker_1');
        if (!claimed) {
            console.log(`⚠️ [EXECUTION ENGINE] Atomic claim failed for job ${job.id} (Already claimed or invalid status: ${job.status}).`);
            return { status: 'NO_CLAIM', claimed: false };
        }

        this.acquireConcurrencyLock(job, mailbox);
        this.emitEvent("JOB_STARTED", "INFO", `Execution started for job ${job.id} by worker ${job.claimedBy}`, { jobId: job.id, mailboxId: mailbox.id });

        // 3. Generate Pre-Send RFC 5322 Message-ID (Preserve fixed Message-ID across retries)
        const messageId = job.messageId || `<vme_${job.id}_${Date.now()}@${mailbox.email.split('@')[1] || 'voxora.agency'}>`;
        job.messageId = messageId;

        // 4. Pre-Send Recovery Check: Verify if email was already delivered before sending
        if (job.retryCount > 0) {
            const alreadySent = await this.verifyMessageInSentFolder(messageId);
            if (alreadySent) {
                job.status = 'SUCCESS';
                job.completedAt = new Date().toISOString();
                this.emitEvent("MESSAGE_SENT_RECOVERED", "INFO", `Recovery check: Message-ID ${messageId} already present in Sent Folder! Skipping resend.`, { jobId: job.id });
                this.emitEvent("JOB_COMPLETED", "INFO", `Job ${job.id} completed via recovery`, { jobId: job.id });
                this.releaseConcurrencyLock(job, mailbox);
                return { status: 'SUCCESS_RECOVERED', job };
            }
        }

        try {
            this.emitEvent("MESSAGE_SEND_STARTED", "INFO", `Initiating SMTP send for ${mailbox.email}`, { jobId: job.id, messageId });

            // 5. Simulate execution or provider call
            if (options.forceCrashAfter250Ok) {
                // Simulate SMTP 250 OK success, then app crash before event log persistence
                this.sentFolderMockStore.add(messageId);
                throw new Error("CRASH_AFTER_250_OK");
            }

            if (options.forceError) {
                throw new Error(options.forceError);
            }

            if (options.forceAuthError) {
                const authErr = new Error("535 5.7.8 Authentication failed");
                authErr.code = "AUTHENTICATION_FAILED";
                throw authErr;
            }

            // Standard Successful Delivery
            this.sentFolderMockStore.add(messageId);
            job.status = 'SUCCESS';
            job.completedAt = new Date().toISOString();
            mailbox.todaySent = (mailbox.todaySent || 0) + 1;

            this.emitEvent("MESSAGE_SENT", "INFO", `Message sent successfully via ${mailbox.email}`, { jobId: job.id, messageId });
            this.emitEvent("JOB_COMPLETED", "INFO", `Job ${job.id} completed successfully`, { jobId: job.id });

            return { status: 'SUCCESS', job };

        } catch (error) {
            // Evaluate Retry Policy & Error Classification
            const retryDecision = RetryPolicy.evaluateFailure(error, job.retryCount + 1);

            if (!retryDecision.shouldRetry) {
                job.status = retryDecision.nextState; // FAILED or DEAD
                job.error = error.message;
                if (retryDecision.classification.action === 'PAUSE_MAILBOX_ERROR') {
                    mailbox.healthState = 'ERROR';
                }

                const eventType = retryDecision.nextState === 'DEAD' ? 'JOB_DEAD' : 'JOB_FAILED';
                this.emitEvent("MESSAGE_SEND_FAILED", "ERROR", `Non-retryable Failure for ${mailbox.email}: ${error.message}`, { jobId: job.id });
                this.emitEvent(eventType, "ERROR", `Job ${job.id} marked ${retryDecision.nextState}`, { jobId: job.id });

                return { status: retryDecision.nextState, job, retryable: false };
            }

            // Retryable Transient Failure
            job.retryCount++;
            job.status = 'RETRYING';
            job.scheduledAt = new Date(Date.now() + retryDecision.backoffSec * 1000).toISOString();
            job.error = error.message;

            this.emitEvent("JOB_RETRYING", "WARN", `Job ${job.id} failed attempt ${job.retryCount}/${RetryPolicy.MAX_ATTEMPTS}. Retrying in ${retryDecision.backoffSec}s: ${error.message}`, { jobId: job.id });

            return { status: 'RETRYING', job, backoffSec: retryDecision.backoffSec, retryable: true };

        } finally {
            this.releaseConcurrencyLock(job, mailbox);
        }
    }

    /**
     * Orphan Job Sweeper (Lease Expiration Sweeper)
     */
    sweepOrphanJobs(jobs, options = {}) {
        const now = options.currentTime || new Date();
        const reclaimed = [];

        jobs.forEach(job => {
            if (job.status === 'RUNNING' && job.leaseExpiresAt) {
                const expired = new Date(job.leaseExpiresAt) < now;
                if (expired) {
                    job.status = 'RETRYING';
                    job.claimedBy = null;
                    job.leaseExpiresAt = null;
                    reclaimed.push(job);
                    this.emitEvent("JOB_RECLAIMED", "WARN", `Orphan sweeper reclaimed stuck job ${job.id}`, { jobId: job.id });
                }
            }
        });

        return reclaimed;
    }
}

module.exports = ExecutionEngine;
