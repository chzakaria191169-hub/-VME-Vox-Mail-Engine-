// tests/smtp_e2e_real.js — Phase 6 Real SMTP E2E Test
'use strict';
const GenericSmtpImapProvider = require('../src/providers/GenericSmtpImapProvider');

const MAILBOX = {
    email: 'hannah@virrexa.work',
    smtpHost: 'smtp.zoho.com',
    smtpPort: 465,
    smtpUser: 'hannah@virrexa.work',
    smtpPassword: 'Ch@zaki191169',
    smtpSecure: true,
    imapHost: 'imap.zoho.com',
    imapPort: 993,
    imapUser: 'hannah@virrexa.work',
    imapPassword: 'Ch@zaki191169',
    imapSecure: true,
};

const TEST_RECIPIENT = 'hannah@virrexa.work';
const TEST_MESSAGE_ID = '<vme_e2e_' + Date.now() + '@axevia.work>';

async function run() {
    console.log('='.repeat(55));
    console.log('PHASE 6 — REAL SMTP E2E TEST');
    console.log('='.repeat(55));
    const results = { smtp_connect: 'PENDING', smtp_auth: 'PENDING', smtp_send: 'PENDING', message_id: null };
    const provider = new GenericSmtpImapProvider(MAILBOX);

    console.log('TEST 1 — SMTP Connect & Verify...');
    try {
        const t = provider.createTransporter();
        await t.verify();
        results.smtp_connect = results.smtp_auth = 'PASS';
        console.log('   SMTP Connect: PASS');
        console.log('   SMTP Auth:    PASS');
    } catch(e) {
        results.smtp_connect = results.smtp_auth = 'FAIL';
        console.error('   SMTP FAIL:', e.message);
        printReport(results); process.exit(1);
    }

    console.log('TEST 2 — Real Send to ' + TEST_RECIPIENT + '...');
    try {
        const id = await provider.sendEmail({ from: MAILBOX.email, to: TEST_RECIPIENT, subject: 'VME Phase 6 E2E Test ' + new Date().toISOString(), text: 'Real VME E2E test. MsgID: ' + TEST_MESSAGE_ID, messageId: TEST_MESSAGE_ID });
        results.smtp_send = 'PASS';
        results.message_id = id || TEST_MESSAGE_ID;
        console.log('   SMTP Send:    PASS');
        console.log('   Message-ID:   ' + results.message_id);
    } catch(e) {
        results.smtp_send = 'FAIL';
        console.error('   SEND FAIL:', e.message);
    }
    printReport(results);
    process.exit(results.smtp_send === 'PASS' ? 0 : 1);
}

function printReport(r) {
    console.log('\n' + '='.repeat(55));
    console.log('SMTP Connect: ' + r.smtp_connect);
    console.log('SMTP Auth:    ' + r.smtp_auth);
    console.log('SMTP Send:    ' + r.smtp_send);
    if (r.message_id) console.log('Message-ID:   ' + r.message_id);
    const pass = r.smtp_connect === 'PASS' && r.smtp_auth === 'PASS' && r.smtp_send === 'PASS';
    console.log('SMTP E2E: ' + (pass ? 'PASS' : 'FAIL'));
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
