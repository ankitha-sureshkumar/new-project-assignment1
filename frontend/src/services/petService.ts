import api from './api';

export interface Pet {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: string; // Changed to string to match backend
  weight?: number;
  gender?: string;
  color?: string;
  microchipId?: string;
  medicalHistory?: string;
  vaccinations?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
  lastVisit?: Date;
  owner: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetData {
  name: string;
  type: string;
  breed: string;
  age: string; // Changed to string to match backend
  weight?: number;
  gender?: string;
  color?: string;
  microchipId?: string;
  medicalHistory?: string;
  vaccinations?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
}

export interface UpdatePetData {
  name?: string;
  type?: string;
  breed?: string;
  age?: string; // Changed to string to match backend
  weight?: number;
  gender?: string;
  color?: string;
  microchipId?: string;
  medicalHistory?: string;
  vaccinations?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PetHistory {
  appointments: any[];
  medicalNotes: any[];
  vaccinations: any[];
}

class PetService {
  // Create a new pet
  async createPet(petData: CreatePetData): Promise<Pet> {
    try {
      const response = await api.post<ApiResponse<{ pet: Pet }>>('/pets', petData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.pet;
      }
      
      throw new Error(response.data.message || 'Failed to create pet');
    } catch (error: any) {
      console.error('Create pet error:', error);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to create pet');
    }
  }

  // Get all pets for the authenticated user
  async getUserPets(): Promise<Pet[]> {
    try {
      const response = await api.get<ApiResponse<{ pets: Pet[] }>>('/pets');
      
      if (response.data.success && response.data.data) {
        return response.data.data.pets;
      }
      
      throw new Error(response.data.message || 'Failed to get pets');
    } catch (error: any) {
      console.error('Get user pets error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get pets');
    }
  }

  // Get a specific pet by ID
  async getPetById(petId: string): Promise<Pet> {
    try {
      const response = await api.get<ApiResponse<{ pet: Pet }>>(`/pets/${petId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.pet;
      }
      
      throw new Error(response.data.message || 'Failed to get pet');
    } catch (error: any) {
      console.error('Get pet by ID error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get pet');
    }
  }

  // Update a pet
  async updatePet(petId: string, petData: UpdatePetData): Promise<Pet> {
    try {
      const response = await api.put<ApiResponse<{ pet: Pet }>>(`/pets/${petId}`, petData);
      
      if (response.data.success && response.data.data) {
        return response.data.data.pet;
      }
      
      throw new Error(response.data.message || 'Failed to update pet');
    } catch (error: any) {
      console.error('Update pet error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update pet');
    }
  }

  // Delete (deactivate) a pet
  async deletePet(petId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/pets/${petId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete pet');
      }
    } catch (error: any) {
      console.error('Delete pet error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete pet');
    }
  }

  // Upload pet profile picture
  async uploadPetPhoto(petId: string, file: File): Promise<Pet> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post<ApiResponse<{ pet: Pet }>>(`/pets/${petId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.pet;
      }
      
      throw new Error(response.data.message || 'Failed to upload pet photo');
    } catch (error: any) {
      console.error('Upload pet photo error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload pet photo');
    }
  }

  // Get pet's medical history
  async getPetHistory(petId: string): Promise<PetHistory> {
    try {
      const response = await api.get<ApiResponse<PetHistory>>(`/pets/${petId}/history`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get pet history');
    } catch (error: any) {
      console.error('Get pet history error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get pet history');
    }
  }

  // Reactivate a deactivated pet
  async activatePet(petId: string): Promise<Pet> {
    try {
      const response = await api.put<ApiResponse<{ pet: Pet }>>(`/pets/${petId}/activate`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.pet;
      }
      
      throw new Error(response.data.message || 'Failed to activate pet');
    } catch (error: any) {
      console.error('Activate pet error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to activate pet');
    }
  }

  // Search pets (admin/vet only)
  async searchPets(query: string): Promise<Pet[]> {
    try {
      const response = await api.get<ApiResponse<{ pets: Pet[] }>>(`/pets/search/${query}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.pets;
      }
      
      throw new Error(response.data.message || 'Failed to search pets');
    } catch (error: any) {
      console.error('Search pets error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to search pets');
    }
  }

  // Add medical notes (veterinarian only)
  async addMedicalNotes(petId: string, notes: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(`/pets/${petId}/medical-notes`, { notes });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add medical notes');
      }
    } catch (error: any) {
      console.error('Add medical notes error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add medical notes');
    }
  }

  // Helper method to format pet age
  formatPetAge(age: { years: number; months: number }): string {
    if (age.years === 0) {
      return `${age.months} month${age.months !== 1 ? 's' : ''}`;
    } else if (age.months === 0) {
      return `${age.years} year${age.years !== 1 ? 's' : ''}`;
    } else {
      return `${age.years} year${age.years !== 1 ? 's' : ''} ${age.months} month${age.months !== 1 ? 's' : ''}`;
    }
  }

  // Helper method to calculate pet age from birthdate
  calculateAge(birthDate: Date): { years: number; months: number } {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months };
  }
}

export default new PetService();