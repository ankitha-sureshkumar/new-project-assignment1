import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle, 
  UserX,
  UserCheck,
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import authService from '../services/authService';
import { User } from '../types';

interface UserManagementProps {
  onNavigate: (page: string) => void;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  requiresReason?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
}

function ConfirmationDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  requiresReason,
  reason,
  onReasonChange,
  confirmText = 'Confirm',
  confirmVariant = 'default'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const canConfirm = !requiresReason || (reason && reason.trim().length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {requiresReason && (
            <div className="mb-4">
              <Label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason (required)
              </Label>
              <textarea
                id="reason"
                value={reason || ''}
                onChange={(e) => onReasonChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide a reason for this action..."
              />
            </div>
          )}
          
          <div className="flex space-x-3 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={!canConfirm}
              className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserDetailsDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

function UserDetailsDialog({ isOpen, user, onClose }: UserDetailsDialogProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
            <Button variant="outline" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <Badge className={user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                {user.isBlocked ? 'Blocked' : 'Active'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">User ID</Label>
              <p className="text-gray-600 text-sm font-mono">{user._id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Registered</Label>
              <p className="text-gray-600 text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {user.address && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-500">Address</Label>
              <p className="text-gray-900">{user.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    requiresReason?: boolean;
    reason?: string;
    confirmText?: string;
    confirmVariant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });
  
  const [userDetailsDialog, setUserDetailsDialog] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await authService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return !user.isBlocked;
        if (statusFilter === 'blocked') return user.isBlocked;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete', reason?: string) => {
    try {
      setActionLoading(userId);
      
      switch (action) {
        case 'block':
          await authService.blockUser(userId, reason || 'Administrative action');
          break;
        case 'unblock':
          await authService.unblockUser(userId);
          break;
        case 'delete':
          await authService.deleteUser(userId);
          break;
      }

      await loadUsers();
      alert(`User ${action}ed successfully`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmDialog = (
    title: string,
    message: string,
    action: () => void,
    options?: {
      requiresReason?: boolean;
      confirmText?: string;
      confirmVariant?: 'default' | 'destructive';
    }
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      action,
      requiresReason: options?.requiresReason,
      reason: '',
      confirmText: options?.confirmText,
      confirmVariant: options?.confirmVariant,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, reason: '' }));
  };

  const confirmAction = () => {
    confirmDialog.action();
    closeConfirmDialog();
  };

  const handleViewUser = (user: User) => {
    setUserDetailsDialog({ isOpen: true, user });
  };

  const handleBlockUser = (user: User) => {
    openConfirmDialog(
      'Block User',
      `Are you sure you want to block ${user.name}? They will not be able to login or use the platform.`,
      () => handleUserAction(user._id, 'block', confirmDialog.reason),
      {
        requiresReason: true,
        confirmText: 'Block User',
        confirmVariant: 'destructive'
      }
    );
  };

  const handleUnblockUser = (user: User) => {
    openConfirmDialog(
      'Unblock User',
      `Are you sure you want to unblock ${user.name}? They will be able to login and use the platform again.`,
      () => handleUserAction(user._id, 'unblock'),
      {
        confirmText: 'Unblock User'
      }
    );
  };

  const handleDeleteUser = (user: User) => {
    openConfirmDialog(
      'Delete User',
      `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all user data.`,
      () => handleUserAction(user._id, 'delete'),
      {
        confirmText: 'Delete User',
        confirmVariant: 'destructive'
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('admin-dashboard')}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-sm text-gray-500">{filteredUsers.length} users found</p>
                </div>
              </div>
            </div>
            
            <Button onClick={loadUsers} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="blocked">Blocked Users</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="flex space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Total: {users.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    Active: {users.filter(u => !u.isBlocked).length}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    Blocked: {users.filter(u => u.isBlocked).length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>All Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {user.isBlocked ? (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Blocked
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            
                            {user.isBlocked ? (
                              <Button
                                size="sm"
                                onClick={() => handleUnblockUser(user)}
                                disabled={actionLoading === user._id}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                {actionLoading === user._id ? (
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBlockUser(user)}
                                disabled={actionLoading === user._id}
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              >
                                {actionLoading === user._id ? (
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <Ban className="w-3 h-3 mr-1" />
                                )}
                                Block
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user)}
                              disabled={actionLoading === user._id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              {actionLoading === user._id ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmAction}
        onCancel={closeConfirmDialog}
        requiresReason={confirmDialog.requiresReason}
        reason={confirmDialog.reason}
        onReasonChange={(reason) => setConfirmDialog(prev => ({ ...prev, reason }))}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.confirmVariant}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        isOpen={userDetailsDialog.isOpen}
        user={userDetailsDialog.user}
        onClose={() => setUserDetailsDialog({ isOpen: false, user: null })}
      />
    </div>
  );
}