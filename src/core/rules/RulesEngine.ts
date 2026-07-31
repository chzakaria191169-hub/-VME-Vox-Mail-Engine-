// src/core/rules/RulesEngine.ts - Evaluates behavioral rules for each Mailbox

export interface MailboxRule {
  maxDailyEmails: number;
  minDailyEmails: number;
  replyDelayMin: number;   // in minutes
  replyDelayMax: number;   // in minutes
  sendOnWeekends: boolean;
  businessHoursOnly: boolean;
  businessStart: number;   // 0-23 hour
  businessEnd: number;     // 0-23 hour
  timezone: string;
  randomFactor: number;    // 0.0 - 1.0
}

// Default rules if no rule is found in the database
export const DEFAULT_RULE: MailboxRule = {
  maxDailyEmails: 20,
  minDailyEmails: 3,
  replyDelayMin: 15,
  replyDelayMax: 180,
  sendOnWeekends: false,
  businessHoursOnly: true,
  businessStart: 8,
  businessEnd: 18,
  timezone: 'UTC',
  randomFactor: 0.3,
};

export class RulesEngine {

  // ============================================
  // Can this mailbox send right now?
  // ============================================
  static canSendNow(rule: MailboxRule): boolean {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

    // Weekend check
    const isWeekend = day === 0 || day === 6;
    if (isWeekend && !rule.sendOnWeekends) {
      return false;
    }

    // Business hours check
    if (rule.businessHoursOnly) {
      if (hour < rule.businessStart || hour >= rule.businessEnd) {
        return false;
      }
    }

    return true;
  }

  // ============================================
  // How many emails should this mailbox send today?
  // Randomized between min and max
  // ============================================
  static getDailyTarget(rule: MailboxRule): number {
    const range = rule.maxDailyEmails - rule.minDailyEmails;
    const randomOffset = Math.floor(Math.random() * (range + 1));
    return rule.minDailyEmails + randomOffset;
  }

  // ============================================
  // Get a random reply delay in milliseconds
  // ============================================
  static getReplyDelayMs(rule: MailboxRule): number {
    const minMs = rule.replyDelayMin * 60 * 1000;
    const maxMs = rule.replyDelayMax * 60 * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  // ============================================
  // Get a random send delay in milliseconds (1-45 mins)
  // ============================================
  static getSendDelayMs(): number {
    const minMinutes = 1;
    const maxMinutes = 45;
    const minutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    return minutes * 60 * 1000;
  }

  // ============================================
  // Should this mailbox skip sending this tick?
  // (adds natural randomness)
  // ============================================
  static shouldSkipThisTick(rule: MailboxRule): boolean {
    return Math.random() < rule.randomFactor;
  }

  // ============================================
  // Has this mailbox reached its daily limit?
  // ============================================
  static hasReachedDailyLimit(todaySent: number, dailyLimit: number): boolean {
    return todaySent >= dailyLimit;
  }

  // ============================================
  // Calculate warmup score based on recent activity
  // Inbox rate, spam recovery, reply rate
  // ============================================
  static calculateWarmupScore(stats: {
    totalSent: number;
    spamCount: number;
    replyCount: number;
    recoveredCount: number;
  }): number {
    if (stats.totalSent === 0) return 0;
    const inboxRate = 1 - (stats.spamCount / stats.totalSent);
    const replyRate = stats.replyCount / stats.totalSent;
    const recoveryBonus = Math.min(stats.recoveredCount * 0.02, 0.2);
    const score = (inboxRate * 0.6 + replyRate * 0.4 + recoveryBonus) * 100;
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}
