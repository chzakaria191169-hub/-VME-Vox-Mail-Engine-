// src/core/analytics/HealthScorer.ts
// Calculates Deliverability & Health Scores for Mailboxes and Domains

export enum HealthGrade {
  EXCELLENT = 'EXCELLENT', // 85 - 100
  GOOD = 'GOOD',           // 70 - 84
  WARNING = 'WARNING',     // 50 - 69
  CRITICAL = 'CRITICAL',   // 0 - 49
}

export interface MailboxMetrics {
  totalSent: number;
  totalReceived: number;
  spamHits: number;
  spamRescued: number;
  bounces: number;
  replies: number;
}

export interface HealthReport {
  score: number;
  grade: HealthGrade;
  inboxRate: number;    // %
  spamRate: number;     // %
  bounceRate: number;   // %
  replyRate: number;    // %
  recommendations: string[];
}

export class HealthScorer {

  // ============================================
  // CALCULATE HEALTH REPORT FOR A MAILBOX
  // Formula:
  // Inbox Placement (40%) + Low Bounce Rate (30%) + Reply Rate (20%) + Spam Recovery (10%)
  // ============================================
  static evaluateMailbox(metrics: MailboxMetrics): HealthReport {
    if (metrics.totalSent === 0) {
      return {
        score: 100,
        grade: HealthGrade.EXCELLENT,
        inboxRate: 100,
        spamRate: 0,
        bounceRate: 0,
        replyRate: 0,
        recommendations: ['New mailbox ready for warmup ramp-up.'],
      };
    }

    const inboxCount = Math.max(0, metrics.totalSent - metrics.spamHits - metrics.bounces);
    const inboxRate = Math.round((inboxCount / metrics.totalSent) * 100);
    const spamRate = Math.round((metrics.spamHits / metrics.totalSent) * 100);
    const bounceRate = Math.round((metrics.bounces / metrics.totalSent) * 100);
    const replyRate = Math.round((metrics.replies / metrics.totalSent) * 100);

    // Weighted Score
    let score = (inboxRate * 0.40) + ((100 - bounceRate) * 0.30) + (replyRate * 0.20);
    if (metrics.spamRescued > 0) {
      score += Math.min(10, metrics.spamRescued * 2);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    let grade = HealthGrade.EXCELLENT;
    if (finalScore < 50) grade = HealthGrade.CRITICAL;
    else if (finalScore < 70) grade = HealthGrade.WARNING;
    else if (finalScore < 85) grade = HealthGrade.GOOD;

    const recommendations: string[] = [];
    if (bounceRate > 5) {
      recommendations.push('High bounce rate detected (>5%). Verify MX/SPF records.');
    }
    if (spamRate > 10) {
      recommendations.push('Spam hits exceeded 10%. Lower daily send volume temporarily.');
    }
    if (replyRate < 20) {
      recommendations.push('Low engagement rate (<20%). Increase warmup reply frequency.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Deliverability parameters optimal.');
    }

    return {
      score: finalScore,
      grade,
      inboxRate,
      spamRate,
      bounceRate,
      replyRate,
      recommendations,
    };
  }

  // ============================================
  // EVALUATE DOMAIN HEALTH AGGREGATE
  // ============================================
  static evaluateDomain(mailboxesMetrics: MailboxMetrics[]): HealthReport {
    const aggregate: MailboxMetrics = mailboxesMetrics.reduce((acc, m) => ({
      totalSent: acc.totalSent + m.totalSent,
      totalReceived: acc.totalReceived + m.totalReceived,
      spamHits: acc.spamHits + m.spamHits,
      spamRescued: acc.spamRescued + m.spamRescued,
      bounces: acc.bounces + m.bounces,
      replies: acc.replies + m.replies,
    }), { totalSent: 0, totalReceived: 0, spamHits: 0, spamRescued: 0, bounces: 0, replies: 0 });

    return this.evaluateMailbox(aggregate);
  }
}
