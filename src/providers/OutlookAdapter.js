const GenericSmtpImapProvider = require('./GenericSmtpImapProvider');
const BaseAdapter = require('./BaseAdapter');

class OutlookAdapter extends BaseAdapter {
    constructor(config) {
        super({
            ...config,
            smtpHost: 'smtp-mail.outlook.com',
            smtpPort: config.smtpPort || 587,
            smtpSecure: false,
            imapHost: 'outlook.office365.com',
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

module.exports = OutlookAdapter;
