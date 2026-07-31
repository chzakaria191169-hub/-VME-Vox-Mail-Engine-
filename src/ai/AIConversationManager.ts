// src/ai/AIConversationManager.ts
// Generates multi-turn, contextual conversation threads tailored to business niches

export enum BusinessNiche {
  TECHNOLOGY = 'TECHNOLOGY',
  MARKETING = 'MARKETING',
  REAL_ESTATE = 'REAL_ESTATE',
  CONSULTING = 'CONSULTING',
  FINANCE = 'FINANCE',
  LOGISTICS = 'LOGISTICS',
}

export interface ConversationTurn {
  turnNumber: number;
  subject: string;
  body: string;
}

export interface ConversationThread {
  threadId: string;
  niche: BusinessNiche;
  turns: ConversationTurn[];
}

export class AIConversationManager {

  private static nicheTopics: Record<BusinessNiche, Array<{ subject: string; turn1: string; turn2: string; turn3: string }>> = {
    [BusinessNiche.TECHNOLOGY]: [
      {
        subject: "API Integration status and deployment pipeline",
        turn1: "Hi team,\n\nQuick check on the API integration status for the upcoming release. Have we resolved the latency issue on the auth endpoint?\n\nBest regards,\nTech Team",
        turn2: "Hey,\n\nThanks for checking. The latency fix was pushed to staging this morning. Load tests look stable under 100ms now.\n\nCheers,\nDev Ops",
        turn3: "Great news! Let me run the end-to-end test suite today and we can approve the production deploy for tomorrow.\n\nBest,\nTech Lead",
      },
      {
        subject: "Cloud infrastructure cost optimization review",
        turn1: "Hello,\n\nI reviewed the latest cloud billing report. We have some unused reserved instances that can save us ~20% if reallocated.\n\nRegards,\nInfrastructure",
        turn2: "Thanks for highlighting this! Could you send over the specific instance IDs so we can adjust the autoscaling group?\n\nBest,\nSystem Admin",
        turn3: "Done! Details sent over. We should see the cost reduction reflect in next month's invoice.\n\nCheers,",
      }
    ],
    [BusinessNiche.MARKETING]: [
      {
        subject: "Q3 Campaign performance & conversion metrics",
        turn1: "Hi,\n\nInitial Q3 campaign metrics look very promising. CTR is up 18% compared to last month. Shall we scale the budget on channel B?\n\nBest,\nGrowth Lead",
        turn2: "Hi there,\n\nThat's great progress! Yes, let's reallocate 15% budget from channel A to B starting Monday.\n\nRegards,\nMarketing Director",
        turn3: "Sounds great, budget reallocation is scheduled. Will update the performance dashboard accordingly.\n\nBest,",
      },
      {
        subject: "Content strategy & newsletter schedule",
        turn1: "Hello,\n\nHere is the proposed content calendar for next month. Let me know if you want to swap any of the featured case studies.\n\nCheers,\nContent Manager",
        turn2: "Looks solid! Let's swap piece #3 with the customer success story from last week — it has higher relevance.\n\nBest,\nEditor",
        turn3: "Got it! Article swapped and final draft queued for design review.\n\nThanks,",
      }
    ],
    [BusinessNiche.REAL_ESTATE]: [
      {
        subject: "Property listing updates & client site visit schedule",
        turn1: "Good morning,\n\nThe prospective buyer requested a site visit for the downtown commercial space this Thursday. Are we clear to confirm?\n\nBest,\nAgent",
        turn2: "Morning! Yes, Thursday afternoon at 2 PM works. Owner has confirmed keys will be available at reception.\n\nRegards,\nProperty Manager",
        turn3: "Perfect, appointment confirmed with client. Will share feedback right after the tour.\n\nBest regards,",
      }
    ],
    [BusinessNiche.CONSULTING]: [
      {
        subject: "Draft proposal review for strategic advisory project",
        turn1: "Hi,\n\nAttached is the revised project scope for the strategic advisory engagement. Please review section 3 regarding deliverable timelines.\n\nRegards,\nConsultant",
        turn2: "Hi! Timeline looks realistic. Let's make sure we include the stakeholder interview phase in week 2.\n\nBest,\nPartner",
        turn3: "Updated section 3 to reflect week 2 interviews. Sending final draft to the client now.\n\nCheers,",
      }
    ],
    [BusinessNiche.FINANCE]: [
      {
        subject: "Monthly financial audit reconciliation report",
        turn1: "Hello,\n\nThe preliminary reconciliation report for last month is complete. All variances above 5% have been flagged for review.\n\nBest,\nFinance Ops",
        turn2: "Thanks for the swift update. I checked line items 12 and 18 — vendor credit notes account for the variance.\n\nRegards,\nController",
        turn3: "Understood, reconciliation finalized and filed in the audit folder.\n\nThank you,",
      }
    ],
    [BusinessNiche.LOGISTICS]: [
      {
        subject: "Regional shipment tracking and warehouse dispatch",
        turn1: "Hi team,\n\nShipment batch #8492 has left the main distribution hub. Estimated arrival at destination is tomorrow 10 AM.\n\nRegards,\nLogistics Team",
        turn2: "Received! Receiving bay team has been notified and scheduled for offloading.\n\nBest,\nWarehouse Manager",
        turn3: "Excellent coordination. Tracking status marked as 'In Transit - On Schedule'.\n\nThanks,",
      }
    ]
  };

  // Select a random niche or topic
  static getRandomNiche(): BusinessNiche {
    const niches = Object.values(BusinessNiche);
    return niches[Math.floor(Math.random() * niches.length)];
  }

  // Generate a complete 3-turn thread for a thread ID
  static generateThread(threadId: string, niche?: BusinessNiche): ConversationThread {
    const selectedNiche = niche || this.getRandomNiche();
    const topicPool = this.nicheTopics[selectedNiche];
    const chosenTopic = topicPool[Math.floor(Math.random() * topicPool.length)];

    return {
      threadId,
      niche: selectedNiche,
      turns: [
        { turnNumber: 1, subject: chosenTopic.subject, body: chosenTopic.turn1 },
        { turnNumber: 2, subject: `Re: ${chosenTopic.subject}`, body: chosenTopic.turn2 },
        { turnNumber: 3, subject: `Re: ${chosenTopic.subject}`, body: chosenTopic.turn3 },
      ]
    };
  }

  // Get next turn for an existing conversation based on turn index
  static getNextTurn(thread: ConversationThread, currentTurn: number): ConversationTurn | null {
    if (currentTurn >= thread.turns.length) return null;
    return thread.turns[currentTurn];
  }
}
