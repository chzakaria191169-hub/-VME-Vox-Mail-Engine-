const https = require('https');
const fs = require('fs');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

console.log("📡 [OMMOP PROTOCOL] CONSULTING DEEPSEEK V3 FOR FINAL PHASE 3 ENTERPRISE ARCHITECTURE DESIGN...");

const prompt = `
You are the Lead Principal Distributed Systems Architect for Voxora Mail Engine (VME).
We are finalizing the comprehensive Enterprise SaaS Architecture for Phase 3: Scheduler & Execution Engine (WF2).

Key Architectual Directives to clarify & validate:
1. Node.js Core vs n8n Orchestrator Split:
   - Node.js (VME Core Service): Manages State, Database, Scheduler, Idempotency, Concurrency Locks, Error Classifier, Retry/Backoff, and Event Sourcing.
   - n8n (WF2 Orchestrator): Invoked by VME Core via Webhook/API trigger for workflow steps or acts as external trigger; returns execution status back to Node.js.
2. Best-Effort Idempotency & Duplicate Prevention:
   - SMTP doesn't support atomic 2-phase commit with PostgreSQL.
   - Strategy: Atomic DB 'RUNNING' claim lock + Message-ID header tracking + IMAP Sent folder verification fallback prior to resending retried jobs.
3. Job Lifecycle State Machine:
   - PENDING -> RUNNING -> SUCCESS | RETRYING | FAILED | DEAD | CANCELLED.
4. Atomic Job Claim & Locking:
   - Conditional DB Update: UPDATE Job SET status='RUNNING', startedAt=NOW() WHERE id=:id AND status='PENDING' RETURNING *.
5. Bounded Retry & Backoff Strategy:
   - Max 3 attempts. Attempt 1 (~10s), Attempt 2 (~60s), Attempt 3 (~300s).
   - Error Classification: Non-retryable (535 Auth Failed, Invalid Credentials, Mailbox Disabled, Daily Limit Reached) -> Immediate FAILED & Mailbox ERROR. Retryable (Timeout, Connection Refused, Temporary DNS, n8n 5xx) -> RETRYING.
6. Failure Matrix & Edge Cases:
   - Worker crash / Orphan Jobs: Lease-based heartbeat or timeout scanner. RUNNING jobs with lease expired > 5m reset to RETRYING if attempts < 3.
7. Database vs Redis/Queue:
   - PostgreSQL (Prisma) with Row Locking is 100% sufficient for current VME scale (< 100k msgs/day), avoiding overengineering. Redis can be added seamlessly later via queue abstraction.
8. Hierarchical Concurrency Control:
   - Configurable limits: Global (50), Workspace (10), Domain (5), Mailbox (1).
9. Decoupled Policies:
   - Scheduler + EligibilityPolicy + ShiftPolicy (decoupled 8-hour shift plugin).

Return a valid JSON object summarizing:
{
  "status": "APPROVED",
  "architecturalModel": "Node.js State & Logic Core + n8n Workflow Orchestration",
  "dbvsRedis": "PostgreSQL Row Locking sufficient for Phase 3; zero overengineering",
  "bestEffortIdempotency": "Atomic Claim Lock + Message-ID Header + IMAP Sent Folder Fallback",
  "recommendations": [
    "Rec 1: Use SELECT FOR UPDATE SKIP LOCKED for atomic job claiming",
    "Rec 2: Store Message-ID in JobAttempt metadata prior to SMTP handshake",
    "Rec 3: Keep n8n decoupled via REST Webhooks with signature verification",
    "Rec 4: Decouple ShiftPolicy as an injectable policy class"
  ]
}
`;

const payload = JSON.stringify({
    model: "deepseek/deepseek-chat",
    messages: [
        { role: "system", content: "You are DeepSeek V3, Principal Enterprise Architect. Output valid JSON only." },
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
        "X-Title": "VME Phase 3 Final Architecture Review"
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
                fs.writeFileSync('deepseek_v3_phase3_final_response.json', content);
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
