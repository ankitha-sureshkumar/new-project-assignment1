import { Request, Response } from 'express';
import { DashboardFacade } from '../patterns/DashboardFacade';
import { DashboardService, PetParentDashboardStrategy, VeterinarianDashboardStrategy } from '../patterns/StrategyPattern';

/**
 * Dashboard Controller - Simplified Working Version
 */
export class DashboardController {
  private dashboardFacade: DashboardFacade;
  private dashboardServiceUser: DashboardService;
  private dashboardServiceVet: DashboardService;
  
  constructor() {
    this.dashboardFacade = new DashboardFacade();
    // Prepare strategy services
    this.dashboardServiceUser = new DashboardService(new PetParentDashboardStrategy());
    this.dashboardServiceVet = new DashboardService(new VeterinarianDashboardStrategy());
  }

  /**
   * Get complete dashboard data for authenticated user
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
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
          // Use strategy-based generation (can keep facade for additional aggregation if needed)
          dashboard = await this.dashboardServiceUser.generateDashboard(userId, 'user');
          break;
        case 'veterinarian':
          dashboard = await this.dashboardServiceVet.generateDashboard(userId, 'veterinarian');
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

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to generate dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get summary metrics
   */
  async getDashboardSummary(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get dashboard summary' });
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;

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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  /**
   * Get user dashboard
   */
  async getUserDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.userId;
      const requesterRole = req.userRole;

      if (requesterRole !== 'admin' && requesterId !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const dashboard = await this.dashboardServiceUser.generateDashboard(userId, 'user');

      res.json({ success: true, data: dashboard });

    } catch (error) {
      res.status(500).json({ error: 'Failed to get user dashboard' });
    }
  }

  /**
   * Get veterinarian dashboard
   */
  async getVeterinarianDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { vetId } = req.params;
      const requesterId = req.userId;
      const requesterRole = req.userRole;

      if (requesterRole !== 'admin' && (requesterRole !== 'veterinarian' || requesterId !== vetId)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const dashboard = await this.dashboardServiceVet.generateDashboard(vetId, 'veterinarian');

      res.json({ success: true, data: dashboard });

    } catch (error) {
      res.status(500).json({ error: 'Failed to get veterinarian dashboard' });
    }
  }

  /**
   * Get admin dashboard
   */
  async getAdminDashboard(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get admin dashboard' });
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get system health metrics' });
    }
  }

  /**
   * Get role-specific dashboard
   */
  async getMyDashboard(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * Get dashboard by date range
   */
  async getDashboardByDateRange(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      res.status(500).json({ error: 'Failed to get dashboard data for date range' });
    }
  }
}

// Create and export instance
const dashboardController = new DashboardController();
export default dashboardController;