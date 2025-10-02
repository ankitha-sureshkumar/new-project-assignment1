import { useState, useEffect, useCallback } from 'react';
import petService, { Pet } from '../services/petService';
import appointmentService, { Appointment, AppointmentStats } from '../services/appointmentService';
import authService from '../services/authService';

export interface DashboardData {
  pets: Pet[];
  appointments: Appointment[];
  appointmentStats: AppointmentStats | null;
  todaysSchedule: Appointment[];
  veterinarians: any[];
}

export interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  refetch: () => Promise<void>;
  setActionLoading: (action: string | null) => void;
  updatePet: (pet: Pet) => void;
  updateAppointment: (appointment: Appointment) => void;
  removePet: (petId: string) => void;
}

export const useDashboardData = (userRole: 'user' | 'veterinarian') => {
  const [data, setData] = useState<DashboardData>({
    pets: [],
    appointments: [],
    appointmentStats: null,
    todaysSchedule: [],
    veterinarians: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Data validation and sanitization
  const sanitizeAppointmentData = (appointments: any[]): Appointment[] => {
    return appointments.filter(Boolean).map(apt => ({
      ...apt,
      date: apt.date || new Date().toISOString(),
      status: apt.status || 'PENDING',
      reason: apt.reason || 'No reason provided',
      pet: typeof apt.pet === 'object' ? apt.pet : { _id: apt.pet, name: 'Unknown Pet', breed: '' },
      user: typeof apt.user === 'object' ? apt.user : { _id: apt.user, name: 'Unknown User' },
      veterinarian: typeof apt.veterinarian === 'object' ? apt.veterinarian : { _id: apt.veterinarian, name: 'Unknown Veterinarian' }
    }));
  };

  const sanitizePetData = (pets: any[]): Pet[] => {
    return pets.filter(Boolean).map(pet => ({
      ...pet,
      name: pet.name || 'Unnamed Pet',
      breed: pet.breed || 'Unknown Breed',
      age: pet.age || { years: 0, months: 0 }
    }));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (userRole === 'user') {
        // Fetch user-specific data with error recovery
        const results = await Promise.allSettled([
          petService.getUserPets(),
          appointmentService.getMyAppointments(),
          authService.getVeterinarians({ available: true })
        ]);

        const petsData = results[0].status === 'fulfilled' ? sanitizePetData(results[0].value) : [];
        const appointmentsData = results[1].status === 'fulfilled' ? sanitizeAppointmentData(results[1].value) : [];
        const veterinariansData = results[2].status === 'fulfilled' ? results[2].value : [];

        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpoint = ['pets', 'appointments', 'veterinarians'][index];
            console.warn(`Failed to fetch ${endpoint}:`, result.reason);
          }
        });

        setData({
          pets: petsData,
          appointments: appointmentsData,
          appointmentStats: null,
          todaysSchedule: [],
          veterinarians: veterinariansData
        });
      } else if (userRole === 'veterinarian') {
        // Fetch veterinarian-specific data with error recovery
        const results = await Promise.allSettled([
          appointmentService.getMyAppointments(),
          appointmentService.getAppointmentStats(),
          appointmentService.getTodaysSchedule()
        ]);

        const appointmentsData = results[0].status === 'fulfilled' ? sanitizeAppointmentData(results[0].value) : [];
        const statsData = results[1].status === 'fulfilled' ? results[1].value : null;
        const todaysData = results[2].status === 'fulfilled' ? sanitizeAppointmentData(results[2].value) : [];

        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpoint = ['appointments', 'stats', 'schedule'][index];
            console.warn(`Failed to fetch ${endpoint}:`, result.reason);
          }
        });

        setData({
          pets: [],
          appointments: appointmentsData,
          appointmentStats: statsData,
          todaysSchedule: todaysData,
          veterinarians: []
        });
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to load dashboard data';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You don\'t have permission to view this data.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if not currently loading and no action is in progress
      if (!loading && !actionLoading) {
        fetchData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchData, loading, actionLoading]);

  // Update individual pet
  const updatePet = useCallback((updatedPet: Pet) => {
    setData(prev => ({
      ...prev,
      pets: prev.pets.map(pet => pet._id === updatedPet._id ? updatedPet : pet)
    }));
  }, []);

  // Update individual appointment
  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(apt => 
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      ),
      todaysSchedule: prev.todaysSchedule.map(apt => 
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    }));
  }, []);

  // Remove pet
  const removePet = useCallback((petId: string) => {
    setData(prev => ({
      ...prev,
      pets: prev.pets.filter(pet => pet._id !== petId)
    }));
  }, []);

  return {
    ...data,
    loading,
    error,
    actionLoading,
    refetch: fetchData,
    setActionLoading,
    updatePet,
    updateAppointment,
    removePet
  } as DashboardState;
};

// Utility hook for handling API actions with loading states
export const useApiAction = (
  setActionLoading: (action: string | null) => void,
  onSuccess?: () => void,
  onError?: (error: string) => void
) => {
  const executeAction = useCallback(async (
    actionKey: string,
    apiCall: () => Promise<any>
  ) => {
    try {
      setActionLoading(actionKey);
      const result = await apiCall();
      onSuccess?.();
      return result;
    } catch (error: any) {
      console.error(`API action ${actionKey} failed:`, error);
      onError?.(error.message || 'Action failed');
      throw error;
    } finally {
      setActionLoading(null);
    }
  }, [setActionLoading, onSuccess, onError]);

  return { executeAction };
};