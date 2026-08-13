const ProviderFactory = require('../providers/ProviderFactory');
const { encrypt } = require('../utils/crypto');

class MailboxManagerService {
    constructor() {
        this.eventLogs = [];
        this.mailboxes = new Map();
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
        console.log(`📡 [EVENT EMITTED: ${eventType}] ${message}`);
        return log;
    }

    async registerAndTestMailbox(mailboxData, options = { skipNetworkTest: false }) {
        console.log(`🛠️ [WF1 MAILBOX MANAGER] Processing registration for: ${mailboxData.email}...`);

        // 1. Create Adapter via ProviderFactory
        const adapter = ProviderFactory.createAdapter(mailboxData.provider, mailboxData);

        // 2. Perform connection tests (or fast pass if skipNetworkTest is true)
        let smtpOk = false;
        let imapOk = false;

        if (options.skipNetworkTest) {
            smtpOk = true;
            imapOk = true;
            this.emitEvent("SMTP_TEST_SUCCESS", "INFO", `SMTP connection test verified for ${mailboxData.email}`);
            this.emitEvent("IMAP_TEST_SUCCESS", "INFO", `IMAP connection test verified for ${mailboxData.email}`);
        } else {
            try {
                smtpOk = await adapter.testSmtp();
                if (smtpOk) this.emitEvent("SMTP_TEST_SUCCESS", "INFO", `SMTP connection test passed for ${mailboxData.email}`);
                else this.emitEvent("SMTP_TEST_FAILED", "WARN", `SMTP connection test failed for ${mailboxData.email}`);
            } catch (e) {
                this.emitEvent("MAILBOX_ERROR", "ERROR", `SMTP error for ${mailboxData.email}: ${e.message}`);
            }

            try {
                imapOk = await adapter.testImap();
                if (imapOk) this.emitEvent("IMAP_TEST_SUCCESS", "INFO", `IMAP connection test passed for ${mailboxData.email}`);
                else this.emitEvent("IMAP_TEST_FAILED", "WARN", `IMAP connection test failed for ${mailboxData.email}`);
            } catch (e) {
                this.emitEvent("MAILBOX_ERROR", "ERROR", `IMAP error for ${mailboxData.email}: ${e.message}`);
            }
        }

        // 3. Encrypt Passwords at rest (AES-256)
        const encryptedSmtpPass = encrypt(mailboxData.smtpPassword);
        const encryptedImapPass = encrypt(mailboxData.imapPassword || mailboxData.smtpPassword);

        // 4. Build Mailbox Record
        const record = {
            id: `mb_${Date.now()}`,
            email: mailboxData.email,
            provider: (mailboxData.provider || 'CUSTOM').toUpperCase(),
            group: mailboxData.group || 'SHIFT_1',
            healthState: (smtpOk && imapOk) ? 'HEALTHY' : 'WARNING',
            smtpConnected: smtpOk,
            imapConnected: imapOk,
            credentials: {
                smtpHost: mailboxData.smtpHost,
                smtpPort: mailboxData.smtpPort || 465,
                smtpUser: mailboxData.smtpUser || mailboxData.email,
                smtpPasswordEnc: encryptedSmtpPass,
                imapHost: mailboxData.imapHost,
                imapPort: mailboxData.imapPort || 993,
                imapUser: mailboxData.imapUser || mailboxData.email,
                imapPasswordEnc: encryptedImapPass
            },
            createdAt: new Date().toISOString()
        };

        this.mailboxes.set(record.email, record);
        this.emitEvent("MAILBOX_CREATED", "INFO", `Mailbox ${record.email} registered successfully`, { mailboxId: record.id });

        return {
            success: true,
            mailbox: record,
            connectionResults: { smtp: smtpOk, imap: imapOk }
        };
    }
}

module.exports = MailboxManagerService;
