// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Base user interface
export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  contact?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pet parent interface
export interface PetParent extends BaseUser {
  role: 'user';
  address: string;
  petOwnership?: string;
  preferredContact?: 'email' | 'phone' | 'both';
}

// Veterinarian interface
export interface Veterinarian extends BaseUser {
  role: 'veterinarian';
  specialization: string;
  experience: string;
  licenseNumber?: string;
  consultationFeeRange?: {
    min: number;
    max: number;
  };
  hospitalsServed?: string;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
  }>;
  certifications?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  rating?: number;
  totalReviews?: number;
  isApproved?: boolean;
  isRejected?: boolean;
  isBlocked?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  blockReason?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

// Union type for User (can be either pet parent or veterinarian)
export type User = PetParent | Veterinarian;

// Pet types
export interface Pet {
  _id: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: string;
  weight?: number;
  owner: string;
  medicalHistory: string;
  vaccinations: string;
  photos: string[];
  lastVisit?: string;
  allergies?: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }>;
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Appointment types
export interface Appointment {
  _id: string;
  user: string | User;
  veterinarian: string | User;
  pet: string | Pet;
  
  date: string;
  time: string;
  
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  
  consultationFee?: number;
  reason: string;
  comments?: string;
  veterinarianNotes?: string;
  
  // Completion details
  diagnosis?: string;
  treatment?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  followUpRequired?: boolean;
  followUpDate?: string;
  
  // Rating system
  rating?: number;
  review?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  _id: string;
  recipient: string;
  type: 'appointment_request' | 'appointment_approved' | 'appointment_confirmed' | 'appointment_completed' | 'appointment_cancelled' | 'appointment_rejected' | 'reminder' | 'system';
  title: string;
  message: string;
  relatedAppointment?: string;
  relatedUser?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'veterinarian';
  contact: string;
  
  // User-specific
  address?: string;
  petOwnership?: string;
  preferredContact?: 'email' | 'phone' | 'both';
  
  // Veterinarian-specific
  specialization?: string;
  experience?: string;
  consultationFeeRange?: {
    min: number;
    max: number;
  };
  hospitalsServed?: string;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
  }>;
  certifications?: string[];
  
  // Common optional fields
  profilePicture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Admin types
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
  refreshToken: string;
}

// Enhanced user types with admin management fields
export interface UserWithAdminFields extends PetParent {
  isBlocked: boolean;
  blockedAt?: string;
  blockedBy?: string;
  blockReason?: string;
}

export interface VeterinarianWithAdminFields extends Veterinarian {
  isApproved: boolean;
  isBlocked: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  blockReason?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

// Admin management actions
export interface UserActionRequest {
  userId: string;
  action: 'block' | 'unblock' | 'delete';
  reason?: string;
}

export interface VeterinarianActionRequest {
  veterinarianId: string;
  action: 'approve' | 'reject' | 'block' | 'unblock' | 'delete';
  reason?: string;
}

// Admin dashboard stats
export interface AdminDashboardStats {
  totalUsers: number;
  totalVeterinarians: number;
  pendingVeterinarians: number;
  approvedVeterinarians: number;
  rejectedVeterinarians: number;
  blockedUsers: number;
  blockedVeterinarians: number;
  totalAppointments: number;
  recentRegistrations: {
    users: UserWithAdminFields[];
    veterinarians: VeterinarianWithAdminFields[];
  };
}