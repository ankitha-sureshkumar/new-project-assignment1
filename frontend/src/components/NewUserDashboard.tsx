import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PawPrint, User, Calendar, Activity, LogOut, PlusCircle, RefreshCw, AlertCircle, CheckCircle, Clock, X, Star } from 'lucide-react';
import { User as UserType } from '../types';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import petService from '../services/petService';
import appointmentService from '../services/appointmentService';

interface NewUserDashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewUserDashboard({ user, onNavigate, onLogout }: NewUserDashboardProps) {
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load pets and appointments in parallel
      const [petsData, appointmentsData] = await Promise.allSettled([
        petService.getUserPets(),
        appointmentService.getMyAppointments()
      ]);

      // Handle pets data
      if (petsData.status === 'fulfilled') {
        setPets(petsData.value || []);
      } else {
        console.warn('Failed to load pets:', petsData.reason);
        setPets([]);
      }

      // Handle appointments data
      if (appointmentsData.status === 'fulfilled') {
        setAppointments(appointmentsData.value || []);
      } else {
        console.warn('Failed to load appointments:', appointmentsData.reason);
        setAppointments([]);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setNotification({ type: 'error', message: 'Failed to load dashboard data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment actions
  const handleAppointmentAction = async (appointmentId: string, action: string, actionFunction: () => Promise<any>) => {
    try {
      setActionLoading(`${action}-${appointmentId}`);
      await actionFunction();
      setNotification({ type: 'success', message: `Appointment ${action}ed successfully!` });
      // Reload data after action
      loadDashboardData();
    } catch (error: any) {
      console.error(`Failed to ${action} appointment:`, error);
      setNotification({ type: 'error', message: error.response?.data?.message || `Failed to ${action} appointment` });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadDashboardData();
    setNotification({ type: 'success', message: 'Dashboard refreshed!' });
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter appointments safely
  const upcomingAppointments = appointments.filter((apt) => {
    if (!apt || !apt.date || !apt.status) return false;
    try {
      const appointmentDate = new Date(apt.date);
      const now = new Date();
      const status = apt.status.toLowerCase();
      return appointmentDate >= now && ['confirmed', 'approved', 'pending'].includes(status);
    } catch {
      return false;
    }
  });

  const pastAppointments = appointments.filter((apt) => {
    if (!apt || !apt.date || !apt.status) return false;
    try {
      const appointmentDate = new Date(apt.date);
      const now = new Date();
      const status = apt.status.toLowerCase();
      return appointmentDate < now || ['completed', 'cancelled', 'rejected'].includes(status);
    } catch {
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={onLogout} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div className="mb-6">
            <Alert className={`${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={`${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {notification.message}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setNotification(null)}
                  className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Pets</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pets.length}</div>
              <p className="text-xs text-muted-foreground">Total registered pets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Confirmed visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointment History</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Completed or past visits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Pets Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Pets</CardTitle>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <ul className="space-y-4">
                    {pets.map((pet) => (
                      <li key={pet._id} className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <PawPrint className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{pet.name}</p>
                          <p className="text-sm text-gray-600">{pet.breed}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500">No pets found.</p>
                )}
                <Button className="w-full mt-4" onClick={() => onNavigate('add-pet')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add a New Pet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Upcoming</h3>
                {upcomingAppointments.length > 0 ? (
                  <ul className="space-y-3 mb-6">
                    {upcomingAppointments.map((apt) => {
                      const appointmentDate = new Date(apt.date || new Date());
                      
                      return (
                        <li key={apt._id || Math.random()} className="p-4 rounded-lg border bg-white">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">
                                {apt.pet?.name || 'Pet'} with Dr. {apt.veterinarian?.name || 'Veterinarian'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </p>
                              <p className="text-sm text-gray-500">{apt.reason || 'No reason provided'}</p>
                              {apt.consultationCost && (
                                <p className="text-sm font-medium text-green-600">Fee: ${apt.consultationCost}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge>
                                {apt.status || 'Pending'}
                              </Badge>
                              <div className="flex space-x-2">
                                {apt.status?.toLowerCase() === 'approved' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAppointmentAction(apt._id, 'confirm', 
                                      () => appointmentService.confirmAppointment(apt._id)
                                    )}
                                    disabled={actionLoading === `confirm-${apt._id}`}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {actionLoading === `confirm-${apt._id}` ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Confirm
                                  </Button>
                                )}
                                {['pending', 'approved'].includes(apt.status?.toLowerCase() || '') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAppointmentAction(apt._id, 'cancel',
                                      () => appointmentService.cancelAppointment(apt._id, 'User cancelled')
                                    )}
                                    disabled={actionLoading === `cancel-${apt._id}`}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    {actionLoading === `cancel-${apt._id}` ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <X className="w-3 h-3 mr-1" />
                                    )}
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No upcoming appointments.</p>
                    <Button onClick={() => onNavigate('book-appointment')} className="bg-blue-600 hover:bg-blue-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Book Your First Appointment
                    </Button>
                  </div>
                )}

                <h3 className="font-semibold mb-2">History</h3>
                {pastAppointments.length > 0 ? (
                  <ul className="space-y-3">
                    {pastAppointments.map((apt) => {
                      const appointmentDate = new Date(apt.date || new Date());
                      const isCompleted = apt.status?.toLowerCase() === 'completed';
                      const hasRating = apt.rating && apt.rating > 0;
                      
                      return (
                        <li key={apt._id || Math.random()} className="p-4 rounded-lg border bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {apt.pet?.name || 'Pet'} with Dr. {apt.veterinarian?.name || 'Veterinarian'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </p>
                              <p className="text-sm text-gray-500">{apt.reason || 'No reason provided'}</p>
                              {apt.veterinarianNotes && (
                                <p className="text-sm text-blue-600 mt-1">Notes: {apt.veterinarianNotes}</p>
                              )}
                              {hasRating && (
                                <div className="flex items-center mt-2">
                                  <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={`text-sm ${i < (apt.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                      ★
                                    </span>
                                  ))}
                                  {apt.review && (
                                    <span className="text-sm text-gray-600 ml-2">• {apt.review}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                                {apt.status || 'Unknown'}
                              </Badge>
                              {isCompleted && !hasRating && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAppointmentAction(apt._id, 'rate',
                                    () => appointmentService.rateAppointment(apt._id, { stars: 5, comment: 'Great service!' })
                                  )}
                                  disabled={actionLoading === `rate-${apt._id}`}
                                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                >
                                  {actionLoading === `rate-${apt._id}` ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <><Star className="w-3 h-3 mr-1" />Rate</>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No appointment history yet.</p>
                  </div>
                )}
                 <Button className="w-full mt-4" onClick={() => onNavigate('book-appointment')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
