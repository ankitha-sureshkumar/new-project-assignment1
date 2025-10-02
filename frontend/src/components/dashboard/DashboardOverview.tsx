import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import petService from '../../services/petService';
import appointmentService from '../../services/appointmentService';

interface DashboardStats {
  totalPets: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalSpent: number;
  upcomingAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'pet' | 'payment';
  title: string;
  description: string;
  date: string;
  status?: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalSpent: 0,
    upcomingAppointments: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch pets and appointments data
      const [pets, appointments] = await Promise.all([
        petService.getUserPets().catch(() => []),
        appointmentService.getMyAppointments().catch(() => [])
      ]);

      // Calculate stats
      const completedAppts = appointments.filter(a => a.status === 'completed');
      const pendingAppts = appointments.filter(a => a.status === 'pending');
      const upcomingAppts = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        const now = new Date();
        return appointmentDate > now && (a.status === 'confirmed' || a.status === 'approved');
      });

      const totalSpent = completedAppts.reduce((sum, a) => sum + (a.consultationCost || 0), 0);

      setStats({
        totalPets: pets.length,
        totalAppointments: appointments.length,
        completedAppointments: completedAppts.length,
        pendingAppointments: pendingAppts.length,
        totalSpent,
        upcomingAppointments: upcomingAppts.length
      });

      // Generate recent activity
      const activity: RecentActivity[] = [];
      
      // Add recent appointments
      appointments.slice(0, 3).forEach(appointment => {
        activity.push({
          id: `appointment-${appointment._id}`,
          type: 'appointment',
          title: `Appointment with ${appointment.veterinarian.name}`,
          description: `${appointment.pet.name} - ${appointment.reason}`,
          date: new Date(appointment.date).toLocaleDateString(),
          status: appointment.status
        });
      });

      // Add recently added pets
      pets.slice(0, 2).forEach(pet => {
        activity.push({
          id: `pet-${pet._id}`,
          type: 'pet',
          title: `Added ${pet.name}`,
          description: `${pet.breed} - ${pet.type}`,
          date: new Date(pet.createdAt).toLocaleDateString()
        });
      });

      // Sort by most recent and limit to 5
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'My Pets',
      value: stats.totalPets,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      description: 'Registered pets'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time appointments'
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Successful visits'
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Healthcare expenses'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'pet': return Heart;
      case 'payment': return DollarSign;
      default: return Activity;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': 
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': 
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 🐾</h1>
        <p className="text-blue-100 mb-4">
          Here's what's happening with your pets today.
        </p>
        {stats.upcomingAppointments > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                You have {stats.upcomingAppointments} upcoming appointment{stats.upcomingAppointments !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your pets and appointments quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Heart className="w-4 h-4 mr-3" />
              Add New Pet
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-3" />
              Book Appointment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="w-4 h-4 mr-3" />
              View Health Records
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest pet care activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          {activity.status && (
                            <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start by adding a pet or booking an appointment!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts/Reminders */}
      {stats.pendingAppointments > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Action Required
                </p>
                <p className="text-sm text-yellow-700">
                  You have {stats.pendingAppointments} appointment{stats.pendingAppointments !== 1 ? 's' : ''} pending approval from veterinarian{stats.pendingAppointments !== 1 ? 's' : ''}.
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                View Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}