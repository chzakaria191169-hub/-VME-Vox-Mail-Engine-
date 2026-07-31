// src/core/engine/MailEngine.ts
// The central orchestrator of the VME system — manages lifecycle, health, and stats

import { WarmupScheduler } from '../scheduler/WarmupScheduler';
import { supabase, getActiveWarmupMailboxes, logEvent } from '../../db/supabase';

export interface EngineStatus {
  running: boolean;
  startedAt: Date | null;
  activeMailboxes: number;
  totalSentToday: number;
  totalReceivedToday: number;
  spamRecoveredToday: number;
  uptimeSeconds: number;
}

export class MailEngine {
  private scheduler: WarmupScheduler;
  private isRunning: boolean = false;
  private startedAt: Date | null = null;
  private dailyResetInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.scheduler = new WarmupScheduler();
  }

  // ============================================
  // START the entire VME engine
  // ============================================
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[MailEngine] Already running.');
      return;
    }

    console.log('[MailEngine] ==========================================');
    console.log('[MailEngine]   Voxora Mail Engine (VME) Starting...');
    console.log('[MailEngine] ==========================================');

    this.isRunning = true;
    this.startedAt = new Date();

    // Start the warmup scheduler
    await this.scheduler.start();

    // Schedule daily stats reset at midnight UTC
    this.scheduleDailyReset();

    const mailboxes = await getActiveWarmupMailboxes();
    console.log(`[MailEngine] ✅ Engine Online — ${mailboxes.length} mailboxes active`);

    await logEvent(
      'ws_voxora_main',
      'system',
      'mail_engine',
      'EngineStarted',
      `VME started with ${mailboxes.length} active mailboxes`,
      'INFO',
      { startedAt: this.startedAt.toISOString(), mailboxCount: mailboxes.length }
    );
  }

  // ============================================
  // STOP the engine
  // ============================================
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('[MailEngine] 🛑 Stopping VME...');
    await this.scheduler.stop();
    this.isRunning = false;

    if (this.dailyResetInterval) clearInterval(this.dailyResetInterval);

    await logEvent(
      'ws_voxora_main',
      'system',
      'mail_engine',
      'EngineStopped',
      'VME gracefully stopped',
      'INFO'
    );

    console.log('[MailEngine] ✅ Engine stopped gracefully.');
  }

  // ============================================
  // GET CURRENT ENGINE STATUS
  // ============================================
  async getStatus(): Promise<EngineStatus> {
    const mailboxes = await getActiveWarmupMailboxes();
    const totalSentToday = mailboxes.reduce((sum, m) => sum + (m.todaySent || 0), 0);
    const totalReceivedToday = mailboxes.reduce((sum, m) => sum + (m.todayReceived || 0), 0);

    const uptimeSeconds = this.startedAt
      ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
      : 0;

    return {
      running: this.isRunning,
      startedAt: this.startedAt,
      activeMailboxes: mailboxes.length,
      totalSentToday,
      totalReceivedToday,
      spamRecoveredToday: 0,
      uptimeSeconds,
    };
  }

  // ============================================
  // RESET daily counters at midnight
  // ============================================
  private scheduleDailyReset(): void {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const msToMidnight = midnight.getTime() - now.getTime();

    setTimeout(async () => {
      await this.resetDailyStats();
      // Then repeat every 24 hours
      this.dailyResetInterval = setInterval(() => this.resetDailyStats(), 24 * 60 * 60 * 1000);
    }, msToMidnight);
  }

  private async resetDailyStats(): Promise<void> {
    console.log('[MailEngine] 🔄 Resetting daily stats for all mailboxes...');
    await supabase
      .from('Mailbox')
      .update({ todaySent: 0, todayReceived: 0 })
      .eq('warmupEnabled', true);
    console.log('[MailEngine] ✅ Daily stats reset complete.');
  }
}
