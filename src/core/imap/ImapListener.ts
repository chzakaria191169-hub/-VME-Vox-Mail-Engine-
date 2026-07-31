// src/core/imap/ImapListener.ts - Polls mailboxes, detects warmup emails, recovers spam

import { ProviderFactory } from '../../providers/ProviderFactory';
import { ProviderType, MailboxConfig } from '../../types';
import {
  logEvent,
  updateMailboxStats,
  saveMessage,
} from '../../db/supabase';
import { SpintaxEngine } from '../../ai/SpintaxEngine';
import { RulesEngine, MailboxRule } from '../rules/RulesEngine';

// Identifier tag added to warmup email subjects/headers to detect them
export const WARMUP_TAG = 'vme-warmup';

export interface ImapPollResult {
  mailboxEmail: string;
  inboxFound: number;
  spamFound: number;
  spamRecovered: number;
  markedAsRead: number;
  repliesScheduled: number;
}

export class ImapListener {

  // ============================================
  // Poll a single mailbox
  // ============================================
  static async pollMailbox(mailbox: any, rule: MailboxRule, warmupQueue: any): Promise<ImapPollResult> {
    const result: ImapPollResult = {
      mailboxEmail: mailbox.email,
      inboxFound: 0,
      spamFound: 0,
      spamRecovered: 0,
      markedAsRead: 0,
      repliesScheduled: 0,
    };

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
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours

    try {
      // ---- Step 1: Check INBOX for warmup emails ----
      const inboxEmails = await provider.fetchEmails('INBOX', since);
      const warmupInbox = inboxEmails.filter(e => this.isWarmupEmail(e.subject, e.from));
      result.inboxFound = warmupInbox.length;

      for (const email of warmupInbox) {
        try {
          // Mark as Read + Important (simulates human behavior)
          await provider.markAsRead(email.messageId, 'INBOX');
          await provider.markAsImportant(email.messageId, 'INBOX');
          result.markedAsRead++;

          // Schedule a reply after a random delay
          const replyDelay = RulesEngine.getReplyDelayMs(rule);
          await warmupQueue.add('warmup:reply', {
            mailboxId: mailbox.id,
            workspaceId: mailbox.workspaceId,
            toEmail: email.from,
            originalSubject: email.subject,
            originalMessageId: email.messageId,
            senderName: mailbox.displayName || mailbox.email,
          }, { delay: replyDelay });
          result.repliesScheduled++;

          await logEvent(
            mailbox.workspaceId,
            'mailbox',
            mailbox.id,
            'WarmupEmailReceived',
            `Warmup email received in INBOX from ${email.from}. Reply scheduled in ${Math.round(replyDelay / 60000)} min.`,
            'INFO',
            { from: email.from, subject: email.subject }
          );
        } catch (e: any) {
          console.warn(`[ImapListener] Error processing inbox email for ${mailbox.email}:`, e.message);
        }
      }

      // ---- Step 2: Check Spam folder for warmup emails ----
      const spamFolders = this.getSpamFolderNames(mailbox.provider as ProviderType);
      for (const spamFolder of spamFolders) {
        try {
          const spamEmails = await provider.fetchEmails(spamFolder, since);
          const warmupSpam = spamEmails.filter(e => this.isWarmupEmail(e.subject, e.from));
          result.spamFound += warmupSpam.length;

          for (const email of warmupSpam) {
            try {
              await provider.moveToInbox(email.messageId, spamFolder);
              result.spamRecovered++;

              await logEvent(
                mailbox.workspaceId,
                'mailbox',
                mailbox.id,
                'SpamRecovered',
                `Warmup email rescued from ${spamFolder}: "${email.subject}" from ${email.from}`,
                'INFO',
                { from: email.from, subject: email.subject, folder: spamFolder }
              );

              // Update warmup score after spam recovery
              await updateMailboxStats(mailbox.id, {
                lastActivity: new Date().toISOString(),
              });
            } catch (e: any) {
              console.warn(`[ImapListener] Error recovering spam email for ${mailbox.email}:`, e.message);
            }
          }
        } catch {
          // Spam folder might not exist — skip silently
        }
      }

    } catch (err: any) {
      console.error(`[ImapListener] Failed polling mailbox ${mailbox.email}:`, err.message);
      await updateMailboxStats(mailbox.id, { lastError: err.message });
    }

    return result;
  }

  // ============================================
  // Detect if an email is a VME warmup email
  // ============================================
  private static isWarmupEmail(subject: string, from: string): boolean {
    // Strategy: all VME warmup emails embed the WARMUP_TAG in hidden header
    // Since we can't check headers in basic fetch, we use a broad heuristic:
    // - Check if from is a known warmup domain or contains the tag in subject
    // In production: use X-VME-Warmup custom header detection
    return subject.includes(WARMUP_TAG) || subject.toLowerCase().includes('vme-warmup');
  }

  // ============================================
  // Get spam folder names per provider
  // ============================================
  private static getSpamFolderNames(provider: ProviderType): string[] {
    switch (provider) {
      case ProviderType.GMAIL:
        return ['[Gmail]/Spam'];
      case ProviderType.OUTLOOK:
      case ProviderType.MICROSOFT365:
        return ['Junk'];
      case ProviderType.ZOHO:
        return ['Spam'];
      default:
        return ['Spam', 'Junk'];
    }
  }
}
