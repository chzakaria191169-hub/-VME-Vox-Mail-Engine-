// src/core/scheduler/WarmupScheduler.ts
// BullMQ-based scheduler that decides WHO sends, TO WHOM, WHEN, and processes jobs

import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import {
  getActiveWarmupMailboxes,
  getRuleForMailbox,
  getRecentSendPairs,
  updateMailboxStats,
  saveMessage,
  logEvent,
} from '../../db/supabase';
import { RulesEngine, DEFAULT_RULE } from '../rules/RulesEngine';
import { SpintaxEngine } from '../../ai/SpintaxEngine';
import { ImapListener, WARMUP_TAG } from '../imap/ImapListener';
import { ProviderFactory } from '../../providers/ProviderFactory';
import { ProviderType, MailboxConfig, SendOptions } from '../../types';

export class WarmupScheduler {
  private connection: IORedis;
  private sendQueue: Queue;
  private replyQueue: Queue;
  private imapQueue: Queue;
  private sendWorker: Worker;
  private replyWorker: Worker;
  private imapWorker: Worker;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    // ── Queues ──
    this.sendQueue = new Queue('warmup:send', { connection: this.connection });
    this.replyQueue = new Queue('warmup:reply', { connection: this.connection });
    this.imapQueue = new Queue('warmup:imap', { connection: this.connection });

    // ── Workers ──
    this.sendWorker = this.createSendWorker();
    this.replyWorker = this.createReplyWorker();
    this.imapWorker = this.createImapWorker();
  }

  // ============================================
  // START the Scheduler (ticks every 60 seconds)
  // ============================================
  async start(): Promise<void> {
    console.log('[WarmupScheduler] 🚀 Starting VME Warmup Engine...');
    await this.tick(); // Run immediately on start
    this.tickInterval = setInterval(() => this.tick(), 60 * 1000);
    // Schedule IMAP polling every 5 minutes
    setInterval(() => this.scheduleImapPolls(), 5 * 60 * 1000);
    console.log('[WarmupScheduler] ✅ Engine running — ticking every 60 seconds');
  }

  // ============================================
  // STOP the Scheduler
  // ============================================
  async stop(): Promise<void> {
    if (this.tickInterval) clearInterval(this.tickInterval);
    await this.sendWorker.close();
    await this.replyWorker.close();
    await this.imapWorker.close();
    await this.sendQueue.close();
    await this.replyQueue.close();
    await this.imapQueue.close();
    await this.connection.quit();
    console.log('[WarmupScheduler] 🛑 Engine stopped.');
  }

  // ============================================
  // TICK — called every 60 seconds
  // Decides which mailboxes should send and queues jobs
  // ============================================
  private async tick(): Promise<void> {
    try {
      const mailboxes = await getActiveWarmupMailboxes();
      if (mailboxes.length === 0) return;

      console.log(`[Scheduler Tick] ⏱ Evaluating ${mailboxes.length} mailboxes...`);

      for (const mailbox of mailboxes) {
        try {
          // Get the rule for this mailbox
          const ruleData = await getRuleForMailbox(mailbox.id, mailbox.workspaceId);
          const rule = ruleData || DEFAULT_RULE;

          // Check if we can send right now (business hours, weekends)
          if (!RulesEngine.canSendNow(rule)) continue;

          // Check if daily limit reached
          if (RulesEngine.hasReachedDailyLimit(mailbox.todaySent || 0, mailbox.warmupDailyLimit)) {
            continue;
          }

          // Add natural randomness (skip ~30% of ticks)
          if (RulesEngine.shouldSkipThisTick(rule)) continue;

          // Select a recipient
          const recipient = await this.selectRecipient(mailbox, mailboxes);
          if (!recipient) continue;

          // Schedule the send job with a random delay
          const delay = RulesEngine.getSendDelayMs();
          const jobId = uuidv4();

          await this.sendQueue.add('warmup:send', {
            jobId,
            fromMailboxId: mailbox.id,
            fromEmail: mailbox.email,
            fromName: mailbox.displayName || mailbox.email,
            fromProvider: mailbox.provider,
            toMailboxId: recipient.id,
            toEmail: recipient.email,
            toName: recipient.displayName || recipient.email,
            workspaceId: mailbox.workspaceId,
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
          }, { delay, attempts: 3, backoff: { type: 'exponential', delay: 30000 } });

          console.log(`[Scheduler] 📤 Queued: ${mailbox.email} → ${recipient.email} (in ${Math.round(delay / 60000)} min)`);

        } catch (err: any) {
          console.error(`[Scheduler] Error processing mailbox ${mailbox.email}:`, err.message);
        }
      }
    } catch (err: any) {
      console.error('[Scheduler Tick] Fatal error:', err.message);
    }
  }

  // ============================================
  // SELECT RECIPIENT — avoids repetition, favors diversity
  // ============================================
  private async selectRecipient(fromMailbox: any, allMailboxes: any[]): Promise<any | null> {
    const recentPairs = await getRecentSendPairs(fromMailbox.id, 48);

    // Filter out: self, recent pairs, inactive mailboxes
    const candidates = allMailboxes.filter(m =>
      m.id !== fromMailbox.id &&
      m.status === 'ACTIVE' &&
      m.warmupEnabled &&
      !recentPairs.includes(m.id)
    );

    if (candidates.length === 0) {
      // If all have been used recently, pick any other
      const fallback = allMailboxes.filter(m => m.id !== fromMailbox.id && m.status === 'ACTIVE');
      if (fallback.length === 0) return null;
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    // Prefer Gmail and Outlook recipients for network diversity
    const preferredProviders = [ProviderType.GMAIL, ProviderType.OUTLOOK, ProviderType.MICROSOFT365];
    const preferred = candidates.filter(m => preferredProviders.includes(m.provider as ProviderType));
    const pool = preferred.length > 0 ? preferred : candidates;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ============================================
  // SCHEDULE IMAP POLLS for all active mailboxes
  // ============================================
  private async scheduleImapPolls(): Promise<void> {
    const mailboxes = await getActiveWarmupMailboxes();
    for (const mailbox of mailboxes) {
      // Stagger IMAP polls to avoid simultaneous connections
      const staggerDelay = Math.floor(Math.random() * 4 * 60 * 1000); // 0-4 min random
      await this.imapQueue.add('warmup:imap', { mailboxId: mailbox.id }, {
        delay: staggerDelay,
        attempts: 2,
      });
    }
    console.log(`[Scheduler] 📬 IMAP polls queued for ${mailboxes.length} mailboxes`);
  }

  // ============================================
  // SEND WORKER — actually sends the warmup email
  // ============================================
  private createSendWorker(): Worker {
    return new Worker('warmup:send', async (job) => {
      const data = job.data;
      console.log(`[SendWorker] 📨 Sending: ${data.fromEmail} → ${data.toEmail}`);

      const config: MailboxConfig = {
        email: data.fromEmail,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
        smtpSecure: data.smtpSecure,
        imapHost: data.imapHost,
        imapPort: data.imapPort,
        imapUser: data.imapUser,
        imapPassword: data.imapPassword,
        imapSecure: data.imapSecure,
      };

      const provider = ProviderFactory.create(config, data.fromProvider as ProviderType);
      const content = SpintaxEngine.generate(data.fromName);
      const messageId = `<vme-${uuidv4()}@${data.fromEmail.split('@')[1]}>`;

      // Embed warmup tag in subject (hidden detection mechanism)
      const taggedSubject = `${content.subject} [${WARMUP_TAG}]`;

      const sendOptions: SendOptions = {
        from: data.fromEmail,
        to: data.toEmail,
        subject: taggedSubject,
        text: content.body,
        html: content.html,
        messageId,
      };

      await provider.sendEmail(sendOptions);

      // Save to DB
      await saveMessage({
        workspaceId: data.workspaceId,
        fromMailboxId: data.fromMailboxId,
        toMailboxId: data.toMailboxId,
        toEmail: data.toEmail,
        subject: taggedSubject,
        body: content.body,
        messageId,
        type: 'WARMUP',
        status: 'SENT',
        sentAt: new Date().toISOString(),
      });

      // Update stats
      await updateMailboxStats(data.fromMailboxId, {
        lastActivity: new Date().toISOString(),
      });

      // Log event
      await logEvent(
        data.workspaceId,
        'mailbox',
        data.fromMailboxId,
        'WarmupEmailSent',
        `Warmup email sent from ${data.fromEmail} to ${data.toEmail}`,
        'INFO',
        { to: data.toEmail, subject: taggedSubject, messageId }
      );

      console.log(`[SendWorker] ✅ Sent: ${data.fromEmail} → ${data.toEmail}`);

    }, { connection: this.connection, concurrency: 5 });
  }

  // ============================================
  // REPLY WORKER — sends a reply to a received warmup email
  // ============================================
  private createReplyWorker(): Worker {
    return new Worker('warmup:reply', async (job) => {
      const data = job.data;
      console.log(`[ReplyWorker] 💬 Replying from mailbox ${data.mailboxId} to ${data.toEmail}`);

      // Fetch mailbox data
      const { supabase: sbClient } = require('../../db/supabase');
      const { data: mailbox } = await sbClient
        .from('Mailbox')
        .select('*')
        .eq('id', data.mailboxId)
        .single();

      if (!mailbox) {
        console.warn(`[ReplyWorker] Mailbox not found: ${data.mailboxId}`);
        return;
      }

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
      const content = SpintaxEngine.generateReply(data.originalSubject, mailbox.displayName || mailbox.email);
      const replyMessageId = `<vme-reply-${uuidv4()}@${mailbox.email.split('@')[1]}>`;

      const sendOptions: SendOptions = {
        from: mailbox.email,
        to: data.toEmail,
        subject: content.subject,
        text: content.body,
        html: content.html,
        messageId: replyMessageId,
        inReplyTo: data.originalMessageId,
        references: [data.originalMessageId],
      };

      await provider.sendEmail(sendOptions);

      await logEvent(
        data.workspaceId,
        'mailbox',
        data.mailboxId,
        'WarmupReplyS‌ent',
        `Reply sent from ${mailbox.email} to ${data.toEmail}`,
        'INFO',
        { to: data.toEmail, originalMessageId: data.originalMessageId }
      );

      console.log(`[ReplyWorker] ✅ Reply sent from ${mailbox.email} → ${data.toEmail}`);

    }, { connection: this.connection, concurrency: 3 });
  }

  // ============================================
  // IMAP WORKER — polls a mailbox for warmup emails
  // ============================================
  private createImapWorker(): Worker {
    return new Worker('warmup:imap', async (job) => {
      const { mailboxId } = job.data;

      const { supabase: sbClient2 } = require('../../db/supabase');
      const { data: mailbox } = await sbClient2
        .from('Mailbox')
        .select('*')
        .eq('id', mailboxId)
        .single();

      if (!mailbox) return;

      const ruleData = await getRuleForMailbox(mailbox.id, mailbox.workspaceId);
      const rule = ruleData || DEFAULT_RULE;

      const result = await ImapListener.pollMailbox(mailbox, rule, this.replyQueue);

      if (result.inboxFound > 0 || result.spamRecovered > 0) {
        console.log(`[ImapWorker] 📬 ${mailbox.email} — Inbox: ${result.inboxFound}, Spam Recovered: ${result.spamRecovered}, Replies Queued: ${result.repliesScheduled}`);
      }

    }, { connection: this.connection, concurrency: 3 });
  }
}
