import api from './api';

export interface Veterinarian {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  experience?: number;
  education?: string;
  certifications?: string[];
  available?: boolean;
  profilePicture?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVeterinarianData {
  name: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string;
  experience?: number;
  education?: string;
  certifications?: string[];
}

export interface UpdateVeterinarianData {
  name?: string;
  email?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  education?: string;
  certifications?: string[];
  available?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class VeterinarianService {
  // Get all veterinarians (for appointment booking)
  async getAllVeterinarians(): Promise<Veterinarian[]> {
    try {
      const response = await api.get<ApiResponse<{ veterinarians: Veterinarian[] }>>('/veterinarians');
      
      if (response.data.success && response.data.data) {
        return response.data.data.veterinarians;
      }
      
      throw new Error(response.data.message || 'Failed to get veterinarians');
    } catch (error: any) {
      console.error('Get veterinarians error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get veterinarians');
    }
  }

  // Get available veterinarians (only active ones)
  async getAvailableVeterinarians(): Promise<Veterinarian[]> {
    try {
      const response = await api.get<ApiResponse<{ veterinarians: Veterinarian[] }>>('/veterinarians?available=true');
      
      if (response.data.success && response.data.data) {
        return response.data.data.veterinarians;
      }
      
      throw new Error(response.data.message || 'Failed to get available veterinarians');
    } catch (error: any) {
      console.error('Get available veterinarians error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get available veterinarians');
    }
  }

  // Get veterinarian by ID
  async getVeterinarianById(veterinarianId: string): Promise<Veterinarian> {
    try {
      const response = await api.get<ApiResponse<{ veterinarian: Veterinarian }>>(`/veterinarians/${veterinarianId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.veterinarian;
      }
      
      throw new Error(response.data.message || 'Failed to get veterinarian');
    } catch (error: any) {
      console.error('Get veterinarian by ID error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get veterinarian');
    }
  }

  // Create new veterinarian (admin only)
  async createVeterinarian(veterinarianData: CreateVeterinarianData): Promise<Veterinarian> {
    try {
      const response = await api.post<ApiResponse<{ veterinarian: Veterinarian }>>('/veterinarians', veterinarianData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.veterinarian;
      }
      
      throw new Error(response.data.message || 'Failed to create veterinarian');
    } catch (error: any) {
      console.error('Create veterinarian error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create veterinarian');
    }
  }

  // Update veterinarian (admin or self)
  async updateVeterinarian(veterinarianId: string, updateData: UpdateVeterinarianData): Promise<Veterinarian> {
    try {
      const response = await api.put<ApiResponse<{ veterinarian: Veterinarian }>>(`/veterinarians/${veterinarianId}`, updateData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.veterinarian;
      }
      
      throw new Error(response.data.message || 'Failed to update veterinarian');
    } catch (error: any) {
      console.error('Update veterinarian error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update veterinarian');
    }
  }

  // Delete veterinarian (admin only)
  async deleteVeterinarian(veterinarianId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<any>>(`/veterinarians/${veterinarianId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete veterinarian');
      }
    } catch (error: any) {
      console.error('Delete veterinarian error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete veterinarian');
    }
  }

  // Get veterinarian's schedule/availability
  async getVeterinarianSchedule(veterinarianId: string, date?: string): Promise<any> {
    try {
      const url = date 
        ? `/veterinarians/${veterinarianId}/schedule?date=${date}`
        : `/veterinarians/${veterinarianId}/schedule`;
        
      const response = await api.get<ApiResponse<any>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get veterinarian schedule');
    } catch (error: any) {
      console.error('Get veterinarian schedule error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get veterinarian schedule');
    }
  }

  // Helper method to format veterinarian name
  formatName(veterinarian: Veterinarian): string {
    return `Dr. ${veterinarian.name}`;
  }

  // Helper method to get specialization display
  getSpecializationDisplay(specialization: string): string {
    const specializations: { [key: string]: string } = {
      'general': 'General Practice',
      'surgery': 'Surgery',
      'cardiology': 'Cardiology',
      'dermatology': 'Dermatology',
      'neurology': 'Neurology',
      'oncology': 'Oncology',
      'ophthalmology': 'Ophthalmology',
      'dentistry': 'Dentistry',
      'emergency': 'Emergency Medicine',
      'internal_medicine': 'Internal Medicine'
    };
    
    return specializations[specialization.toLowerCase()] || specialization;
  }

  // Helper method to check if veterinarian is available
  isAvailable(veterinarian: Veterinarian): boolean {
    return veterinarian.available !== false; // Default to true if not specified
  }

  // Helper method to get veterinarian rating display
  getRatingDisplay(veterinarian: Veterinarian): string {
    if (!veterinarian.rating || veterinarian.rating === 0) {
      return 'No ratings yet';
    }
    return `${veterinarian.rating.toFixed(1)} stars`;
  }

  // Helper method to get experience display
  getExperienceDisplay(veterinarian: Veterinarian): string {
    if (!veterinarian.experience || veterinarian.experience === 0) {
      return 'New to practice';
    }
    return `${veterinarian.experience} year${veterinarian.experience > 1 ? 's' : ''} experience`;
  }
}

export default new VeterinarianService();