const crypto = require('crypto');

class MessageDeduplicationPolicy {
    constructor(maxMemoryKeys = 10000) {
        this.deduplicationStore = new Set();
        this.maxMemoryKeys = maxMemoryKeys;
        this.keyOrder = []; // Queue for LRU memory bound safety
    }

    /**
     * Generates a unique deduplication key.
     * Primary: RFC 5322 Message-ID header (sanitized).
     * Fallback: SHA-256(mailboxId + folder + UIDVALIDITY + UID + internalDate + subjectHash)
     */
    static generateKey(rawMsg, mailboxId, normalizedFolder) {
        // Clean and validate Message-ID (Scoped to mailboxId to prevent cross-mailbox/tenant collisions)
        if (rawMsg.messageId && typeof rawMsg.messageId === 'string' && rawMsg.messageId.trim().length > 3) {
            const cleanMessageId = rawMsg.messageId.trim().toLowerCase();
            const mbId = mailboxId || 'global';
            return `msg_id:${mbId}:${cleanMessageId}`;
        }

        // Fallback Composite Key featuring UIDVALIDITY to prevent cross-session UID collisions
        const uidValidity = rawMsg.uidValidity || '1';
        const uid = rawMsg.uid || '0';
        const date = rawMsg.internalDate || new Date().toISOString();
        const subjectHash = crypto.createHash('sha256').update((rawMsg.subject || '').trim().toLowerCase()).digest('hex').substring(0, 16);

        const composite = `${mailboxId}:${normalizedFolder}:${uidValidity}:${uid}:${date}:${subjectHash}`;
        const hash = crypto.createHash('sha256').update(composite).digest('hex');
        return `hash:${hash}`;
    }

    isDuplicate(key) {
        return this.deduplicationStore.has(key);
    }

    registerKey(key) {
        if (this.deduplicationStore.has(key)) return;

        // Bounded memory protection to prevent memory leaks
        if (this.deduplicationStore.size >= this.maxMemoryKeys) {
            const oldestKey = this.keyOrder.shift();
            if (oldestKey) this.deduplicationStore.delete(oldestKey);
        }

        this.deduplicationStore.add(key);
        this.keyOrder.push(key);
    }
}

module.exports = MessageDeduplicationPolicy;
