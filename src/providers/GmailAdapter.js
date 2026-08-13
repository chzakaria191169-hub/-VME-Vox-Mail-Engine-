const GenericSmtpImapProvider = require('./GenericSmtpImapProvider');
const BaseAdapter = require('./BaseAdapter');

class GmailAdapter extends BaseAdapter {
    constructor(config) {
        super({
            ...config,
            smtpHost: 'smtp.gmail.com',
            smtpPort: config.smtpPort || 465,
            smtpSecure: config.smtpPort === 587 ? false : true,
            imapHost: 'imap.gmail.com',
            imapPort: 993,
            imapSecure: true
        });
        this.provider = new GenericSmtpImapProvider(this.config);
    }

    async send(options) {
        return await this.provider.sendEmail(options);
    }

    async testSmtp() {
        const res = await this.provider.testConnection();
        return res.smtp;
    }

    async testImap() {
        const res = await this.provider.testConnection();
        return res.imap;
    }

    getStatus() {
        return { connected: true, lastSync: new Date() };
    }
}

module.exports = GmailAdapter;
