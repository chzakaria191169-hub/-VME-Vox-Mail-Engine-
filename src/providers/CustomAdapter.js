const GenericSmtpImapProvider = require('./GenericSmtpImapProvider');
const BaseAdapter = require('./BaseAdapter');

class CustomAdapter extends BaseAdapter {
    constructor(config) {
        super(config); // Expects custom smtpHost, smtpPort, imapHost, imapPort, user, password, ssl
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

module.exports = CustomAdapter;
