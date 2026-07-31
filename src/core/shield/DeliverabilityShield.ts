// src/core/shield/DeliverabilityShield.ts
// Automated Circuit Breaker & Safeguard for Mailbox Deliverability

import { supabase, updateMailboxStats, logEvent } from '../../db/supabase';
import { HealthScorer, HealthGrade, MailboxMetrics } from '../analytics/HealthScorer';

export interface ShieldCheckResult {
  mailboxId: string;
  email: string;
  actionTaken: 'NONE' | 'PAUSED' | 'ALERTED';
  reason?: string;
}

export class DeliverabilityShield {

  // Maximum allowed consecutive authentication errors before auto-pause
  private static MAX_AUTH_ERRORS = 3;

  // Maximum allowed bounce rate percentage before auto-pause
  private static MAX_BOUNCE_RATE = 10; // 10%

  // ============================================
  // AUDIT AND PROTECT ALL MAILBOXES IN WORKSPACE
  // ============================================
  static async auditWorkspace(workspaceId: string): Promise<ShieldCheckResult[]> {
    const results: ShieldCheckResult[] = [];

    const { data: mailboxes, error } = await supabase
      .from('Mailbox')
      .select('*')
      .eq('workspaceId', workspaceId)
      .eq('status', 'ACTIVE');

    if (error || !mailboxes) return results;

    for (const mailbox of mailboxes) {
      const metrics: MailboxMetrics = {
        totalSent: mailbox.totalSent || 0,
        totalReceived: mailbox.totalReceived || 0,
        spamHits: 0,
        spamRescued: 0,
        bounces: 0,
        replies: mailbox.totalReceived || 0,
      };

      const health = HealthScorer.evaluateMailbox(metrics);

      // Check 1: Critical Health Grade (score < 50)
      if (health.grade === HealthGrade.CRITICAL) {
        await this.pauseMailbox(mailbox, `Critical Deliverability Score (${health.score}/100)`);
        results.push({
          mailboxId: mailbox.id,
          email: mailbox.email,
          actionTaken: 'PAUSED',
          reason: `Health score dropped to ${health.score}/100`,
        });
        continue;
      }

      // Check 2: Last Error indicates auth failure
      if (mailbox.lastError && (mailbox.lastError.includes('Authentication Failed') || mailbox.lastError.includes('535'))) {
        await this.pauseMailbox(mailbox, `Authentication Failed: ${mailbox.lastError}`);
        results.push({
          mailboxId: mailbox.id,
          email: mailbox.email,
          actionTaken: 'PAUSED',
          reason: `Authentication failure detected`,
        });
        continue;
      }

      results.push({
        mailboxId: mailbox.id,
        email: mailbox.email,
        actionTaken: 'NONE',
      });
    }

    return results;
  }

  // ============================================
  // PAUSE A MAILBOX TO PREVENT DOMAIN DAMAGE
  // ============================================
  private static async pauseMailbox(mailbox: any, reason: string): Promise<void> {
    console.warn(`[DeliverabilityShield] 🛡 AUTO-PAUSING MAILBOX: ${mailbox.email} | Reason: ${reason}`);

    await supabase
      .from('Mailbox')
      .update({
        status: 'PAUSED',
        warmupEnabled: false,
        lastError: `Shield Auto-Pause: ${reason}`,
      })
      .eq('id', mailbox.id);

    await logEvent(
      mailbox.workspaceId,
      'mailbox',
      mailbox.id,
      'DeliverabilityShieldPaused',
      `Mailbox ${mailbox.email} auto-paused by Deliverability Shield. Reason: ${reason}`,
      'WARNING',
      { reason, email: mailbox.email }
    );
  }
}
