import api from './api';

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface AvailableTimeSlot {
  time: string;
  available: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class AvailabilityService {
  // Get current veterinarian's availability schedule
  async getMyAvailability(): Promise<AvailabilitySlot[]> {
    try {
      const response = await api.get<ApiResponse<{ availability: AvailabilitySlot[] }>>('/availability/my-schedule');
      
      if (response.data.success && response.data.data) {
        return response.data.data.availability;
      }
      
      throw new Error(response.data.message || 'Failed to get availability');
    } catch (error: any) {
      console.error('Get availability error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get availability');
    }
  }

  // Update veterinarian's full availability schedule
  async updateAvailability(availability: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    try {
      const response = await api.put<ApiResponse<{ availability: AvailabilitySlot[] }>>('/availability/update-schedule', {
        availability
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.availability;
      }
      
      throw new Error(response.data.message || 'Failed to update availability');
    } catch (error: any) {
      console.error('Update availability error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update availability');
    }
  }

  // Toggle availability for a specific day
  async toggleTimeSlot(day: string, enabled: boolean): Promise<AvailabilitySlot[]> {
    try {
      const response = await api.put<ApiResponse<{ availability: AvailabilitySlot[] }>>('/availability/toggle-slot', {
        day,
        enabled
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.availability;
      }
      
      throw new Error(response.data.message || 'Failed to toggle time slot');
    } catch (error: any) {
      console.error('Toggle time slot error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to toggle time slot');
    }
  }

  // Get available time slots for a specific veterinarian and date (for booking)
  async getAvailableSlots(veterinarianId: string, date: string): Promise<AvailableTimeSlot[]> {
    try {
      const response = await api.get<ApiResponse<{ availableSlots: AvailableTimeSlot[] }>>(
        `/availability/${veterinarianId}/slots?date=${date}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.availableSlots;
      }
      
      throw new Error(response.data.message || 'Failed to get available slots');
    } catch (error: any) {
      console.error('Get available slots error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get available slots');
    }
  }

  // Helper method to format time display
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Helper method to get day name from date
  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Helper method to check if a time slot is in the past
  isTimeSlotInPast(date: string, time: string): boolean {
    const now = new Date();
    const slotDateTime = new Date(`${date} ${time}`);
    return slotDateTime < now;
  }
}

export default new AvailabilityService();