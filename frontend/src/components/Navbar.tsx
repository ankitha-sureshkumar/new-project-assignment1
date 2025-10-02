import { Button } from './ui/button';
import { PawPrint } from './PawPrint';
import { Bell, User, Settings } from 'lucide-react';
import { Badge } from './ui/badge';

interface NavbarProps {
  currentPage: string;
  userType: 'guest' | 'user' | 'veteran';
  onNavigate: (page: string) => void;
  notifications?: number;
}

export function Navbar({ currentPage, userType, onNavigate, notifications = 0 }: NavbarProps) {
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
          {!isLoggedIn ? (
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
                  className="text-secondary-foreground hover:text-primary-foreground"
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('home')}
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