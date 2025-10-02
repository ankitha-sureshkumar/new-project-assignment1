import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  ArrowLeft,
  Stethoscope,
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
  AlertTriangle,
  Info,
  FileText
} from 'lucide-react';
import authService from '../services/authService';
import { Veterinarian } from '../types';

interface VeterinarianManagementProps {
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
  confirmVariant = 'default',
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

interface VetDetailsDialogProps {
  isOpen: boolean;
  vet: Veterinarian | null;
  onClose: () => void;
}

function VetDetailsDialog({ isOpen, vet, onClose }: VetDetailsDialogProps) {
  if (!isOpen || !vet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Veterinarian Details</h3>
            <Button variant="outline" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="text-gray-900 font-medium">{vet.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-gray-900">{vet.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-gray-900">{vet.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="flex items-center space-x-2">
                <Badge className={vet.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {vet.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
                <Badge className={vet.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {vet.isApproved ? 'Approved' : 'Pending/Rejected'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Vet ID</Label>
              <p className="text-gray-600 text-sm font-mono">{vet._id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Registered</Label>
              <p className="text-gray-600 text-sm">{new Date(vet.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {vet.specialization && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-500">Specialization</Label>
              <p className="text-gray-900">{vet.specialization}</p>
            </div>
          )}

          {vet.licenseNumber && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-500">License Number</Label>
              <p className="text-gray-900">{vet.licenseNumber}</p>
            </div>
          )}

          {vet.documents && vet.documents.length > 0 && (
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-500 mb-2 block">Documents</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {vet.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{doc.name || `Document ${idx + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VeterinarianManagement({ onNavigate }: VeterinarianManagementProps) {
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'blocked' | 'active'>('all');
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

  const [vetDetailsDialog, setVetDetailsDialog] = useState<{
    isOpen: boolean;
    vet: Veterinarian | null;
  }>({
    isOpen: false,
    vet: null,
  });

  useEffect(() => {
    loadVets();
  }, []);

  const filteredVets = useMemo(() => {
    let filtered = [...vets];

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.licenseNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((v) => {
        switch (statusFilter) {
          case 'pending':
            return !v.isApproved && !v.isRejected;
          case 'approved':
            return v.isApproved === true;
          case 'rejected':
            return v.isRejected === true;
          case 'blocked':
            return v.isBlocked === true;
          case 'active':
            return !v.isBlocked;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [vets, searchTerm, statusFilter]);

  const loadVets = async () => {
    try {
      setLoading(true);
      const list = await authService.getAllVeterinarians();
      setVets(list);
    } catch (error) {
      console.error('Failed to load veterinarians:', error);
      alert('Failed to load veterinarians');
    } finally {
      setLoading(false);
    }
  };

  const handleVetAction = async (
    vetId: string,
    action: 'approve' | 'reject' | 'block' | 'unblock' | 'delete',
    reason?: string
  ) => {
    try {
      setActionLoading(vetId);
      switch (action) {
        case 'approve':
          await authService.approveVeterinarian(vetId);
          break;
        case 'reject':
          await authService.rejectVeterinarian(vetId, reason || 'Not eligible');
          break;
        case 'block':
          await authService.blockVeterinarian(vetId, reason || 'Administrative action');
          break;
        case 'unblock':
          await authService.unblockVeterinarian(vetId);
          break;
        case 'delete':
          await authService.deleteVeterinarian(vetId);
          break;
      }
      await loadVets();
      alert(`Veterinarian ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} veterinarian:`, error);
      alert(`Failed to ${action} veterinarian`);
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
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, reason: '' }));
  };

  const confirmAction = () => {
    confirmDialog.action();
    closeConfirmDialog();
  };

  const handleViewVet = (vet: Veterinarian) => {
    setVetDetailsDialog({ isOpen: true, vet });
  };

  const handleApproveVet = (vet: Veterinarian) => {
    openConfirmDialog(
      'Approve Veterinarian',
      `Approve ${vet.name}? They will be able to login and access veterinarian features.`,
      () => handleVetAction(vet._id, 'approve'),
      { confirmText: 'Approve' }
    );
  };

  const handleRejectVet = (vet: Veterinarian) => {
    openConfirmDialog(
      'Reject Veterinarian',
      `Reject ${vet.name}'s registration? They will not be able to login as a vet.`,
      () => handleVetAction(vet._id, 'reject', confirmDialog.reason),
      { requiresReason: true, confirmText: 'Reject', confirmVariant: 'destructive' }
    );
  };

  const handleBlockVet = (vet: Veterinarian) => {
    openConfirmDialog(
      'Block Veterinarian',
      `Block ${vet.name}? They will not be able to login or use the platform.`,
      () => handleVetAction(vet._id, 'block', confirmDialog.reason),
      { requiresReason: true, confirmText: 'Block', confirmVariant: 'destructive' }
    );
  };

  const handleUnblockVet = (vet: Veterinarian) => {
    openConfirmDialog(
      'Unblock Veterinarian',
      `Unblock ${vet.name}? They will regain access to the platform.`,
      () => handleVetAction(vet._id, 'unblock'),
      { confirmText: 'Unblock' }
    );
  };

  const handleDeleteVet = (vet: Veterinarian) => {
    openConfirmDialog(
      'Delete Veterinarian',
      `Permanently delete ${vet.name}? This cannot be undone.`,
      () => handleVetAction(vet._id, 'delete'),
      { confirmText: 'Delete', confirmVariant: 'destructive' }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading veterinarians...</p>
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
                <Stethoscope className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Veterinarian Management</h1>
                  <p className="text-sm text-gray-500">{filteredVets.length} veterinarians found</p>
                </div>
              </div>
            </div>

            <Button onClick={loadVets} variant="outline">
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
                <Label className="block text-sm font-medium text-gray-700 mb-2">Search Veterinarians</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or license..."
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
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    Total: {vets.length}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    Pending: {vets.filter((v) => !v.isApproved && !v.isRejected).length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    Approved: {vets.filter((v) => v.isApproved).length}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Rejected: {vets.filter((v) => v.isRejected).length}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    Blocked: {vets.filter((v) => v.isBlocked).length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5" />
              <span>All Veterinarians</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVets.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No veterinarians found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinarian</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVets.map((vet) => (
                      <tr key={vet._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vet.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{vet.licenseNumber || 'No license'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{vet.email}</div>
                            <div className="text-xs text-gray-500">{vet.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            <Badge className={vet.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {vet.isBlocked ? (
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
                            <Badge className={vet.isApproved ? 'bg-green-100 text-green-800' : (vet.isRejected ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800')}>
                              {vet.isApproved ? 'Approved' : (vet.isRejected ? 'Rejected' : 'Pending')}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vet.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewVet(vet)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>

                            {!vet.isApproved && !vet.isRejected && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveVet(vet)}
                                disabled={actionLoading === vet._id}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                {actionLoading === vet._id ? (
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                Approve
                              </Button>
                            )}

                            {!vet.isApproved && !vet.isRejected && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectVet(vet)}
                                disabled={actionLoading === vet._id}
                                className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                              >
                                {actionLoading === vet._id ? (
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                )}
                                Reject
                              </Button>
                            )}

                            {vet.isBlocked ? (
                              <Button
                                size="sm"
                                onClick={() => handleUnblockVet(vet)}
                                disabled={actionLoading === vet._id}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                {actionLoading === vet._id ? (
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
                                onClick={() => handleBlockVet(vet)}
                                disabled={actionLoading === vet._id}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                {actionLoading === vet._id ? (
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
                              onClick={() => handleDeleteVet(vet)}
                              disabled={actionLoading === vet._id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              {actionLoading === vet._id ? (
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
        onReasonChange={(reason) => setConfirmDialog((prev) => ({ ...prev, reason }))}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.confirmVariant}
      />

      {/* Vet Details Dialog */}
      <VetDetailsDialog
        isOpen={vetDetailsDialog.isOpen}
        vet={vetDetailsDialog.vet}
        onClose={() => setVetDetailsDialog({ isOpen: false, vet: null })}
      />
    </div>
  );
}
