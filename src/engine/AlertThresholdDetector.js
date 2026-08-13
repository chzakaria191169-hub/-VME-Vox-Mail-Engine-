class AlertThresholdDetector {
    constructor(options = {}) {
        this.bounceRateThreshold = options.bounceRateThreshold || 0.05; // 5%
        this.spamRateThreshold = options.spamRateThreshold || 0.02;     // 2%
        this.consecutiveErrorThreshold = options.consecutiveErrorThreshold || 3;
        this.minHealthScoreThreshold = options.minHealthScoreThreshold || 50.0;
        this.eventLogs = [];
        this.activeAlerts = new Map();
    }

    emitEvent(eventType, level = "WARN", message, metadata = {}) {
        const log = {
            id: `evt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            eventType,
            level,
            message,
            metadata,
            createdAt: new Date().toISOString()
        };
        this.eventLogs.push(log);
        console.log(`⚠️ [ALERT THRESHOLD DETECTOR EVENT: ${eventType}] ${message}`);
        return log;
    }

    /**
     * Evaluates a mailbox's aggregated metrics and status against safety thresholds.
     * Enforces date-scoped alert idempotency to prevent duplicate alert storms.
     */
    async evaluateMailbox(mailbox, metric = {}, mailboxState = {}, healthResult = {}, options = {}) {
        const breaches = [];
        const dateStr = new Date().toISOString().split('T')[0];

        const sent = metric.sentCount || 0;
        const bounces = metric.bounceCount || 0;
        const received = metric.receivedCount || 0;
        const spam = metric.spamCount || 0;
        const consecutiveErrors = mailboxState.consecutiveErrors || 0;
        const score = healthResult.score !== undefined ? healthResult.score : 100.0;

        // 1. High Bounce Rate Breach
        if (sent >= 10 && (bounces / sent) >= this.bounceRateThreshold) {
            const bounceRate = Math.round((bounces / sent) * 1000) / 10;
            breaches.push({
                type: 'HIGH_BOUNCE_RATE',
                severity: 'HIGH',
                message: `Mailbox ${mailbox.email} bounce rate is ${bounceRate}% (Threshold: ${this.bounceRateThreshold * 100}%)`,
                details: { sent, bounces, bounceRate }
            });
        }

        // 2. High Spam Trap Breach
        if (received >= 10 && (spam / received) >= this.spamRateThreshold) {
            const spamRate = Math.round((spam / received) * 1000) / 10;
            breaches.push({
                type: 'HIGH_SPAM_RATE',
                severity: 'MEDIUM',
                message: `Mailbox ${mailbox.email} spam placement rate is ${spamRate}% (Threshold: ${this.spamRateThreshold * 100}%)`,
                details: { received, spam, spamRate }
            });
        }

        // 3. Consecutive Error Breach
        if (consecutiveErrors >= this.consecutiveErrorThreshold) {
            breaches.push({
                type: 'CONSECUTIVE_ERRORS_EXCEEDED',
                severity: 'HIGH',
                message: `Mailbox ${mailbox.email} failed ${consecutiveErrors} consecutive times`,
                details: { consecutiveErrors, lastError: mailboxState.lastError }
            });
        }

        // 4. Low Health Score Breach
        if (score < this.minHealthScoreThreshold) {
            breaches.push({
                type: 'LOW_HEALTH_SCORE',
                severity: 'CRITICAL',
                message: `Mailbox ${mailbox.email} health score dropped to ${score} (Threshold: ${this.minHealthScoreThreshold})`,
                details: { score }
            });
        }

        const emittedBreaches = [];

        // Check date-scoped idempotency key for each breach
        for (const breach of breaches) {
            const alertKey = `${mailbox.id}:${breach.type}:${dateStr}`;
            let alreadyEmitted = this.activeAlerts.has(alertKey);

            const dbClient = options.prisma || options.dbClient;
            if (!alreadyEmitted && dbClient && typeof dbClient.eventLog?.findFirst === 'function') {
                const existing = await dbClient.eventLog.findFirst({
                    where: {
                        mailboxId: mailbox.id,
                        eventType: 'ALERT_THRESHOLD_BREACH',
                        createdAt: { gte: new Date(`${dateStr}T00:00:00.000Z`) }
                    }
                });
                if (existing) {
                    alreadyEmitted = true;
                    this.activeAlerts.set(alertKey, true);
                }
            }

            if (!alreadyEmitted) {
                this.activeAlerts.set(alertKey, true);
                this.emitEvent("ALERT_THRESHOLD_BREACH", breach.severity === 'CRITICAL' ? 'ERROR' : 'WARN', breach.message, {
                    mailboxId: mailbox.id,
                    workspaceId: mailbox.workspaceId,
                    breachType: breach.type,
                    details: breach.details
                });
                emittedBreaches.push(breach);
            }
        }

        return {
            hasBreach: breaches.length > 0,
            breachesCount: breaches.length,
            breaches,
            emittedBreaches
        };
    }
}

module.exports = AlertThresholdDetector;
