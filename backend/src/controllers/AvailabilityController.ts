import { Request, Response } from 'express';
import Veterinarian, { IVeterinarian } from '../models/Veterinarian';
import mongoose from 'mongoose';

/**
 * Availability Controller - Manage veterinarian available time slots
 */
export class AvailabilityController {
  
  // Get veterinarian's availability schedule
  async getMyAvailability(req: Request, res: Response): Promise<void> {
    try {
      const veterinarianId = req.userId;
      
      if (!veterinarianId) {
        res.status(401).json({
          success: false,
          message: 'Veterinarian authentication required'
        });
        return;
      }
      
      const veterinarian = await Veterinarian.findById(veterinarianId).select('availability');
      
      if (!veterinarian) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: { availability: veterinarian.availability }
      });
      
    } catch (error: any) {
      console.error('Get availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get availability'
      });
    }
  }
  
  // Update veterinarian's availability schedule
  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const veterinarianId = req.userId;
      const { availability } = req.body;
      
      if (!veterinarianId) {
        res.status(401).json({
          success: false,
          message: 'Veterinarian authentication required'
        });
        return;
      }
      
      if (!availability || !Array.isArray(availability)) {
        res.status(400).json({
          success: false,
          message: 'Valid availability array is required'
        });
        return;
      }
      
      // Validate availability format
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      for (const slot of availability) {
        if (!validDays.includes(slot.day)) {
          res.status(400).json({
            success: false,
            message: `Invalid day: ${slot.day}`
          });
          return;
        }
        
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          res.status(400).json({
            success: false,
            message: 'Invalid time format. Use HH:MM format'
          });
          return;
        }
        
        if (typeof slot.enabled !== 'boolean') {
          res.status(400).json({
            success: false,
            message: 'Enabled field must be boolean'
          });
          return;
        }
      }
      
      const veterinarian = await Veterinarian.findByIdAndUpdate(
        veterinarianId,
        { availability },
        { new: true, runValidators: true }
      ).select('availability');
      
      if (!veterinarian) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: { availability: veterinarian.availability }
      });
      
    } catch (error: any) {
      console.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }
  }
  
  // Toggle a specific time slot availability
  async toggleTimeSlot(req: Request, res: Response): Promise<void> {
    try {
      const veterinarianId = req.userId;
      const { day, enabled } = req.body;
      
      if (!veterinarianId) {
        res.status(401).json({
          success: false,
          message: 'Veterinarian authentication required'
        });
        return;
      }
      
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      if (!validDays.includes(day)) {
        res.status(400).json({
          success: false,
          message: 'Invalid day provided'
        });
        return;
      }
      
      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Enabled field must be boolean'
        });
        return;
      }
      
      const veterinarian = await Veterinarian.findById(veterinarianId);
      
      if (!veterinarian) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found'
        });
        return;
      }
      
      // Find and update the specific day
      const dayIndex = veterinarian.availability.findIndex(slot => slot.day === day);
      
      if (dayIndex !== -1) {
        veterinarian.availability[dayIndex].enabled = enabled;
        await veterinarian.save();
      } else {
        res.status(404).json({
          success: false,
          message: 'Time slot for the specified day not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: `${day} availability ${enabled ? 'enabled' : 'disabled'}`,
        data: { availability: veterinarian.availability }
      });
      
    } catch (error: any) {
      console.error('Toggle time slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle time slot'
      });
    }
  }
  
  // Get available time slots for a specific veterinarian and date (for booking)
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { veterinarianId } = req.params;
      const { date } = req.query;
      
      if (!mongoose.Types.ObjectId.isValid(veterinarianId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid veterinarian ID'
        });
        return;
      }
      
      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Date parameter is required'
        });
        return;
      }
      
      const requestedDate = new Date(date as string);
      const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      const veterinarian = await Veterinarian.findById(veterinarianId).select('availability');
      
      if (!veterinarian) {
        res.status(404).json({
          success: false,
          message: 'Veterinarian not found'
        });
        return;
      }
      
      // Find availability for the requested day
      const dayAvailability = veterinarian.availability.find(slot => slot.day === dayName);
      
      if (!dayAvailability || !dayAvailability.enabled) {
        res.json({
          success: true,
          data: { availableSlots: [] },
          message: 'No availability for this day'
        });
        return;
      }
      
      // Generate time slots (30-minute intervals)
      const startTime = dayAvailability.startTime;
      const endTime = dayAvailability.endTime;
      const slots = this.generateTimeSlots(startTime, endTime, 30);
      
      // TODO: Filter out already booked slots by checking appointments
      // For now, return all available slots
      
      res.json({
        success: true,
        data: { 
          availableSlots: slots.map(slot => ({
            time: slot,
            available: true
          }))
        }
      });
      
    } catch (error: any) {
      console.error('Get available slots error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available slots'
      });
    }
  }
  
  // Helper method to generate time slots
  private generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
    const slots: string[] = [];
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  }
}

const availabilityController = new AvailabilityController();
export default availabilityController;