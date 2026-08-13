class ThreadAssociationEngine {
    constructor() {
        this.threads = new Map(); // conversationId -> Array of Message-IDs
    }

    /**
     * Associates an incoming message to an existing conversation thread via In-Reply-To or References headers.
     */
    associateMessage(message, knownMessageToConversationMap = new Map()) {
        const inReplyTo = (message.inReplyTo || '').trim().toLowerCase();
        const references = (message.references || []).map(r => r.trim().toLowerCase());

        // 1. Check In-Reply-To Direct Match
        if (inReplyTo && knownMessageToConversationMap.has(inReplyTo)) {
            const convId = knownMessageToConversationMap.get(inReplyTo);
            return { matched: true, conversationId: convId, matchedBy: "IN_REPLY_TO" };
        }

        // 2. Check References Header Array Match
        for (const refId of references) {
            if (refId && knownMessageToConversationMap.has(refId)) {
                const convId = knownMessageToConversationMap.get(refId);
                return { matched: true, conversationId: convId, matchedBy: "REFERENCES_ARRAY" };
            }
        }

        // 3. No match -> Creates new conversation ID
        const newConvId = `conv_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        return { matched: false, conversationId: newConvId, matchedBy: "NEW_THREAD" };
    }
}

module.exports = ThreadAssociationEngine;
