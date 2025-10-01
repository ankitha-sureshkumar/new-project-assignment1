"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardFacade_1 = require("../patterns/DashboardFacade");
class DashboardController {
    constructor() {
        this.dashboardFacade = new DashboardFacade_1.DashboardFacade();
    }
    async getDashboard(req, res) {
        try {
            const userId = req.userId;
            const role = req.userRole;
            if (!userId || !role) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            let dashboard;
            switch (role) {
                case 'user':
                    dashboard = await this.dashboardFacade.getUserDashboard(userId);
                    break;
                case 'veterinarian':
                    dashboard = await this.dashboardFacade.getVeterinarianDashboard(userId);
                    break;
                case 'admin':
                    dashboard = await this.dashboardFacade.getAdminDashboard(userId);
                    break;
                default:
                    res.status(400).json({ error: 'Invalid user role' });
                    return;
            }
            res.json({
                success: true,
                data: dashboard,
                timestamp: new Date()
            });
        }
        catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({
                error: 'Failed to generate dashboard data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getDashboardSummary(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const summary = { metrics: [] };
            res.json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get dashboard summary' });
        }
    }
    async getNotifications(req, res) {
        try {
            const userId = req.userId;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const notifications = await this.dashboardFacade.getNotifications(userId, limit);
            res.json({
                success: true,
                data: notifications,
                total: notifications.length
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get notifications' });
        }
    }
    async getUserDashboard(req, res) {
        try {
            const { userId } = req.params;
            const requesterId = req.userId;
            const requesterRole = req.userRole;
            if (requesterRole !== 'admin' && requesterId !== userId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const dashboard = await this.dashboardFacade.getUserDashboard(userId);
            res.json({
                success: true,
                data: dashboard
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get user dashboard' });
        }
    }
    async getVeterinarianDashboard(req, res) {
        try {
            const { vetId } = req.params;
            const requesterId = req.userId;
            const requesterRole = req.userRole;
            if (requesterRole !== 'admin' &&
                (requesterRole !== 'veterinarian' || requesterId !== vetId)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const dashboard = await this.dashboardFacade.getVeterinarianDashboard(vetId);
            res.json({
                success: true,
                data: dashboard
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get veterinarian dashboard' });
        }
    }
    async getAdminDashboard(req, res) {
        try {
            const adminId = req.userId;
            if (!adminId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const dashboard = await this.dashboardFacade.getAdminDashboard(adminId);
            res.json({
                success: true,
                data: dashboard
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get admin dashboard' });
        }
    }
    async getSystemHealth(req, res) {
        try {
            const adminId = req.userId;
            if (!adminId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const healthMetrics = await this.dashboardFacade.getSystemHealthMetrics(adminId);
            res.json({
                success: true,
                data: healthMetrics
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get system health metrics' });
        }
    }
    async getMyDashboard(req, res) {
        try {
            const userId = req.userId;
            const role = req.userRole;
            if (!userId || !role) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            let dashboard;
            switch (role) {
                case 'user':
                    dashboard = await this.dashboardFacade.getUserDashboard(userId);
                    break;
                case 'veterinarian':
                    dashboard = await this.dashboardFacade.getVeterinarianDashboard(userId);
                    break;
                case 'admin':
                    dashboard = await this.dashboardFacade.getAdminDashboard(userId);
                    break;
                default:
                    res.status(400).json({ error: 'Invalid user role' });
                    return;
            }
            res.json({
                success: true,
                data: dashboard,
                role: role
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get dashboard data' });
        }
    }
    async markNotificationRead(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }
    async getDashboardByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const userId = req.userId;
            const role = req.userRole;
            if (!userId || !role) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            if (!startDate || !endDate) {
                res.status(400).json({ error: 'Start date and end date are required' });
                return;
            }
            let dashboard;
            switch (role) {
                case 'user':
                    dashboard = await this.dashboardFacade.getUserDashboard(userId);
                    break;
                case 'veterinarian':
                    dashboard = await this.dashboardFacade.getVeterinarianDashboard(userId);
                    break;
                default:
                    dashboard = await this.dashboardFacade.getUserDashboard(userId);
            }
            res.json({
                success: true,
                data: dashboard,
                dateRange: { startDate, endDate }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get dashboard data for date range' });
        }
    }
}
exports.DashboardController = DashboardController;
const dashboardController = new DashboardController();
exports.default = dashboardController;
//# sourceMappingURL=DashboardController.js.map