class ErrorClassifier {
    static classify(error) {
        const msg = (error.message || '').toUpperCase();
        const code = (error.code || '').toUpperCase();

        // Non-Retryable Errors
        if (msg.includes("535") || code === "AUTHENTICATION_FAILED" || msg.includes("AUTH") || msg.includes("INVALID CREDENTIALS")) {
            return { retryable: false, type: "AUTHENTICATION_FAILED", action: "PAUSE_MAILBOX_ERROR" };
        }

        if (msg.includes("MAILBOX DISABLED") || msg.includes("ACCOUNT DISABLED")) {
            return { retryable: false, type: "MAILBOX_DISABLED", action: "PAUSE_MAILBOX" };
        }

        if (msg.includes("DAILY LIMIT REACHED") || msg.includes("QUOTA EXCEEDED")) {
            return { retryable: false, type: "DAILY_LIMIT_REACHED", action: "POSTPONE_NEXT_DAY" };
        }

        // Retryable Errors
        if (msg.includes("ETIMEDOUT") || msg.includes("TIMEOUT") || code === "ETIMEDOUT") {
            return { retryable: true, type: "NETWORK_TIMEOUT", action: "SCHEDULE_RETRY" };
        }

        if (msg.includes("ENOTFOUND") || msg.includes("DNS") || code === "ENOTFOUND") {
            return { retryable: true, type: "DNS_TEMPORARY_FAILURE", action: "SCHEDULE_RETRY" };
        }

        if (msg.includes("ECONNREFUSED") || msg.includes("CONNECTION REFUSED") || code === "ECONNREFUSED") {
            return { retryable: true, type: "CONNECTION_REFUSED", action: "SCHEDULE_RETRY" };
        }

        // Default: Retryable transient error
        return { retryable: true, type: "UNKNOWN_TRANSIENT_ERROR", action: "SCHEDULE_RETRY" };
    }
}

module.exports = ErrorClassifier;
