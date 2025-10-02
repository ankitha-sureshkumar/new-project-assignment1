import { User } from '../classes/User';
import { Veterinarian } from '../classes/Veterinarian';
import { BaseUser } from '../classes/BaseUser';

/**
 * Proxy Pattern Implementation
 * Role-based access control for sensitive data and operations
 */

// Access permissions enum
export enum Permission {
  READ_OWN_DATA = 'read_own_data',
  READ_ALL_DATA = 'read_all_data',
  WRITE_OWN_DATA = 'write_own_data',
  WRITE_ALL_DATA = 'write_all_data',
  DELETE_OWN_DATA = 'delete_own_data',
  DELETE_ALL_DATA = 'delete_all_data',
  MANAGE_USERS = 'manage_users',
  MANAGE_VETERINARIANS = 'manage_veterinarians',
  VIEW_SENSITIVE_DATA = 'view_sensitive_data',
  APPROVE_APPOINTMENTS = 'approve_appointments',
  ACCESS_MEDICAL_RECORDS = 'access_medical_records',
  PRESCRIBE_MEDICATIONS = 'prescribe_medications'
}

// User context for access control
export interface UserContext {
  userId: string;
  role: 'user' | 'veterinarian' | 'admin';
  permissions: Permission[] | string[];
  isBlocked?: boolean;
  isApproved?: boolean;
}

// Interface for data access operations
export interface IDataAccessor {
  getUserData(userId: string, requestorContext: UserContext): Promise<any>;
  getUserById(userId: string): Promise<any>;
  getAllUsers(): Promise<any[]>;
  getUserAppointments(userId: string, requestorContext: UserContext): Promise<any[]>;
  getVeterinarianData(vetId: string, requestorContext: UserContext): Promise<any>;
  getVeterinarianById(vetId: string): Promise<any>;
  getAllVeterinarians(): Promise<any[]>;
  getMedicalRecords(petId: string, requestorContext: UserContext): Promise<any>;
  updateUserData(userId: string, data: any, requestorContext: UserContext): Promise<any>;
  deleteUser(userId: string, requestorContext: UserContext): Promise<void>;
}

// Real data accessor (the actual service being protected)
export class RealDataAccessor implements IDataAccessor {
  async getUserData(userId: string, requestorContext: UserContext): Promise<any> {
    // Direct database access - fetch from User model
    const UserModel = require('../models/User').default;
    const user = await UserModel.findById(userId).select('-password');
    return user ? user.toObject() : null;
  }

  async getUserById(userId: string): Promise<any> {
    console.log(`Accessing user by ID: ${userId}`);
    // This would integrate with your MongoDB User model
    const UserModel = require('../models/User').default;
    const user = await UserModel.findById(userId).select('-password');
    return user ? user.toObject() : null;
  }

  async getAllUsers(): Promise<any[]> {
    console.log('Accessing all users');
    const UserModel = require('../models/User').default;
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
    return users.map((user: any) => user.toObject());
  }

  async getVeterinarianById(vetId: string): Promise<any> {
    console.log(`Accessing veterinarian by ID: ${vetId}`);
    const VeterinarianModel = require('../models/Veterinarian').default;
    const vet = await VeterinarianModel.findById(vetId).select('-password');
    return vet ? vet.toObject() : null;
  }

  async getAllVeterinarians(): Promise<any[]> {
    console.log('Accessing all veterinarians');
    const VeterinarianModel = require('../models/Veterinarian').default;
    const vets = await VeterinarianModel.find().select('-password').sort({ createdAt: -1 });
    return vets.map((vet: any) => vet.toObject());
  }

  async getUserAppointments(userId: string, requestorContext: UserContext): Promise<any[]> {
    console.log(`Accessing appointments for user ${userId}`);
    const AppointmentModel = require('../models/Appointment').default;
    return AppointmentModel.find({ user: userId })
      .select('date time status reason veterinarian pet createdAt updatedAt')
      .populate('veterinarian', 'name specialization')
      .populate('pet', 'name type breed')
      .sort({ date: -1 })
      .limit(50);
  }

  async getVeterinarianData(vetId: string, requestorContext: UserContext): Promise<any> {
    console.log(`Accessing veterinarian data for ${vetId}`);
    return {
      id: vetId,
      name: 'Dr. Smith',
      specialization: 'General Practice',
      // ... other vet data
    };
  }

  async getMedicalRecords(petId: string, requestorContext: UserContext): Promise<any> {
    console.log(`Accessing medical records for pet ${petId}`);
    return {
      petId,
      records: [
        { date: '2024-01-10', diagnosis: 'Routine checkup', treatment: 'Vaccinations' }
        // ... other records
      ]
    };
  }

  async updateUserData(userId: string, data: any, requestorContext: UserContext): Promise<any> {
    console.log(`Updating user data for ${userId}`);
    // Direct database update
    return { ...data, id: userId, updatedAt: new Date() };
  }

  async deleteUser(userId: string, requestorContext: UserContext): Promise<void> {
    console.log(`Deleting user ${userId}`);
    // Direct database deletion
  }
}

// Proxy class that adds access control
export class SecureDataAccessProxy implements IDataAccessor {
  private realAccessor: RealDataAccessor;
  private accessLogger: AccessLogger;

  constructor(realAccessor: RealDataAccessor) {
    this.realAccessor = realAccessor;
    this.accessLogger = new AccessLogger();
  }

  async getUserData(userId: string, requestorContext: UserContext): Promise<any> {
    // Access control checks
    if (!this.canAccessUserData(userId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getUserData', userId);
      throw new Error('Access denied: Insufficient permissions to access user data');
    }

    this.accessLogger.logAccess(requestorContext.userId, 'getUserData', userId);

    // Get data from real accessor
    const userData = await this.realAccessor.getUserData(userId, requestorContext);

    // Filter sensitive data based on permissions
    return this.filterSensitiveUserData(userData, requestorContext);
  }

  async getUserAppointments(userId: string, requestorContext: UserContext): Promise<any[]> {
    if (!this.canAccessAppointments(userId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getUserAppointments', userId);
      throw new Error('Access denied: Cannot access appointment data');
    }

    this.accessLogger.logAccess(requestorContext.userId, 'getUserAppointments', userId);

    const appointments = await this.realAccessor.getUserAppointments(userId, requestorContext);

    // Filter appointment data based on role
    return this.filterAppointmentData(appointments, requestorContext);
  }

  async getVeterinarianData(vetId: string, requestorContext: UserContext): Promise<any> {
    if (!this.canAccessVeterinarianData(vetId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getVeterinarianData', vetId);
      throw new Error('Access denied: Cannot access veterinarian data');
    }

    this.accessLogger.logAccess(requestorContext.userId, 'getVeterinarianData', vetId);

    const vetData = await this.realAccessor.getVeterinarianData(vetId, requestorContext);

    return this.filterVeterinarianData(vetData, requestorContext);
  }

  async getMedicalRecords(petId: string, requestorContext: UserContext): Promise<any> {
    if (!this.canAccessMedicalRecords(petId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getMedicalRecords', petId);
      throw new Error('Access denied: Cannot access medical records');
    }

    this.accessLogger.logAccess(requestorContext.userId, 'getMedicalRecords', petId);

    const records = await this.realAccessor.getMedicalRecords(petId, requestorContext);

    return this.filterMedicalRecords(records, requestorContext);
  }

  async updateUserData(userId: string, data: any, requestorContext: UserContext): Promise<any> {
    if (!this.canUpdateUserData(userId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'updateUserData', userId);
      throw new Error('Access denied: Cannot update user data');
    }

    // Validate data before update
    const sanitizedData = this.sanitizeUpdateData(data, requestorContext);

    this.accessLogger.logAccess(requestorContext.userId, 'updateUserData', userId);

    return await this.realAccessor.updateUserData(userId, sanitizedData, requestorContext);
  }

  async deleteUser(userId: string, requestorContext: UserContext): Promise<void> {
    if (!this.canDeleteUser(userId, requestorContext)) {
      this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'deleteUser', userId);
      throw new Error('Access denied: Cannot delete user');
    }

    this.accessLogger.logAccess(requestorContext.userId, 'deleteUser', userId);

    await this.realAccessor.deleteUser(userId, requestorContext);
  }

  async getUserById(userId: string): Promise<any> {
    // Note: This method assumes the context is already validated
    // In practice, you'd pass context here too
    console.log(`Secure access: getUserById ${userId}`);
    return await this.realAccessor.getUserById(userId);
  }

  async getAllUsers(): Promise<any[]> {
    // Note: This method should have context validation
    console.log('Secure access: getAllUsers');
    return await this.realAccessor.getAllUsers();
  }

  async getVeterinarianById(vetId: string): Promise<any> {
    console.log(`Secure access: getVeterinarianById ${vetId}`);
    return await this.realAccessor.getVeterinarianById(vetId);
  }

  async getAllVeterinarians(): Promise<any[]> {
    console.log('Secure access: getAllVeterinarians');
    return await this.realAccessor.getAllVeterinarians();
  }

  // Access control methods
  private canAccessUserData(userId: string, context: UserContext): boolean {
    // Blocked users cannot access any data
    if (context.isBlocked) return false;

    // Users can access their own data
    if (context.userId === userId && context.permissions.includes(Permission.READ_OWN_DATA)) {
      return true;
    }

    // Admins can access all user data
    if (context.role === 'admin' && context.permissions.includes(Permission.READ_ALL_DATA)) {
      return true;
    }

    // Approved veterinarians can access limited user data for their patients
    if (context.role === 'veterinarian' && 
        context.isApproved && 
        context.permissions.includes(Permission.ACCESS_MEDICAL_RECORDS)) {
      // Would need to check if this user is the vet's patient
      return true; // Simplified for demo
    }

    return false;
  }

  private canAccessAppointments(userId: string, context: UserContext): boolean {
    if (context.isBlocked) return false;

    // Users can access their own appointments
    if (context.userId === userId) return true;

    // Veterinarians can access appointments for their patients
    if (context.role === 'veterinarian' && context.isApproved) return true;

    // Admins can access all appointments
    if (context.role === 'admin') return true;

    return false;
  }

  private canAccessVeterinarianData(vetId: string, context: UserContext): boolean {
    if (context.isBlocked) return false;

    // Veterinarians can access their own data
    if (context.userId === vetId && context.role === 'veterinarian') return true;

    // Users can access basic vet data (public information)
    if (context.role === 'user') return true;

    // Admins can access all vet data
    if (context.role === 'admin') return true;

    return false;
  }

  private canAccessMedicalRecords(petId: string, context: UserContext): boolean {
    if (context.isBlocked) return false;

    // Only approved veterinarians and admins can access medical records
    if (context.role === 'veterinarian' && 
        context.isApproved && 
        context.permissions.includes(Permission.ACCESS_MEDICAL_RECORDS)) {
      return true;
    }

    if (context.role === 'admin' && 
        context.permissions.includes(Permission.VIEW_SENSITIVE_DATA)) {
      return true;
    }

    // Pet owners can access their pet's records
    if (context.role === 'user') {
      // Would need to check if this user owns the pet
      return true; // Simplified for demo
    }

    return false;
  }

  private canUpdateUserData(userId: string, context: UserContext): boolean {
    if (context.isBlocked) return false;

    // Users can update their own data
    if (context.userId === userId && context.permissions.includes(Permission.WRITE_OWN_DATA)) {
      return true;
    }

    // Admins can update any user data
    if (context.role === 'admin' && context.permissions.includes(Permission.WRITE_ALL_DATA)) {
      return true;
    }

    return false;
  }

  private canDeleteUser(userId: string, context: UserContext): boolean {
    if (context.isBlocked) return false;

    // Only admins can delete users
    if (context.role === 'admin' && context.permissions.includes(Permission.DELETE_ALL_DATA)) {
      return true;
    }

    // Users can delete their own account
    if (context.userId === userId && context.permissions.includes(Permission.DELETE_OWN_DATA)) {
      return true;
    }

    return false;
  }

  // Data filtering methods
  private filterSensitiveUserData(userData: any, context: UserContext): any {
    const filtered = { ...userData };

    // Remove sensitive fields based on context
    if (context.role !== 'admin' && !context.permissions.includes(Permission.VIEW_SENSITIVE_DATA)) {
      delete filtered.password;
      delete filtered.resetPasswordToken;
      delete filtered.emailVerificationToken;
    }

    // Remove personal details for non-owners
    if (context.userId !== userData.id && context.role !== 'admin') {
      delete filtered.phone;
      delete filtered.address;
      delete filtered.emergencyContact;
    }

    return filtered;
  }

  private filterAppointmentData(appointments: any[], context: UserContext): any[] {
    return appointments.map(appointment => {
      const filtered = { ...appointment };

      // Veterinarians see different data than users
      if (context.role === 'user') {
        delete filtered.veterinarianNotes;
        delete filtered.internalComments;
      }

      if (context.role === 'veterinarian') {
        delete filtered.userPrivateNotes;
      }

      return filtered;
    });
  }

  private filterVeterinarianData(vetData: any, context: UserContext): any {
    const filtered = { ...vetData };

    // Hide sensitive vet information from regular users
    if (context.role === 'user') {
      delete filtered.earnings;
      delete filtered.personalNotes;
      delete filtered.adminComments;
      delete filtered.licenseDetails;
    }

    // Show limited data to other veterinarians
    if (context.role === 'veterinarian' && context.userId !== vetData.id) {
      delete filtered.earnings;
      delete filtered.personalNotes;
    }

    return filtered;
  }

  private filterMedicalRecords(records: any, context: UserContext): any {
    if (context.role === 'admin') {
      return records; // Admins see everything
    }

    // Filter based on role
    const filtered = { ...records };
    
    if (context.role === 'user') {
      // Pet owners see basic information
      filtered.records = filtered.records?.map((record: any) => ({
        date: record.date,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        // Hide internal vet notes
      }));
    }

    return filtered;
  }

  private sanitizeUpdateData(data: any, context: UserContext): any {
    const sanitized = { ...data };

    // Remove fields that users shouldn't be able to update
    if (context.role !== 'admin') {
      delete sanitized.role;
      delete sanitized.permissions;
      delete sanitized.isApproved;
      delete sanitized.isBlocked;
      delete sanitized.createdAt;
      delete sanitized.updatedAt;
    }

    // Users can only update specific fields
    if (context.role === 'user') {
      const allowedFields = ['name', 'phone', 'address', 'preferredContact', 'petOwnership'];
      Object.keys(sanitized).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete sanitized[key];
        }
      });
    }

    return sanitized;
  }
}

// Access logging system
export class AccessLogger {
  private logs: AccessLog[] = [];

  logAccess(userId: string, operation: string, resourceId: string): void {
    const log: AccessLog = {
      userId,
      operation,
      resourceId,
      timestamp: new Date(),
      success: true
    };

    this.logs.push(log);
    console.log(`✅ Access granted: User ${userId} performed ${operation} on ${resourceId}`);
  }

  logUnauthorizedAccess(userId: string, operation: string, resourceId: string): void {
    const log: AccessLog = {
      userId,
      operation,
      resourceId,
      timestamp: new Date(),
      success: false,
      reason: 'Insufficient permissions'
    };

    this.logs.push(log);
    console.warn(`❌ Access denied: User ${userId} attempted ${operation} on ${resourceId}`);
  }

  getAccessLogs(userId?: string, operation?: string): AccessLog[] {
    let filteredLogs = this.logs;

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (operation) {
      filteredLogs = filteredLogs.filter(log => log.operation === operation);
    }

    return filteredLogs;
  }

  getUnauthorizedAttempts(): AccessLog[] {
    return this.logs.filter(log => !log.success);
  }
}

export interface AccessLog {
  userId: string;
  operation: string;
  resourceId: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
}

// Factory for creating secure proxies
export class ProxyFactory {
  static createSecureDataAccessor(): IDataAccessor {
    const realAccessor = new RealDataAccessor();
    return new SecureDataAccessProxy(realAccessor);
  }

  static createProxy(userContext: UserContext): IDataAccessor {
    const realAccessor = new RealDataAccessor();
    const secureProxy = new SecureDataAccessProxy(realAccessor);
    
    // Create a context-aware proxy that binds the user context
    return {
      getUserData: (userId: string) => secureProxy.getUserData(userId, userContext),
      getUserById: (userId: string) => secureProxy.getUserById(userId),
      getAllUsers: () => secureProxy.getAllUsers(),
      getUserAppointments: (userId: string) => secureProxy.getUserAppointments(userId, userContext),
      getVeterinarianData: (vetId: string) => secureProxy.getVeterinarianData(vetId, userContext),
      getVeterinarianById: (vetId: string) => secureProxy.getVeterinarianById(vetId),
      getAllVeterinarians: () => secureProxy.getAllVeterinarians(),
      getMedicalRecords: (petId: string) => secureProxy.getMedicalRecords(petId, userContext),
      updateUserData: (userId: string, data: any) => secureProxy.updateUserData(userId, data, userContext),
      deleteUser: (userId: string) => secureProxy.deleteUser(userId, userContext)
    };
  }

  static createUserContext(user: BaseUser): UserContext {
    return {
      userId: user.id,
      role: user.getRole(),
      permissions: this.getPermissionsForRole(user.getRole()),
      isBlocked: user.isBlocked,
      isApproved: user instanceof Veterinarian ? user.isApproved : true
    };
  }

  private static getPermissionsForRole(role: 'user' | 'veterinarian' | 'admin'): Permission[] {
    switch (role) {
      case 'user':
        return [
          Permission.READ_OWN_DATA,
          Permission.WRITE_OWN_DATA,
          Permission.DELETE_OWN_DATA
        ];
      case 'veterinarian':
        return [
          Permission.READ_OWN_DATA,
          Permission.WRITE_OWN_DATA,
          Permission.ACCESS_MEDICAL_RECORDS,
          Permission.APPROVE_APPOINTMENTS,
          Permission.PRESCRIBE_MEDICATIONS
        ];
      case 'admin':
        return [
          Permission.READ_ALL_DATA,
          Permission.WRITE_ALL_DATA,
          Permission.DELETE_ALL_DATA,
          Permission.MANAGE_USERS,
          Permission.MANAGE_VETERINARIANS,
          Permission.VIEW_SENSITIVE_DATA
        ];
      default:
        return [];
    }
  }
}

// Usage service that demonstrates the proxy pattern
export class SecureDataService {
  private dataAccessor: IDataAccessor;

  constructor() {
    this.dataAccessor = ProxyFactory.createSecureDataAccessor();
  }

  async getUserProfile(userId: string, requestor: BaseUser): Promise<any> {
    const context = ProxyFactory.createUserContext(requestor);
    return await this.dataAccessor.getUserData(userId, context);
  }

  async getUserAppointments(userId: string, requestor: BaseUser): Promise<any[]> {
    const context = ProxyFactory.createUserContext(requestor);
    return await this.dataAccessor.getUserAppointments(userId, context);
  }

  async updateUserProfile(userId: string, data: any, requestor: BaseUser): Promise<any> {
    const context = ProxyFactory.createUserContext(requestor);
    return await this.dataAccessor.updateUserData(userId, data, context);
  }
}

// All classes are already individually exported above
