import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PawPrint, User, Calendar, Activity, LogOut, RefreshCw, Bell, BarChart3, Clock, DollarSign, Star, AlertCircle, Edit, CheckCircle, XCircle, Stethoscope, ToggleLeft, ToggleRight } from 'lucide-react';
import { User as UserType } from '../types';
import { Badge } from './ui/badge';
import appointmentService from '../services/appointmentService';
import availabilityService, { AvailabilitySlot } from '../services/availabilityService';
import notificationService from '../services/notificationService';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './ui/chart';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as ReLineChart, Line } from 'recharts';

interface VeterinarianDashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRegisterActions?: (actions: {
    goToNotifications?: () => void;
    showProfile?: () => void;
  }) => void;
}

type TabType = 'appointments' | 'timings' | 'analytics' | 'notifications';

export function VeterinarianDashboard({ user, onNavigate, onLogout, onRegisterActions }: VeterinarianDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile and modal states
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Appointment action states
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all veterinarian data
      const [appointmentsData, availabilityData] = await Promise.all([
        appointmentService.getMyAppointments().catch(err => {
          console.warn('Failed to load appointments:', err);
          return [];
        }),
        availabilityService.getMyAvailability().catch(err => {
          console.warn('Failed to load availability:', err);
          return [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Saturday', startTime: '09:00', endTime: '13:00', enabled: false },
            { day: 'Sunday', startTime: '09:00', endTime: '13:00', enabled: false }
          ];
        })
      ]);
      
      console.log('Loaded appointments for veterinarian:', appointmentsData);
      console.log('Loaded availability for veterinarian:', availabilityData);
      
      setAppointments(appointmentsData || []);
      setAvailability(availabilityData || []);
      
      // Fetch notifications from backend API and combine with generated ones
      try {
        const combinedNotifications = await notificationService.getCombinedVeterinarianNotifications(appointmentsData || []);
        setNotifications(combinedNotifications);
      } catch (error) {
        console.warn('Failed to load backend notifications, using generated ones:', error);
        // Fallback to generated notifications
        const realNotifications = notificationService.generateVeterinarianNotifications(appointmentsData || []);
        const sortedNotifications = notificationService.sortNotifications(realNotifications);
        setNotifications(sortedNotifications);
      }
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      let errorMessage = 'Failed to load dashboard data. Please try refreshing the page.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };
  
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

  // Appointment action handlers
  const handleApproveAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowApprovalModal(true);
  };

  const handleRejectAppointment = async (appointment: any) => {
    try {
      setProcessingAction(true);
      await appointmentService.rejectAppointment(appointment._id, 'Unavailable at requested time');
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === appointment._id ? { ...apt, status: 'REJECTED' } : apt
      ));
    } catch (error) {
      console.error('Failed to reject appointment:', error);
      setError('Failed to reject appointment. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelAppointment = async (appointment: any) => {
    try {
      setProcessingAction(true);
      await appointmentService.cancelAppointment(appointment._id, 'Cancelled by veterinarian');
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === appointment._id ? { ...apt, status: 'CANCELLED' } : apt
      ));
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRescheduleAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCompleteAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCompleteModal(true);
  };

  const submitApproval = async (appointmentId: string, consultationFee: number, notes?: string) => {
    try {
      setProcessingAction(true);
await appointmentService.approveAppointment(appointmentId, {
        consultationFee,
        veterinarianNotes: notes
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, status: 'APPROVED', consultationFee } : apt
      ));
      
      setShowApprovalModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to approve appointment:', error);
      setError('Failed to approve appointment. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const submitComplete = async (completionData: {
    diagnosis: string;
    treatment: string;
    followUpRequired: boolean;
    veterinarianNotes?: string;
  }) => {
    try {
      setProcessingAction(true);
      const updatedAppointment = await appointmentService.completeAppointment(selectedAppointment._id, completionData);
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === selectedAppointment._id 
          ? { ...apt, status: 'COMPLETED', ...completionData }
          : apt
      ));
      
      setShowCompleteModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      setError('Failed to complete appointment. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Helper functions for data calculations
  const getTodayAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      return appointmentDate.toDateString() === today.toDateString();
    }).sort((a, b) => {
      const timeA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
      const timeB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
      return timeA - timeB;
    });
  };

  const getPendingAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'PENDING' || apt.status === 'pending'
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getApprovedAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'APPROVED' || apt.status === 'approved'
    );
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'COMPLETED' || apt.status === 'completed'
    );
  };

  const getMonthlyEarnings = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return (apt.status === 'COMPLETED' || apt.status === 'completed') && 
               aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear;
      })
      .reduce((total, apt) => total + (apt.consultationFee || apt.consultationCost || 0), 0);
  };

  const getAverageRating = () => {
    const ratedAppointments = appointments.filter(apt => apt.rating && apt.rating > 0);
    if (ratedAppointments.length === 0) return '0.0';
    const totalRating = ratedAppointments.reduce((sum, apt) => sum + (apt.rating || 0), 0);
    return (totalRating / ratedAppointments.length).toFixed(1);
  };
  
  const getUnreadNotifications = () => {
    return notificationService.getUnreadCount(notifications);
  };
  
  // Handler to toggle availability for a specific day
  const handleToggleAvailability = async (day: string, currentEnabled: boolean) => {
    try {
      setError(null);
      const newEnabled = !currentEnabled;
      
      // Optimistically update UI
      setAvailability(prev => prev.map(slot => 
        slot.day === day ? { ...slot, enabled: newEnabled } : slot
      ));
      
      // Update backend
      const updatedAvailability = await availabilityService.toggleTimeSlot(day, newEnabled);
      setAvailability(updatedAvailability);
      
    } catch (error: any) {
      console.error('Failed to toggle availability:', error);
      setError('Failed to update availability. Please try again.');
      
      // Revert optimistic update on error
      setAvailability(prev => prev.map(slot => 
        slot.day === day ? { ...slot, enabled: currentEnabled } : slot
      ));
    }
  };
  
  // Handler to mark notification as read
  const handleMarkNotificationAsRead = async (notificationId: string, read: boolean) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <PawPrint className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Dr. {user.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {user.email} • Veterinarian Dashboard
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
                {getUnreadNotifications() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getUnreadNotifications()}
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
            {(['appointments', 'timings', 'analytics', 'notifications'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab === 'appointments' && <Stethoscope className="h-4 w-4" />}
                  {tab === 'timings' && <Clock className="h-4 w-4" />}
                  {tab === 'analytics' && <BarChart3 className="h-4 w-4" />}
                  {tab === 'notifications' && <Bell className="h-4 w-4" />}
                  <span className="capitalize">{tab === 'timings' ? 'Available Timings' : tab}</span>
                  {tab === 'appointments' && getPendingAppointments().length > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getPendingAppointments().length}
                    </Badge>
                  )}
                  {tab === 'notifications' && getUnreadNotifications() > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getUnreadNotifications()}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
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
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Today's</p>
                      <p className="text-xl font-bold">{getTodayAppointments().length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold">{getPendingAppointments().length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-xl font-bold">{getApprovedAppointments().length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold">{getCompletedAppointments().length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* All Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5" />
                  <span>All Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No appointments found</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          appointment.status === 'PENDING' ? 'bg-orange-500/10' :
                          appointment.status === 'APPROVED' ? 'bg-green-500/10' :
                          appointment.status === 'COMPLETED' ? 'bg-blue-500/10' : 'bg-gray-500/10'
                        }`}>
                          <Stethoscope className={`h-5 w-5 ${
                            appointment.status === 'PENDING' ? 'text-orange-500' :
                            appointment.status === 'APPROVED' ? 'text-green-500' :
                            appointment.status === 'COMPLETED' ? 'text-blue-500' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.pet?.name || 'Pet'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.user?.name || 'Owner'} • {new Date(appointment.date).toLocaleDateString()} • {appointment.time || 'Time TBD'}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                          {appointment.consultationFee && (
                            <p className="text-xs text-green-600 font-medium">${appointment.consultationFee}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          appointment.status === 'COMPLETED' ? 'default' :
                          appointment.status === 'APPROVED' ? 'secondary' :
                          appointment.status === 'PENDING' ? 'outline' : 'destructive'
                        }>
                          {appointment.status?.toLowerCase()}
                        </Badge>
                        
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleApproveAppointment(appointment)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRejectAppointment(appointment)}>
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {(appointment.status === 'APPROVED' || appointment.status === 'CONFIRMED') && (
                          <>
                            <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50" onClick={() => handleCompleteAppointment(appointment)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRescheduleAppointment(appointment)}>
                              <Clock className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleCancelAppointment(appointment)}>
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'timings' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Available Time Slots</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Toggle availability for each day
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        slot.enabled ? 'bg-green-500/10' : 'bg-gray-500/10'
                      }`}>
                        <Clock className={`h-5 w-5 ${slot.enabled ? 'text-green-500' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{slot.day}</h4>
                        <p className="text-sm text-muted-foreground">
                          {availabilityService.formatTime(slot.startTime)} - {availabilityService.formatTime(slot.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={slot.enabled ? 'default' : 'secondary'}>
                        {slot.enabled ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAvailability(slot.day, slot.enabled)}
                        className={`p-2 hover:bg-muted ${
                          slot.enabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {slot.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Availability Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {availability.filter(slot => slot.enabled).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Available Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-500">
                      {availability.filter(slot => !slot.enabled).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Unavailable Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {getTodayAppointments().length}
                    </p>
                    <p className="text-sm text-muted-foreground">Today's Slots</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">
                      {getPendingAppointments().length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

{activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
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
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                      <p className="text-2xl font-bold">${getMonthlyEarnings()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold">{getAverageRating()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{getCompletedAppointments().length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointments by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                  const counts = new Array(7).fill(0);
                  appointments.forEach(a => {
                    const d = new Date(a.date);
                    counts[d.getDay()] += 1;
                  });
                  const data = days.map((label, idx) => ({ day: label, count: counts[idx] }));
                  const config = { count: { label: 'Appointments', color: 'hsl(221, 83%, 53%)' } } as const;
                  return (
                    <ChartContainer config={config} className="w-full h-[300px]">
                      <ReBarChart data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent nameKey="count" />} />
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
                <CardTitle>Top Pets by Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const map: Record<string, number> = {};
                  appointments.forEach(a => {
                    const name = (a.pet as any)?.name || 'Unknown';
                    map[name] = (map[name] || 0) + 1;
                  });
                  const data = Object.entries(map)
                    .map(([pet, visits]) => ({ pet, visits }))
                    .sort((a,b) => b.visits - a.visits)
                    .slice(0, 6);
                  const config = { visits: { label: 'Visits', color: 'hsl(27, 96%, 61%)' } } as const;
                  if (data.length === 0) return <div className="text-sm text-muted-foreground">No data yet.</div>;
                  return (
                    <ChartContainer config={config} className="w-full h-[300px]">
                      <ReBarChart data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="pet" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent nameKey="visits" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="visits" fill="var(--color-visits)" radius={[4,4,0,0]} />
                      </ReBarChart>
                    </ChartContainer>
                  );
                })()}
              </CardContent>
            </Card>
            
<Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const statuses = ['PENDING','APPROVED','CONFIRMED','COMPLETED','CANCELLED','REJECTED'] as const;
                  const chartData = statuses.map((s) => ({ status: s, count: appointments.filter(a => (a.status || '').toUpperCase() === s).length }));
                  const config = { count: { label: 'Count', color: 'hsl(221, 83%, 53%)' } } as const;
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
                <CardTitle>Earnings Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Build 6 months range
                  const now = new Date();
                  const months: { key: string; label: string }[] = [];
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
                  }
                  const earningsByMonth: Record<string, number> = {};
                  appointments.forEach((apt) => {
                    if ((apt.status || '').toUpperCase() === 'COMPLETED') {
                      const d = new Date(apt.date);
                      const key = `${d.getFullYear()}-${d.getMonth()}`;
                      earningsByMonth[key] = (earningsByMonth[key] || 0) + (apt.consultationFee || apt.consultationCost || 0);
                    }
                  });
                  const data = months.map(m => ({ month: m.label, earnings: Math.round((earningsByMonth[m.key] || 0) * 100) / 100 }));
                  const config = { earnings: { label: 'Earnings', color: 'hsl(142, 72%, 45%)' } } as const;
                  return (
                    <ChartContainer config={config} className="w-full h-[300px]">
                      <ReLineChart data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent nameKey="earnings" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="earnings" stroke="var(--color-earnings)" strokeWidth={2} dot={{ r: 3 }} />
                      </ReLineChart>
                    </ChartContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  <Badge variant="secondary">{getUnreadNotifications()} new</Badge>
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
                        onClick={() => handleMarkNotificationAsRead(notification.id, notification.read)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt || notification.time).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={
                            notification.type === 'new_appointment' ? 'default' :
                            notification.type === 'appointment' ? 'secondary' :
                            notification.type === 'reminder' ? 'outline' :
                            notification.type === 'cancellation' ? 'destructive' : 'outline'
                          }>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingProfile ? 'Edit Profile' : 'Profile Settings'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowProfile(false);
                setEditingProfile(false);
              }}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Dr. {profileData.name}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                {editingProfile ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Specialization</label>
                <p className="text-sm text-muted-foreground">General Practice</p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                {editingProfile ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setEditingProfile(false)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
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
      )}
      
      {/* Appointment Action Modals */}
      {showApprovalModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Approve Appointment</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowApprovalModal(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const fee = parseFloat(formData.get('fee') as string);
              const notes = formData.get('notes') as string;
              if (fee) {
                submitApproval(selectedAppointment._id, fee, notes);
              }
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="fee"
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="Enter fee amount"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  name="notes"
                  className="w-full mt-1 p-2 border rounded h-20"
                  placeholder="Add any notes for the appointment"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processingAction}>
                  {processingAction ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleAppointmentModal
          appointment={selectedAppointment}
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onReschedule={async (rescheduleData) => {
            try {
              setProcessingAction(true);
              const updatedAppointment = await appointmentService.rescheduleAppointment(
                selectedAppointment._id, 
                rescheduleData
              );
              
              // Update local state
              setAppointments(prev => prev.map(apt => 
                apt._id === selectedAppointment._id 
                  ? { ...apt, ...updatedAppointment, status: 'PENDING' }
                  : apt
              ));
              
setShowRescheduleModal(false);
              setSelectedAppointment(null);
              await loadDashboardData();
            } catch (error) {
              console.error('Failed to reschedule appointment:', error);
              setError('Failed to reschedule appointment. Please try again.');
            } finally {
              setProcessingAction(false);
            }
          }}
          isLoading={processingAction}
        />
      )}

      {/* Complete Appointment Modal */}
      <CompleteAppointmentModal
        appointment={selectedAppointment}
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedAppointment(null);
        }}
        onComplete={submitComplete}
        isLoading={processingAction}
      />
    </div>
  );
}
