class HealthAndScoringPolicy {
    /**
     * Calculates Mailbox Reputation Score (0.0 to 100.0) based on metrics and error status.
     */
    static calculateMailboxHealthScore(metric = {}, mailboxState = {}) {
        let score = 100.0;

        const sent = metric.sentCount || 0;
        const received = metric.receivedCount || 0;
        const bounces = metric.bounceCount || 0;
        const spam = metric.spamCount || 0;
        const rescued = metric.rescuedCount || 0;
        const errors = metric.errorCount || 0;
        const consecutiveErrors = mailboxState.consecutiveErrors || 0;

        // 1. Bounce Penalty (Heavy impact on sender reputation)
        if (sent > 0) {
            const bounceRate = bounces / sent;
            if (bounceRate > 0.02) { // Bounce rate above 2% penalizes score
                score -= Math.min(60, bounceRate * 200);
            }
        } else if (bounces > 0) {
            score -= Math.min(50, bounces * 15);
        }

        // 2. Spam Penalty & Rescue Recovery
        if (spam > 0) {
            const unrescuedSpam = Math.max(0, spam - rescued);
            score -= Math.min(30, unrescuedSpam * 5);
            // Reward for rescued messages
            if (rescued > 0) {
                score += Math.min(15, rescued * 3);
            }
        }

        // 3. Consecutive Connection & Provider Error Penalty
        if (consecutiveErrors > 0) {
            score -= Math.min(40, consecutiveErrors * 10);
        }

        // 4. Error Count Penalty
        if (errors > 0) {
            score -= Math.min(20, errors * 2);
        }

        // Clamp final score to bounds [0.0, 100.0]
        const finalScore = Math.max(0.0, Math.min(100.0, Math.round(score * 10) / 10));
        return {
            score: finalScore,
            status: HealthAndScoringPolicy.getHealthStatusLabel(finalScore),
            metricsEvaluated: { sent, bounces, spam, rescued, consecutiveErrors }
        };
    }

    /**
     * Calculates Domain Authentication & Health Score based on DNS verification & metrics.
     */
    static calculateDomainHealthScore(domain = {}, domainMetric = {}) {
        let score = 100.0;

        const isVerified = domain.isVerified || false;
        const hasSpf = Boolean(domain.spfRecord || domain.spfValid);
        const hasDkim = Boolean(domain.dkimRecord || domain.dkimValid);
        const hasDmarc = Boolean(domain.dmarcRecord || domain.dmarcValid);

        if (!isVerified) score -= 30.0;
        if (!hasSpf) score -= 20.0;
        if (!hasDkim) score -= 20.0;
        if (!hasDmarc) score -= 15.0;

        const totalSent = domainMetric.totalSent || 0;
        const totalSpam = domainMetric.totalSpam || 0;

        if (totalSent > 0 && totalSpam > 0) {
            const spamRatio = totalSpam / totalSent;
            if (spamRatio > 0.05) score -= Math.min(25, spamRatio * 100);
        }

        const finalScore = Math.max(0.0, Math.min(100.0, Math.round(score * 10) / 10));
        return {
            score: finalScore,
            status: HealthAndScoringPolicy.getHealthStatusLabel(finalScore),
            dnsPosture: { isVerified, hasSpf, hasDkim, hasDmarc }
        };
    }

    /**
     * Maps numerical score to categorical health label:
     * EXCELLENT (90-100) | GOOD (75-89) | FAIR (50-74) | POOR (25-49) | CRITICAL (0-24)
     */
    static getHealthStatusLabel(score) {
        if (score >= 90.0) return 'EXCELLENT';
        if (score >= 75.0) return 'GOOD';
        if (score >= 50.0) return 'FAIR';
        if (score >= 25.0) return 'POOR';
        return 'CRITICAL';
    }
}

module.exports = HealthAndScoringPolicy;
