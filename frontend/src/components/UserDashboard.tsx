import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PawPrint, User, Calendar, Activity, LogOut, PlusCircle, RefreshCw, Bell, BarChart3, Heart, AlertCircle, Settings, Edit, DollarSign } from 'lucide-react';
import { User as UserType } from '../types';
import { Badge } from './ui/badge';
import petService from '../services/petService';
import appointmentService from '../services/appointmentService';
import notificationService from '../services/notificationService';
import { AddPetModal, PetFormData } from './AddPetModal';
import { EditPetModal } from './EditPetModal';
import { BookAppointmentModal, BookAppointmentFormData } from './BookAppointmentModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './ui/chart';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as ReLineChart, Line } from 'recharts';

interface UserDashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRegisterActions?: (actions: {
    goToNotifications?: () => void;
    showProfile?: () => void;
  }) => void;
}

type TabType = 'notifications' | 'pets' | 'appointments' | 'analytics';

export function UserDashboard({ user, onNavigate, onLogout, onRegisterActions }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [showProfile, setShowProfile] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingPet, setAddingPet] = useState(false);
  const [updatingPet, setUpdatingPet] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState(user);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Register actions for navbar integration
  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        goToNotifications: () => setActiveTab('notifications'),
        showProfile: () => setShowProfile(true)
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (onRegisterActions) {
        onRegisterActions({});
      }
    };
  }, [onRegisterActions]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real data from APIs
      const [petsData, appointmentsData] = await Promise.all([
        petService.getUserPets().catch(err => {
          console.warn('Failed to load pets:', err);
          return [];
        }),
        appointmentService.getMyAppointments().catch(err => {
          console.warn('Failed to load appointments:', err);
          return [];
        })
      ]);
      
      // Get combined notifications (database + generated from appointments)
      const combinedNotifications = await notificationService.getCombinedNotifications(appointmentsData || []);

      setPets(petsData || []);
      setAppointments(appointmentsData || []);
      setNotifications(combinedNotifications);
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page or check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddPet = async (petData: PetFormData) => {
    try {
      setAddingPet(true);
      setError(null); // Clear any previous errors
      
      // Map PetFormData to CreatePetData format expected by backend
      const createPetData = {
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        gender: petData.gender,
        color: petData.color,
        microchipId: petData.microchipId,
        medicalHistory: petData.medicalHistory,
        vaccinations: petData.vaccinations,
        allergies: petData.allergies,
        emergencyContact: petData.emergencyContact
      };
      
      console.log('Sending pet data to backend:', createPetData);
      
      const newPet = await petService.createPet(createPetData);
      setPets(prev => [newPet, ...prev]);
      setShowAddPetModal(false);
      
      // Show success message or notification
      console.log('Pet added successfully:', newPet);
    } catch (error: any) {
      console.error('Failed to add pet:', error);
      // Show error message to user
      let errorMessage = 'Failed to add pet. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setAddingPet(false);
    }
  };

  const handleEditPet = (pet: any) => {
    setSelectedPet(pet);
    setShowEditPetModal(true);
  };

  const handleUpdatePet = async (petData: any) => {
    if (!selectedPet) return;
    
    setUpdatingPet(true);
    try {
      const updatedPet = await petService.updatePet(selectedPet._id, petData);
      setPets(prevPets => prevPets.map(pet => 
        pet._id === selectedPet._id ? updatedPet : pet
      ));
      setShowEditPetModal(false);
      setSelectedPet(null);
    } catch (error) {
      console.error('Failed to update pet:', error);
      setError('Failed to update pet. Please try again.');
    } finally {
      setUpdatingPet(false);
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;
    
    setUpdatingPet(true);
    try {
      await petService.deletePet(selectedPet._id);
      setPets(prevPets => prevPets.filter(pet => pet._id !== selectedPet._id));
      setShowEditPetModal(false);
      setSelectedPet(null);
    } catch (error) {
      console.error('Failed to delete pet:', error);
      setError('Failed to delete pet. Please try again.');
    } finally {
      setUpdatingPet(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditPetModal(false);
    setSelectedPet(null);
  };

  const handleBookAppointment = async (appointmentData: BookAppointmentFormData) => {
    try {
      setBookingAppointment(true);
      setError(null);
      
      // Map BookAppointmentFormData to CreateAppointmentData format
      const createAppointmentData = {
        petId: appointmentData.petId,
        veterinarianId: appointmentData.veterinarianId,
        date: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        reason: appointmentData.reason,
        userNotes: appointmentData.userNotes
      };
      
      console.log('Booking appointment:', createAppointmentData);
      
      const newAppointment = await appointmentService.bookAppointment(createAppointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      setShowBookAppointmentModal(false);
      
      // Refresh notifications after booking
      loadDashboardData();
      
      console.log('Appointment booked successfully:', newAppointment);
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setBookingAppointment(false);
    }
  };

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetailModal(true);
  };

  const handleCloseAppointmentDetail = () => {
    setShowAppointmentDetailModal(false);
    setSelectedAppointmentId(null);
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowRescheduleModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    // This is handled by the AppointmentDetailModal
    // Just refresh the data after cancellation
    loadDashboardData();
  };

  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
    setSelectedAppointmentId(null);
    loadDashboardData();
  };

  const handleCloseReschedule = () => {
    setShowRescheduleModal(false);
    setSelectedAppointmentId(null);
  };

  const handleNotificationClick = async (notificationId: string, read: boolean) => {
    if (!read) {
      try {
        await notificationService.markNotificationAsRead(notificationId);
        // Update the local state to mark as read
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions for sections
  const renderNotificationsSection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            <Badge variant="secondary">{notifications.filter(n => !n.read).length} new</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.filter(n => !n.read).length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No unread notifications</p>
            </div>
          ) : (
            notifications
              .filter(notification => !notification.read)
              .map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-4 rounded-lg border bg-background cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      notification.type === 'appointment' ? 'default' :
                      notification.type === 'reminder' ? 'secondary' :
                      notification.type === 'feedback' ? 'outline' : 'outline'
                    }>
                      {notification.type}
                    </Badge>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPetsSection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>My Pets</span>
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddPetModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Pet
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pets.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No pets registered yet</p>
              <Button className="mt-4" size="sm" onClick={() => setShowAddPetModal(true)}>Add Your First Pet</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Card key={pet._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{pet.name}</h4>
                        <p className="text-sm text-muted-foreground">{pet.breed} • {pet.type}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPet(pet)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>My Appointments</span>
          </CardTitle>
          <Button size="sm" onClick={() => setShowBookAppointmentModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No appointments yet</p>
              <Button className="mt-4" size="sm" onClick={() => setShowBookAppointmentModal(true)}>Book Your First Appointment</Button>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">{appointment.pet?.name || 'Pet'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.veterinarian?.name || 'Veterinarian'} • {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant={
                    appointment.status === 'completed' ? 'default' :
                    appointment.status === 'confirmed' ? 'secondary' :
                    appointment.status === 'cancelled' ? 'destructive' : 'outline'
                  }>
                    {appointment.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(appointment._id)}>View</Button>
                  {(['pending','approved','confirmed'] as const).includes((appointment.status || '').toLowerCase() as any) && (
                    <Button variant="outline" size="sm" onClick={() => handleRescheduleAppointment(appointment._id)}>
                      Reschedule
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

const renderAnalyticsSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pets</p>
                <p className="text-2xl font-bold">{pets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Visits</p>
                <p className="text-2xl font-bold">{appointments.filter(a => (a.status || '').toLowerCase() === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">
                  ${appointments.filter(a => (a.status || '').toLowerCase() === 'completed').reduce((sum, a) => sum + (a.consultationFee || (a as any).consultationCost || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Appointments by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const statuses = ['pending','approved','confirmed','completed','cancelled','rejected'] as const;
            const chartData = statuses.map((s) => ({ status: s, count: appointments.filter(a => (a.status || '').toLowerCase() === s).length }));
            const config = { count: { label: 'Count', color: 'hsl(262, 83%, 58%)' } } as const;
            return (
              <ChartContainer config={config} className="w-full h-[300px]">
                <ReBarChart data={chartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4,4,0,0]} />
                </ReBarChart>
              </ChartContainer>
            );
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Appointments (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const now = new Date();
            const months: { key: string; label: string }[] = [];
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
            }
            const countByMonth: Record<string, number> = {};
            appointments.forEach((apt) => {
              const d = new Date(apt.date);
              const key = `${d.getFullYear()}-${d.getMonth()}`;
              countByMonth[key] = (countByMonth[key] || 0) + 1;
            });
            const data = months.map(m => ({ month: m.label, count: countByMonth[m.key] || 0 }));
            const config = { count: { label: 'Appointments', color: 'hsl(221, 83%, 53%)' } } as const;
            return (
              <ChartContainer config={config} className="w-full h-[300px]">
                <ReLineChart data={data} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="count" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 3 }} />
                </ReLineChart>
              </ChartContainer>
            );
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Spend by Pet</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const spends: Record<string, number> = {};
            appointments
              .filter(a => (a.status || '').toLowerCase() === 'completed')
              .forEach(a => {
                const petName = (a.pet as any)?.name || 'Unknown';
                const fee = a.consultationFee || (a as any).consultationCost || 0;
                spends[petName] = (spends[petName] || 0) + fee;
              });
            const data = Object.entries(spends).map(([pet, amount]) => ({ pet, amount }));
            const config = { amount: { label: 'Spend', color: 'hsl(27, 96%, 61%)' } } as const;
            if (data.length === 0) {
              return <div className="text-sm text-muted-foreground">No spend data yet.</div>;
            }
            return (
              <ChartContainer config={config} className="w-full h-[300px]">
                <ReBarChart data={data} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pet" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="amount" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[4,4,0,0]} />
                </ReBarChart>
              </ChartContainer>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileModal = () => {
    if (!showProfile) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)}>
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              {editingProfile ? (
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full mt-1 p-2 border rounded"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profileData.name}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone</label>
              {editingProfile ? (
                <input 
                  type="text" 
                  value={profileData.phone || ''} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full mt-1 p-2 border rounded"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profileData.phone || 'Not provided'}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              {editingProfile ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingProfile(false);
                    setProfileData(user);
                  }}>Cancel</Button>
                  <Button size="sm" onClick={() => {
                    setEditingProfile(false);
                    // Here you would call an API to update the profile
                    console.log('Update profile:', profileData);
                  }}>Save</Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setEditingProfile(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <PawPrint className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Welcome back, {user.name}!</h1>
                <p className="text-sm text-muted-foreground">
                  {user.email} • Pet Parent Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(true)}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('pets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pets'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>My Pets</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Render Active Tab Content */}
        {activeTab === 'notifications' && renderNotificationsSection()}
        {activeTab === 'pets' && renderPetsSection()}
        {activeTab === 'appointments' && renderAppointmentsSection()}
        {activeTab === 'analytics' && renderAnalyticsSection()}
      </div>
      
      {/* Profile Modal */}
      {renderProfileModal()}
      
      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSubmit={handleAddPet}
        loading={addingPet}
      />
      
      {/* Edit Pet Modal */}
      <EditPetModal
        isOpen={showEditPetModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdatePet}
        onDelete={handleDeletePet}
        pet={selectedPet}
        loading={updatingPet}
      />
      
      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookAppointmentModal}
        onClose={() => setShowBookAppointmentModal(false)}
        onSubmit={handleBookAppointment}
        pets={pets}
        loading={bookingAppointment}
      />
      
      {/* Appointment Detail Modal */}
<AppointmentDetailModal
        isOpen={showAppointmentDetailModal}
        onClose={handleCloseAppointmentDetail}
        appointmentId={selectedAppointmentId || undefined}
        onCancel={handleCancelAppointment}
        onRefresh={loadDashboardData}
      />
      
      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        isOpen={showRescheduleModal}
        onClose={handleCloseReschedule}
        appointmentId={selectedAppointmentId || ''}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}
