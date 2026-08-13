const EligibilityEngine = require('./EligibilityEngine');

class JobScheduler {
    constructor() {
        this.jobs = new Map();
        this.idempotencyStore = new Set();
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
        console.log(`📡 [EVENT EMITTED: ${eventType}] ${message}`);
        return log;
    }

    /**
     * Schedules a send job with strict composite key idempotency.
     * Composite Key: mailboxId + slotKey + jobType
     */
    scheduleSendJob(mailbox, payload = {}, options = {}) {
        const now = options.currentTime || new Date();

        // 1. Evaluate Mailbox Eligibility
        const evalRes = EligibilityEngine.evaluateMailbox(mailbox, { currentTime: now });
        if (!evalRes.isEligible) {
            console.log(`⚠️ [JOB SCHEDULER] Mailbox ${mailbox.email} not eligible: ${evalRes.reasons.join(', ')}`);
            return { success: false, reason: evalRes.reasons.join(', ') };
        }

        // 2. Generate Idempotency Composite Key
        const slotKey = `${now.getUTCFullYear()}-${now.getUTCMonth()+1}-${now.getUTCDate()}-${now.getUTCHours()}:${Math.floor(now.getUTCMinutes() / 5)*5}`;
        const idempotencyKey = `job:${mailbox.id}:${slotKey}:${payload.type || 'SEND_MESSAGE'}`;

        if (this.idempotencyStore.has(idempotencyKey)) {
            console.log(`🔒 [JOB SCHEDULER] Duplicate job prevented by Idempotency Key: ${idempotencyKey}`);
            return { success: false, reason: "DUPLICATE_JOB_PREVENTED", idempotencyKey };
        }

        // 3. Register Idempotency Lock
        this.idempotencyStore.add(idempotencyKey);

        // 4. Create Job Record
        const job = {
            id: `job_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            mailboxId: mailbox.id,
            workspaceId: mailbox.workspaceId || 'default-ws',
            domainId: mailbox.domainId || 'default-domain',
            type: payload.type || 'SEND_MESSAGE',
            status: 'PENDING',
            retryCount: 0,
            maxRetries: 3,
            payload,
            leaseExpiresAt: null,
            scheduledAt: now.toISOString(),
            createdAt: now.toISOString()
        };

        this.jobs.set(job.id, job);
        this.emitEvent("JOB_CREATED", "INFO", `Job ${job.id} created for mailbox ${mailbox.email}`, { jobId: job.id, mailboxId: mailbox.id });

        return {
            success: true,
            job,
            idempotencyKey
        };
    }

    getPendingJobs() {
        return Array.from(this.jobs.values()).filter(j => j.status === 'PENDING');
    }
}

module.exports = JobScheduler;
