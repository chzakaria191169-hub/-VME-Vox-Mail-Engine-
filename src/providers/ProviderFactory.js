const GmailAdapter = require('./GmailAdapter');
const OutlookAdapter = require('./OutlookAdapter');
const CustomAdapter = require('./CustomAdapter');

class ProviderFactory {
    static createAdapter(providerType, config) {
        const type = (providerType || 'CUSTOM').toUpperCase();
        switch (type) {
            case 'GMAIL':
                return new GmailAdapter(config);
            case 'OUTLOOK':
            case 'MICROSOFT365':
                return new OutlookAdapter(config);
            case 'CUSTOM':
            case 'ZOHO':
            default:
                return new CustomAdapter(config);
        }
    }
}

module.exports = ProviderFactory;
