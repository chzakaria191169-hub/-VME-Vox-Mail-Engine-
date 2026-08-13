class ShiftPolicy {
    /**
     * Determines whether a mailbox group is active at a given UTC time.
     * Shifts (UTC):
     * - PERMANENT_247 / PERMANENT_ANCHOR_247: Always Active (24/7)
     * - SHIFT_1: 00:00 - 08:00 UTC
     * - SHIFT_2: 08:00 - 16:00 UTC
     * - SHIFT_3: 16:00 - 24:00 UTC
     */
    static isMailboxInActiveShift(mailboxGroup, currentTime = new Date()) {
        const group = (mailboxGroup || 'SHIFT_1').toUpperCase();
        if (group.includes('PERMANENT')) return true;

        const currentHour = currentTime.getUTCHours();

        switch (group) {
            case 'SHIFT_1':
                return currentHour >= 0 && currentHour < 8;
            case 'SHIFT_2':
                return currentHour >= 8 && currentHour < 16;
            case 'SHIFT_3':
                return currentHour >= 16 && currentHour < 24;
            default:
                return true;
        }
    }

    static getActiveShiftName(currentTime = new Date()) {
        const hour = currentTime.getUTCHours();
        if (hour < 8) return 'SHIFT_1';
        if (hour < 16) return 'SHIFT_2';
        return 'SHIFT_3';
    }
}

module.exports = ShiftPolicy;
