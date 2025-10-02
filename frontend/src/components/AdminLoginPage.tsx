import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PawBackground, PawPrint } from './PawPrint';
import { Footer } from './Footer';
import { Shield, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import { Admin } from '../types';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
  onAdminLogin?: (admin: Admin) => void;
  onLogin?: (admin: Admin) => void;
}

export function AdminLoginPage({ onNavigate, onAdminLogin, onLogin }: AdminLoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.loginAdmin({
        email: formData.email,
        password: formData.password
      });

      if (response) {
        // Support both onAdminLogin and onLogin callbacks
        if (onAdminLogin) {
          onAdminLogin(response.admin);
        } else if (onLogin) {
          onLogin(response.admin);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PawBackground className="min-h-screen py-12 px-6">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Admin Access</CardTitle>
            <CardDescription>
              Restricted area - Administrative login required
            </CardDescription>
            
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter admin password"
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

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    <strong>Admin Access Only:</strong> This login is restricted to authorized administrators only.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-muted-foreground">
                Having trouble accessing your admin account?<br />
                Contact your system administrator for assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Regular users should use the{' '}
            <button 
              onClick={() => onNavigate('login')}
              className="text-primary hover:underline"
            >
              standard login
            </button>
          </p>
        </div>
      </div>
      
      <Footer onNavigate={onNavigate} />
    </PawBackground>
  );
}