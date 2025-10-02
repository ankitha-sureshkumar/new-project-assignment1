import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeSelector } from './components/ThemeSelector';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { VeteranDashboard } from './components/VeteranDashboard';

type Page = 'home' | 'register' | 'login' | 'dashboard';
type UserType = 'guest' | 'user' | 'veteran';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userType, setUserType] = useState<UserType>('guest');

  const handleNavigation = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogin = (type: 'user' | 'veteran') => {
    setUserType(type);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUserType('guest');
    setCurrentPage('home');
  };

  // Mock notification count for demo
  const notificationCount = userType !== 'guest' ? 3 : 0;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar 
          currentPage={currentPage}
          userType={userType}
          onNavigate={handleNavigation}
          notifications={notificationCount}
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
          
          {currentPage === 'dashboard' && userType === 'user' && (
            <UserDashboard onNavigate={handleNavigation} />
          )}
          
          {currentPage === 'dashboard' && userType === 'veteran' && (
            <VeteranDashboard onNavigate={handleNavigation} />
          )}
        </main>

        <ThemeSelector />
      </div>
    </ThemeProvider>
  );
}