import React, { useState, useEffect } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { VeterinarianManagement } from './VeterinarianManagement';
import authService from '../services/authService';
import { Admin } from '../types';

export type AdminPage = 'login' | 'admin-dashboard' | 'admin-users' | 'admin-veterinarians';

export function AdminApp() {
  const [currentPage, setCurrentPage] = useState<AdminPage>('login');
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const checkAdminAuth = () => {
      if (authService.isAdminAuthenticated()) {
        const currentAdmin = authService.getCurrentAdmin();
        if (currentAdmin) {
          setAdmin(currentAdmin);
          setCurrentPage('admin-dashboard');
        }
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const handleAdminLogin = (loggedInAdmin: Admin) => {
    setAdmin(loggedInAdmin);
    setCurrentPage('admin-dashboard');
  };

  const handleAdminLogout = () => {
    authService.logoutAdmin();
    setAdmin(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page: AdminPage) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show login page if no admin is authenticated
  if (currentPage === 'login' || !admin) {
    return <AdminLoginPage onLogin={handleAdminLogin} />;
  }

  // Render appropriate page based on current page
  switch (currentPage) {
    case 'admin-dashboard':
      return (
        <AdminDashboard
          admin={admin}
          onNavigate={handleNavigate}
          onLogout={handleAdminLogout}
        />
      );

    case 'admin-users':
      return (
        <UserManagement
          onNavigate={handleNavigate}
        />
      );

    case 'admin-veterinarians':
      return (
        <VeterinarianManagement
          onNavigate={handleNavigate}
        />
      );

    default:
      return (
        <AdminDashboard
          admin={admin}
          onNavigate={handleNavigate}
          onLogout={handleAdminLogout}
        />
      );
  }
}