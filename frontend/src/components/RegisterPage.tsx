import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { PawBackground, PawPrint } from './PawPrint';
import { Footer } from './Footer';
import { User, Stethoscope, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import { User as UserType } from '../types';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [step, setStep] = useState<'choose' | 'user' | 'veterinarian'>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    contact: '',
    
    // User-specific fields
    address: '',
    petOwnership: '',
    preferredContact: 'email',
    
    // Veterinarian-specific fields
    specialization: '',
    experience: '',
    consultationCostMin: '',
    consultationCostMax: '',
    hospitalsServed: '',
    availability: [] as string[],
    certifications: null as File | null,
    profilePicture: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.contact) {
      setError('Please fill in all required fields');
      return;
    }

    // Name validation
    if (formData.name.length < 2 || formData.name.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setError('Name can only contain letters and spaces');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return;
    }

    // Contact validation - backend expects plain numbers only
    if (!/^[0-9]{10,15}$/.test(formData.contact.replace(/\s/g, ''))) {
      setError('Please provide a valid contact number (10-15 digits only, e.g., 5551234567)');
      return;
    }

    if (step === 'user' && !formData.address) {
      setError('Address is required for pet parents');
      return;
    }

    if (step === 'veterinarian') {
      if (!formData.specialization || !formData.experience || !formData.consultationCostMin || !formData.consultationCostMax) {
        setError('Please fill in all veterinarian details');
        return;
      }
      
      const minFee = parseFloat(formData.consultationCostMin);
      const maxFee = parseFloat(formData.consultationCostMax);
      
      if (isNaN(minFee) || isNaN(maxFee)) {
        setError('Consultation fees must be valid numbers');
        return;
      }
      
      if (minFee < 10) {
        setError('Minimum consultation fee must be at least $10');
        return;
      }
      
      if (maxFee <= minFee) {
        setError('Maximum fee must be greater than minimum fee');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('contact', formData.contact);

      if (step === 'user') {
        // User-specific fields
        formDataToSend.append('address', formData.address);
        if (formData.petOwnership) {
          formDataToSend.append('petOwnership', formData.petOwnership);
        }
        if (formData.preferredContact) {
          formDataToSend.append('preferredContact', formData.preferredContact);
        }
        
        // Add profile picture for user
        if (formData.profilePicture) {
          formDataToSend.append('profilePicture', formData.profilePicture);
        }
        
        // Use user registration endpoint
        await authService.registerUser(formDataToSend);
        
      } else if (step === 'veterinarian') {
        // Veterinarian-specific required fields
        formDataToSend.append('specialization', formData.specialization);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('consultationFeeRange[min]', formData.consultationCostMin);
        formDataToSend.append('consultationFeeRange[max]', formData.consultationCostMax);
        
        // Optional veterinarian fields
        if (formData.hospitalsServed) {
          formDataToSend.append('hospitalsServed', formData.hospitalsServed);
        }
        
        // Process availability data
        if (formData.availability && formData.availability.length > 0) {
          formData.availability.forEach((day, index) => {
            formDataToSend.append(`availability[${index}]`, day);
          });
        }
        
        // Add files for veterinarian
        if (formData.profilePicture) {
          formDataToSend.append('profilePicture', formData.profilePicture);
        }
        
        if (formData.certifications) {
          formDataToSend.append('certifications', formData.certifications);
        }
        
        // Use veterinarian registration endpoint
        await authService.registerVeterinarian(formDataToSend);
      }
      
      // Registration successful - redirect to login
      alert('Registration successful! Please login with your credentials.');
      onNavigate('login');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        if (err.message.includes('Validation failed')) {
          // Try to extract specific validation errors
          try {
            const response = err.message.match(/"errors":\[(.*?)\]/);
            if (response) {
              // This is a rough extraction - the actual error details should come from the API response
              errorMessage = 'Please check your input data. Common issues: password format, phone number format, or missing required fields.';
            } else {
              errorMessage = err.message;
            }
          } catch {
            errorMessage = 'Validation failed. Please check your input data.';
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'choose') {
    return (
      <PawBackground className="min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center mb-12">
            <PawPrint className="mx-auto mb-4 text-primary" size="lg" opacity={1} />
            <h1 className="text-3xl font-bold text-foreground mb-2">Join Oggy's Pet Hospital</h1>
            <p className="text-muted-foreground">Choose your registration type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary"
              onClick={() => { setStep('user'); setError(''); }}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Pet Parent</CardTitle>
                <CardDescription>
                  Register as a pet owner to book appointments and manage your pet's health
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Schedule appointments</li>
                  <li>• Manage pet profiles</li>
                  <li>• Access medical history</li>
                  <li>• Receive care reminders</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary"
              onClick={() => { setStep('veterinarian'); setError(''); }}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit group-hover:bg-secondary/20 transition-colors">
                  <Stethoscope className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Veterinarian</CardTitle>
                <CardDescription>
                  Join our network of professional veterinarians to serve pet families
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Manage your schedule</li>
                  <li>• Set consultation rates</li>
                  <li>• Access patient records</li>
                  <li>• Track your practice</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer onNavigate={onNavigate} />
      </PawBackground>
    );
  }

  return (
    <PawBackground className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setStep('choose')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Registration Type
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {step === 'user' ? (
                <User className="w-6 h-6 text-primary" />
              ) : (
                <Stethoscope className="w-6 h-6 text-secondary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === 'user' ? 'Pet Parent Registration' : 'Veterinarian Registration'}
            </CardTitle>
            <CardDescription>
              {step === 'user' 
                ? 'Create your account to start managing your pet\'s healthcare' 
                : 'Join our professional network to serve pet families'
              }
            </CardDescription>
            
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange('contact', value);
                    }}
                    placeholder="5551234567"
                    maxLength={15}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter digits only (10-15 digits, e.g., 5551234567)
                  </p>
                </div>
              </div>

              {/* User-specific Fields */}
              {step === 'user' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                      className="min-h-20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="petOwnership">Pet Ownership Information</Label>
                    <Textarea
                      id="petOwnership"
                      value={formData.petOwnership}
                      onChange={(e) => handleInputChange('petOwnership', e.target.value)}
                      placeholder="Tell us about your pets (types, breeds, ages, etc.)"
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Preferred Contact Method</Label>
                    <RadioGroup 
                      value={formData.preferredContact} 
                      onValueChange={(value) => handleInputChange('preferredContact', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email-contact" />
                        <Label htmlFor="email-contact">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone-contact" />
                        <Label htmlFor="phone-contact">Phone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both-contact" />
                        <Label htmlFor="both-contact">Both Email & Phone</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {/* Veterinarian-specific Fields */}
              {step === 'veterinarian' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select onValueChange={(value) => handleInputChange('specialization', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Practice">General Practice</SelectItem>
                          <SelectItem value="Surgery">Surgery</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Emergency Care">Emergency Care</SelectItem>
                          <SelectItem value="Dental Care">Dental Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="e.g., 5 years"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalsServed">Previous Hospitals/Clinics Served</Label>
                    <Textarea
                      id="hospitalsServed"
                      value={formData.hospitalsServed}
                      onChange={(e) => handleInputChange('hospitalsServed', e.target.value)}
                      placeholder="List hospitals or clinics where you've worked"
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Days of Availability</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day}
                            className="rounded"
                            onChange={(e) => {
                              const newAvailability = e.target.checked
                                ? [...formData.availability, day]
                                : formData.availability.filter(d => d !== day);
                              handleInputChange('availability', newAvailability);
                            }}
                          />
                          <Label htmlFor={day} className="text-sm">{day.slice(0, 3)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultationCostMin">Min Consultation Cost ($) *</Label>
                      <Input
                        id="consultationCostMin"
                        type="number"
                        value={formData.consultationCostMin}
                        onChange={(e) => handleInputChange('consultationCostMin', e.target.value)}
                        placeholder="50"
                        min="10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultationCostMax">Max Consultation Cost ($) *</Label>
                      <Input
                        id="consultationCostMax"
                        type="number"
                        value={formData.consultationCostMax}
                        onChange={(e) => handleInputChange('consultationCostMax', e.target.value)}
                        placeholder="150"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Upload Certifications</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload your veterinary license and certifications
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        id="certifications"
                        onChange={(e) => handleInputChange('certifications', e.target.files?.[0] || null)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('certifications')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a profile picture
                  </p>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    id="profilePicture"
                    onChange={(e) => handleInputChange('profilePicture', e.target.files?.[0] || null)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('profilePicture')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <PawPrint className="ml-2" size="sm" opacity={1} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer onNavigate={onNavigate} />
    </PawBackground>
  );
}