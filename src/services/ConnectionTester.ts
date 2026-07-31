// src/services/ConnectionTester.ts

import { ProviderFactory } from '../providers/ProviderFactory';
import { MailboxConfig, ConnectionTestResult, ProviderType } from '../types';

export class ConnectionTester {
  static async testMailbox(config: MailboxConfig, provider: ProviderType): Promise<ConnectionTestResult> {
    const instance = ProviderFactory.create(config, provider);
    return await instance.testConnection();
  }

  static async testBatch(mailboxes: { config: MailboxConfig; provider: ProviderType }[]): Promise<ConnectionTestResult[]> {
    const results: ConnectionTestResult[] = [];
    for (const m of mailboxes) {
      console.log(`[ConnectionTester] Testing ${m.config.email}...`);
      const res = await this.testMailbox(m.config, m.provider);
      results.push(res);
      console.log(`  └─ SMTP: ${res.smtpSuccess ? '✅ PASS' : '❌ FAIL'} | IMAP: ${res.imapSuccess ? '✅ PASS' : '❌ FAIL'}`);
    }
    return results;
  }
}
