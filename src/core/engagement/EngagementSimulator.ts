// src/core/engagement/EngagementSimulator.ts
// Simulates human engagement signals (Open, Read, Star, Inbox rescue, Reply)

import { ProviderFactory } from '../../providers/ProviderFactory';
import { ProviderType, MailboxConfig } from '../../types';
import { logEvent, updateMailboxStats } from '../../db/supabase';

export interface EngagementPlan {
  markAsRead: boolean;
  markAsImportant: boolean;
  moveToInboxIfSpam: boolean;
  sendReply: boolean;
  replyDelayMs: number;
}

export class EngagementSimulator {

  // ============================================
  // GENERATE RANDOM HUMAN ENGAGEMENT PLAN
  // Based on realistic human behavior probabilities
  // ============================================
  static createEngagementPlan(isSpam: boolean): EngagementPlan {
    const markAsRead = Math.random() < 0.95; // 95% open rate
    const markAsImportant = Math.random() < 0.40; // 40% star/important rate
    const moveToInboxIfSpam = isSpam; // Always rescue spam if detected
    const sendReply = Math.random() < 0.45; // 45% reply rate

    // Random human read time delay (30 seconds to 5 minutes)
    const replyDelayMs = Math.floor(Math.random() * (5 * 60 * 1000 - 30 * 1000)) + 30 * 1000;

    return {
      markAsRead,
      markAsImportant,
      moveToInboxIfSpam,
      sendReply,
      replyDelayMs,
    };
  }

  // ============================================
  // EXECUTE ENGAGEMENT ACTIONS ON A MAILBOX
  // ============================================
  static async executeEngagement(
    mailbox: any,
    folder: string,
    messageId: string,
    plan: EngagementPlan
  ): Promise<{ readDone: boolean; importantDone: boolean; spamRescued: boolean }> {
    const config: MailboxConfig = {
      email: mailbox.email,
      smtpHost: mailbox.smtpHost,
      smtpPort: mailbox.smtpPort,
      smtpUser: mailbox.smtpUser,
      smtpPassword: mailbox.smtpPassword,
      smtpSecure: mailbox.smtpSecure,
      imapHost: mailbox.imapHost,
      imapPort: mailbox.imapPort,
      imapUser: mailbox.imapUser,
      imapPassword: mailbox.imapPassword,
      imapSecure: mailbox.imapSecure,
    };

    const provider = ProviderFactory.create(config, mailbox.provider as ProviderType);
    let readDone = false;
    let importantDone = false;
    let spamRescued = false;

    try {
      // 1. Move from Spam to Inbox if in Spam
      if (plan.moveToInboxIfSpam) {
        await provider.moveToInbox(messageId, folder);
        spamRescued = true;
        await logEvent(
          mailbox.workspaceId,
          'mailbox',
          mailbox.id,
          'EngagementSpamRescued',
          `Rescued email ${messageId} from ${folder} to INBOX`,
          'INFO'
        );
      }

      const targetFolder = spamRescued ? 'INBOX' : folder;

      // 2. Mark as Read
      if (plan.markAsRead) {
        await provider.markAsRead(messageId, targetFolder);
        readDone = true;
      }

      // 3. Mark as Important / Starred
      if (plan.markAsImportant) {
        await provider.markAsImportant(messageId, targetFolder);
        importantDone = true;
      }

      // Update stats
      await updateMailboxStats(mailbox.id, {
        lastActivity: new Date().toISOString(),
      });

    } catch (err: any) {
      console.warn(`[EngagementSimulator] Error executing engagement for ${mailbox.email}:`, err.message);
    }

    return { readDone, importantDone, spamRescued };
  }
}
