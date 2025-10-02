import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Calendar, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import appointmentService from '../services/appointmentService';
import veterinarianService from '../services/veterinarianService';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Either pass appointmentId (+ onSuccess) for user flow, or pass appointment (+ onReschedule) for vet flow
  appointmentId?: string;
  appointment?: AppointmentData;
  onSuccess?: () => void;
  onReschedule?: (data: { date: string; timeSlot: { startTime: string; endTime: string }; reason?: string }) => Promise<void> | void;
  isLoading?: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface AppointmentData {
  _id: string;
  pet: { name: string };
  veterinarian: { _id: string; name: string };
  date: string;
  time: string;
  status: string;
}

export function RescheduleAppointmentModal({ isOpen, onClose, appointmentId, appointment: initialAppointment, onSuccess, onReschedule, isLoading }: RescheduleAppointmentModalProps) {
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

useEffect(() => {
    if (isOpen) {
      // seed appointment if provided (vet flow) or fetch by id (user flow)
      if (initialAppointment) {
        setAppointment(initialAppointment);
      } else if (appointmentId) {
        loadAppointmentData();
      }
      setNewDate('');
      setNewTimeSlot(null);
      setAvailableSlots([]);
      setReason('');
      setError(null);
    }
  }, [isOpen, appointmentId, initialAppointment]);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      const appointmentData = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(appointmentData as AppointmentData);
    } catch (error: any) {
      setError(error.message || 'Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointment && newDate) {
      loadAvailableSlots();
    }
  }, [appointment, newDate]);

  const loadAvailableSlots = async () => {
    if (!appointment || !newDate) return;

    try {
      setSlotsLoading(true);
      const slots = await appointmentService.getAvailableSlots(appointment.veterinarian._id, newDate);
      setAvailableSlots(slots.filter(slot => slot.available));
    } catch (error: any) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

const handleReschedule = async () => {
    if (!appointment || !newDate || !newTimeSlot) {
      setError('Please select a date and time slot');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        date: newDate,
        timeSlot: newTimeSlot,
        reason: reason.trim() || 'Patient requested reschedule'
      };

      if (onReschedule) {
        await onReschedule(payload);
      } else if (appointmentId) {
        await appointmentService.rescheduleAppointment(appointmentId, payload);
      } else if (appointment?._id) {
        await appointmentService.rescheduleAppointment(appointment._id, payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6">
        <Card className="w-full rounded-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Calendar className="h-5 w-5" />
              <span>Reschedule Appointment</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {loading && !appointment && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading appointment...</span>
              </div>
            )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {appointment && (
            <div className="space-y-6">
              {/* Current Appointment Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Current Appointment</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Pet:</strong> {appointment.pet.name}</p>
                    <p><strong>Veterinarian:</strong> Dr. {appointment.veterinarian.name}</p>
                    <p><strong>Current Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                    <p><strong>Current Time:</strong> {formatTime(appointment.time)}</p>
                    <Badge className="mt-2" variant="outline">{appointment.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Select New Date */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Select New Date</label>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Select New Time */}
              {newDate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Select New Time</label>
                    {slotsLoading && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Loading slots...
                      </div>
                    )}
                  </div>
                  
{availableSlots.length === 0 && !slotsLoading ? (
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                      No available time slots for this date. Please select a different date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setNewTimeSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                          className={`p-3 text-sm border rounded-lg transition-colors ${
                            newTimeSlot?.startTime === slot.startTime
                              ? 'border-primary bg-primary text-white'
                              : 'hover:bg-muted border-gray-300'
                          }`}
                          disabled={loading}
                          type="button"
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reason for Reschedule */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Reason for Reschedule <span className="text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for rescheduling..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
<Button
                  onClick={handleReschedule}
                  disabled={loading || isLoading || !newDate || !newTimeSlot}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rescheduling...
                    </>
                  ) : (
                    'Reschedule Appointment'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}