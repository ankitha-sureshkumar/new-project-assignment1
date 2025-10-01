import { Router } from 'express';
import notificationController from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with optional filters
 * @access  Private
 * @params  ?unreadOnly=true&limit=10&page=1
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all user notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get the count of unread notifications for the user
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;