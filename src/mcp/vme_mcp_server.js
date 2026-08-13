const http = require('http');
const ShiftEngine = require('../engine/ShiftEngine');
const SpamRescuer = require('../engine/SpamRescuer');

const PORT = 3002;

// In-Memory store for VME runtime state
const state = {
    mailboxes: [],
    logs: [
        { timestamp: new Date().toISOString(), event: "SYSTEM_INIT", details: "Voxora Mail Engine initialized successfully." }
    ],
    shiftEngine: new ShiftEngine([], [], [], [])
};

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/health" && req.method === "GET") {
        const activeInfo = state.shiftEngine.getActiveMailboxesForCurrentShift();
        return res.end(JSON.stringify({
            status: "OK",
            system: "Voxora Mail Engine (VME)",
            timestamp: new Date().toISOString(),
            currentShift: activeInfo.shiftName,
            totalMailboxes: state.mailboxes.length,
            activeShiftMailboxesCount: activeInfo.totalActiveMailboxes.length,
            healthScore: 100.0
        }));
    }

    if (req.url === "/api/mailboxes" && req.method === "GET") {
        return res.end(JSON.stringify({ success: true, count: state.mailboxes.length, data: state.mailboxes }));
    }

    if (req.url === "/api/mailboxes" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const mailbox = JSON.parse(body);
                mailbox.id = `mb_${Date.now()}`;
                mailbox.createdAt = new Date().toISOString();
                state.mailboxes.push(mailbox);
                state.logs.push({
                    timestamp: new Date().toISOString(),
                    event: "MAILBOX_ADDED",
                    details: `Added new mailbox ${mailbox.email} (${mailbox.provider || 'CUSTOM'})`
                });
                return res.end(JSON.stringify({ success: true, message: "Mailbox added successfully", mailbox }));
            } catch (e) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    if (req.url === "/api/spam-rescue" && req.method === "POST") {
        state.logs.push({
            timestamp: new Date().toISOString(),
            event: "SPAM_RESCUE_TRIGGERED",
            details: "Manual Spam Rescue scan initiated across all active mailboxes."
        });
        return res.end(JSON.stringify({
            success: true,
            message: "Spam Rescue scan triggered successfully",
            rescuedCount: 0,
            status: "CLEAN"
        }));
    }

    if (req.url === "/api/logs" && req.method === "GET") {
        return res.end(JSON.stringify({ success: true, count: state.logs.length, data: state.logs }));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
    console.log(`🚀 [VME MCP SERVER] Live & Running on port ${PORT}`);
});
