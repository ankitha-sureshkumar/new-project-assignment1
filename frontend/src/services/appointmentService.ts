import api from './api';

export interface Appointment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  pet: {
    _id: string;
    name: string;
    type: string;
    breed: string;
    age: {
      years: number;
      months: number;
    };
  };
  veterinarian: {
    _id: string;
    name: string;
    email: string;
    specialization?: string;
    licenseNumber: string;
  };
  date: Date;
  // Backend returns a simple time string (HH:MM) on appointments
  time?: string;
  // timeSlot is used when booking or rescheduling (request payload)
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  status: 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  reason: string;
  consultationFee?: number;
  veterinarianNotes?: string;
  userNotes?: string;
  rating?: {
    stars: number;
    comment?: string;
    ratedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  petId: string;
  veterinarianId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  reason: string;
  userNotes?: string;
}

export interface ApproveAppointmentData {
  consultationFee: number;
  veterinarianNotes?: string;
}

export interface CompleteAppointmentData {
  diagnosis: string;
  treatment: string;
  followUpRequired?: boolean;
  veterinarianNotes?: string;
}

export interface RateAppointmentData {
  stars: number; // 1-5
  comment?: string;
}

export interface RescheduleAppointmentData {
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  reason?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalEarnings: number;
  averageRating: number;
  appointmentsThisMonth: number;
  appointmentsThisWeek: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class AppointmentService {
  // Book a new appointment (user only)
  async bookAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post<ApiResponse<{ appointment: Appointment }>>('/appointments', appointmentData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to book appointment');
    } catch (error: any) {
      console.error('Book appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to book appointment');
    }
  }

  // Get appointments for the authenticated user (role-based)
  async getMyAppointments(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }): Promise<Appointment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page) params.append('page', filters.page.toString());

      const url = `/appointments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<ApiResponse<{ appointments: Appointment[] }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointments;
      }
      
      throw new Error(response.data.message || 'Failed to get appointments');
    } catch (error: any) {
      console.error('Get my appointments error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get appointments');
    }
  }

  // Get a specific appointment by ID
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
      const response = await api.get<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to get appointment');
    } catch (error: any) {
      console.error('Get appointment by ID error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get appointment');
    }
  }

  // Approve appointment (veterinarian only)
  async approveAppointment(appointmentId: string, approvalData: ApproveAppointmentData): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/approve`, approvalData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to approve appointment');
    } catch (error: any) {
      console.error('Approve appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve appointment');
    }
  }

  // Confirm appointment (user only)
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/confirm`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to confirm appointment');
    } catch (error: any) {
      console.error('Confirm appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to confirm appointment');
    }
  }

  // Complete appointment (veterinarian only)
  async completeAppointment(appointmentId: string, completionData: CompleteAppointmentData): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/complete`, completionData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to complete appointment');
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to complete appointment');
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/cancel`, { reason });
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to cancel appointment');
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel appointment');
    }
  }

  // Reject appointment (veterinarian only)
  async rejectAppointment(appointmentId: string, reason: string): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/reject`, { reason });
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to reject appointment');
    } catch (error: any) {
      console.error('Reject appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject appointment');
    }
  }

  // Rate appointment (user only)
  async rateAppointment(appointmentId: string, ratingData: RateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/rating`, ratingData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to rate appointment');
    } catch (error: any) {
      console.error('Rate appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to rate appointment');
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId: string, rescheduleData: RescheduleAppointmentData): Promise<Appointment> {
    try {
      const response = await api.put<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/reschedule`, rescheduleData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointment;
      }
      
      throw new Error(response.data.message || 'Failed to reschedule appointment');
    } catch (error: any) {
      console.error('Reschedule appointment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reschedule appointment');
    }
  }

  // Get available time slots for a veterinarian
  async getAvailableSlots(veterinarianId: string, date: string): Promise<AvailableSlot[]> {
    try {
      const response = await api.get<ApiResponse<{ slots: AvailableSlot[] }>>(`/appointments/availability/${veterinarianId}?date=${date}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.slots;
      }
      
      throw new Error(response.data.message || 'Failed to get available slots');
    } catch (error: any) {
      console.error('Get available slots error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get available slots');
    }
  }

  // Get appointments for a specific pet
  async getPetAppointments(petId: string): Promise<Appointment[]> {
    try {
      const response = await api.get<ApiResponse<{ appointments: Appointment[] }>>(`/appointments/pet/${petId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointments;
      }
      
      throw new Error(response.data.message || 'Failed to get pet appointments');
    } catch (error: any) {
      console.error('Get pet appointments error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get pet appointments');
    }
  }

  // Get today's schedule (veterinarian only)
  async getTodaysSchedule(): Promise<Appointment[]> {
    try {
      const response = await api.get<ApiResponse<{ appointments: Appointment[] }>>('/appointments/today/schedule');
      
      if (response.data.success && response.data.data) {
        return response.data.data.appointments;
      }
      
      throw new Error(response.data.message || 'Failed to get today\'s schedule');
    } catch (error: any) {
      console.error('Get today\'s schedule error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get today\'s schedule');
    }
  }

  // Get appointment statistics (veterinarian and admin)
  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const response = await api.get<ApiResponse<AppointmentStats>>('/appointments/stats/summary');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get appointment stats');
    } catch (error: any) {
      console.error('Get appointment stats error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get appointment stats');
    }
  }

  // Helper method to format appointment status
  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Helper method to format appointment date
  formatAppointmentDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to format time slot
  formatTimeSlot(timeSlot: { startTime: string; endTime: string }): string {
    return `${this.formatTime(timeSlot.startTime)} - ${this.formatTime(timeSlot.endTime)}`;
  }

  // Helper method to format time
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Helper method to check if appointment is upcoming
  isUpcoming(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    return appointmentDate > now && (appointment.status === 'confirmed' || appointment.status === 'approved');
  }

  // Helper method to check if appointment is past
  isPast(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    return appointmentDate < now;
  }
}

export default new AppointmentService();