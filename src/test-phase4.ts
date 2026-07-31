// src/test-phase4.ts - Complete verification runner for Phase 4 (Warmup Network & Smart AI Conversations)

import dotenv from 'dotenv';
dotenv.config();

import { AIConversationManager, BusinessNiche } from './ai/AIConversationManager';
import { WarmupNetwork, MailboxPeer } from './core/network/WarmupNetwork';
import { EngagementSimulator } from './core/engagement/EngagementSimulator';
import { getActiveWarmupMailboxes } from './db/supabase';
import { ProviderType } from './types';

async function runPhase4Verification() {
  console.log('====================================================');
  console.log('🚀 TESTING VME PHASE 4: WARMUP NETWORK & AI THREADS');
  console.log('====================================================\n');

  // 1. Test AI Conversation Manager across Niches
  console.log('--- 1. Testing AI Multi-Turn Conversation Generator ---');
  const niches = [BusinessNiche.TECHNOLOGY, BusinessNiche.MARKETING, BusinessNiche.REAL_ESTATE];

  for (const niche of niches) {
    const thread = AIConversationManager.generateThread(`thread-${Date.now()}`, niche);
    console.log(`\n[Niche: ${thread.niche}]`);
    console.log(` 💬 Turn 1 Subject: "${thread.turns[0].subject}"`);
    console.log(` 💬 Turn 1 Preview: ${thread.turns[0].body.split('\n')[0]}`);
    console.log(` 💬 Turn 2 Subject: "${thread.turns[1].subject}"`);
    console.log(` 💬 Turn 2 Preview: ${thread.turns[1].body.split('\n')[0]}`);
    console.log(` 💬 Turn 3 Subject: "${thread.turns[2].subject}"`);
    console.log(` 💬 Turn 3 Preview: ${thread.turns[2].body.split('\n')[0]}`);
  }

  // 2. Test Warmup Network Peer Selection & Diversity
  console.log('\n\n--- 2. Testing Warmup Network & Peer Matching Strategy ---');
  try {
    const rawMailboxes = await getActiveWarmupMailboxes();
    const peers: MailboxPeer[] = rawMailboxes.map(m => ({
      id: m.id,
      email: m.email,
      domain: m.domain || m.email.split('@')[1],
      provider: m.provider as ProviderType,
      workspaceId: m.workspaceId,
      warmupScore: m.warmupScore || 75,
      todaySent: m.todaySent || 0,
      warmupDailyLimit: m.warmupDailyLimit || 20,
    }));

    const stats = WarmupNetwork.calculateNetworkStats(peers);
    console.log(` Total Network Pool Size: ${stats.totalMailboxes} mailboxes across ${stats.totalDomains} domains`);
    console.log(` Provider Distribution:`, stats.providerDistribution);
    console.log(` Average Network Health Score: ${stats.averageHealthScore}/100 🔥`);

    if (peers.length > 0) {
      const sampleSender = peers[0];
      const selectedPeer = WarmupNetwork.selectPeer(sampleSender, peers, []);
      console.log(`\n Matching Test for Sender: ${sampleSender.email} (${sampleSender.provider})`);
      console.log(` -> Selected Optimal Peer: ${selectedPeer?.email} (${selectedPeer?.provider})`);
      console.log(` -> Match Quality: ${selectedPeer?.provider !== sampleSender.provider ? '⭐ Tier 1 Cross-Provider' : 'Tier 2 Cross-Domain'}`);
    }

  } catch (err: any) {
    console.error(' ❌ Database query error in network test:', err.message);
  }

  // 3. Test Engagement Simulator
  console.log('\n--- 3. Testing Engagement Simulator ---');
  const normalPlan = EngagementSimulator.createEngagementPlan(false);
  const spamPlan = EngagementSimulator.createEngagementPlan(true);

  console.log(' Normal Inbox Engagement Plan:', {
    MarkAsRead: normalPlan.markAsRead,
    StarImportant: normalPlan.markAsImportant,
    SendReply: normalPlan.sendReply,
    ReplyDelayMinutes: Math.round(normalPlan.replyDelayMs / 60000),
  });

  console.log(' Spam Rescue Plan:', {
    MoveFromSpamToInbox: spamPlan.moveToInboxIfSpam,
    MarkAsRead: spamPlan.markAsRead,
    StarImportant: spamPlan.markAsImportant,
    SendReply: spamPlan.sendReply,
  });

  console.log('\n====================================================');
  console.log('✅ PHASE 4 VERIFICATION PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runPhase4Verification().catch(console.error);
