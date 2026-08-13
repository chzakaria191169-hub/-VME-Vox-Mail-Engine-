class FolderClassificationPolicy {
    /**
     * Maps provider-specific folder names to normalized internal folder types:
     * Types: INBOX | SPAM | SENT | TRASH | ARCHIVE | OTHER
     */
    static normalizeFolder(rawFolderName, providerType = 'CUSTOM') {
        const folder = (rawFolderName || '').toLowerCase().trim();
        const provider = (providerType || 'CUSTOM').toUpperCase();

        if (folder === 'inbox') return 'INBOX';

        // Provider specific mappings
        if (provider === 'GMAIL') {
            if (folder.includes('spam')) return 'SPAM';
            if (folder.includes('sent')) return 'SENT';
            if (folder.includes('trash') || folder.includes('bin')) return 'TRASH';
            if (folder.includes('all mail')) return 'ARCHIVE';
        }

        if (provider === 'OUTLOOK' || provider === 'MICROSOFT365') {
            if (folder.includes('junk')) return 'SPAM';
            if (folder.includes('sent items') || folder.includes('sent')) return 'SENT';
            if (folder.includes('deleted items') || folder.includes('trash')) return 'TRASH';
            if (folder.includes('archive')) return 'ARCHIVE';
        }

        // Generic / Custom / Mailcow / Zoho Mappings
        if (folder.includes('spam') || folder.includes('junk')) return 'SPAM';
        if (folder.includes('sent')) return 'SENT';
        if (folder.includes('trash') || folder.includes('deleted') || folder.includes('bin')) return 'TRASH';
        if (folder.includes('archive')) return 'ARCHIVE';

        return 'OTHER';
    }
}

module.exports = FolderClassificationPolicy;
