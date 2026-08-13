class BaseProvider {
    constructor(config) {
        this.config = config;
    }

    async sendEmail({ from, to, subject, text, html, messageId, inReplyTo, references }) {
        throw new Error("Method sendEmail() must be implemented in child provider.");
    }

    async fetchEmails({ folder = 'INBOX', since = null }) {
        throw new Error("Method fetchEmails() must be implemented in child provider.");
    }

    async moveToFolder({ messageId, targetFolder = 'INBOX' }) {
        throw new Error("Method moveToFolder() must be implemented in child provider.");
    }

    async markFlags({ messageId, flags = ['\\Seen', '\\Flagged'] }) {
        throw new Error("Method markFlags() must be implemented in child provider.");
    }

    async testConnection() {
        throw new Error("Method testConnection() must be implemented in child provider.");
    }
}

module.exports = BaseProvider;
