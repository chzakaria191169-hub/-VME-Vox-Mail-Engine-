class ShiftEngine {
    constructor(permanentSeeds = [], shift1Boxes = [], shift2Boxes = [], shift3Boxes = []) {
        this.permanentSeeds = permanentSeeds; // 20 Gmail + 20 Outlook (Runs 24/7)
        this.shift1Boxes = shift1Boxes;       // Shift 1 (00:00 - 08:00)
        this.shift2Boxes = shift2Boxes;       // Shift 2 (08:00 - 16:00)
        this.shift3Boxes = shift3Boxes;       // Shift 3 (16:00 - 24:00)
    }

    getCurrentShiftName(date = new Date()) {
        const hour = date.getUTCHours();
        if (hour >= 0 && hour < 8) return "SHIFT_1";
        if (hour >= 8 && hour < 16) return "SHIFT_2";
        return "SHIFT_3";
    }

    getActiveMailboxesForCurrentShift(date = new Date()) {
        const shift = this.getCurrentShiftName(date);
        let currentShiftDomainBoxes = [];

        if (shift === "SHIFT_1") currentShiftDomainBoxes = this.shift1Boxes;
        else if (shift === "SHIFT_2") currentShiftDomainBoxes = this.shift2Boxes;
        else currentShiftDomainBoxes = this.shift3Boxes;

        // Return combined list: 40 Permanent Seeds (24/7) + Current Shift Domain Boxes
        return {
            shiftName: shift,
            activePermanentSeedsCount: this.permanentSeeds.length,
            activeShiftDomainBoxesCount: currentShiftDomainBoxes.length,
            totalActiveMailboxes: [...this.permanentSeeds, ...currentShiftDomainBoxes]
        };
    }
}

module.exports = ShiftEngine;
