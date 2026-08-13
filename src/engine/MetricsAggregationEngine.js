const { PrismaClient } = require('@prisma/client');

class MetricsAggregationEngine {
    constructor(prismaClient = null) {
        this.prisma = prismaClient;
        this.eventLogs = [];
        this.inMemoryLedger = new Set();
        this.inMemoryMailboxMetrics = new Map();
        this.inMemoryDomainMetrics = new Map();
        this.inMemoryWorkspaceMetrics = new Map();
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
        console.log(`📡 [METRICS ENGINE EVENT: ${eventType}] ${message}`);
        return log;
    }

    /**
     * Formats a Date object or ISO string to UTC YYYY-MM-DD Date
     */
    static getUtcDateString(dateInput = new Date()) {
        const d = new Date(dateInput);
        return d.toISOString().split('T')[0];
    }

    /**
     * Maps Event Types to exact counter increments for Mailbox, Domain, and Workspace
     */
    mapEventToIncrements(evt) {
        const eventType = evt.eventType;
        const metadata = evt.metadata || {};

        const res = {
            mailbox: {},
            domain: {},
            workspace: { totalEvents: 1 }
        };

        const errorTypes = [
            'MESSAGE_SEND_FAILED',
            'MAILBOX_ERROR',
            'IMAP_TEST_FAILED',
            'SMTP_TEST_FAILED',
            'MESSAGE_PROCESSING_FAILED',
            'MESSAGE_RESCUE_FAILED',
            'SMTP_ERROR'
        ];

        if (eventType === 'MESSAGE_SENT') {
            res.mailbox.sentCount = 1;
            res.domain.totalSent = 1;
            res.workspace.totalSent = 1;
            res.workspace.totalMessages = 1;
        } else if (eventType === 'MESSAGE_SYNCED') {
            res.mailbox.receivedCount = 1;
            if (metadata.folder === 'INBOX' || !metadata.folder) {
                res.mailbox.inboxCount = 1;
            } else if (metadata.folder === 'SPAM') {
                res.mailbox.spamCount = 1;
                res.domain.totalSpam = 1;
            }
            res.domain.totalReceived = 1;
            res.workspace.totalReceived = 1;
            res.workspace.totalMessages = 1;
        } else if (eventType === 'MESSAGE_MOVED_TO_INBOX') {
            res.mailbox.rescuedCount = 1;
            res.mailbox.inboxCount = 1;
            res.domain.totalRescued = 1;
        } else if (eventType === 'MESSAGE_IN_SPAM') {
            res.mailbox.spamCount = 1;
            res.domain.totalSpam = 1;
        } else if (eventType === 'MESSAGE_BOUNCE_DETECTED') {
            res.mailbox.bounceCount = 1;
        } else if (errorTypes.includes(eventType)) {
            res.mailbox.errorCount = 1;
        }

        return res;
    }

    /**
     * Atomically processes an event with EXACTLY-ONCE EFFECT using PostgreSQL transaction
     * and MetricEventLedger table.
     */
    async processEvent(evt, options = {}) {
        const dbClient = options.prisma || this.prisma;
        const eventId = evt.id;

        if (!eventId) {
            throw new Error('EVENT_ID_REQUIRED: Event object must contain a valid id');
        }

        if (!dbClient || typeof dbClient.$transaction !== 'function') {
            return this._processEventInMemory(evt);
        }

        const dateStr = MetricsAggregationEngine.getUtcDateString(evt.createdAt || new Date());

        return await dbClient.$transaction(async (tx) => {
            // 1. Claim event in MetricEventLedger (Atomic PK insertion)
            const claimedCount = await tx.$executeRawUnsafe(
                `INSERT INTO "MetricEventLedger" ("eventId", "processedAt")
                 VALUES ($1, NOW())
                 ON CONFLICT ("eventId") DO NOTHING`,
                eventId
            );

            if (claimedCount === 0) {
                return { success: true, eventId, status: 'SKIPPED_DUPLICATE' };
            }

            // 2. Resolve target entities
            const mailboxId = evt.mailboxId || evt.metadata?.mailboxId;
            let workspaceId = evt.workspaceId || evt.metadata?.workspaceId;
            let domainId = null;

            if (mailboxId) {
                const mailbox = await tx.mailbox.findUnique({
                    where: { id: mailboxId },
                    select: { domainId: true, workspaceId: true }
                });
                if (mailbox) {
                    domainId = mailbox.domainId;
                    if (!workspaceId) {
                        workspaceId = mailbox.workspaceId;
                    }
                }
            }

            // 3. Map event increments
            const increments = this.mapEventToIncrements(evt);

            // 4. Perform Co-Transactional Metric UPSERTs
            if (mailboxId && Object.keys(increments.mailbox).length > 0) {
                await this.aggregateMailboxMetricTx(tx, mailboxId, dateStr, increments.mailbox);
            }

            if (domainId && Object.keys(increments.domain).length > 0) {
                await this.aggregateDomainMetricTx(tx, domainId, dateStr, increments.domain);
            }

            if (workspaceId) {
                await this.aggregateWorkspaceMetricTx(tx, workspaceId, dateStr, increments.workspace);
            }

            return { success: true, eventId, status: 'PROCESSED' };
        });
    }

    /**
     * In-memory processing fallback for mock unit tests without live database.
     */
    _processEventInMemory(evt) {
        const eventId = evt.id;
        if (this.inMemoryLedger.has(eventId)) {
            return { success: true, eventId, status: 'SKIPPED_DUPLICATE' };
        }
        this.inMemoryLedger.add(eventId);

        const dateStr = MetricsAggregationEngine.getUtcDateString(evt.createdAt || new Date());
        const mailboxId = evt.mailboxId || evt.metadata?.mailboxId;
        const workspaceId = evt.workspaceId || evt.metadata?.workspaceId;
        const increments = this.mapEventToIncrements(evt);

        if (mailboxId && Object.keys(increments.mailbox).length > 0) {
            const key = `${mailboxId}:${dateStr}`;
            const cur = this.inMemoryMailboxMetrics.get(key) || {
                sentCount: 0, receivedCount: 0, inboxCount: 0, spamCount: 0, rescuedCount: 0, bounceCount: 0, errorCount: 0
            };
            for (const [k, v] of Object.entries(increments.mailbox)) {
                cur[k] = (cur[k] || 0) + v;
            }
            this.inMemoryMailboxMetrics.set(key, cur);
        }

        if (workspaceId) {
            const key = `${workspaceId}:${dateStr}`;
            const cur = this.inMemoryWorkspaceMetrics.get(key) || { activeMailboxes: 0, totalMessages: 0, totalEvents: 0 };
            for (const [k, v] of Object.entries(increments.workspace)) {
                cur[k] = (cur[k] || 0) + v;
            }
            this.inMemoryWorkspaceMetrics.set(key, cur);
        }

        return { success: true, eventId, status: 'PROCESSED' };
    }

    /**
     * Mailbox Metric UPSERT within transaction handle
     */
    async aggregateMailboxMetricTx(tx, mailboxId, dateStr, increments = {}) {
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        const sentCount = increments.sentCount || 0;
        const receivedCount = increments.receivedCount || 0;
        const inboxCount = increments.inboxCount || 0;
        const spamCount = increments.spamCount || 0;
        const rescuedCount = increments.rescuedCount || 0;
        const bounceCount = increments.bounceCount || 0;
        const errorCount = increments.errorCount || 0;

        const query = `
            INSERT INTO "MailboxMetric" (id, "mailboxId", date, "sentCount", "receivedCount", "inboxCount", "spamCount", "rescuedCount", "bounceCount", "errorCount")
            VALUES (gen_random_uuid()::text, $1, $2::date, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT ("mailboxId", date) DO UPDATE SET
                "sentCount"     = "MailboxMetric"."sentCount" + EXCLUDED."sentCount",
                "receivedCount" = "MailboxMetric"."receivedCount" + EXCLUDED."receivedCount",
                "inboxCount"    = "MailboxMetric"."inboxCount" + EXCLUDED."inboxCount",
                "spamCount"     = "MailboxMetric"."spamCount" + EXCLUDED."spamCount",
                "rescuedCount"  = "MailboxMetric"."rescuedCount" + EXCLUDED."rescuedCount",
                "bounceCount"   = "MailboxMetric"."bounceCount" + EXCLUDED."bounceCount",
                "errorCount"    = "MailboxMetric"."errorCount" + EXCLUDED."errorCount";
        `;

        await tx.$executeRawUnsafe(
            query,
            mailboxId,
            targetDate.toISOString(),
            sentCount,
            receivedCount,
            inboxCount,
            spamCount,
            rescuedCount,
            bounceCount,
            errorCount
        );
    }

    /**
     * Domain Metric UPSERT within transaction handle
     */
    async aggregateDomainMetricTx(tx, domainId, dateStr, increments = {}) {
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        const totalSent = increments.totalSent || 0;
        const totalReceived = increments.totalReceived || 0;
        const totalSpam = increments.totalSpam || 0;
        const totalRescued = increments.totalRescued || 0;

        const query = `
            INSERT INTO "DomainMetric" (id, "domainId", date, "totalSent", "totalReceived", "totalSpam", "totalRescued")
            VALUES (gen_random_uuid()::text, $1, $2::date, $3, $4, $5, $6)
            ON CONFLICT ("domainId", date) DO UPDATE SET
                "totalSent"     = "DomainMetric"."totalSent" + EXCLUDED."totalSent",
                "totalReceived" = "DomainMetric"."totalReceived" + EXCLUDED."totalReceived",
                "totalSpam"     = "DomainMetric"."totalSpam" + EXCLUDED."totalSpam",
                "totalRescued"  = "DomainMetric"."totalRescued" + EXCLUDED."totalRescued";
        `;

        await tx.$executeRawUnsafe(
            query,
            domainId,
            targetDate.toISOString(),
            totalSent,
            totalReceived,
            totalSpam,
            totalRescued
        );
    }

    /**
     * Workspace Metric UPSERT within transaction handle
     */
    async aggregateWorkspaceMetricTx(tx, workspaceId, dateStr, increments = {}) {
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        const activeMailboxes = increments.activeMailboxes || 0;
        const totalMessages = increments.totalMessages || 0;
        const totalEvents = increments.totalEvents || 0;

        const query = `
            INSERT INTO "WorkspaceMetric" (id, "workspaceId", date, "activeMailboxes", "totalMessages", "totalEvents")
            VALUES (gen_random_uuid()::text, $1, $2::date, $3, $4, $5)
            ON CONFLICT ("workspaceId", date) DO UPDATE SET
                "activeMailboxes" = GREATEST("WorkspaceMetric"."activeMailboxes", EXCLUDED."activeMailboxes"),
                "totalMessages"   = "WorkspaceMetric"."totalMessages" + EXCLUDED."totalMessages",
                "totalEvents"     = "WorkspaceMetric"."totalEvents" + EXCLUDED."totalEvents";
        `;

        await tx.$executeRawUnsafe(
            query,
            workspaceId,
            targetDate.toISOString(),
            activeMailboxes,
            totalMessages,
            totalEvents
        );
    }

    /**
     * Public standalone helpers preserving backward compatibility
     */
    async aggregateMailboxMetric(mailboxId, dateStr, increments = {}, options = {}) {
        const dbClient = options.prisma || this.prisma;
        if (!dbClient) {
            return this._aggregateMailboxMetricInMemory(mailboxId, dateStr, increments);
        }
        await this.aggregateMailboxMetricTx(dbClient, mailboxId, dateStr, increments);
        return { success: true, mailboxId, date: dateStr, increments };
    }

    async aggregateDomainMetric(domainId, dateStr, increments = {}, options = {}) {
        const dbClient = options.prisma || this.prisma;
        if (!dbClient) {
            return { success: true, domainId, date: dateStr, increments };
        }
        await this.aggregateDomainMetricTx(dbClient, domainId, dateStr, increments);
        return { success: true, domainId, date: dateStr, increments };
    }

    async aggregateWorkspaceMetric(workspaceId, dateStr, increments = {}, options = {}) {
        const dbClient = options.prisma || this.prisma;
        if (!dbClient) {
            return this._aggregateWorkspaceMetricInMemory(workspaceId, dateStr, increments);
        }
        await this.aggregateWorkspaceMetricTx(dbClient, workspaceId, dateStr, increments);
        return { success: true, workspaceId, date: dateStr, increments };
    }

    _aggregateMailboxMetricInMemory(mailboxId, dateStr, increments) {
        const key = `${mailboxId}:${dateStr}`;
        const cur = this.inMemoryMailboxMetrics.get(key) || {
            sentCount: 0, receivedCount: 0, inboxCount: 0, spamCount: 0, rescuedCount: 0, bounceCount: 0, errorCount: 0
        };
        for (const [k, v] of Object.entries(increments)) {
            cur[k] = (cur[k] || 0) + v;
        }
        this.inMemoryMailboxMetrics.set(key, cur);
        return { success: true, mailboxId, date: dateStr, increments };
    }

    _aggregateWorkspaceMetricInMemory(workspaceId, dateStr, increments) {
        const key = `${workspaceId}:${dateStr}`;
        const cur = this.inMemoryWorkspaceMetrics.get(key) || { activeMailboxes: 0, totalMessages: 0, totalEvents: 0 };
        for (const [k, v] of Object.entries(increments)) {
            cur[k] = (cur[k] || 0) + v;
        }
        this.inMemoryWorkspaceMetrics.set(key, cur);
        return { success: true, workspaceId, date: dateStr, increments };
    }

    /**
     * DETERMINISTIC & IDEMPOTENT REBUILD FROM EVENT LOG
     * Wipes existing metrics and ledger entries for the target date range inside a single transaction,
     * then replays all event logs.
     * Invariant: Incremental Processing === Replay === Full Rebuild.
     */
    async rebuildMetricsFromEventLog(events = [], options = {}) {
        const dbClient = options.prisma || this.prisma;

        if (!dbClient || typeof dbClient.$transaction !== 'function') {
            this.inMemoryLedger.clear();
            this.inMemoryMailboxMetrics.clear();
            this.inMemoryDomainMetrics.clear();
            this.inMemoryWorkspaceMetrics.clear();

            let processedCount = 0;
            for (const evt of events) {
                const res = this._processEventInMemory(evt);
                if (res.status === 'PROCESSED') processedCount++;
            }
            return { success: true, processedEvents: events.length, metricUpdates: processedCount };
        }

        // Collect unique dates and event IDs from the events array
        const datesSet = new Set();
        const eventIds = [];
        for (const evt of events) {
            if (evt.createdAt) {
                datesSet.add(MetricsAggregationEngine.getUtcDateString(evt.createdAt));
            }
            if (evt.id) {
                eventIds.push(evt.id);
            }
        }
        const dates = Array.from(datesSet).map(d => new Date(`${d}T00:00:00.000Z`));

        return await dbClient.$transaction(async (tx) => {
            // 1. Wipe metrics for dates covered by the rebuild set to eliminate additive bug
            if (dates.length > 0) {
                await tx.mailboxMetric.deleteMany({ where: { date: { in: dates } } });
                await tx.domainMetric.deleteMany({ where: { date: { in: dates } } });
                await tx.workspaceMetric.deleteMany({ where: { date: { in: dates } } });
            }

            // 2. Wipe ledger entries for the events being replayed
            if (eventIds.length > 0) {
                await tx.$executeRawUnsafe(
                    `DELETE FROM "MetricEventLedger" WHERE "eventId" = ANY($1::text[])`,
                    eventIds
                );
            }

            // 3. Replay events in order
            let processedCount = 0;
            for (const evt of events) {
                const dateStr = MetricsAggregationEngine.getUtcDateString(evt.createdAt || new Date());
                const eventId = evt.id;

                if (!eventId) continue;

                // Claim in ledger
                const claimed = await tx.$executeRawUnsafe(
                    `INSERT INTO "MetricEventLedger" ("eventId", "processedAt")
                     VALUES ($1, NOW())
                     ON CONFLICT ("eventId") DO NOTHING`,
                    eventId
                );

                if (claimed === 0) continue;

                const mailboxId = evt.mailboxId || evt.metadata?.mailboxId;
                let workspaceId = evt.workspaceId || evt.metadata?.workspaceId;
                let domainId = null;

                if (mailboxId) {
                    const mb = await tx.mailbox.findUnique({
                        where: { id: mailboxId },
                        select: { domainId: true, workspaceId: true }
                    });
                    if (mb) {
                        domainId = mb.domainId;
                        if (!workspaceId) workspaceId = mb.workspaceId;
                    }
                }

                const increments = this.mapEventToIncrements(evt);

                if (mailboxId && Object.keys(increments.mailbox).length > 0) {
                    await this.aggregateMailboxMetricTx(tx, mailboxId, dateStr, increments.mailbox);
                }
                if (domainId && Object.keys(increments.domain).length > 0) {
                    await this.aggregateDomainMetricTx(tx, domainId, dateStr, increments.domain);
                }
                if (workspaceId) {
                    await this.aggregateWorkspaceMetricTx(tx, workspaceId, dateStr, increments.workspace);
                }

                processedCount++;
            }

            this.emitEvent("METRICS_REBUILD_COMPLETED", "INFO", `Rebuilt metrics from ${events.length} event logs`, { processedCount });
            return { success: true, processedEvents: events.length, metricUpdates: processedCount };
        });
    }
}

module.exports = MetricsAggregationEngine;
