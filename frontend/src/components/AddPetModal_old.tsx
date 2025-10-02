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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg w-full max-w-3xl my-8 shadow-xl">
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 sticky top-0 bg-background rounded-t-lg z-10">
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Pet</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Pet Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${errors.name ? 'border-red-500' : 'border-input'}`}
                      placeholder="Enter pet's name"
                      maxLength={30}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Pet Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background"
                    >
                      {petTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Breed *</label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      className={`w-full p-2 border rounded-md ${errors.breed ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter breed"
                      maxLength={50}
                    />
                    {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Age *</label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className={`w-full p-2 border rounded-md ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., 2 years, 6 months"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="200"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={`w-full p-2 border rounded-md ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter weight"
                    />
                    {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {genderOptions.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className={`w-full p-2 border rounded-md ${errors.color ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Describe pet's color"
                      maxLength={50}
                    />
                    {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Microchip ID</label>
                    <input
                      type="text"
                      value={formData.microchipId}
                      onChange={(e) => handleInputChange('microchipId', e.target.value)}
                      className={`w-full p-2 border rounded-md ${errors.microchipId ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter microchip ID if available"
                      maxLength={20}
                    />
                    {errors.microchipId && <p className="text-red-500 text-sm mt-1">{errors.microchipId}</p>}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Medical History</label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className={`w-full p-2 border rounded-md h-24 ${errors.medicalHistory ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter any known medical conditions, surgeries, etc."
                      maxLength={1000}
                    />
                    {errors.medicalHistory && <p className="text-red-500 text-sm mt-1">{errors.medicalHistory}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Vaccinations</label>
                    <textarea
                      value={formData.vaccinations}
                      onChange={(e) => handleInputChange('vaccinations', e.target.value)}
                      className={`w-full p-2 border rounded-md h-24 ${errors.vaccinations ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="List vaccinations and dates"
                      maxLength={500}
                    />
                    {errors.vaccinations && <p className="text-red-500 text-sm mt-1">{errors.vaccinations}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Allergies</label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={currentAllergy}
                        onChange={(e) => setCurrentAllergy(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Add an allergy"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      />
                      <Button type="button" onClick={addAllergy} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies?.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeAllergy(allergy)}>
                          {allergy} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Emergency Contact (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.contact || ''}
                      onChange={(e) => handleEmergencyContactChange('contact', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Relation</label>
                    <input
                      type="text"
                      value={formData.emergencyContact?.relation || ''}
                      onChange={(e) => handleEmergencyContactChange('relation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Friend, Family"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[100px]">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Pet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}