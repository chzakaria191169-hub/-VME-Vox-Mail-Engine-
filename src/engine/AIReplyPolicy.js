const BounceClassifier = require('./BounceClassifier');

class AIReplyProvider {
    async generateReply(incomingMessage, options = {}) {
        throw new Error("Method generateReply() must be implemented in child AI provider class.");
    }
}

class MockAIProvider extends AIReplyProvider {
    async generateReply(incomingMessage, options = {}) {
        return {
            subject: `Re: ${(incomingMessage.subject || '').replace(/^Re:\s*/i, '')}`,
            body: `Hi, thank you for reaching out! I received your email regarding "${incomingMessage.subject}". Let's discuss further soon.`,
            confidence: 0.95,
            model: "mock-ai-provider-v1"
        };
    }
}

class AIReplyPolicy {
    constructor(aiProvider = new MockAIProvider()) {
        this.aiProvider = aiProvider;
        this.enabled = true; // Can be toggled on/off independently
    }

    /**
     * Fail-Closed Safety Exclusion Rules:
     * If ANY doubt exists ➔ DO NOT AUTO-REPLY.
     */
    isEligibleForAIReply(message) {
        if (!this.enabled) return { eligible: false, reason: "AI_POLICY_DISABLED" };

        const from = (message.fromEmail || message.from || '').toLowerCase().trim();
        const subject = (message.subject || '').toLowerCase().trim();
        const headers = message.headers || {};

        // 1. Fail-Closed: Bounces & Delivery Failures
        const bounceEval = BounceClassifier.classify(message);
        if (bounceEval.isBounce) {
            return { eligible: false, reason: "BOUNCE_OR_DSN_DETECTED" };
        }

        // 2. Fail-Closed: System Notifications & Automated Addresses
        const excludedSenders = ["no-reply@", "noreply@", "donotreply@", "mailer-daemon@", "postmaster@", "notifications@", "support@"];
        if (excludedSenders.some(s => from.includes(s))) {
            return { eligible: false, reason: "EXCLUDED_SYSTEM_SENDER" };
        }

        // 3. Fail-Closed: Auto-Submitted & Auto-Response Headers
        if (headers['auto-submitted'] || headers['Auto-Submitted'] || headers['x-auto-response-suppress']) {
            return { eligible: false, reason: "AUTO_SUBMITTED_HEADER" };
        }

        // 4. Fail-Closed: Folder Scope (Must be INBOX)
        if (message.folder !== 'INBOX') {
            return { eligible: false, reason: "NOT_IN_INBOX_FOLDER" };
        }

        // 5. Fail-Closed: Direction Scope (Must be RECEIVED)
        if (message.direction && message.direction !== 'RECEIVED') {
            return { eligible: false, reason: "NOT_RECEIVED_DIRECTION" };
        }

        return { eligible: true };
    }

    async generateAutoReply(message, options = {}) {
        const evalRes = this.isEligibleForAIReply(message);
        if (!evalRes.eligible) {
            console.log(`ℹ️ [AI REPLY POLICY FAIL-CLOSED] Message ${message.id || 'raw'} skipped for AI Reply: ${evalRes.reason}`);
            return { generated: false, reason: evalRes.reason };
        }

        const aiResponse = await this.aiProvider.generateReply(message, options);
        return {
            generated: true,
            replyPayload: aiResponse
        };
    }
}

module.exports = {
    AIReplyProvider,
    MockAIProvider,
    AIReplyPolicy
};
