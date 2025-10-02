import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import appointmentController from '../controllers/AppointmentController';

const router = express.Router();

/**
 * Appointment Routes
 * All routes require authentication
 * Supports the complete appointment workflow:
 * 1. User books appointment
 * 2. Veterinarian approves with pricing
 * 3. User confirms appointment
 * 4. Veterinarian completes appointment
 * 5. User can rate the appointment
 */

// Apply authentication middleware to all appointment routes
router.use(authenticate);

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment (Step 1 - User books)
 * @access  Private (Users only)
 */
router.post('/', authorize('user'), appointmentController.bookAppointment.bind(appointmentController));

/**
 * @route   GET /api/appointments
 * @desc    Get appointments for authenticated user (based on role)
 * @access  Private (All authenticated users)
 * @query   status - Filter by appointment status
 * @query   startDate - Filter appointments from this date
 * @query   endDate - Filter appointments until this date
 * @query   limit - Number of appointments to return
 * @query   page - Page number for pagination
 */
router.get('/', appointmentController.getMyAppointments.bind(appointmentController));

/**
 * @route   GET /api/appointments/all
 * @desc    Get all appointments in the system
 * @access  Private (Admin only)
 */
router.get('/all', authorize('admin'), appointmentController.getAllAppointments.bind(appointmentController));

/**
 * @route   GET /api/appointments/:appointmentId
 * @desc    Get a specific appointment by ID
 * @access  Private (User who booked, assigned veterinarian, or admin)
 */
router.get('/:appointmentId', appointmentController.getAppointmentById.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/approve
 * @desc    Approve appointment with pricing (Step 2 - Vet approves)
 * @access  Private (Veterinarian or admin)
 */
router.put('/:appointmentId/approve', authorize('veterinarian', 'admin'), appointmentController.approveAppointment.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/confirm
 * @desc    Confirm appointment (Step 3 - User confirms)
 * @access  Private (User who booked the appointment)
 */
router.put('/:appointmentId/confirm', appointmentController.confirmAppointment.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/complete
 * @desc    Complete appointment with notes (Step 4 - Vet completes)
 * @access  Private (Veterinarian or admin)
 */
router.put('/:appointmentId/complete', authorize('veterinarian', 'admin'), appointmentController.completeAppointment.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/cancel
 * @desc    Cancel appointment
 * @access  Private (User who booked, assigned veterinarian, or admin)
 */
router.put('/:appointmentId/cancel', appointmentController.cancelAppointment.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/reject
 * @desc    Reject appointment
 * @access  Private (Veterinarian or admin)
 */
router.put('/:appointmentId/reject', authorize('veterinarian', 'admin'), appointmentController.rejectAppointment.bind(appointmentController));

/**
 * @route   POST /api/appointments/:appointmentId/rating
 * @desc    Rate appointment (Step 5 - User rates)
 * @access  Private (User who booked the appointment)
 */
router.post('/:appointmentId/rating', appointmentController.rateAppointment.bind(appointmentController));

/**
 * @route   GET /api/appointments/user/:userId
 * @desc    Get appointments for a specific user
 * @access  Private (Admin, or user themselves)
 */
// router.get('/user/:userId', appointmentController.getUserAppointments.bind(appointmentController));

/**
 * @route   GET /api/appointments/veterinarian/:vetId
 * @desc    Get appointments for a specific veterinarian
 * @access  Private (Admin, or veterinarian themselves)
 */
// router.get('/veterinarian/:vetId', appointmentController.getVetAppointments.bind(appointmentController));

/**
 * @route   GET /api/appointments/availability/:vetId
 * @desc    Get available time slots for a veterinarian
 * @access  Private (All authenticated users)
 * @query   date - Date to check availability for (YYYY-MM-DD)
 */
// router.get('/availability/:vetId', appointmentController.getAvailableSlots.bind(appointmentController));

/**
 * @route   GET /api/appointments/pet/:petId
 * @desc    Get appointment history for a specific pet
 * @access  Private (Pet owner, assigned veterinarians, or admin)
 */
// router.get('/pet/:petId', appointmentController.getPetAppointments.bind(appointmentController));

/**
 * @route   GET /api/appointments/today/schedule
 * @desc    Get today's appointment schedule
 * @access  Private (Veterinarians and admin)
 */
// router.get('/today/schedule', authorize('veterinarian', 'admin'), appointmentController.getTodaysSchedule.bind(appointmentController));

/**
 * @route   GET /api/appointments/upcoming/reminders
 * @desc    Get upcoming appointments that need reminders
 * @access  Private (Admin for system notifications)
 */
// router.get('/upcoming/reminders', authorize('admin'), appointmentController.getUpcomingReminders.bind(appointmentController));

/**
 * @route   PUT /api/appointments/:appointmentId/reschedule
 * @desc    Reschedule appointment to a new date/time
 * @access  Private (User who booked, assigned veterinarian, or admin)
 */
router.put('/:appointmentId/reschedule', appointmentController.rescheduleAppointment.bind(appointmentController));

// Stats and bulk update functionality
router.get('/stats/summary', authorize('veterinarian', 'admin'), appointmentController.getAppointmentStats.bind(appointmentController));
// router.post('/bulk/update', authorize('admin'), appointmentController.bulkUpdateAppointments.bind(appointmentController));

export default router;