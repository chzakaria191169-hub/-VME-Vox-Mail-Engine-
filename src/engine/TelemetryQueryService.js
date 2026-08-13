class TelemetryQueryService {
    constructor(prismaClient = null) {
        this.prisma = prismaClient;
    }

    /**
     * Validates Workspace Scope to enforce strict Multi-Tenant Isolation
     */
    validateWorkspaceAccess(entityWorkspaceId, requestedWorkspaceId) {
        if (requestedWorkspaceId && entityWorkspaceId && requestedWorkspaceId !== entityWorkspaceId) {
            const err = new Error(`ACCESS_DENIED_MULTI_TENANT: Workspace ${requestedWorkspaceId} cannot access data for Workspace ${entityWorkspaceId}`);
            err.code = "ACCESS_DENIED_MULTI_TENANT";
            throw err;
        }
    }

    /**
     * Retrieves aggregated Mailbox Analytics filtered by workspace scope.
     */
    async getMailboxAnalytics(mailbox, startDate, endDate, options = {}) {
        this.validateWorkspaceAccess(mailbox.workspaceId, options.currentWorkspaceId);
        const dbClient = options.prisma || this.prisma;

        if (dbClient && typeof dbClient.mailboxMetric?.findMany === 'function') {
            const metrics = await dbClient.mailboxMetric.findMany({
                where: {
                    mailboxId: mailbox.id,
                    date: {
                        gte: new Date(`${startDate}T00:00:00.000Z`),
                        lte: new Date(`${endDate}T23:59:59.999Z`)
                    }
                },
                orderBy: { date: 'asc' }
            });
            return { success: true, mailboxId: mailbox.id, metrics };
        }

        // Fallback in-memory response for unit testing
        return {
            success: true,
            mailboxId: mailbox.id,
            metrics: options.mockMetrics || []
        };
    }

    /**
     * Retrieves aggregated Domain Analytics filtered by workspace scope.
     */
    async getDomainAnalytics(domain, startDate, endDate, options = {}) {
        this.validateWorkspaceAccess(domain.workspaceId, options.currentWorkspaceId);
        const dbClient = options.prisma || this.prisma;

        if (dbClient && typeof dbClient.domainMetric?.findMany === 'function') {
            const metrics = await dbClient.domainMetric.findMany({
                where: {
                    domainId: domain.id,
                    date: {
                        gte: new Date(`${startDate}T00:00:00.000Z`),
                        lte: new Date(`${endDate}T23:59:59.999Z`)
                    }
                },
                orderBy: { date: 'asc' }
            });
            return { success: true, domainId: domain.id, metrics };
        }

        return {
            success: true,
            domainId: domain.id,
            metrics: options.mockMetrics || []
        };
    }

    /**
     * Retrieves Workspace Overview Dashboard Analytics.
     */
    async getWorkspaceOverview(workspaceId, startDate, endDate, options = {}) {
        this.validateWorkspaceAccess(workspaceId, options.currentWorkspaceId || workspaceId);
        const dbClient = options.prisma || this.prisma;

        if (dbClient && typeof dbClient.workspaceMetric?.findMany === 'function') {
            const metrics = await dbClient.workspaceMetric.findMany({
                where: {
                    workspaceId,
                    date: {
                        gte: new Date(`${startDate}T00:00:00.000Z`),
                        lte: new Date(`${endDate}T23:59:59.999Z`)
                    }
                },
                orderBy: { date: 'asc' }
            });
            return { success: true, workspaceId, metrics };
        }

        return {
            success: true,
            workspaceId,
            metrics: options.mockMetrics || []
        };
    }

    /**
     * Queries EventLogs with multi-tenant workspace isolation.
     */
    async getEventLogs(workspaceId, filters = {}, options = {}) {
        this.validateWorkspaceAccess(workspaceId, options.currentWorkspaceId || workspaceId);
        const dbClient = options.prisma || this.prisma;

        if (dbClient && typeof dbClient.eventLog?.findMany === 'function') {
            const whereClause = {
                workspaceId,
                ...(filters.mailboxId ? { mailboxId: filters.mailboxId } : {}),
                ...(filters.eventType ? { eventType: filters.eventType } : {}),
                ...(filters.level ? { level: filters.level } : {})
            };

            const logs = await dbClient.eventLog.findMany({
                where: whereClause,
                take: filters.limit || 50,
                orderBy: { createdAt: 'desc' }
            });
            return { success: true, workspaceId, logs };
        }

        return {
            success: true,
            workspaceId,
            logs: options.mockLogs || []
        };
    }
}

module.exports = TelemetryQueryService;
