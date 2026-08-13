const https = require('https');
const GenericSmtpImapProvider = require('../providers/GenericSmtpImapProvider');

class SpamRescuer {
    constructor(groqApiKey = process.env.GROQ_API_KEY) {
        this.groqApiKey = groqApiKey;
    }

    async generateGroqReply(incomingSubject, incomingBody) {
        if (!this.groqApiKey) {
            // Fallback natural reply
            return "Hi there,\n\nThanks for reaching out and touching base. Everything looks good on our end!\n\nBest regards,\nVoxora Team";
        }

        return new Promise((resolve) => {
            const payload = JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a professional email assistant. Write a short, natural, human email response (2-3 sentences max) replying to the incoming email." },
                    { role: "user", content: `Subject: ${incomingSubject}\nBody: ${incomingBody}` }
                ],
                max_tokens: 150
            });

            const req = https.request({
                hostname: "api.groq.com",
                path: "/openai/v1/chat/completions",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.groqApiKey}`
                }
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                            resolve(parsed.choices[0].message.content.trim());
                        } else {
                            resolve("Thanks for your update! Looking forward to working together.");
                        }
                    } catch (e) {
                        resolve("Received your email, thanks for connecting!");
                    }
                });
            });

            req.on("error", () => resolve("Received your email, thanks for connecting!"));
            req.write(payload);
            req.end();
        });
    }

    async scanAndRescueSpam(mailboxConfig, knownSendersList = []) {
        console.log(`🔍 [SPAM RESCUER] Scanning Spam/Junk folder for: ${mailboxConfig.email}...`);
        const provider = new GenericSmtpImapProvider(mailboxConfig);
        const client = provider.createImapClient();
        const rescuedLogs = [];

        try {
            await client.connect();

            // Find Spam or Junk mailbox folder
            const mailboxes = await client.list();
            let spamFolder = mailboxes.find(m => m.name.toLowerCase().includes('spam') || m.name.toLowerCase().includes('junk'));
            
            if (spamFolder) {
                let lock = await client.getMailboxLock(spamFolder.path);
                try {
                    // Fetch unread or recent messages in Spam
                    for await (let msg of client.fetch('1:*', { envelope: true, bodyStructure: true, flags: true })) {
                        const senderEmail = msg.envelope.from && msg.envelope.from[0] ? `${msg.envelope.from[0].mailbox}@${msg.envelope.from[0].host}` : '';
                        
                        // Check if sender is in our warmup network
                        const isMatch = knownSendersList.length === 0 || knownSendersList.some(s => s.toLowerCase() === senderEmail.toLowerCase());
                        
                        if (isMatch && senderEmail) {
                            console.log(`🚨 [SPAM RESCUED!] Found email from ${senderEmail} in Spam folder! Rescuing to INBOX...`);
                            
                            // Move email to INBOX
                            await client.messageMove(msg.seq, 'INBOX');

                            // Generate AI Reply via Groq Llama 3.3 70B
                            const replyBody = await this.generateGroqReply(msg.envelope.subject || 'Follow up', 'Warmup message text');
                            
                            rescuedLogs.push({
                                sender: senderEmail,
                                recipient: mailboxConfig.email,
                                subject: msg.envelope.subject,
                                status: "SPAM_RESCUED",
                                aiReplyGenerated: replyBody,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                } finally {
                    lock.release();
                }
            }
            await client.logout();
        } catch (e) {
            console.error(`Spam scan error for ${mailboxConfig.email}:`, e.message);
        }

        return rescuedLogs;
    }
}

module.exports = SpamRescuer;
