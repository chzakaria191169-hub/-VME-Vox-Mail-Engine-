class BounceClassifier {
    /**
     * High-Precision Bounce & Delivery Failure Classifier.
     * Prevents false positives by evaluating strict header, sender, and subject boundaries.
     */
    static classify(message) {
        const from = (message.fromEmail || message.from || '').toLowerCase().trim();
        const subject = (message.subject || '').toLowerCase().trim();
        const contentType = (message.contentType || '').toLowerCase().trim();
        const headers = message.headers || {};

        // 1. DSN Standard Content-Type Header Check
        if (contentType.includes("report-type=delivery-status") || contentType.includes("multipart/report")) {
            return { isBounce: true, type: "PERMANENT_DSN_REPORT", confidence: 1.0 };
        }

        // 2. X-Failed-Recipients Header Check
        if (headers['x-failed-recipients'] || headers['X-Failed-Recipients']) {
            return { isBounce: true, type: "FAILED_RECIPIENTS_HEADER", confidence: 1.0 };
        }

        // 3. Sender Boundary Check (Mailer-Daemon / Postmaster / System Notification)
        const systemBounceSenders = ["mailer-daemon@", "postmaster@", "mail-daemon@", "bounce@"];
        const isSystemBounceSender = systemBounceSenders.some(s => from.startsWith(s) || from.includes(`<${s}`));

        if (isSystemBounceSender) {
            return { isBounce: true, type: "SYSTEM_BOUNCE_SENDER", confidence: 1.0 };
        }

        // 4. Exact Subject Pattern Matching (Requires System DSN Signature)
        const strictBounceSubjects = [
            "undelivered mail returned to sender",
            "delivery status notification (failure)",
            "mail delivery failed: returning message to sender",
            "mail delivery status notification"
        ];

        for (const pattern of strictBounceSubjects) {
            if (subject === pattern || subject.startsWith(`${pattern}:`)) {
                return { isBounce: true, type: "STRICT_BOUNCE_SUBJECT_MATCH", confidence: 0.95 };
            }
        }

        // 5. False Positive Guard: Normal emails discussing "bounce" or "failure" in conversation
        return { isBounce: false, type: "STANDARD_MESSAGE", confidence: 0.0 };
    }
}

module.exports = BounceClassifier;
