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
import { PawBackground, PawPrint } from './PawPrint';
import { 
  Bell, 
  Plus, 
  Copy, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Heart, 
  Clock, 
  DollarSign,
  User,
  Trash2,
  Edit,
  Star,
  ChevronDown
} from 'lucide-react';

interface UserDashboardProps {
  onNavigate: (page: string) => void;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  medicalHistory: string;
  vaccinations: string;
  lastVisit?: string;
}

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  veterinarian: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rescheduled';
  cost: number;
  comments?: string;
  rating?: number;
}

interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'feedback';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedVet, setSelectedVet] = useState<string>('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: '3 years',
      medicalHistory: 'Hip dysplasia screening, regular checkups',
      vaccinations: 'Up to date - Rabies, DHPP',
      lastVisit: '2024-11-15'
    },
    {
      id: '2',
      name: 'Luna',
      type: 'Cat',
      breed: 'Persian',
      age: '2 years',
      medicalHistory: 'Spayed, dental cleaning',
      vaccinations: 'Due - FVRCP booster',
      lastVisit: '2024-10-22'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      petId: '1',
      petName: 'Max',
      veterinarian: 'Dr. Smith',
      date: '2024-12-15',
      time: '10:00 AM',
      status: 'Approved',
      cost: 75,
      comments: 'Regular checkup and vaccination'
    },
    {
      id: '2',
      petId: '2',
      petName: 'Luna',
      date: '2024-12-20',
      time: '2:30 PM',
      veterinarian: 'Dr. Johnson',
      status: 'Pending',
      cost: 90,
      comments: 'Dental examination'
    },
    {
      id: '3',
      petId: '1',
      petName: 'Max',
      date: '2024-11-15',
      time: '9:00 AM',
      veterinarian: 'Dr. Smith',
      status: 'Completed',
      cost: 65,
      rating: 5,
      comments: 'Hip examination - all good!'
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your appointment for Max on Dec 15 has been confirmed by Dr. Smith',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',  
      type: 'reminder',
      title: 'Vaccination Due',
      message: 'Luna\'s FVRCP booster vaccination is due next week',
      time: '1 day ago',
      read: false
    },
    {
      id: '3',
      type: 'feedback',
      title: 'Rate Your Visit',
      message: 'How was Max\'s visit with Dr. Smith? Please leave a review',
      time: '3 days ago',
      read: true
    }
  ]);

  const veterans = [
    { id: '1', name: 'Dr. Smith', specialization: 'General Practice', cost: { min: 50, max: 80 }, rating: 4.9 },
    { id: '2', name: 'Dr. Johnson', specialization: 'Dental Care', cost: { min: 70, max: 120 }, rating: 4.8 },
    { id: '3', name: 'Dr. Williams', specialization: 'Surgery', cost: { min: 100, max: 200 }, rating: 4.9 },
  ];

  const clonePet = (petId: string) => {
    const petToClone = pets.find(p => p.id === petId);
    if (petToClone) {
      const newPet: Pet = {
        ...petToClone,
        id: Date.now().toString(),
        name: `${petToClone.name} (Copy)`,
      };
      setPets([...pets, newPet]);
    }
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
      if (sortBy === 'cost') return b.cost - a.cost;
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

  return (
    <PawBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Pet Parent! 🐾</h1>
          <p className="text-muted-foreground">Manage your pets' healthcare and appointments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="notifications" className="relative">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs bg-accent">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pets">
              <Heart className="w-4 h-4 mr-2" />
              My Pets
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Clock className="w-4 h-4 mr-2" />
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
                  Recent Notifications
                </CardTitle>
                <CardDescription>Stay updated with your pet's healthcare</CardDescription>
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
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Pets Tab */}
          <TabsContent value="pets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Pets</h2>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Pet
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="relative group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <PawPrint className="text-primary" size="sm" opacity={1} />
                        {pet.name}
                      </CardTitle>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" onClick={() => clonePet(pet.id)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{pet.breed} • {pet.age}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Medical History</Label>
                      <p className="text-sm">{pet.medicalHistory}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vaccinations</Label>
                      <p className="text-sm">{pet.vaccinations}</p>
                    </div>
                    {pet.lastVisit && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Visit</Label>
                        <p className="text-sm">{new Date(pet.lastVisit).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Appointment Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Appointment</CardTitle>
                <CardDescription>Book a consultation for your pet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Pet</Label>
                    <Select value={selectedPet} onValueChange={setSelectedPet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name} ({pet.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Veterinarian</Label>
                    <Select value={selectedVet} onValueChange={setSelectedVet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose veterinarian" />
                      </SelectTrigger>
                      <SelectContent>
                        {veterans.map((vet) => (
                          <SelectItem key={vet.id} value={vet.id}>
                            {vet.name} - {vet.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dynamic Cost Display */}
                {selectedVet && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      {(() => {
                        const vet = veterans.find(v => v.id === selectedVet);
                        return vet ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{vet.name}</h4>
                              <p className="text-sm text-muted-foreground">{vet.specialization}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(vet.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">{vet.rating}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                ${vet.cost.min} - ${vet.cost.max}
                              </p>
                              <p className="text-xs text-muted-foreground">Consultation cost</p>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Textarea placeholder="Describe the reason for this appointment" />
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">
                  Book Appointment
                  <Calendar className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">My Appointments</h2>
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
                    <TableHead>Pet</TableHead>
                    <TableHead>Veterinarian</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.petName}</TableCell>
                      <TableCell>{appointment.veterinarian}</TableCell>
                      <TableCell>
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${appointment.cost}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {appointment.status === 'Completed' && !appointment.rating && (
                            <Button size="sm" variant="outline">
                              <Star className="w-3 h-3 mr-1" />
                              Rate
                            </Button>
                          )}
                          {appointment.status === 'Pending' && (
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
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
                  <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{pets.length}</div>
                  <p className="text-xs text-muted-foreground">Active profiles</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'Completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Successful visits</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    ${appointments.reduce((sum, a) => sum + (a.status === 'Completed' ? a.cost : 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Healthcare costs</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <PawPrint className="text-primary" size="sm" opacity={1} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.petName} visit</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.veterinarian} • {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)} variant="outline">
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pet Health Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pets.map((pet) => {
                    const petAppointments = appointments.filter(a => a.petId === pet.id);
                    const lastVisit = petAppointments
                      .filter(a => a.status === 'Completed')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    
                    return (
                      <div key={pet.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Heart className="text-accent" size="sm" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{pet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {pet.breed} • {petAppointments.length} visits
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {lastVisit ? `Last: ${new Date(lastVisit.date).toLocaleDateString()}` : 'No visits yet'}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PawBackground>
  );
}