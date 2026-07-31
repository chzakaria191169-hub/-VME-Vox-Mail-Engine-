// src/core/analytics/AnalyticsService.ts
// Aggregates high-level system metrics, deliverability trends, and domain health

import { supabase } from '../../db/supabase';
import { HealthScorer, HealthGrade } from './HealthScorer';

export interface WorkspaceAnalyticsSummary {
  workspaceId: string;
  totalMailboxes: number;
  activeMailboxes: number;
  pausedMailboxes: number;
  totalSentToday: number;
  totalReceivedToday: number;
  overallHealthScore: number;
  networkGrade: HealthGrade;
  domainCount: number;
  recentEventsCount: number;
}

export class AnalyticsService {

  // ============================================
  // GET WORKSPACE SUMMARY ANALYTICS
  // ============================================
  static async getWorkspaceSummary(workspaceId: string): Promise<WorkspaceAnalyticsSummary> {
    const { data: mailboxes } = await supabase
      .from('Mailbox')
      .select('*')
      .eq('workspaceId', workspaceId);

    const { data: domains } = await supabase
      .from('Domain')
      .select('id')
      .eq('workspaceId', workspaceId);

    const { data: events } = await supabase
      .from('EventLog')
      .select('id')
      .eq('workspaceId', workspaceId);

    const list = mailboxes || [];
    const active = list.filter(m => m.status === 'ACTIVE');
    const paused = list.filter(m => m.status === 'PAUSED');

    const totalSentToday = list.reduce((sum, m) => sum + (m.todaySent || 0), 0);
    const totalReceivedToday = list.reduce((sum, m) => sum + (m.todayReceived || 0), 0);
    const totalSentAllTime = list.reduce((sum, m) => sum + (m.totalSent || 0), 0);
    const totalReceivedAllTime = list.reduce((sum, m) => sum + (m.totalReceived || 0), 0);

    const metrics = {
      totalSent: totalSentAllTime,
      totalReceived: totalReceivedAllTime,
      spamHits: 0,
      spamRescued: 0,
      bounces: 0,
      replies: totalReceivedAllTime,
    };

    const health = HealthScorer.evaluateMailbox(metrics);

    return {
      workspaceId,
      totalMailboxes: list.length,
      activeMailboxes: active.length,
      pausedMailboxes: paused.length,
      totalSentToday,
      totalReceivedToday,
      overallHealthScore: health.score,
      networkGrade: health.grade,
      domainCount: domains?.length || 0,
      recentEventsCount: events?.length || 0,
    };
  }
}
