// src/core/network/WarmupNetwork.ts
// Intelligent Warmup Network & Peer Matching Strategy

import { ProviderType } from '../../types';

export interface MailboxPeer {
  id: string;
  email: string;
  domain: string;
  provider: ProviderType;
  workspaceId: string;
  warmupScore: number;
  todaySent: number;
  warmupDailyLimit: number;
}

export class WarmupNetwork {

  // ============================================
  // SELECT OPTIMAL PEER FOR WARMUP EXCHANGE
  // Multi-tier selection strategy:
  // 1. Cross-Provider + Cross-Domain (Best for deliverability)
  // 2. Cross-Domain (Same Provider)
  // 3. Fallback: Any available peer except self
  // ============================================
  static selectPeer(sender: MailboxPeer, availablePeers: MailboxPeer[], recentPeerIds: string[]): MailboxPeer | null {
    // Exclude sender itself and recently interacted peers
    const validPeers = availablePeers.filter(p =>
      p.id !== sender.id &&
      !recentPeerIds.includes(p.id) &&
      p.todaySent < p.warmupDailyLimit
    );

    if (validPeers.length === 0) {
      // Relax recent interaction constraint if pool is exhausted
      const fallbackPeers = availablePeers.filter(p => p.id !== sender.id && p.todaySent < p.warmupDailyLimit);
      if (fallbackPeers.length === 0) return null;
      return this.weightedRandomSelect(fallbackPeers);
    }

    // Tier 1: Cross-Provider AND Cross-Domain
    const tier1 = validPeers.filter(p => p.provider !== sender.provider && p.domain !== sender.domain);
    if (tier1.length > 0) {
      return this.weightedRandomSelect(tier1);
    }

    // Tier 2: Cross-Domain (Same Provider)
    const tier2 = validPeers.filter(p => p.domain !== sender.domain);
    if (tier2.length > 0) {
      return this.weightedRandomSelect(tier2);
    }

    // Tier 3: Any valid peer remaining
    return this.weightedRandomSelect(validPeers);
  }

  // ============================================
  // WEIGHTED RANDOM SELECTION
  // Prefers high health-score peers to act as "Anchors"
  // ============================================
  private static weightedRandomSelect(peers: MailboxPeer[]): MailboxPeer {
    // If scores are default 0, fallback to uniform random
    const totalScore = peers.reduce((sum, p) => sum + (p.warmupScore || 50), 0);
    let rand = Math.random() * totalScore;

    for (const peer of peers) {
      const score = peer.warmupScore || 50;
      if (rand < score) {
        return peer;
      }
      rand -= score;
    }

    return peers[Math.floor(Math.random() * peers.length)];
  }

  // ============================================
  // GET NETWORK HEALTH METRICS
  // Summarizes network diversity across providers
  // ============================================
  static calculateNetworkStats(peers: MailboxPeer[]) {
    const providerCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    let totalScore = 0;

    for (const peer of peers) {
      providerCounts[peer.provider] = (providerCounts[peer.provider] || 0) + 1;
      domainCounts[peer.domain] = (domainCounts[peer.domain] || 0) + 1;
      totalScore += peer.warmupScore || 0;
    }

    const averageHealthScore = peers.length > 0 ? Math.round(totalScore / peers.length) : 0;

    return {
      totalMailboxes: peers.length,
      providerDistribution: providerCounts,
      totalDomains: Object.keys(domainCounts).length,
      averageHealthScore,
    };
  }
}
