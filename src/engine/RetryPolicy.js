const ErrorClassifier = require('./ErrorClassifier');

class RetryPolicy {
    static MAX_ATTEMPTS = 3;

    /**
     * Exponential Backoff with Jitter:
     * Attempt 1: ~10s - 15s
     * Attempt 2: ~60s - 65s
     * Attempt 3: ~300s - 305s -> DEAD
     */
    static computeBackoffSeconds(attempt) {
        const base = Math.min(300, 10 * Math.pow(2, Math.max(0, attempt - 1)));
        const jitter = Math.floor(Math.random() * 5) + 1;
        return base + jitter;
    }

    static evaluateFailure(error, currentAttempt) {
        const classification = ErrorClassifier.classify(error);

        if (!classification.retryable) {
            return {
                shouldRetry: false,
                nextState: 'FAILED',
                backoffSec: 0,
                classification
            };
        }

        if (currentAttempt >= this.MAX_ATTEMPTS) {
            return {
                shouldRetry: false,
                nextState: 'DEAD',
                backoffSec: 0,
                classification
            };
        }

        const backoffSec = this.computeBackoffSeconds(currentAttempt);
        return {
            shouldRetry: true,
            nextState: 'RETRYING',
            backoffSec,
            classification
        };
    }
}

module.exports = RetryPolicy;
