// src/types/index.ts - Core TypeScript Interfaces for Vox Mail Engine (VME)

export enum ProviderType {
  ZOHO = 'ZOHO',
  GMAIL = 'GMAIL',
  OUTLOOK = 'OUTLOOK',
  MICROSOFT365 = 'MICROSOFT365',
  CUSTOM = 'CUSTOM',
}

export enum MailboxStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

export enum MessageType {
  WARMUP = 'WARMUP',
  COLD_EMAIL = 'COLD_EMAIL',
  REPLY = 'REPLY',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  REPLIED = 'REPLIED',
  BOUNCED = 'BOUNCED',
  SPAM = 'SPAM',
  RECOVERED = 'RECOVERED',
  FAILED = 'FAILED',
}

export interface MailboxConfig {
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure?: boolean;
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPassword: string;
  imapSecure?: boolean;
}

export interface SendOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface EmailMessage {
  messageId: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  date: Date;
  folder: string;
  isRead: boolean;
  isSpam: boolean;
  inReplyTo?: string;
}

export interface ConnectionTestResult {
  mailboxEmail: string;
  provider: ProviderType;
  smtpSuccess: boolean;
  imapSuccess: boolean;
  smtpError?: string;
  imapError?: string;
  testedAt: Date;
}
