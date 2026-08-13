const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const BaseProvider = require('./BaseProvider');

class GenericSmtpImapProvider extends BaseProvider {
    constructor(config) {
        super(config);
        // config = { email, smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, imapHost, imapPort, imapUser, imapPassword, imapSecure }
    }

    createTransporter() {
        return nodemailer.createTransport({
            host: this.config.smtpHost,
            port: this.config.smtpPort,
            secure: this.config.smtpSecure !== undefined ? this.config.smtpSecure : (this.config.smtpPort === 465),
            auth: {
                user: this.config.smtpUser || this.config.email,
                pass: this.config.smtpPassword
            },
            tls: { rejectUnauthorized: false }
        });
    }

    createImapClient() {
        return new ImapFlow({
            host: this.config.imapHost,
            port: this.config.imapPort || 993,
            secure: this.config.imapSecure !== undefined ? this.config.imapSecure : true,
            auth: {
                user: this.config.imapUser || this.config.email,
                pass: this.config.imapPassword
            },
            logger: false,
            tls: { rejectUnauthorized: false }
        });
    }

    async sendEmail({ from, to, subject, text, html, messageId, inReplyTo, references }) {
        const transporter = this.createTransporter();
        const mailOptions = {
            from: from || this.config.email,
            to: to,
            subject: subject,
            text: text,
            html: html || text,
            headers: {}
        };
        if (messageId) mailOptions.messageId = messageId;
        if (inReplyTo) mailOptions.inReplyTo = inReplyTo;
        if (references) mailOptions.headers['References'] = Array.isArray(references) ? references.join(' ') : references;

        const info = await transporter.sendMail(mailOptions);
        return info.messageId;
    }

    async testConnection() {
        const results = { smtp: false, imap: false, error: null };
        try {
            const transporter = this.createTransporter();
            await transporter.verify();
            results.smtp = true;
        } catch (e) {
            results.error = `SMTP Error: ${e.message}`;
        }

        try {
            const client = this.createImapClient();
            await client.connect();
            await client.logout();
            results.imap = true;
        } catch (e) {
            if (!results.error) results.error = `IMAP Error: ${e.message}`;
            else results.error += ` | IMAP Error: ${e.message}`;
        }

        return results;
    }
}

module.exports = GenericSmtpImapProvider;
