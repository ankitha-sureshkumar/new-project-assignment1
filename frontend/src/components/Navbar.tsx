import { Button } from './ui/button';
import { PawPrint } from './PawPrint';
import { Bell, User, Settings, Shield } from 'lucide-react';
import { Badge } from './ui/badge';

interface NavbarProps {
  currentPage: string;
  userType: 'guest' | 'user' | 'veterinarian' | 'admin';
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  notifications?: number;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}

export function Navbar({ currentPage, userType, onNavigate, onLogout, notifications = 0, onNotificationsClick, onProfileClick }: NavbarProps) {
  const isLoggedIn = userType !== 'guest';
  
  return (
    <nav className="bg-secondary text-secondary-foreground px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavigate('home')}
        >
          <PawPrint className="text-primary" size="lg" opacity={1} />
          <div>
            <h1 className="text-xl font-bold">Oggy's Pet Hospital</h1>
            <p className="text-xs opacity-75">Caring with Love 🐾</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {userType === 'admin' ? (
            <>
              <Button 
                variant={currentPage === 'admin-dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin-dashboard')}
                className="text-secondary-foreground hover:text-primary-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
              <Button 
                variant={currentPage === 'admin-users' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin-users')}
                className="text-secondary-foreground hover:text-primary-foreground"
              >
                Users
              </Button>
              <Button 
                variant={currentPage === 'admin-veterinarians' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin-veterinarians')}
                className="text-secondary-foreground hover:text-primary-foreground"
              >
                Veterinarians
              </Button>
            </>
          ) : !isLoggedIn ? (
            <>
              <Button 
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className="text-secondary-foreground hover:text-primary-foreground"
              >
                Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('register')}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Register
              </Button>
              <Button 
                onClick={() => onNavigate('login')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login
              </Button>
              {/* Admin Access for Guests */}
              <Button 
                variant="ghost"
                onClick={() => onNavigate('admin-login')}
                className="text-muted-foreground hover:text-red-600 border border-red-200 hover:border-red-400 text-xs"
                size="sm"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
                className="text-secondary-foreground hover:text-primary-foreground"
              >
                Dashboard
              </Button>
              
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onNotificationsClick}
                  className="text-secondary-foreground hover:text-primary-foreground"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs bg-accent text-accent-foreground">
                      {notifications > 9 ? '9+' : notifications}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onProfileClick}
                  className="text-secondary-foreground hover:text-primary-foreground"
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLogout || (() => onNavigate('home'))}
                  className="text-secondary-foreground hover:text-primary-foreground text-sm"
                >
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}