import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Users, Stethoscope, LogOut, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import { Admin, AdminDashboardStats } from '../types';

interface AdminDashboardProps {
  admin: Admin;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ admin, onNavigate, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await authService.getAdminDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logoutAdmin();
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {admin.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                Administrator
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500">{stats?.blockedUsers || 0} blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Veterinarians</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalVeterinarians || 0}</p>
                  <p className="text-xs text-gray-500">{stats?.approvedVeterinarians || 0} approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pendingVeterinarians || 0}</p>
                  <p className="text-xs text-gray-500">Need review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full mr-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('admin-users')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View, block, unblock, and manage all pet parent accounts
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {stats?.totalUsers || 0} Total
                  </Badge>
                  {stats?.blockedUsers && stats.blockedUsers > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {stats.blockedUsers} Blocked
                    </Badge>
                  )}
                </div>
                <Button size="sm" className="bg-blue-600 text-white">
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('admin-veterinarians')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-green-600" />
                <span>Veterinarian Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Approve, reject, block, and manage veterinarian accounts
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Badge className="bg-green-100 text-green-800">
                    {stats?.approvedVeterinarians || 0} Approved
                  </Badge>
                  {stats?.pendingVeterinarians && stats.pendingVeterinarians > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                      {stats.pendingVeterinarians} Pending
                    </Badge>
                  )}
                </div>
                <Button size="sm" className="bg-green-600 text-white">
                  Manage Vets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Actions */}
        {stats && stats.pendingVeterinarians > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Urgent: Veterinarian Approvals Needed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-4">
                You have {stats.pendingVeterinarians} veterinarian{stats.pendingVeterinarians > 1 ? 's' : ''} waiting for approval.
                New veterinarians cannot login until approved by an administrator.
              </p>
              <Button 
                onClick={() => onNavigate('admin-veterinarians')}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Pending Applications
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}