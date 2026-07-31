// src/providers/base/BaseProvider.ts

import { MailboxConfig, SendOptions, EmailMessage, ConnectionTestResult, ProviderType } from '../../types';

export abstract class BaseProvider {
  abstract readonly providerType: ProviderType;
  protected config: MailboxConfig;

  constructor(config: MailboxConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendEmail(options: SendOptions): Promise<string>;
  abstract fetchEmails(folder?: string, since?: Date): Promise<EmailMessage[]>;
  abstract markAsRead(messageId: string, folder?: string): Promise<void>;
  abstract markAsImportant(messageId: string, folder?: string): Promise<void>;
  abstract moveToInbox(messageId: string, fromFolder?: string): Promise<void>;
  abstract testConnection(): Promise<ConnectionTestResult>;
}
