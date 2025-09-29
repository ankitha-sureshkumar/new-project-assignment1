import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PawBackground, PawPrint } from './PawPrint';
import { User, Stethoscope, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userType: 'user' | 'veteran') => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [step, setStep] = useState<'choose' | 'user' | 'veteran'>('choose');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login validation
    if (formData.email && formData.password) {
      onLogin(step as 'user' | 'veteran');
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your Oggy's Pet Hospital account</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary"
              onClick={() => setStep('user')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Pet Parent Login</CardTitle>
                <CardDescription>
                  Access your pet's health records and book appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• View appointment history</li>
                  <li>• Manage pet profiles</li>
                  <li>• Schedule new visits</li>
                  <li>• Access medical records</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary"
              onClick={() => setStep('veteran')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit group-hover:bg-secondary/20 transition-colors">
                  <Stethoscope className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Veterinarian Login</CardTitle>
                <CardDescription>
                  Access your professional dashboard and patient management
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Manage appointments</li>
                  <li>• Update availability</li>
                  <li>• View patient records</li>
                  <li>• Track consultations</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate('register')}
                className="text-primary hover:underline font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </PawBackground>
    );
  }

  return (
    <PawBackground className="min-h-screen py-12 px-6">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setStep('choose')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login Type
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
              {step === 'user' ? 'Pet Parent Sign In' : 'Veterinarian Sign In'}
            </CardTitle>
            <CardDescription>
              {step === 'user' 
                ? 'Access your pet\'s healthcare dashboard' 
                : 'Access your professional veterinary dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-muted-foreground">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign In
                <PawPrint className="ml-2" size="sm" opacity={1} />
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Need an account?{' '}
                <button 
                  onClick={() => onNavigate('register')}
                  className="text-primary hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium text-sm mb-3">Demo Credentials:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Pet Parent:</strong> user@demo.com / password123</p>
              <p><strong>Veterinarian:</strong> vet@demo.com / password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PawBackground>
  );
}