// src/db/supabase.ts - Supabase client for VME

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gihuscbvgrugzaxowmur.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get all active warmup mailboxes
export async function getActiveWarmupMailboxes(): Promise<any[]> {
  const { data, error } = await supabase
    .from('Mailbox')
    .select('*')
    .eq('status', 'ACTIVE')
    .eq('warmupEnabled', true);
  if (error) throw error;
  return data || [];
}

// Helper to get rule for a mailbox (or workspace default)
export async function getRuleForMailbox(mailboxId: string, workspaceId: string): Promise<any> {
  // Try mailbox-specific rule first
  const { data: specific } = await supabase
    .from('MailboxRule')
    .select('*')
    .eq('mailboxId', mailboxId)
    .single();
  if (specific) return specific;

  // Fall back to workspace-level rule
  const { data: workspace } = await supabase
    .from('MailboxRule')
    .select('*')
    .eq('workspaceId', workspaceId)
    .is('mailboxId', null)
    .single();
  return workspace;
}

// Helper to update mailbox stats
export async function updateMailboxStats(mailboxId: string, updates: Partial<{
  todaySent: number;
  todayReceived: number;
  totalSent: number;
  totalReceived: number;
  lastActivity: string;
  lastError: string;
  warmupScore: number;
}>): Promise<void> {
  await supabase.from('Mailbox').update(updates).eq('id', mailboxId);
}

// Helper to log an event
export async function logEvent(workspaceId: string, entity: string, entityId: string, event: string, message: string, level: string = 'INFO', metadata?: any): Promise<void> {
  await supabase.from('EventLog').insert({
    workspaceId,
    entity,
    entityId,
    event,
    level,
    message,
    metadata: metadata || null,
  });
}

// Helper to save a sent message record
export async function saveMessage(data: {
  workspaceId: string;
  fromMailboxId: string;
  toMailboxId?: string;
  toEmail: string;
  subject: string;
  body: string;
  messageId: string;
  inReplyTo?: string;
  conversationId?: string;
  type: string;
  status: string;
  sentAt?: string;
}): Promise<any> {
  const { data: saved, error } = await supabase.from('Message').insert(data).select().single();
  if (error) throw error;
  return saved;
}

// Helper to get recent send pairs to avoid repetition
export async function getRecentSendPairs(mailboxId: string, hoursBack: number = 48): Promise<string[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('Message')
    .select('toMailboxId')
    .eq('fromMailboxId', mailboxId)
    .eq('type', 'WARMUP')
    .gte('createdAt', since)
    .not('toMailboxId', 'is', null);
  return (data || []).map((m: any) => m.toMailboxId).filter(Boolean);
}
