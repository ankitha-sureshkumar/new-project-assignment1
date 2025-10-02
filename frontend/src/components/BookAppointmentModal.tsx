import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Calendar, Clock, User, Heart, Stethoscope } from 'lucide-react';
import { Badge } from './ui/badge';
import veterinarianService, { Veterinarian } from '../services/veterinarianService';
import appointmentService from '../services/appointmentService';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: BookAppointmentFormData) => Promise<void>;
  pets: any[];
  loading?: boolean;
}

export interface BookAppointmentFormData {
  petId: string;
  veterinarianId: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  reason: string;
  userNotes?: string;
}


interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export function BookAppointmentModal({ isOpen, onClose, onSubmit, pets, loading }: BookAppointmentModalProps) {
  const [formData, setFormData] = useState<BookAppointmentFormData>({
    petId: '',
    veterinarianId: '',
    date: '',
    timeSlot: { startTime: '', endTime: '' },
    reason: '',
    userNotes: ''
  });
  const [step, setStep] = useState(1); // Multi-step form
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingVets, setLoadingVets] = useState(false);

  // Load real veterinarians from database
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        petId: '',
        veterinarianId: '',
        date: '',
        timeSlot: { startTime: '', endTime: '' },
        reason: '',
        userNotes: ''
      });
      setStep(1);
      
      // Load real veterinarians from database
      loadVeterinarians();
    }
  }, [isOpen]);

  const loadVeterinarians = async () => {
    try {
      setLoadingVets(true);
      const vets = await veterinarianService.getAvailableVeterinarians();
      setVeterinarians(vets);
    } catch (error) {
      console.error('Failed to load veterinarians:', error);
      // If API fails, try to get all veterinarians
      try {
        const allVets = await veterinarianService.getAllVeterinarians();
        setVeterinarians(allVets.filter(vet => veterinarianService.isAvailable(vet)));
      } catch (fallbackError) {
        console.error('Failed to load any veterinarians:', fallbackError);
        setVeterinarians([]);
      }
    } finally {
      setLoadingVets(false);
    }
  };

  // Load available time slots when vet and date are selected
  useEffect(() => {
    if (formData.veterinarianId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.veterinarianId, formData.date]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      // Use real appointmentService to get available slots
      const slots = await appointmentService.getAvailableSlots(formData.veterinarianId, formData.date);
      
      // Convert the API response to our TimeSlot format
      const timeSlots: TimeSlot[] = slots.map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available !== false
      }));
      
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      // Fallback to some default slots if API fails
      setAvailableSlots([
        { startTime: '09:00', endTime: '09:30', available: true },
        { startTime: '10:00', endTime: '10:30', available: true },
        { startTime: '11:00', endTime: '11:30', available: true },
        { startTime: '14:00', endTime: '14:30', available: true },
        { startTime: '15:00', endTime: '15:30', available: true },
        { startTime: '16:00', endTime: '16:30', available: true }
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId || !formData.veterinarianId || !formData.date || 
        !formData.timeSlot.startTime || !formData.reason) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedToNext = () => {
    switch (step) {
      case 1: return formData.petId !== '';
      case 2: return formData.veterinarianId !== '';
      case 3: return formData.date !== '' && formData.timeSlot.startTime !== '';
      case 4: return formData.reason.trim() !== '';
      default: return false;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book Appointment</span>
            <Badge variant="outline">Step {step} of 4</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Pet */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Select Your Pet
                  </h3>
                  {pets.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No pets registered yet</p>
                      <p className="text-sm text-muted-foreground">Please add a pet first before booking an appointment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pets.map((pet) => (
                        <div
                          key={pet._id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            formData.petId === pet._id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, petId: pet._id }))}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Heart className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{pet.name}</h4>
                              <p className="text-sm text-muted-foreground">{pet.breed} • {pet.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select Veterinarian */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Choose Veterinarian
                </h3>
                
                {loadingVets ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm">Loading veterinarians...</span>
                  </div>
                ) : veterinarians.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No veterinarians available</p>
                    <p className="text-sm text-muted-foreground">Please try again later or contact support.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {veterinarians.map((vet) => (
                      <div
                        key={vet._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          formData.veterinarianId === vet._id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, veterinarianId: vet._id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                              <Stethoscope className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">{veterinarianService.formatName(vet)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {veterinarianService.getSpecializationDisplay(vet.specialization)}
                              </p>
                              <p className="text-xs text-muted-foreground">License: {vet.licenseNumber}</p>
                              {vet.experience && (
                                <p className="text-xs text-blue-600">
                                  {veterinarianService.getExperienceDisplay(vet)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={veterinarianService.isAvailable(vet) ? 'default' : 'secondary'}>
                              {veterinarianService.isAvailable(vet) ? 'Available' : 'Busy'}
                            </Badge>
                            {vet.rating && vet.rating > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ⭐ {vet.rating.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Date and Time */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Choose Date & Time
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    min={getTomorrowDate()}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, timeSlot: { startTime: '', endTime: '' } }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {formData.date && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm">Loading slots...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            type="button"
                            disabled={!slot.available}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              !slot.available 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : formData.timeSlot.startTime === slot.startTime
                                  ? 'border-primary bg-primary text-white'
                                  : 'hover:bg-muted border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              timeSlot: { startTime: slot.startTime, endTime: slot.endTime } 
                            }))}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Reason and Notes */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Visit *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Routine checkup">Routine Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Illness">Illness/Not feeling well</option>
                    <option value="Injury">Injury</option>
                    <option value="Follow-up">Follow-up Visit</option>
                    <option value="Dental care">Dental Care</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={formData.userNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, userNotes: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent h-20"
                    placeholder="Any additional information about your pet's condition or special requirements..."
                  />
                </div>

                {/* Booking Summary */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pet:</span>
                      <span>{pets.find(p => p._id === formData.petId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Veterinarian:</span>
                      <span>{veterinarians.find(v => v._id === formData.veterinarianId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{formatTime(formData.timeSlot.startTime)} - {formatTime(formData.timeSlot.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reason:</span>
                      <span>{formData.reason}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              <div className="space-x-2">
                {step < 4 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    disabled={!canProceedToNext() || (pets.length === 0 && step === 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading || !canProceedToNext()}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}