// src/test_phase2_plugins.ts

import { ConnectionTester } from './services/ConnectionTester';
import { ProviderType } from './types';

async function runPhase2Test() {
  console.log("=== VME Phase 2: Testing Provider Plugin System across Domains ===");

  const testAccounts = [
    { email: 'ava@amplixa.work', provider: ProviderType.ZOHO },
    { email: 'sophia@axevia.work', provider: ProviderType.ZOHO },
    { email: 'maya@convertiq.work', provider: ProviderType.ZOHO },
    { email: 'emily@elevore.work', provider: ProviderType.ZOHO },
    { email: 'charlotte@marketiva.work', provider: ProviderType.ZOHO },
    { email: 'addison@vilora.work', provider: ProviderType.ZOHO },
    { email: 'hannah@virixo.work', provider: ProviderType.ZOHO },
    { email: 'claire@virrexa.online', provider: ProviderType.ZOHO },
    { email: 'sophia@virrexa.work', provider: ProviderType.ZOHO },
  ];

  for (const acc of testAccounts) {
    const config = {
      email: acc.email,
      smtpHost: 'smtp.zoho.com',
      smtpPort: 465,
      smtpUser: acc.email,
      smtpPassword: 'Ch@zaki191169',
      smtpSecure: true,
      imapHost: 'imap.zoho.com',
      imapPort: 993,
      imapUser: acc.email,
      imapPassword: 'Ch@zaki191169',
      imapSecure: true,
    };

    console.log(`\nTesting plugin connection for: ${acc.email}...`);
    const result = await ConnectionTester.testMailbox(config, acc.provider);
    console.log(`  ├─ SMTP Status: ${result.smtpSuccess ? '✅ PASS' : '❌ FAIL (' + result.smtpError + ')'}`);
    console.log(`  └─ IMAP Status: ${result.imapSuccess ? '✅ PASS' : '❌ FAIL (' + result.imapError + ')'}`);
  }
}

runPhase2Test().catch(console.error);
