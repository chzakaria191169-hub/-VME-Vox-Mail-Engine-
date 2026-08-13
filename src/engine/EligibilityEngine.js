const ShiftPolicy = require('./ShiftPolicy');

class EligibilityEngine {
    /**
     * Evaluates whether a mailbox is eligible for scheduled sending.
     * Criteria:
     * 1. Status == ACTIVE
     * 2. HealthState IN ['HEALTHY', 'WARNING'] (Not PAUSED or ERROR)
     * 3. TodaySent < DailyMaxLimit
     * 4. ActiveJobsCount == 0
     * 5. Active Shift according to ShiftPolicy
     */
    static evaluateMailbox(mailbox, options = {}) {
        const now = options.currentTime || new Date();
        const reasons = [];

        if (mailbox.status !== 'ACTIVE') {
            reasons.push(`Status is ${mailbox.status} (Required: ACTIVE)`);
        }

        if (['PAUSED', 'ERROR'].includes(mailbox.healthState)) {
            reasons.push(`Health state is ${mailbox.healthState}`);
        }

        if ((mailbox.todaySent || 0) >= (mailbox.dailyMaxLimit || 20)) {
            reasons.push(`Daily send limit reached (${mailbox.todaySent}/${mailbox.dailyMaxLimit})`);
        }

        if (mailbox.activeJobsCount && mailbox.activeJobsCount > 0) {
            reasons.push(`Has active running jobs (${mailbox.activeJobsCount})`);
        }

        const shiftActive = ShiftPolicy.isMailboxInActiveShift(mailbox.group, now);
        if (!shiftActive) {
            reasons.push(`Mailbox group ${mailbox.group} is inactive for current UTC hour (${now.getUTCHours()}:00)`);
        }

        const isEligible = reasons.length === 0;

        return {
            isEligible,
            reasons,
            activeShift: ShiftPolicy.getActiveShiftName(now)
        };
    }

    static filterEligibleMailboxes(mailboxes, options = {}) {
        return mailboxes.filter(mb => this.evaluateMailbox(mb, options).isEligible);
    }
}

module.exports = EligibilityEngine;
