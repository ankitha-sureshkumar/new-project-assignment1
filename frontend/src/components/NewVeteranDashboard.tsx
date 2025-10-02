import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Stethoscope, Calendar, DollarSign, Star, LogOut, CheckCircle, Clock, RefreshCw, AlertCircle, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { User as UserType } from '../types';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import appointmentService from '../services/appointmentService';

interface NewVeteranDashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewVeteranDashboard({ user, onNavigate, onLogout }: NewVeteranDashboardProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<any[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<any>(null);
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
      
      // Load appointments, stats, and today's schedule in parallel
      const [appointmentsData, statsData, scheduleData] = await Promise.allSettled([
        appointmentService.getMyAppointments(),
        appointmentService.getAppointmentStats(),
        appointmentService.getTodaysSchedule()
      ]);

      // Handle appointments data
      if (appointmentsData.status === 'fulfilled') {
        setAppointments(appointmentsData.value || []);
      } else {
        console.warn('Failed to load appointments:', appointmentsData.reason);
        setAppointments([]);
      }

      // Handle stats data
      if (statsData.status === 'fulfilled') {
        setAppointmentStats(statsData.value);
      } else {
        console.warn('Failed to load stats:', statsData.reason);
        setAppointmentStats(null);
      }

      // Handle schedule data
      if (scheduleData.status === 'fulfilled') {
        setTodaysSchedule(scheduleData.value || []);
      } else {
        console.warn('Failed to load schedule:', scheduleData.reason);
        setTodaysSchedule([]);
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
      setNotification({ type: 'success', message: `Appointment ${action}d successfully!` });
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading veterinarian dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Veterinarian Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, Dr. {user.name.split(' ').pop()}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={onLogout} className="text-green-600 border-green-200 hover:bg-green-50">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysSchedule.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${appointmentStats?.totalEarnings.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">All-time revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats?.completedAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">Total completed visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats?.averageRating.toFixed(1) || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Based on user feedback</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysSchedule.length > 0 ? (
                  <ul className="space-y-4">
                    {todaysSchedule.map((apt) => {
                      const appointmentDate = new Date(apt.date || new Date());
                      return (
                        <li key={apt._id || Math.random()} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 text-center border-r pr-4">
                              <p className="text-sm font-bold">
                                {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </p>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {apt.pet?.name || 'Pet'} ({apt.pet?.breed || 'Unknown breed'})
                            </p>
                            <p className="text-sm text-gray-600">Owner: {apt.user?.name || 'Unknown owner'}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-10">No appointments scheduled for today.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All Appointments Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Details</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner & Reason</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((apt) => {
                          const status = apt.status?.toLowerCase() || 'pending';
                          const isPending = status === 'pending';
                          const isConfirmed = status === 'confirmed';
                          const isCompleted = status === 'completed';
                          const appointmentDate = new Date(apt.date || new Date());
                          
                          return (
                            <tr key={apt._id || Math.random()} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {appointmentDate.toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {apt.pet?.name || 'Pet'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {apt.pet?.breed || ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {apt.user?.name || 'User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {apt.reason || 'No reason provided'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col items-start space-y-2">
                                  <Badge variant={isCompleted ? 'default' : isPending ? 'outline' : 'secondary'}>
                                    {apt.status || 'Pending'}
                                  </Badge>
                                  <div className="flex space-x-1">
                                    {isPending && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAppointmentAction(apt._id, 'approve', 
                                            () => appointmentService.approveAppointment(apt._id, { consultationCost: 50 })
                                          )}
                                          disabled={actionLoading === `approve-${apt._id}`}
                                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                                        >
                                          {actionLoading === `approve-${apt._id}` ? (
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <ThumbsUp className="w-3 h-3" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleAppointmentAction(apt._id, 'reject',
                                            () => appointmentService.rejectAppointment(apt._id, 'Schedule conflict')
                                          )}
                                          disabled={actionLoading === `reject-${apt._id}`}
                                          className="border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
                                        >
                                          {actionLoading === `reject-${apt._id}` ? (
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <ThumbsDown className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </>
                                    )}
                                    {isConfirmed && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAppointmentAction(apt._id, 'complete',
                                          () => appointmentService.completeAppointment(apt._id, { veterinarianNotes: 'Consultation completed' })
                                        )}
                                        disabled={actionLoading === `complete-${apt._id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                                      >
                                        {actionLoading === `complete-${apt._id}` ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <CheckCircle className="w-3 h-3" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-10">No appointments found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
