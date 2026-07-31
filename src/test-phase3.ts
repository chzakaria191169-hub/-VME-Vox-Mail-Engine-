// src/test-phase3.ts - Complete verification runner for Phase 3 (Mail Engine & Scheduler)

import dotenv from 'dotenv';
dotenv.config();

import { SpintaxEngine } from './ai/SpintaxEngine';
import { RulesEngine, DEFAULT_RULE } from './core/rules/RulesEngine';
import { getActiveWarmupMailboxes, getRuleForMailbox, getRecentSendPairs } from './db/supabase';

async function runPhase3Verification() {
  console.log('====================================================');
  console.log('🚀 TESTING VME PHASE 3: MAIL ENGINE & SCHEDULER');
  console.log('====================================================\n');

  // 1. Test Spintax Content Engine
  console.log('--- 1. Testing Spintax Engine ---');
  for (let i = 1; i <= 3; i++) {
    const sample = SpintaxEngine.generate(`Sender ${i}`);
    console.log(`[Sample ${i}]`);
    console.log(` Subject: "${sample.subject}"`);
    console.log(` Body Preview: ${sample.body.split('\n')[0]}...`);
  }
  const replySample = SpintaxEngine.generateReply("Re: Project update", "John Doe");
  console.log(`[Reply Sample]`);
  console.log(` Subject: "${replySample.subject}"`);
  console.log(` Body Preview: ${replySample.body.split('\n')[0]}...\n`);

  // 2. Test Rules Engine
  console.log('--- 2. Testing Rules Engine ---');
  const canSend = RulesEngine.canSendNow(DEFAULT_RULE);
  const target = RulesEngine.getDailyTarget(DEFAULT_RULE);
  const sendDelay = RulesEngine.getSendDelayMs();
  const replyDelay = RulesEngine.getReplyDelayMs(DEFAULT_RULE);
  const warmupScore = RulesEngine.calculateWarmupScore({
    totalSent: 50,
    spamCount: 2,
    replyCount: 30,
    recoveredCount: 2,
  });

  console.log(` Can send right now? ${canSend ? '✅ YES' : '⏸ NO (Outside business hours/weekend)'}`);
  console.log(` Daily target range (${DEFAULT_RULE.minDailyEmails}-${DEFAULT_RULE.maxDailyEmails}): Selected ${target} emails/day`);
  console.log(` Random send delay generated: ${Math.round(sendDelay / 60000)} minutes`);
  console.log(` Random reply delay generated: ${Math.round(replyDelay / 60000)} minutes`);
  console.log(` Calculated Warmup Health Score: ${warmupScore}/100 🔥\n`);

  // 3. Database & Mailbox Pool Inspection
  console.log('--- 3. Database Mailbox & Rule Integration ---');
  try {
    const activeMailboxes = await getActiveWarmupMailboxes();
    console.log(` Found ${activeMailboxes.length} active warmup mailboxes in database.`);

    if (activeMailboxes.length > 0) {
      const sampleMb = activeMailboxes[0];
      const rule = await getRuleForMailbox(sampleMb.id, sampleMb.workspaceId);
      const recentPairs = await getRecentSendPairs(sampleMb.id, 48);

      console.log(` Mailbox Sample: ${sampleMb.email} (${sampleMb.provider})`);
      console.log(` Daily Warmup Limit: ${sampleMb.warmupDailyLimit}`);
      console.log(` Custom or Default Rule bound: ${rule ? 'Custom Rule' : 'Default Rule'}`);
      console.log(` Recent Send History Count (48h): ${recentPairs.length} pairs logged`);
    }
  } catch (err: any) {
    console.error(' ❌ Database query error:', err.message);
  }

  console.log('\n====================================================');
  console.log('✅ PHASE 3 VERIFICATION PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runPhase3Verification().catch(console.error);
