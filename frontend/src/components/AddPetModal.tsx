import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Save, Plus } from 'lucide-react';
import { Badge } from './ui/badge';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (petData: PetFormData) => Promise<void>;
  loading?: boolean;
}

export interface PetFormData {
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: string;
  weight?: number;
  gender?: 'Male' | 'Female' | 'Unknown';
  color?: string;
  microchipId?: string;
  medicalHistory?: string;
  vaccinations?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
}

const initialFormData: PetFormData = {
  name: '',
  type: 'Dog',
  breed: '',
  age: '',
  weight: undefined,
  gender: 'Unknown',
  color: '',
  microchipId: '',
  medicalHistory: '',
  vaccinations: '',
  allergies: [],
  emergencyContact: {
    name: '',
    contact: '',
    relation: ''
  }
};

export function AddPetModal({ isOpen, onClose, onSubmit, loading = false }: AddPetModalProps) {
  const [formData, setFormData] = useState<PetFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentAllergy, setCurrentAllergy] = useState('');

  if (!isOpen) return null;

  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'] as const;
  const genderOptions = ['Male', 'Female', 'Unknown'] as const;

  const inputClassName = (hasError: boolean) =>
    `w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
      hasError ? 'border-red-500' : 'border-input'
    } bg-background`;

  const selectClassName = 'w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background';

  const handleInputChange = (field: keyof PetFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmergencyContactChange = (field: keyof PetFormData['emergencyContact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value
      }
    }));
  };

  const addAllergy = () => {
    if (currentAllergy.trim() && !formData.allergies?.includes(currentAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), currentAllergy.trim()]
      }));
      setCurrentAllergy('');
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter(allergy => allergy !== allergyToRemove) || []
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Pet name cannot exceed 30 characters';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    } else if (formData.breed.length > 50) {
      newErrors.breed = 'Breed cannot exceed 50 characters';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    }

    if (formData.weight && (formData.weight < 0.1 || formData.weight > 200)) {
      newErrors.weight = 'Weight must be between 0.1 and 200 kg';
    }

    if (formData.color && formData.color.length > 50) {
      newErrors.color = 'Color description cannot exceed 50 characters';
    }

    if (formData.microchipId && formData.microchipId.length > 20) {
      newErrors.microchipId = 'Microchip ID cannot exceed 20 characters';
    }

    if (formData.medicalHistory && formData.medicalHistory.length > 1000) {
      newErrors.medicalHistory = 'Medical history cannot exceed 1000 characters';
    }

    if (formData.vaccinations && formData.vaccinations.length > 500) {
      newErrors.vaccinations = 'Vaccinations info cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData(initialFormData);
      setCurrentAllergy('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to add pet:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCurrentAllergy('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-background rounded-lg w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b shrink-0">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Add New Pet</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-primary">Basic Information</h3>
                <div className="space-y-4">
                  {/* Name and Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pet Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={inputClassName(!!errors.name)}
                        placeholder="Enter pet's name"
                        maxLength={30}
                        disabled={loading}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Pet Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className={selectClassName}
                        disabled={loading}
                      >
                        {petTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Breed and Age Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Breed *</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => handleInputChange('breed', e.target.value)}
                        className={inputClassName(!!errors.breed)}
                        placeholder="Enter breed"
                        maxLength={50}
                        disabled={loading}
                      />
                      {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Age *</label>
                      <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className={inputClassName(!!errors.age)}
                        placeholder="e.g., 2 years, 6 months"
                        disabled={loading}
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                  </div>

                  {/* Weight and Gender Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="200"
                        value={formData.weight || ''}
                        onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className={inputClassName(!!errors.weight)}
                        placeholder="Enter weight"
                        disabled={loading}
                      />
                      {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className={selectClassName}
                        disabled={loading}
                      >
                        {genderOptions.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color and Microchip Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className={inputClassName(!!errors.color)}
                        placeholder="Describe pet's color"
                        maxLength={50}
                        disabled={loading}
                      />
                      {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Microchip ID</label>
                      <input
                        type="text"
                        value={formData.microchipId}
                        onChange={(e) => handleInputChange('microchipId', e.target.value)}
                        className={inputClassName(!!errors.microchipId)}
                        placeholder="Enter microchip ID"
                        maxLength={20}
                        disabled={loading}
                      />
                      {errors.microchipId && <p className="text-red-500 text-sm mt-1">{errors.microchipId}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-primary">Medical Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Medical History</label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className={inputClassName(!!errors.medicalHistory) + ' resize-none h-20'}
                      placeholder="Enter any known medical conditions, surgeries, etc."
                      maxLength={1000}
                      disabled={loading}
                    />
                    {errors.medicalHistory && <p className="text-red-500 text-sm mt-1">{errors.medicalHistory}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vaccinations</label>
                    <textarea
                      value={formData.vaccinations}
                      onChange={(e) => handleInputChange('vaccinations', e.target.value)}
                      className={inputClassName(!!errors.vaccinations) + ' resize-none h-20'}
                      placeholder="List vaccinations and dates"
                      maxLength={500}
                      disabled={loading}
                    />
                    {errors.vaccinations && <p className="text-red-500 text-sm mt-1">{errors.vaccinations}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Allergies</label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={currentAllergy}
                        onChange={(e) => setCurrentAllergy(e.target.value)}
                        className="flex-1 p-3 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background"
                        placeholder="Add an allergy"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                        disabled={loading}
                      />
                      <Button 
                        type="button" 
                        onClick={addAllergy} 
                        size="sm" 
                        disabled={loading || !currentAllergy.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies?.map((allergy, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80 transition-colors" 
                          onClick={() => !loading && removeAllergy(allergy)}
                        >
                          {allergy} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-primary">Emergency Contact <span className="text-sm text-muted-foreground">(Optional)</span></h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContact?.name || ''}
                        onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                        className={inputClassName(false)}
                        placeholder="Contact person name"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact?.contact || ''}
                        onChange={(e) => handleEmergencyContactChange('contact', e.target.value)}
                        className={inputClassName(false)}
                        placeholder="Phone number"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.relation || ''}
                      onChange={(e) => handleEmergencyContactChange('relation', e.target.value)}
                      className={inputClassName(false)}
                      placeholder="e.g., Friend, Family, Neighbor"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-background shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="min-w-[120px]"
              onClick={handleSubmit}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Pet
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}