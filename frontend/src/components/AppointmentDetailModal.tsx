import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Calendar, Clock, User, Heart, Stethoscope, FileText, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import appointmentService from '../services/appointmentService';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  onRefresh?: () => void;
}

interface AppointmentDetail {
  _id: string;
  user: {
    name: string;
    email: string;
    contact?: string;
  };
  pet: {
    name: string;
    type: string;
    breed: string;
    age?: string;
    weight?: number;
    color?: string;
    medicalHistory?: string;
  };
  veterinarian: {
    name: string;
    email: string;
    specialization: string;
    experience?: string;
  };
  date: string;
  time: string;
  status: string;
  reason: string;
  comments?: string;
  veterinarianNotes?: string;
  consultationFee?: number;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  rating?: number;
  review?: string;
}

export function AppointmentDetailModal({ isOpen, onClose, appointmentId, onCancel, onReschedule, onRefresh }: AppointmentDetailModalProps) {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ratingStars, setRatingStars] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const loadAppointmentDetails = async () => {
    if (!appointmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const appointmentData = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(appointmentData as AppointmentDetail);
    } catch (error: any) {
      console.error('Failed to load appointment details:', error);
      setError(error.message || 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCancelAppointment = async () => {
    if (!appointment?._id || !onCancel) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel this appointment? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      setActionLoading(true);
      await appointmentService.cancelAppointment(appointment._id);
      onCancel(appointment._id);
      if (onRefresh) onRefresh();
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel appointment:', error);
      setError(error.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleAppointment = () => {
    if (!appointment?._id || !onReschedule) return;
    onReschedule(appointment._id);
    onClose();
  };

  const canCancelOrReschedule = (status: string) => {
    const cancelableStatuses = ['PENDING', 'APPROVED', 'CONFIRMED'];
    return cancelableStatuses.includes(status.toUpperCase());
  };

  const canRate = (apt: AppointmentDetail) => {
    return apt.status?.toUpperCase() === 'COMPLETED' && (apt.rating === undefined || apt.rating === null);
  };

  const submitRating = async () => {
    if (!appointment?._id || ratingStars < 1) return;
    try {
      setRatingSubmitting(true);
      const updated = await appointmentService.rateAppointment(appointment._id, { stars: ratingStars, comment: ratingComment });
      setAppointment(updated as any);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl min-h-full flex flex-col py-4">
        <Card className="flex flex-col w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-white z-10 border-b">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Appointment Details</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading appointment details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={loadAppointmentDetails}
              >
                Retry
              </Button>
            </div>
          )}

          {appointment && (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold text-sm sm:text-base">Appointment Info</h3>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p><strong>Date:</strong> <span className="break-words">{formatDate(appointment.date)}</span></p>
                      <p><strong>Time:</strong> {formatTime(appointment.time)}</p>
                      <p className="flex items-center flex-wrap gap-2">
                        <strong>Status:</strong> 
                        <Badge className={`${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </Badge>
                      </p>
{appointment.consultationFee !== undefined && (
                        <p><strong>Fee:</strong> ${appointment.consultationFee}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <h3 className="font-semibold">Pet Information</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {appointment.pet.name}</p>
                      <p><strong>Type:</strong> {appointment.pet.type}</p>
                      <p><strong>Breed:</strong> {appointment.pet.breed}</p>
                      {appointment.pet.age && (
                        <p><strong>Age:</strong> {appointment.pet.age}</p>
                      )}
                      {appointment.pet.weight && (
                        <p><strong>Weight:</strong> {appointment.pet.weight} lbs</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Veterinarian Information */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    <h3 className="font-semibold">Veterinarian</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <p><strong>Name:</strong> Dr. {appointment.veterinarian.name}</p>
                    <p><strong>Specialization:</strong> {appointment.veterinarian.specialization}</p>
                    {appointment.veterinarian.experience && (
                      <p><strong>Experience:</strong> {appointment.veterinarian.experience} years</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reason and Notes */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Reason for Visit</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded">{appointment.reason}</p>
                    </div>
                    
                    {appointment.comments && (
                      <div>
                        <h3 className="font-semibold mb-2">Your Notes</h3>
                        <p className="text-sm bg-blue-50 p-3 rounded">{appointment.comments}</p>
                      </div>
                    )}

                    {appointment.veterinarianNotes && (
                      <div>
                        <h3 className="font-semibold mb-2">Veterinarian Notes</h3>
                        <p className="text-sm bg-green-50 p-3 rounded">{appointment.veterinarianNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information (if completed) */}
              {(appointment.diagnosis || appointment.treatment || appointment.prescriptions?.length) && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Medical Summary</h3>
                    
                    {appointment.diagnosis && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Diagnosis</h4>
                        <p className="text-sm bg-red-50 p-3 rounded">{appointment.diagnosis}</p>
                      </div>
                    )}

                    {appointment.treatment && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Treatment</h4>
                        <p className="text-sm bg-yellow-50 p-3 rounded">{appointment.treatment}</p>
                      </div>
                    )}

                    {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Prescriptions</h4>
                        <div className="space-y-2">
                          {appointment.prescriptions.map((prescription, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded text-sm">
                              <p><strong>{prescription.medication}</strong></p>
                              <p>Dosage: {prescription.dosage}</p>
                              <p>Frequency: {prescription.frequency}</p>
                              <p>Duration: {prescription.duration}</p>
                              {prescription.instructions && (
                                <p>Instructions: {prescription.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating and Review (existing) */}
              {(appointment.rating || appointment.review) && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Your Feedback</h3>
                    {appointment.rating && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span>Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= appointment.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {appointment.review && (
                      <p className="text-sm bg-gray-50 p-3 rounded">{appointment.review}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating Form (if eligible) */}
              {canRate(appointment) && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold">Rate Your Visit</h3>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingStars(star)}
                          className={`text-2xl ${ratingStars >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          aria-label={`Rate ${star} star${star>1?'s':''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Feedback (optional)</label>
                      <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="w-full p-2 border rounded-md min-h-[80px]"
                        placeholder="Share details about your experience"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setRatingStars(0); setRatingComment(''); }}>Clear</Button>
                      <Button size="sm" onClick={submitRating} disabled={ratingSubmitting || ratingStars < 1}>
                        {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white p-4 border-t mt-6 -mx-3 sm:-mx-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 gap-2 order-2 sm:order-1">
                    {appointment && canCancelOrReschedule(appointment.status) && (
                      <>
                        {onReschedule && (
                          <Button 
                            variant="outline" 
                            onClick={handleRescheduleAppointment}
                            disabled={actionLoading}
                            className="flex-1 text-xs sm:text-sm"
                            size="sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Reschedule</span>
                            <span className="sm:hidden">Reschedule</span>
                          </Button>
                        )}
                        {onCancel && (
                          <Button 
                            variant="destructive" 
                            onClick={handleCancelAppointment}
                            disabled={actionLoading}
                            className="flex-1 text-xs sm:text-sm"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span>Cancel</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="order-1 sm:order-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}