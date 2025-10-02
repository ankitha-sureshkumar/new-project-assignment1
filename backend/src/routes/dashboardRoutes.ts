import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import dashboardController from '../controllers/DashboardController';

const router = express.Router();

/**
 * Dashboard Routes
 * All routes require authentication
 * Some routes have additional role-based authorization
 */

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

/**
 * @route   GET /api/dashboard
 * @desc    Get complete dashboard data for authenticated user
 * @access  Private (All authenticated users)
 */
router.get('/', dashboardController.getDashboard.bind(dashboardController));

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get summary metrics for authenticated user
 * @access  Private (All authenticated users)
 */
router.get('/summary', dashboardController.getDashboardSummary.bind(dashboardController));

/**
 * @route   GET /api/dashboard/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private (All authenticated users)
 * @query   limit - Number of notifications to return (default: 10)
 */
router.get('/notifications', dashboardController.getNotifications.bind(dashboardController));

/**
 * @route   GET /api/dashboard/my
 * @desc    Get role-specific dashboard based on authenticated user's role
 * @access  Private (All authenticated users)
 */
router.get('/my', dashboardController.getMyDashboard.bind(dashboardController));

/**
 * @route   GET /api/dashboard/range
 * @desc    Get dashboard data for specific date range
 * @access  Private (All authenticated users)
 * @query   startDate - Start date (YYYY-MM-DD format)
 * @query   endDate - End date (YYYY-MM-DD format)
 */
router.get('/range', dashboardController.getDashboardByDateRange.bind(dashboardController));

/**
 * @route   PUT /api/dashboard/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private (All authenticated users)
 */
router.put('/notifications/:notificationId/read', dashboardController.markNotificationRead.bind(dashboardController));

/**
 * @route   GET /api/dashboard/user/:userId
 * @desc    Get user dashboard (simplified version)
 * @access  Private (Admin or self only)
 */
router.get('/user/:userId', dashboardController.getUserDashboard.bind(dashboardController));

/**
 * @route   GET /api/dashboard/veterinarian/:vetId
 * @desc    Get veterinarian dashboard
 * @access  Private (Admin or veterinarian themselves)
 */
router.get('/veterinarian/:vetId', dashboardController.getVeterinarianDashboard.bind(dashboardController));

/**
 * @route   GET /api/dashboard/admin
 * @desc    Get admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard.bind(dashboardController));

/**
 * @route   GET /api/dashboard/admin/health
 * @desc    Get system health metrics
 * @access  Private (Admin only)
 */
router.get('/admin/health', authorize('admin'), dashboardController.getSystemHealth.bind(dashboardController));

export default router;