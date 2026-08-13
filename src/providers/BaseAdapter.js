class BaseAdapter {
    constructor(config) {
        this.config = config;
    }

    async send(options) {
        throw new Error("Method send() must be implemented in child provider adapter.");
    }

    async receive(options) {
        throw new Error("Method receive() must be implemented in child provider adapter.");
    }

    async testSmtp() {
        throw new Error("Method testSmtp() must be implemented in child provider adapter.");
    }

    async testImap() {
        throw new Error("Method testImap() must be implemented in child provider adapter.");
    }

    getStatus() {
        return { connected: false, lastSync: null };
    }
}

module.exports = BaseAdapter;
