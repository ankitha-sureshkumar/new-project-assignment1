import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeSelector } from './components/ThemeSelector';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { VeterinarianDashboard } from './components/VeterinarianDashboard';
import { AdminLoginPage, AdminDashboard, UserManagement, VeterinarianManagement } from './components';
import authService from './services/authService';
import { User, Admin } from './types';

type Page = 'home' | 'register' | 'login' | 'dashboard' | 'admin-login' | 'admin-dashboard' | 'admin-users' | 'admin-veterinarians';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Restore page from localStorage or default to home
    const savedPage = localStorage.getItem('currentPage');
    return (savedPage as Page) || 'home';
  });
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard action handlers (for communication with UserDashboard)
  const [dashboardActions, setDashboardActions] = useState<{
    goToNotifications?: () => void;
    showProfile?: () => void;
  }>({});

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for admin authentication first
        if (authService.isAdminAuthenticated()) {
          try {
            const adminData = authService.getCurrentAdmin();
            if (adminData) {
              setAdmin(adminData);
              // Only set admin dashboard if no page is saved or if current page is home/login/register
              const savedPage = localStorage.getItem('currentPage') as Page;
              if (!savedPage || ['home', 'login', 'register', 'admin-login'].includes(savedPage)) {
                setCurrentPage('admin-dashboard');
                localStorage.setItem('currentPage', 'admin-dashboard');
              }
            }
          } catch (error) {
            console.error('Failed to get admin profile:', error);
            authService.logoutAdmin();
            setCurrentPage('home');
            localStorage.setItem('currentPage', 'home');
          }
        } else if (authService.isAuthenticated()) {
          // Simple approach like admin - just use cached user data
          const cachedUser = authService.getCurrentUser();
          if (cachedUser) {
            console.log('✅ Loading cached user data...');
            setUser(cachedUser);
            // Only set dashboard if no page is saved or if current page is home/login/register
            const savedPage = localStorage.getItem('currentPage') as Page;
            if (!savedPage || ['home', 'login', 'register'].includes(savedPage)) {
              setCurrentPage('dashboard');
              localStorage.setItem('currentPage', 'dashboard');
            }
          } else {
            // No cached user, redirect to login
            authService.logout();
            setCurrentPage('login');
            localStorage.setItem('currentPage', 'login');
          }
        } else {
          // If not authenticated and on dashboard/admin pages, redirect to home
          const savedPage = localStorage.getItem('currentPage') as Page;
          if (['dashboard', 'admin-dashboard', 'admin-users', 'admin-veterinarians'].includes(savedPage)) {
            setCurrentPage('home');
            localStorage.setItem('currentPage', 'home');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to home page on any error
        setCurrentPage('home');
        localStorage.setItem('currentPage', 'home');
      }
      setLoading(false);
    };

    checkAuth();
    
    // Handle auth failed events from API service
    const handleAuthFailed = () => {
      console.log('Auth failed event received, logging out...');
      setUser(null);
      setAdmin(null);
      setCurrentPage('home');
      localStorage.setItem('currentPage', 'home');
    };
    
    window.addEventListener('auth-failed', handleAuthFailed);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('auth-failed', handleAuthFailed);
    };
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page as Page);
    localStorage.setItem('currentPage', page);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
    localStorage.setItem('currentPage', 'dashboard');
  };

  const handleAdminLogin = (adminData: Admin) => {
    setAdmin(adminData);
    setCurrentPage('admin-dashboard');
    localStorage.setItem('currentPage', 'admin-dashboard');
  };

  const handleLogout = () => {
    if (admin) {
      authService.logoutAdmin();
      setAdmin(null);
    } else {
      authService.logout();
      setUser(null);
    }
    setCurrentPage('home');
    localStorage.setItem('currentPage', 'home');
  };
  
  // Handle navbar notification click
  const handleNavbarNotifications = () => {
    if (dashboardActions.goToNotifications) {
      dashboardActions.goToNotifications();
    }
  };
  
  // Handle navbar profile click
  const handleNavbarProfile = () => {
    if (dashboardActions.showProfile) {
      dashboardActions.showProfile();
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get notification count (mock for now - will be replaced with real data later)
  const notificationCount = user ? 3 : 0;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Navbar 
            currentPage={currentPage}
            userType={admin ? 'admin' : user ? user.role : 'guest'}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            notifications={notificationCount}
            onNotificationsClick={handleNavbarNotifications}
            onProfileClick={handleNavbarProfile}
          />
          
          <main>
          {currentPage === 'home' && (
            <HomePage onNavigate={handleNavigation} />
          )}
          
          {currentPage === 'register' && (
            <RegisterPage onNavigate={handleNavigation} />
          )}
          
          {currentPage === 'login' && (
            <LoginPage onNavigate={handleNavigation} onLogin={handleLogin} />
          )}
          
          {currentPage === 'dashboard' && user?.role === 'user' && (
            <UserDashboard 
              onNavigate={handleNavigation} 
              user={user} 
              onLogout={handleLogout}
              onRegisterActions={setDashboardActions}
            />
          )}
          
          {currentPage === 'dashboard' && user?.role === 'veterinarian' && (
            <VeterinarianDashboard onNavigate={handleNavigation} user={user} onLogout={handleLogout} />
          )}
          
          
          {/* Admin Pages */}
          {currentPage === 'admin-login' && (
            <AdminLoginPage onNavigate={handleNavigation} onAdminLogin={handleAdminLogin} />
          )}
          
          {currentPage === 'admin-dashboard' && admin && (
            <AdminDashboard admin={admin} onNavigate={handleNavigation} onLogout={handleLogout} />
          )}
          
          {currentPage === 'admin-users' && admin && (
            <UserManagement onNavigate={handleNavigation} />
          )}
          
          {currentPage === 'admin-veterinarians' && admin && (
            <VeterinarianManagement onNavigate={handleNavigation} />
          )}
        </main>

        <ThemeSelector />
      </div>
    </ThemeProvider>
    </ErrorBoundary>
  );
}