import { Router } from 'express';
import availabilityController from '../controllers/AvailabilityController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/availability/my-schedule
 * @desc    Get current user's availability schedule
 * @access  Private (Veterinarian only)
 */
router.get('/my-schedule', authorize('veterinarian'), availabilityController.getMyAvailability.bind(availabilityController));

/**
 * @route   PUT /api/availability/update-schedule
 * @desc    Update veterinarian's full availability schedule
 * @access  Private (Veterinarian only)
 */
router.put('/update-schedule', authorize('veterinarian'), availabilityController.updateAvailability.bind(availabilityController));

/**
 * @route   PUT /api/availability/toggle-slot
 * @desc    Toggle availability for a specific day
 * @access  Private (Veterinarian only)
 */
router.put('/toggle-slot', authorize('veterinarian'), availabilityController.toggleTimeSlot.bind(availabilityController));

/**
 * @route   GET /api/availability/:veterinarianId/slots
 * @desc    Get available time slots for a specific veterinarian and date
 * @access  Private (All authenticated users - for booking)
 * @query   date - Date to check availability for (YYYY-MM-DD)
 */
router.get('/:veterinarianId/slots', availabilityController.getAvailableSlots.bind(availabilityController));

export default router;