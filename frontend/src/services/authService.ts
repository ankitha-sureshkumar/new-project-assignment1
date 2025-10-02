import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse, AdminLoginRequest, AdminAuthResponse, Admin, AdminDashboardStats, UserWithAdminFields, VeterinarianWithAdminFields, UserActionRequest, VeterinarianActionRequest } from '../types';

// Dashboard Summary interface
interface DashboardSummary {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalPets?: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

class AuthService {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting registration...', { email: data.email, role: data.role });
      
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      console.log('📝 Registration response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // Store token and user in localStorage (no refresh token like admin)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userType', 'user');
        
        console.log('✅ Registration successful:', user.email);
        return { token, user };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Extract validation error messages
          const validationErrors = responseData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
          throw new Error(errorMsg);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Registration failed');
      }
    }
  }

  // Login user (pet parent) - Simple approach like admin
  async loginUser(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting user login...', { email: data.email });
      
      const response = await api.post<ApiResponse<AuthResponse>>('/users/login', data);
      
      console.log('📝 User login response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // Check if user is blocked
        if (user.isBlocked) {
          throw new Error('Your account has been blocked. Please contact support for assistance.');
        }
        
        // Ensure the user has the correct role
        const userWithRole = { ...user, role: 'user' as const };
        
        // Store token and user in localStorage (no refresh token like admin)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('userType', 'user');
        
        console.log('✅ User login successful:', userWithRole.email);
        return { token, user: userWithRole };
      }
      
      throw new Error(response.data.message || 'User login failed');
    } catch (error: any) {
      console.error('❌ User login error:', error);
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Extract validation error messages
          const validationErrors = responseData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
          throw new Error(errorMsg);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'User login failed');
      }
    }
  }

  // Login veterinarian
  async loginVeterinarian(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting veterinarian login...', { email: data.email });
      
      const response = await api.post<ApiResponse<AuthResponse>>('/veterinarians/login', data);
      
      console.log('📝 Veterinarian login response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, veterinarian } = response.data.data;
        
        // Check if veterinarian is approved
        if (veterinarian.approvalStatus !== 'approved') {
          const statusMessage = {
            pending: 'Your account is still pending approval. Please wait for admin approval before logging in.',
            rejected: 'Your account has been rejected. Please contact support for more information.'
          }[veterinarian.approvalStatus] || 'Your account is not approved for login.';
          
          throw new Error(statusMessage);
        }
        
        // Check if veterinarian is blocked
        if (veterinarian.isBlocked) {
          throw new Error('Your account has been blocked. Please contact support for assistance.');
        }
        
        // Ensure the veterinarian has the correct role
        const veterinarianWithRole = { ...veterinarian, role: 'veterinarian' as const };
        
        // Store token and veterinarian data in localStorage (no refresh token like admin)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(veterinarianWithRole));
        localStorage.setItem('userType', 'veterinarian');
        
        console.log('✅ Veterinarian login successful:', veterinarianWithRole.email);
        return { user: veterinarianWithRole, token };
      }
      
      throw new Error(response.data.message || 'Veterinarian login failed');
    } catch (error: any) {
      console.error('❌ Veterinarian login error:', error);
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Extract validation error messages
          const validationErrors = responseData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
          throw new Error(errorMsg);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Veterinarian login failed');
      }
    }
  }

  // Generic login method (for backward compatibility) - tries both endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // First try to login as user
      try {
        return await this.loginUser(data);
      } catch (userError) {
        console.log('User login failed, trying veterinarian login...');
      }
      
      // If user login fails, try veterinarian
      try {
        return await this.loginVeterinarian(data);
      } catch (vetError) {
        console.log('Veterinarian login also failed.');
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Logout user - Simple approach like admin
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    // Optionally notify other tabs/windows about logout
    window.dispatchEvent(new Event('logout'));
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Simple profile getter - just return cached data like admin approach
  getProfile(): User | null {
    return this.getCurrentUser();
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      
      // Update localStorage with updated user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.put<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password');
    }
  }

  // Get all veterinarians (public)
  async getVeterinarians(filters?: { specialization?: string; available?: boolean }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.available) params.append('available', 'true');
    
    const response = await api.get<ApiResponse<{ veterinarians: User[] }>>(`/auth/veterinarians?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.veterinarians;
    }
    
    throw new Error(response.data.message || 'Failed to get veterinarians');
  }

  // Get veterinarian by ID (public)
  async getVeterinarianById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<{ veterinarian: User }>>(`/auth/veterinarians/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.veterinarian;
    }
    
    throw new Error(response.data.message || 'Failed to get veterinarian');
  }

  // Register user (pet parent) with file upload
  async registerUser(formData: FormData): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting user registration...');
      
      const response = await api.post<ApiResponse<AuthResponse>>('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('📝 User registration response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // Ensure the user has the correct role
        const userWithRole = { ...user, role: 'user' as const };
        
        // Store token and user in localStorage (no refresh token like admin)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('userType', 'user');
        
        console.log('✅ User registration successful:', userWithRole.email);
        return { token, user: userWithRole };
      }
      
      throw new Error(response.data.message || 'User registration failed');
    } catch (error: any) {
      console.error('❌ User registration error:', error);
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Extract validation error messages
          const validationErrors = responseData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
          throw new Error(errorMsg);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'User registration failed');
      }
    }
  }

  // Register veterinarian with file upload
  async registerVeterinarian(formData: FormData): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting veterinarian registration...');
      
      const response = await api.post<ApiResponse<AuthResponse>>('/veterinarians/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('📝 Veterinarian registration response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, veterinarian } = response.data.data;
        
        // Ensure the veterinarian has the correct role
        const veterinarianWithRole = { ...veterinarian, role: 'veterinarian' as const };
        
        // Store token and veterinarian data in localStorage (no refresh token like admin)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(veterinarianWithRole));
        localStorage.setItem('userType', 'veterinarian');
        
        console.log('✅ Veterinarian registration successful:', veterinarianWithRole.email);
        return { user: veterinarianWithRole, token };
      }
      
      throw new Error(response.data.message || 'Veterinarian registration failed');
    } catch (error: any) {
      console.error('❌ Veterinarian registration error:', error);
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          // Extract validation error messages
          const validationErrors = responseData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
          throw new Error(errorMsg);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Veterinarian registration failed');
      }
    }
  }

  async getVeterinarianDashboard(): Promise<DashboardSummary> {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/veterinarian');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get veterinarian dashboard');
  }

  async getUserDashboard(): Promise<DashboardSummary> {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/user');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get user dashboard');
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ===== ADMIN METHODS =====
  
  // Admin login
  async loginAdmin(data: AdminLoginRequest): Promise<AdminAuthResponse> {
    try {
      console.log('🔐 Attempting admin login...', { email: data.email });
      
      const response = await api.post<ApiResponse<AdminAuthResponse>>('/admin/login', data);
      
      console.log('📝 Admin login response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, admin } = response.data.data;
        
        // Store admin token and admin data in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        localStorage.setItem('userType', 'admin');
        
        console.log('✅ Admin login successful:', admin.email);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Admin login failed');
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      
      if (error.response) {
        const responseData = error.response.data;
        const errorMsg = responseData?.message || `Server error: ${error.response.status}`;
        throw new Error(errorMsg);
      } else if (error.request) {
        throw new Error('Network error: Could not connect to server.');
      } else {
        throw new Error(error.message || 'Admin login failed');
      }
    }
  }

  // Admin logout
  logoutAdmin(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('userType');
  }

  // Get current admin from localStorage
  getCurrentAdmin(): Admin | null {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      try {
        return JSON.parse(adminStr);
      } catch (error) {
        console.error('Error parsing admin from localStorage:', error);
        localStorage.removeItem('admin');
      }
    }
    return null;
  }

  // Check if admin is authenticated
  isAdminAuthenticated(): boolean {
    const token = localStorage.getItem('adminToken');
    const admin = this.getCurrentAdmin();
    const userType = localStorage.getItem('userType');
    return !!(token && admin && userType === 'admin');
  }

  // Get admin token from localStorage
  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  // Get admin dashboard stats
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get dashboard stats');
  }

  // Get all users with admin fields
  async getAllUsers(): Promise<UserWithAdminFields[]> {
    const response = await api.get<ApiResponse<{ users: UserWithAdminFields[] }>>('/admin/users', {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data.users;
    }
    
    throw new Error(response.data.message || 'Failed to get users');
  }

  // Get all veterinarians with admin fields
  async getAllVeterinarians(): Promise<VeterinarianWithAdminFields[]> {
    const response = await api.get<ApiResponse<{ veterinarians: VeterinarianWithAdminFields[] }>>('/admin/veterinarians', {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data.veterinarians;
    }
    
    throw new Error(response.data.message || 'Failed to get veterinarians');
  }

  // Perform user action (block/unblock/delete)
  async performUserAction(actionRequest: UserActionRequest): Promise<void> {
    const response = await api.post<ApiResponse>('/admin/users/action', actionRequest, {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'User action failed');
    }
  }

  // Perform veterinarian action (approve/reject/block/unblock/delete)
  async performVeterinarianAction(actionRequest: VeterinarianActionRequest): Promise<void> {
    const response = await api.post<ApiResponse>('/admin/veterinarians/action', actionRequest, {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Veterinarian action failed');
    }
  }

  // Update user details
  async updateUser(userId: string, updateData: Partial<UserWithAdminFields>): Promise<UserWithAdminFields> {
    const response = await api.put<ApiResponse<{ user: UserWithAdminFields }>>(`/admin/users/${userId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Failed to update user');
  }

  // Update veterinarian details
  async updateVeterinarian(veterinarianId: string, updateData: Partial<VeterinarianWithAdminFields>): Promise<VeterinarianWithAdminFields> {
    const response = await api.put<ApiResponse<{ veterinarian: VeterinarianWithAdminFields }>>(`/admin/veterinarians/${veterinarianId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${this.getAdminToken()}`
      }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data.veterinarian;
    }
    
    throw new Error(response.data.message || 'Failed to update veterinarian');
  }

  // === Individual User Action Methods ===
  
  // Block user
  async blockUser(userId: string, reason: string): Promise<void> {
    await this.performUserAction({ userId, action: 'block', reason });
  }
  
  // Unblock user
  async unblockUser(userId: string): Promise<void> {
    await this.performUserAction({ userId, action: 'unblock' });
  }
  
  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await this.performUserAction({ userId, action: 'delete' });
  }
  
  // === Individual Veterinarian Action Methods ===
  
  // Approve veterinarian
  async approveVeterinarian(veterinarianId: string): Promise<void> {
    await this.performVeterinarianAction({ veterinarianId, action: 'approve' });
  }
  
  // Reject veterinarian
  async rejectVeterinarian(veterinarianId: string, reason: string): Promise<void> {
    await this.performVeterinarianAction({ veterinarianId, action: 'reject', reason });
  }
  
  // Block veterinarian
  async blockVeterinarian(veterinarianId: string, reason: string): Promise<void> {
    await this.performVeterinarianAction({ veterinarianId, action: 'block', reason });
  }
  
  // Unblock veterinarian
  async unblockVeterinarian(veterinarianId: string): Promise<void> {
    await this.performVeterinarianAction({ veterinarianId, action: 'unblock' });
  }
  
  // Delete veterinarian
  async deleteVeterinarian(veterinarianId: string): Promise<void> {
    await this.performVeterinarianAction({ veterinarianId, action: 'delete' });
  }
}

export default new AuthService();
