const https = require('https');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

console.log("📡 [OMMOP PROTOCOL] CONSULTING DEEPSEEK V3 FOR PHASE 2 (PROVIDERS & MAILBOX MANAGER WF1)...");

const prompt = `
You are the Lead Principal Software Architect for Voxora Mail Engine (VME).
We are implementing Phase 2: Providers & Mailbox Manager (WF1).

Key Requirements for Phase 2:
1. BaseAdapter Interface with unified standard methods:
   - send(options)
   - receive(options)
   - testSmtp()
   - testImap()
   - getStatus()

2. Three Adapter Implementations:
   - GmailAdapter (smtp: smtp.gmail.com:465/587, imap: imap.gmail.com:993)
   - OutlookAdapter (smtp: smtp-mail.outlook.com:587, imap: outlook.office365.com:993)
   - CustomSmtpImapAdapter (custom host, port, ssl)

3. Mailbox Manager Workflow (WF1) logic:
   - Validates input credentials
   - Runs testSmtp() and testImap()
   - Encrypts passwords with AES-256
   - Saves to Prisma PostgreSQL database
   - Emits EventLog entries: MAILBOX_CREATED, SMTP_TEST_SUCCESS, IMAP_TEST_SUCCESS, MAILBOX_ERROR.

Output a clean JSON object containing:
{
  "status": "VALIDATED",
  "phase": 2,
  "architectureNotes": "Summary of Phase 2 architecture",
  "baseAdapterCode": "// JS code for BaseAdapter",
  "gmailAdapterCode": "// JS code for GmailAdapter",
  "outlookAdapterCode": "// JS code for OutlookAdapter",
  "customAdapterCode": "// JS code for CustomAdapter",
  "mailboxManagerCode": "// JS code for WF1 Mailbox Manager handler"
}
Return raw JSON only, no markdown formatting outside JSON.
`;

const payload = JSON.stringify({
    model: "deepseek/deepseek-chat",
    messages: [
        { role: "system", content: "You are DeepSeek V3, expert system architect. Output valid JSON only." },
        { role: "user", content: prompt }
    ],
    temperature: 0.2
});

const req = https.request({
    hostname: "openrouter.ai",
    path: "/api/v1/chat/completions",
    method: "POST",
    headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voxora.agency",
        "X-Title": "VME Phase 2 DeepSeek Architect"
    }
}, (res) => {
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => {
        try {
            const parsed = JSON.parse(body);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                const content = parsed.choices[0].message.content;
                console.log("🤖 DeepSeek V3 Response Received!");
                require('fs').writeFileSync('deepseek_v3_phase2_response.json', content);
                console.log("Saved response to deepseek_v3_phase2_response.json");
            } else {
                console.error("DeepSeek response error:", body);
            }
        } catch (e) {
            console.error("Parse error:", e.message, body);
        }
    });
});

req.on("error", console.error);
req.write(payload);
req.end();
