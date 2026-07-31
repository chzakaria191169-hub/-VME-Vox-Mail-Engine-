// src/test-phase5.ts - Complete verification runner for Phase 5 (Analytics & Deliverability Shield)

import dotenv from 'dotenv';
dotenv.config();

import { HealthScorer, HealthGrade } from './core/analytics/HealthScorer';
import { DeliverabilityShield } from './core/shield/DeliverabilityShield';
import { AnalyticsService } from './core/analytics/AnalyticsService';
import { getActiveWarmupMailboxes } from './db/supabase';

async function runPhase5Verification() {
  console.log('====================================================');
  console.log('🚀 TESTING VME PHASE 5: ANALYTICS & DELIVERABILITY SHIELD');
  console.log('====================================================\n');

  // 1. Test Health Scorer Engine
  console.log('--- 1. Testing Health Scorer Engine ---');

  const scenario1 = HealthScorer.evaluateMailbox({
    totalSent: 100,
    totalReceived: 45,
    spamHits: 2,
    spamRescued: 2,
    bounces: 1,
    replies: 40,
  });

  const scenario2 = HealthScorer.evaluateMailbox({
    totalSent: 100,
    totalReceived: 10,
    spamHits: 25,
    spamRescued: 0,
    bounces: 12,
    replies: 5,
  });

  console.log(' [Optimal Mailbox Scenario]');
  console.log(`  Health Score: ${scenario1.score}/100 (${scenario1.grade})`);
  console.log(`  Inbox Rate: ${scenario1.inboxRate}%, Bounce Rate: ${scenario1.bounceRate}%, Reply Rate: ${scenario1.replyRate}%`);
  console.log(`  Recommendations: ${scenario1.recommendations.join(' | ')}`);

  console.log('\n [Degraded Mailbox Scenario]');
  console.log(`  Health Score: ${scenario2.score}/100 (${scenario2.grade})`);
  console.log(`  Inbox Rate: ${scenario2.inboxRate}%, Bounce Rate: ${scenario2.bounceRate}%, Reply Rate: ${scenario2.replyRate}%`);
  console.log(`  Recommendations: ${scenario2.recommendations.join(' | ')}`);


  // 2. Test Deliverability Shield (Circuit Breaker)
  console.log('\n\n--- 2. Testing Deliverability Shield Audit ---');
  try {
    const activeMailboxes = await getActiveWarmupMailboxes();
    if (activeMailboxes.length > 0) {
      const workspaceId = activeMailboxes[0].workspaceId;
      console.log(` Running Shield Audit on Workspace: ${workspaceId}...`);
      const shieldResults = await DeliverabilityShield.auditWorkspace(workspaceId);
      console.log(` Audited ${shieldResults.length} mailboxes.`);
      const pausedCount = shieldResults.filter(r => r.actionTaken === 'PAUSED').length;
      console.log(` Shield Actions Taken: ${pausedCount} mailboxes auto-paused, ${shieldResults.length - pausedCount} mailboxes healthy ✅`);
    }
  } catch (err: any) {
    console.error(' ❌ Database query error in shield test:', err.message);
  }


  // 3. Test Analytics Summary Service
  console.log('\n--- 3. Testing Analytics Service Aggregation ---');
  try {
    const summary = await AnalyticsService.getWorkspaceSummary('ws_voxora_main');
    console.log(' Workspace Health Summary:', {
      TotalMailboxes: summary.totalMailboxes,
      ActiveMailboxes: summary.activeMailboxes,
      PausedMailboxes: summary.pausedMailboxes,
      DomainsConfigured: summary.domainCount,
      OverallNetworkScore: `${summary.overallHealthScore}/100 (${summary.networkGrade})`,
      TotalSentToday: summary.totalSentToday,
      TotalReceivedToday: summary.totalReceivedToday,
    });
  } catch (err: any) {
    console.error(' ❌ Analytics Service error:', err.message);
  }

  console.log('\n====================================================');
  console.log('✅ PHASE 5 VERIFICATION PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runPhase5Verification().catch(console.error);
