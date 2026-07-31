// src/providers/custom/CustomProvider.ts

import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { BaseProvider } from '../base/BaseProvider';
import { MailboxConfig, SendOptions, EmailMessage, ConnectionTestResult, ProviderType } from '../../types';

export class CustomProvider extends BaseProvider {
  readonly providerType = ProviderType.CUSTOM;
  private smtpTransporter: nodemailer.Transporter;
  private imapClient: ImapFlow;

  constructor(config: MailboxConfig) {
    super(config);
    this.smtpTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure !== undefined ? config.smtpSecure : (config.smtpPort === 465),
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.imapClient = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: config.imapSecure !== undefined ? config.imapSecure : (config.imapPort === 993),
      auth: {
        user: config.imapUser,
        pass: config.imapPassword,
      },
      logger: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async connect(): Promise<void> {
    await this.imapClient.connect();
  }

  async disconnect(): Promise<void> {
    try {
      await this.imapClient.logout();
    } catch {
      // ignore
    }
  }

  async sendEmail(options: SendOptions): Promise<string> {
    const info = await this.smtpTransporter.sendMail({
      from: `"${options.from}" <${options.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      messageId: options.messageId,
      inReplyTo: options.inReplyTo,
      references: options.references ? options.references.join(' ') : undefined,
    });
    return info.messageId || options.messageId || '';
  }

  async fetchEmails(folder = 'INBOX', since?: Date): Promise<EmailMessage[]> {
    const messages: EmailMessage[] = [];
    await this.connect();
    const lock = await this.imapClient.getMailboxLock(folder);
    try {
      const searchCriteria: any = { all: true };
      if (since) searchCriteria.since = since;

      for await (const message of this.imapClient.fetch(searchCriteria, { envelope: true, bodyStructure: true, flags: true })) {
        if (!message.envelope) continue;
        messages.push({
          messageId: message.envelope.messageId || '',
          from: message.envelope.from?.[0]?.address || '',
          to: message.envelope.to?.[0]?.address || '',
          subject: message.envelope.subject || '',
          text: '',
          date: message.envelope.date || new Date(),
          folder,
          isRead: message.flags ? message.flags.has('\\Seen') : false,
          isSpam: folder.toLowerCase().includes('spam') || folder.toLowerCase().includes('junk'),
          inReplyTo: message.envelope.inReplyTo || undefined,
        });
      }
    } finally {
      lock.release();
      await this.disconnect();
    }
    return messages;
  }

  async markAsRead(messageId: string, folder = 'INBOX'): Promise<void> {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock(folder);
    try {
      await this.imapClient.messageFlagsAdd({ header: { 'message-id': messageId } }, ['\\Seen']);
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  async markAsImportant(messageId: string, folder = 'INBOX'): Promise<void> {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock(folder);
    try {
      await this.imapClient.messageFlagsAdd({ header: { 'message-id': messageId } }, ['\\Flagged']);
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  async moveToInbox(messageId: string, fromFolder = 'Spam'): Promise<void> {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock(fromFolder);
    try {
      await this.imapClient.messageMove({ header: { 'message-id': messageId } }, 'INBOX');
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const result: ConnectionTestResult = {
      mailboxEmail: this.config.email,
      provider: this.providerType,
      smtpSuccess: false,
      imapSuccess: false,
      testedAt: new Date(),
    };

    try {
      await this.smtpTransporter.verify();
      result.smtpSuccess = true;
    } catch (err: any) {
      result.smtpSuccess = false;
      result.smtpError = err.message;
    }

    try {
      await this.connect();
      result.imapSuccess = true;
      await this.disconnect();
    } catch (err: any) {
      result.imapSuccess = false;
      result.imapError = err.message;
    }

    return result;
  }
}
