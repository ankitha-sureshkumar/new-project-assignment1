import { Request, Response } from 'express';
import Appointment, { IAppointment } from '../models/Appointment';
import Pet from '../models/Pet';
import User from '../models/User';
import Veterinarian from '../models/Veterinarian';
import mongoose from 'mongoose';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { RequireFieldsValidator, ObjectIdValidator, PetOwnershipValidator, VetApprovalValidator, FutureDateValidator, TimeFormatValidator } from '../patterns/validation/ValidatorChain';
import { AppointmentStateContext } from '../patterns/state/appointment/StateContext';
import { NotificationManager } from '../patterns/NotificationObserver';
import { AuthRequest } from '../middleware/auth';

/**
 * Appointment Controller - Full Database Implementation
 */
export class AppointmentController {
  private notificationManager: NotificationManager;
  
  constructor() {
    this.notificationManager = new NotificationManager();
  }
  
  async bookAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { petId, veterinarianId, date, timeSlot, reason, userNotes } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      // Validation chain
      const require = new RequireFieldsValidator(['petId','veterinarianId','date','timeSlot','reason']);
      const objectIds = new ObjectIdValidator(['petId','veterinarianId'], mongoose);
      const ownership = new PetOwnershipValidator(userId.toString());
      const vetApproved = new VetApprovalValidator();
      const future = new FutureDateValidator();
      const timeValid = new TimeFormatValidator('timeSlot.startTime');
      require.setNext(objectIds).setNext(ownership).setNext(vetApproved).setNext(future).setNext(timeValid);
      await require.handle({ petId, veterinarianId, date, timeSlot, reason });
      
      // Validate object IDs
      if (!mongoose.Types.ObjectId.isValid(petId) || 
          !mongoose.Types.ObjectId.isValid(veterinarianId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid pet or veterinarian ID'
        });
        return;
      }
      
      // Verify pet belongs to user
      const pet = await Pet.findOne({ _id: petId, owner: userId, isActive: true });
      if (!pet) {
        res.status(404).json({
          success: false,
          message: 'Pet not found or does not belong to you'
        });
        return;
      }
      
      // Verify veterinarian exists and is active
      const veterinarian = await Veterinarian.findOne({ _id: veterinarianId, isApproved: true });
      if (!veterinarian) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found or not available'
        });
        return;
      }
      
      // Check for existing appointment at the same time (via repository)
      const repo = new AppointmentRepository();
      const conflict = await repo.findConflict(veterinarianId, new Date(date), timeSlot.startTime);
      if (conflict) {
        res.status(409).json({ success: false, message: 'Time slot is already booked. Please choose another time.' });
        return;
      }
      
      // Create the appointment
      const appointmentData = {
        user: userId,
        pet: petId,
        veterinarian: veterinarianId,
        date: new Date(date),
        time: timeSlot.startTime, // Use startTime as the appointment time
        reason: reason.trim(),
        comments: userNotes?.trim(), // userNotes maps to comments field in model
        status: 'PENDING' as const // Must be uppercase
      };
      
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      
      // Populate appointment with user and pet details for response
      await appointment.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);
      
      // Trigger notifications
      await this.notificationManager.onAppointmentCreated(appointment);
      
      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully! The veterinarian will review your request.',
        data: { appointment }
      });
      
    } catch (error: any) {
      console.error('Book appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to book appointment. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getMyAppointments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const userRole = req.userRole; // Set by auth middleware
      if (!userId) {
        res.status(401).json({ success: false, message: 'User authentication required' });
        return;
      }
      const repo = new AppointmentRepository();
      const appointments = userRole === 'veterinarian'
        ? await repo.findByVeterinarian(userId.toString())
        : await repo.findByUser(userId.toString());

      res.json({ success: true, data: { appointments }, count: appointments.length });
      
    } catch (error: any) {
      console.error('Get my appointments error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to get appointments'
      });
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get all appointments' });
    }
  }

  async getAppointmentStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      const role = req.userRole;

      if (!userId || !role) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const filter: any = role === 'veterinarian' ? { veterinarian: userId } : role === 'admin' ? {} : { user: userId };
      const appointments = await Appointment.find(filter).select('status date time consultationFee rating');

      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
      const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
      const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');

      // Earnings (primarily for veterinarians); for users this can represent total spending
      const totalEarnings = completedAppointments.reduce((sum, a) => sum + (a.consultationFee || 0), 0);

      // Average rating across completed appointments with rating
      const ratings = completedAppointments.map(a => a.rating).filter((r): r is number => typeof r === 'number');
      const averageRating = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;

      // Appointments this month/week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const appointmentsThisWeek = appointments.filter(a => a.date >= startOfWeek && a.date <= now).length;
      const appointmentsThisMonth = appointments.filter(a => a.date >= startOfMonth && a.date <= now).length;

      res.json({
        success: true,
        data: {
          totalAppointments,
          completedAppointments: completedAppointments.length,
          pendingAppointments: pendingAppointments.length,
          cancelledAppointments: cancelledAppointments.length,
          totalEarnings,
          averageRating: Math.round(averageRating * 10) / 10,
          appointmentsThisMonth,
          appointmentsThisWeek
        }
      });
    } catch (error: any) {
      console.error('Get appointment stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to get appointment stats' });
    }
  }

  async getAppointmentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?._id?.toString() || '';
  let userRole: 'user' | 'veterinarian' = 'user';
  if (req.userRole === 'veterinarian') userRole = 'veterinarian';
  // Treat admin as user for repository access
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }
      const repo = new AppointmentRepository();
      const appointment = await repo.findByIdForRole(appointmentId, userId, userRole);
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or access denied' });
        return;
      }
      res.json({ success: true, data: { appointment } });
    } catch (error: any) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to get appointment'
      });
    }
  }

  async approveAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { consultationFee, veterinarianNotes } = req.body;
      const vetId = req.user?._id;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }
      
      // Load appointment and use State pattern for transition
      const appointment = await Appointment.findOne({ _id: appointmentId, veterinarian: vetId, status: 'PENDING' });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or cannot be approved' });
        return;
      }
      const ctx = new AppointmentStateContext(appointment);
      const approved = await ctx.getState().approve({ consultationFee, veterinarianNotes });
      await approved.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);
      
      // Trigger notification for approval
      await this.notificationManager.onAppointmentApproved(approved);
      
      res.json({ success: true, message: 'Appointment approved successfully', data: { appointment: approved } });
    } catch (error: any) {
      console.error('Approve appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to approve appointment'
      });
    }
  }

  async confirmAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?._id;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }
      
      const appointment = await Appointment.findOne({ _id: appointmentId, user: userId, status: 'APPROVED' });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or cannot be confirmed' });
        return;
      }
      const ctx = new AppointmentStateContext(appointment);
      const confirmed = await ctx.getState().confirm();
      await confirmed.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);
      // Use updated event for confirm
      await this.notificationManager.onAppointmentUpdated(confirmed);
      
      res.json({ success: true, message: 'Appointment confirmed successfully', data: { appointment: confirmed } });
    } catch (error: any) {
      console.error('Confirm appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to confirm appointment'
      });
    }
  }

  async completeAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { diagnosis, treatment, followUpRequired, veterinarianNotes } = req.body;
      const vetId = req.user?._id;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }
      if (!diagnosis || !treatment) {
        res.status(400).json({ success: false, message: 'Diagnosis and treatment are required to complete the appointment' });
        return;
      }
      const appointment = await Appointment.findOne({ _id: appointmentId, veterinarian: vetId, status: { $in: ['APPROVED', 'CONFIRMED'] } });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or cannot be completed' });
        return;
      }
      const ctx = new AppointmentStateContext(appointment);
      const completed = await ctx.getState().complete({ diagnosis, treatment, followUpRequired, veterinarianNotes });
      await completed.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);
      await this.notificationManager.onAppointmentCompleted(completed);
      
      res.json({
        success: true,
        message: 'Appointment completed successfully',
        data: { appointment }
      });
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to complete appointment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async cancelAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const userId = req.user?._id;
      const userRole = req.userRole;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }
      
      const baseQuery: any = { _id: appointmentId, status: { $nin: ['CANCELLED', 'COMPLETED'] } };
      if (userRole === 'veterinarian') baseQuery.veterinarian = userId; else baseQuery.user = userId;

      const appointment = await Appointment.findOne(baseQuery);
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' });
        return;
      }
      const ctx = new AppointmentStateContext(appointment);
      const cancelled = await ctx.getState().cancel(reason);
      await cancelled.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);

      await this.notificationManager.onAppointmentCancelled(cancelled);
      
      res.json({ success: true, message: 'Appointment cancelled successfully', data: { appointment: cancelled } });
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to cancel appointment'
      });
    }
  }

  async rejectAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const vetId = req.user?._id;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }
      
      const appointment = await Appointment.findOne({ _id: appointmentId, veterinarian: vetId, status: 'PENDING' });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or cannot be rejected' });
        return;
      }
      // Reject handled as a direct status set for now
      appointment.status = 'REJECTED';
      appointment.veterinarianNotes = reason ? `Rejected: ${reason}` : 'Rejected by veterinarian';
      await appointment.save();
      await appointment.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);

      await this.notificationManager.onAppointmentRejected(appointment);
      
      res.json({ success: true, message: 'Appointment rejected successfully', data: { appointment } });
    } catch (error: any) {
      console.error('Reject appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to reject appointment'
      });
    }
  }

  async rescheduleAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { date, timeSlot, reason } = req.body;
      const userId = req.user?._id;
      const userRole = req.userRole;
      
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }
      
      if (!date || !timeSlot || !timeSlot.startTime) {
        res.status(400).json({
          success: false,
          message: 'Date and time slot are required'
        });
        return;
      }
      
      // Build query based on user role
      let query: any = { 
        _id: appointmentId,
        status: { $nin: ['CANCELLED', 'COMPLETED', 'REJECTED'] }
      };
      
      if (userRole === 'veterinarian') {
        query.veterinarian = userId;
      } else {
        query.user = userId;
      }
      
      // Find the current appointment
      const currentAppointment = await Appointment.findOne(query);
      if (!currentAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found or cannot be rescheduled'
        });
        return;
      }
      
      // Check if new time slot is available (via repository)
      const repo = new AppointmentRepository();
      const existingAppointment = await repo.findConflict(
        currentAppointment.veterinarian.toString(),
        new Date(date),
        timeSlot.startTime,
        appointmentId
      );
      if (existingAppointment) {
        res.status(409).json({ success: false, message: 'Selected time slot is not available. Please choose another time.' });
        return;
      }
      
      // Additional validation chain for reschedule
      const requireRes = new RequireFieldsValidator(['date']);
      const futureRes = new FutureDateValidator();
      const timeValidRes = new TimeFormatValidator('timeSlot.startTime');
      requireRes.setNext(futureRes).setNext(timeValidRes);
      await requireRes.handle({ date, timeSlot });

      // Use state transition for reschedule
      const stateCtx = new AppointmentStateContext(currentAppointment);
      const rescheduled = await stateCtx.getState().reschedule({ date, time: timeSlot.startTime, reason });
      await rescheduled.populate([
        { path: 'user', select: 'name email contact' },
        { path: 'pet', select: 'name type breed age weight' },
        { path: 'veterinarian', select: 'name email specialization' }
      ]);
      
      res.json({ success: true, message: 'Appointment rescheduled successfully', data: { appointment: rescheduled } });
    } catch (error: any) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to reschedule appointment'
      });
    }
  }

  async rateAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?._id;
      const { stars, comment } = req.body;

      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        return;
      }

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const starsNum = Number(stars);
      if (!starsNum || starsNum < 1 || starsNum > 5) {
        res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
        return;
      }

      // Only allow rating by the user who booked, and only for completed appointments
      const appointment = await Appointment.findOne({ _id: appointmentId, user: userId, status: 'COMPLETED' });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or not eligible for rating' });
        return;
      }

      appointment.rating = starsNum;
      appointment.review = (comment || '').toString().trim().substring(0, 500);
      await appointment.save();

      const populated = await Appointment.findById(appointment._id)
        .populate('user', 'name email contact')
        .populate('pet', 'name type breed age weight')
        .populate('veterinarian', 'name email specialization');

      res.json({
        success: true,
        message: 'Appointment rated successfully',
        data: { appointment: populated }
      });
    } catch (error: any) {
      console.error('Rate appointment error:', error);
      res.status(500).json({ success: false, message: 'Failed to rate appointment' });
    }
  }

  async getUserAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      res.json({
        success: true,
        data: { userId, appointments: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user appointments' });
    }
  }

  async getVetAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { vetId } = req.params;
      res.json({
        success: true,
        data: { vetId, appointments: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get veterinarian appointments' });
    }
  }

  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { vetId } = req.params;
      const { date } = req.query;
      
      if (!mongoose.Types.ObjectId.isValid(vetId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid veterinarian ID'
        });
        return;
      }
      
      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Date is required'
        });
        return;
      }
      
      // Get veterinarian to check availability
      const vet = await Veterinarian.findById(vetId);
      if (!vet) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found'
        });
        return;
      }
      
      // Get day of week for the requested date
      const requestedDate = new Date(date as string);
      const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if vet is available on this day
      const dayAvailability = vet.availability?.find(avail => avail.day === dayOfWeek && avail.enabled);
      
      if (!dayAvailability) {
        res.json({
          success: true,
          data: { slots: [] }
        });
        return;
      }
      
      // Generate time slots from start to end time (30-minute intervals)
      const slots = [];
      const startTime = dayAvailability.startTime;
      const endTime = dayAvailability.endTime;
      
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      
      while (start < end) {
        const timeStr = start.toTimeString().substring(0, 5); // HH:MM format
        
        // Check if this slot is already booked
        const existingAppointment = await Appointment.findOne({
          veterinarian: vetId,
          date: requestedDate,
          time: timeStr,
          status: { $nin: ['CANCELLED', 'REJECTED'] }
        });
        
        slots.push({
          startTime: timeStr,
          endTime: new Date(start.getTime() + 30 * 60000).toTimeString().substring(0, 5),
          available: !existingAppointment
        });
        
        start.setMinutes(start.getMinutes() + 30);
      }
      
      res.json({
        success: true,
        data: { slots }
      });
      
    } catch (error: any) {
      console.error('Get available slots error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to get available slots'
      });
    }
  }

  async getPetAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      res.json({
        success: true,
        data: { petId, appointments: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get pet appointments' });
    }
  }

  async getTodaysSchedule(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: { date: new Date().toISOString().split('T')[0], schedule: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get today\'s schedule' });
    }
  }

  async getUpcomingReminders(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: { reminders: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get upcoming reminders' });
    }
  }
  
}

const appointmentController = new AppointmentController();
export default appointmentController;
