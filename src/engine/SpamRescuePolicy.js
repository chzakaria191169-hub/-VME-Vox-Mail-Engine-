class SpamRescuePolicy {
    constructor(syncEngine) {
        this.syncEngine = syncEngine;
        this.eventLogs = [];
    }

    emitEvent(eventType, level = "INFO", message, metadata = {}) {
        const log = {
            id: `evt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            eventType,
            level,
            message,
            metadata,
            createdAt: new Date().toISOString()
        };
        this.eventLogs.push(log);
        console.log(`📡 [SPAM RESCUE EVENT: ${eventType}] ${message}`);
        return log;
    }

    /**
     * Evaluates if a message trapped in SPAM belongs to VME network.
     * Criteria:
     * 1. Message In-Reply-To header matches an existing VME message
     * 2. OR body contains active VME tracking payload hash
     */
    isVMENetworkMatch(message, knownVmeMessageIds = new Set()) {
        if (message.inReplyTo && knownVmeMessageIds.has(message.inReplyTo)) {
            return true;
        }
        if (message.body && message.body.includes("vme_network_token")) {
            return true;
        }
        return false;
    }

    async evaluateAndRescueSpam(message, mailbox, options = {}) {
        if (message.folder !== 'SPAM') {
            return { rescued: false, reason: "NOT_IN_SPAM_FOLDER" };
        }

        const knownIds = options.knownVmeMessageIds || new Set(["<vme_orig_500@voxora.agency>"]);
        const matchesVME = this.isVMENetworkMatch(message, knownIds);

        if (!matchesVME) {
            console.log(`ℹ️ [SPAM RESCUE] Message ${message.id} in SPAM does NOT belong to VME network. Leaving in SPAM.`);
            return { rescued: false, reason: "NO_VME_NETWORK_MATCH" };
        }

        this.emitEvent("MESSAGE_IN_SPAM", "WARN", `VME Message ${message.id} detected in SPAM for ${mailbox.email}`, { messageId: message.id });
        this.emitEvent("MESSAGE_RESCUE_STARTED", "INFO", `Initiating IMAP MOVE (SPAM -> INBOX) for ${message.id}`, { messageId: message.id });

        try {
            if (options.forceMoveError) {
                throw new Error("IMAP MOVE Command Failed");
            }

            // Simulate IMAP UID MOVE to INBOX (with UID COPY + STORE \Deleted fallback)
            message.folder = 'INBOX';
            message.status = 'RESCUED';

            this.emitEvent("MESSAGE_MOVED_TO_INBOX", "INFO", `Successfully rescued message ${message.id} to INBOX!`, { messageId: message.id });

            return {
                rescued: true,
                message
            };

        } catch (error) {
            message.status = 'RESCUE_FAILED';
            this.emitEvent("MESSAGE_RESCUE_FAILED", "ERROR", `Failed to rescue message ${message.id}: ${error.message}`, { messageId: message.id });

            return {
                rescued: false,
                error: error.message
            };
        }
    }
}

module.exports = SpamRescuePolicy;
