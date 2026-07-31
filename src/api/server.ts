// src/api/server.ts
// Express REST API Server for Vox Mail Engine (VME)
// Provides clean, API-first control for Voxora CRM integration

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { supabase, getActiveWarmupMailboxes, logEvent } from '../db/supabase';
import { AnalyticsService } from '../core/analytics/AnalyticsService';
import { DeliverabilityShield } from '../core/shield/DeliverabilityShield';
import { RulesEngine, DEFAULT_RULE } from '../core/rules/RulesEngine';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Vox Mail Engine (VME)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// WORKSPACE ANALYTICS & HEALTH SUMMARY
// ============================================
app.get('/api/v1/workspaces/:workspaceId/summary', async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const summary = await AnalyticsService.getWorkspaceSummary(workspaceId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// LIST MAILBOXES (Filtered by Workspace & Status)
// ============================================
app.get('/api/v1/workspaces/:workspaceId/mailboxes', async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const { data: mailboxes, error } = await supabase
      .from('Mailbox')
      .select('*')
      .eq('workspaceId', workspaceId);

    if (error) throw error;
    res.json({ success: true, count: mailboxes.length, data: mailboxes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// UPDATE MAILBOX CONFIG / PAUSE / RESUME
// ============================================
app.patch('/api/v1/mailboxes/:mailboxId', async (req: Request, res: Response) => {
  try {
    const mailboxId = String(req.params.mailboxId);
    const updates = req.body;

    const { data, error } = await supabase
      .from('Mailbox')
      .update(updates)
      .eq('id', mailboxId)
      .select()
      .single();

    if (error) throw error;

    await logEvent(
      data.workspaceId,
      'mailbox',
      mailboxId,
      'MailboxUpdatedViaAPI',
      `Mailbox ${data.email} updated via API`,
      'INFO',
      updates
    );

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// RUN DELIVERABILITY SHIELD AUDIT ON DEMAND
// ============================================
app.post('/api/v1/workspaces/:workspaceId/shield/audit', async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const results = await DeliverabilityShield.auditWorkspace(workspaceId);
    res.json({
      success: true,
      auditedCount: results.length,
      pausedCount: results.filter(r => r.actionTaken === 'PAUSED').length,
      details: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// GET SYSTEM EVENT LOGS
// ============================================
app.get('/api/v1/workspaces/:workspaceId/logs', async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.workspaceId);
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: logs, error } = await supabase
      .from('EventLog')
      .select('*')
      .eq('workspaceId', workspaceId)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export function startApiServer() {
  app.listen(PORT, () => {
    console.log(`[VME REST API] 🌐 Server listening on http://localhost:${PORT}`);
  });
}
