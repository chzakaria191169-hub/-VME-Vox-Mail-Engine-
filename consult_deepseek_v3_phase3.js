const https = require('https');
const fs = require('fs');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

console.log("📡 [OMMOP PROTOCOL] CONSULTING DEEPSEEK V3 FOR PHASE 3 (SCHEDULER & EXECUTION ENGINE WF2)...");

const prompt = `
You are the Lead Principal System Architect for Voxora Mail Engine (VME).
We are designing Phase 3: Scheduler & Execution Engine (WF2).

We need your expert review on the following Phase 3 design questions:
1. Job Lifecycle States: Standardizing PENDING, RUNNING, SUCCESS, FAILED, RETRYING, DEAD, CANCELLED.
2. Idempotency & Duplicate Prevention: Ensuring no job is created twice or executed twice upon crash.
3. Bounded Retry & Backoff Strategy: Maximum attempts (e.g. 3), Exponential Backoff (e.g. 10s, 60s, 300s), Jitter, Retryable vs Non-Retryable errors (Auth error = Non-retryable).
4. Concurrency Limits & Queue Throttling: Per-mailbox, per-domain, and global concurrency limits.
5. Mailbox Eligibility Engine: Filtering by status (ACTIVE), health (HEALTHY/WARNING), daily limits, current active jobs, cooldown, provider limits, workspace limits.
6. Decoupled Shift Logic: Shift policy layer decoupled from core generic scheduler (Scheduler + ShiftPolicy plugin).
7. Failure Matrix: Handling SMTP timeout, auth failure, connection error, process crash, orphan jobs.
8. EventLog Source of Truth: Standardized event names: JOB_CREATED, JOB_STARTED, JOB_RETRYING, MESSAGE_SEND_STARTED, MESSAGE_SENT, MESSAGE_SEND_FAILED, JOB_COMPLETED, JOB_FAILED, JOB_DEAD.

Return a valid JSON object only with format:
{
  "status": "APPROVED",
  "phase": 3,
  "deepseekRecommendations": [
     "Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"
  ],
  "jobStateTransitions": {
     "PENDING": ["RUNNING", "CANCELLED"],
     "RUNNING": ["SUCCESS", "RETRYING", "FAILED", "DEAD"],
     "RETRYING": ["RUNNING", "DEAD"],
     "SUCCESS": [],
     "FAILED": ["RETRYING", "DEAD"],
     "DEAD": [],
     "CANCELLED": []
  },
  "retryPolicy": {
     "maxAttempts": 3,
     "backoffStrategy": "EXPONENTIAL_JITTER",
     "initialIntervalSec": 10,
     "maxIntervalSec": 300,
     "nonRetryableErrors": ["AUTHENTICATION_FAILED", "INVALID_CREDENTIALS", "MAILBOX_DISABLED"]
  },
  "concurrencyPolicy": {
     "globalLimit": 50,
     "perWorkspaceLimit": 10,
     "perMailboxLimit": 1
  },
  "shiftPolicyArchitecture": "Decoupled ShiftPolicy interface evaluation before job scheduling",
  "failureMatrix": {
     "smtpTimeout": "Retry with exponential backoff if attempts < 3, else DEAD",
     "authFailure": "Immediate non-retryable failure, pause mailbox, emit MAILBOX_ERROR",
     "processCrash": "Orphan job detection scanner resets RUNNING jobs > 5 mins to RETRYING",
     "messageSentUnlogged": "Message-ID header deduplication prevents re-sending upon retry"
  }
}
`;

const payload = JSON.stringify({
    model: "deepseek/deepseek-chat",
    messages: [
        { role: "system", content: "You are DeepSeek V3, world-class distributed system architect. Return raw valid JSON only." },
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
        "X-Title": "VME Phase 3 DeepSeek Architect"
    }
}, (res) => {
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => {
        try {
            const parsed = JSON.parse(body);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                const content = parsed.choices[0].message.content;
                console.log("🤖 DeepSeek V3 Phase 3 Response Received!");
                fs.writeFileSync('deepseek_v3_phase3_response.json', content);
                console.log("Saved response to deepseek_v3_phase3_response.json");
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
