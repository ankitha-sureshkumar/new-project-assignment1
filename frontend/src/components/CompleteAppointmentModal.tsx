import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { XCircle, CheckCircle, Stethoscope } from 'lucide-react';

interface CompleteAppointmentModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (completionData: {
    diagnosis: string;
    treatment: string;
    followUpRequired: boolean;
    veterinarianNotes?: string;
  }) => void;
  isLoading: boolean;
}

export function CompleteAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onComplete,
  isLoading
}: CompleteAppointmentModalProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [veterinarianNotes, setVeterinarianNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    
    if (!treatment.trim()) {
      newErrors.treatment = 'Treatment is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onComplete({
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      followUpRequired,
      veterinarianNotes: veterinarianNotes.trim() || undefined
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      setDiagnosis('');
      setTreatment('');
      setFollowUpRequired(false);
      setVeterinarianNotes('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl min-h-full flex flex-col py-2 sm:py-4">
        <Card className="flex flex-col w-full max-h-screen">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-white z-10 border-b px-3 sm:px-6">
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Complete Appointment</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto px-3 sm:px-6 pb-0">
            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">Patient:</span>
                  <p className="font-medium break-words">{appointment?.pet?.name} ({appointment?.pet?.type})</p>
                </div>
                <div>
                  <span className="text-gray-500">Owner:</span>
                  <p className="font-medium break-words">{appointment?.user?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">{new Date(appointment?.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <p className="font-medium">{appointment?.time}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Reason:</span>
                  <p className="font-medium break-words">{appointment?.reason}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Diagnosis */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="diagnosis" className="text-xs sm:text-sm font-medium text-gray-700">
                  Diagnosis *
                </label>
                <textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className={`w-full p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm ${
                    errors.diagnosis ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Enter the diagnosis..."
                  disabled={isLoading}
                />
                {errors.diagnosis && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.diagnosis}</p>
                )}
              </div>

              {/* Treatment */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="treatment" className="text-xs sm:text-sm font-medium text-gray-700">
                  Treatment *
                </label>
                <textarea
                  id="treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className={`w-full p-2 sm:p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm ${
                    errors.treatment ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Enter the treatment provided..."
                  disabled={isLoading}
                />
                {errors.treatment && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.treatment}</p>
                )}
              </div>

              {/* Follow-up Required */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="followUp" className="text-xs sm:text-sm font-medium text-gray-700">
                  Follow-up appointment required
                </label>
              </div>

              {/* Veterinarian Notes */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="notes" className="text-xs sm:text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={veterinarianNotes}
                  onChange={(e) => setVeterinarianNotes(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm"
                  rows={4}
                  placeholder="Enter any additional notes, instructions, or recommendations..."
                  disabled={isLoading}
                />
              </div>

            </form>
          </CardContent>
          
          {/* Sticky Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="order-2 sm:order-1 text-xs sm:text-sm"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 text-xs sm:text-sm"
                size="sm"
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Completing...</span>
                    <span className="sm:hidden">Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Complete Appointment</span>
                    <span className="sm:hidden">Complete</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}