import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { PawBackground, PawPrint } from './PawPrint';
import { 
  Bell, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  User,
  Edit,
  Star,
  Hospital,
  Activity
} from 'lucide-react';

interface VeteranDashboardProps {
  onNavigate: (page: string) => void;
}

interface Appointment {
  id: string;
  petName: string;
  petType: string;
  ownerName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rescheduled';
  consultationCost: number;
  reason: string;
  comments?: string;
  rating?: number;
}

interface Notification {
  id: string;
  type: 'new_appointment' | 'cancellation' | 'reschedule';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Availability {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  hospital: string;
}

export function VeteranDashboard({ onNavigate }: VeteranDashboardProps) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [consultationMin, setConsultationMin] = useState(75);
  const [consultationMax, setConsultationMax] = useState(150);

  // Mock data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      petName: 'Max',
      petType: 'Golden Retriever',
      ownerName: 'Sarah Johnson',
      date: '2024-12-15',
      time: '10:00 AM',
      status: 'Pending',
      consultationCost: 75,
      reason: 'Regular checkup and vaccination',
      comments: ''
    },
    {
      id: '2',
      petName: 'Luna',
      petType: 'Persian Cat',
      ownerName: 'Mike Chen',
      date: '2024-12-16',
      time: '2:30 PM',
      status: 'Approved',
      consultationCost: 90,
      reason: 'Dental examination',
      comments: 'Follow-up needed'
    },
    {
      id: '3',
      petName: 'Charlie',
      petType: 'Beagle',
      ownerName: 'Emily Davis',
      date: '2024-11-28',
      time: '9:00 AM',
      status: 'Completed',
      consultationCost: 65,
      reason: 'Hip examination',
      comments: 'All clear, schedule 6-month follow-up',
      rating: 5
    },
    {
      id: '4',
      petName: 'Buddy',
      petType: 'Labrador',
      ownerName: 'John Wilson',
      date: '2024-12-18',
      time: '11:30 AM',
      status: 'Rescheduled',
      consultationCost: 80,
      reason: 'Emergency consultation',
      comments: 'Owner requested time change'
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_appointment',
      title: 'New Appointment Request',
      message: 'Sarah Johnson has requested an appointment for Max on Dec 15',
      time: '30 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'reschedule',
      title: 'Appointment Rescheduled',
      message: 'John Wilson has requested to reschedule Buddy\'s appointment',
      time: '2 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'cancellation',
      title: 'Appointment Cancelled',
      message: 'Lisa Brown has cancelled the appointment for Whiskers',
      time: '1 day ago',
      read: true
    }
  ]);

  const [availability, setAvailability] = useState<Availability[]>([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', hospital: 'Main Clinic' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00', hospital: 'Main Clinic' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '15:00', hospital: 'East Branch' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00', hospital: 'Main Clinic' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00', hospital: 'Main Clinic' },
    { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '13:00', hospital: 'Main Clinic' },
    { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '13:00', hospital: 'Emergency Only' }
  ]);

  const approveAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'Approved' as const } : apt
    ));
  };

  const completeAppointment = (appointmentId: string, comments: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'Completed' as const, comments } : apt
    ));
  };

  const updateAvailability = (day: string, field: keyof Availability, value: any) => {
    setAvailability(availability.map(avail =>
      avail.day === day ? { ...avail, [field]: value } : avail
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const filteredAppointments = appointments
    .filter(apt => filterStatus === 'all' || apt.status.toLowerCase() === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'cost') return b.consultationCost - a.consultationCost;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Analytics calculations
  const completedAppointments = appointments.filter(a => a.status === 'Completed');
  const totalEarnings = completedAppointments.reduce((sum, a) => sum + a.consultationCost, 0);
  const averageRating = completedAppointments.filter(a => a.rating).reduce((sum, a) => sum + (a.rating || 0), 0) / completedAppointments.filter(a => a.rating).length || 0;

  return (
    <PawBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Veterinarian Dashboard 🩺</h1>
          <p className="text-muted-foreground">Manage your appointments and professional practice</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="notifications" className="relative">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs bg-accent">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Hospital className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Professional Notifications
                </CardTitle>
                <CardDescription>Stay updated with appointment requests and changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.read ? 'bg-muted/50' : 'bg-card shadow-sm'
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Manage your availability and hospital assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availability.map((avail) => (
                    <div key={avail.day} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={avail.enabled}
                          onCheckedChange={(checked) => updateAvailability(avail.day, 'enabled', checked)}
                        />
                        <div>
                          <p className="font-medium">{avail.day}</p>
                          <p className="text-xs text-muted-foreground">{avail.hospital}</p>
                        </div>
                      </div>
                      {avail.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <Input
                            type="time"
                            value={avail.startTime}
                            onChange={(e) => updateAvailability(avail.day, 'startTime', e.target.value)}
                            className="w-20 h-8"
                          />
                          <span>-</span>
                          <Input
                            type="time"
                            value={avail.endTime}
                            onChange={(e) => updateAvailability(avail.day, 'endTime', e.target.value)}
                            className="w-20 h-8"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consultation Rates</CardTitle>
                  <CardDescription>Set your consultation cost range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Minimum Consultation Cost ($)</Label>
                      <Input
                        type="number"
                        value={consultationMin}
                        onChange={(e) => setConsultationMin(Number(e.target.value))}
                        min="0"
                        step="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Consultation Cost ($)</Label>
                      <Input
                        type="number"
                        value={consultationMax}
                        onChange={(e) => setConsultationMax(Number(e.target.value))}
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Current Range</span>
                      <span className="text-lg font-bold text-primary">
                        ${consultationMin} - ${consultationMax}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This range will be displayed to pet parents when booking appointments
                    </p>
                  </div>

                  <Button className="w-full">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Update Rates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Appointment Management</h2>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="cost">Sort by Cost</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet & Owner</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.petName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.petType} • {appointment.ownerName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{appointment.time}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48">
                        <p className="text-sm truncate">{appointment.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${appointment.consultationCost}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {appointment.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveAppointment(appointment.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                          {appointment.status === 'Approved' && (
                            <Button
                              size="sm"
                              onClick={() => completeAppointment(appointment.id, 'Consultation completed successfully')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          {appointment.status === 'Completed' && appointment.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < appointment.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {((completedAppointments.length / appointments.length) * 100).toFixed(0)}% success rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">${totalEarnings}</div>
                  <p className="text-xs text-muted-foreground">From completed visits</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {averageRating > 0 && [...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <PawPrint className="text-primary" size="sm" opacity={1} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.petName} ({appointment.petType})</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.ownerName} • {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(appointment.status)} variant="outline">
                          {appointment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">${appointment.consultationCost}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availability.filter(a => a.enabled).map((avail) => (
                    <div key={avail.day} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Activity className="text-secondary" size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{avail.day}</p>
                        <p className="text-xs text-muted-foreground">
                          {avail.startTime} - {avail.endTime} • {avail.hospital}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        Available
                      </div>
                    </div>
                  ))}
                  {availability.filter(a => !a.enabled).length > 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      {availability.filter(a => !a.enabled).length} day(s) unavailable
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PawBackground>
  );
}