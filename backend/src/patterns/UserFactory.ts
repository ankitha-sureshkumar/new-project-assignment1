import { User } from '../classes/User';
import { Veterinarian, ConsultationFeeRange } from '../classes/Veterinarian';
import { BaseUser } from '../classes/BaseUser';
import { v4 as uuidv4 } from 'uuid';

/**
 * Factory Pattern Implementation
 * Creates User and Veterinarian objects based on registration data
 */

// Abstract factory interface
export interface IUserFactory {
  createUser(userData: any): Promise<BaseUser>;
  validateUserData(userData: any): { isValid: boolean; errors: string[] };
}

// Concrete factory for creating Users (Pet Parents)
export class PetParentFactory implements IUserFactory {
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    contact: string;
    address: string;
    petOwnership?: string;
    preferredContact?: 'email' | 'phone' | 'both';
    profilePicture?: string;
  }): Promise<User> {
    // Validate data before creating user
    const validation = this.validateUserData(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate unique ID
    const userId = uuidv4();

    // Hash password (this would be done in the BaseUser constructor)
    const user = User.create({
      id: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      contact: userData.contact,
      address: userData.address,
      petOwnership: userData.petOwnership || '',
      preferredContact: userData.preferredContact || 'email',
      profilePicture: userData.profilePicture
    });

    return user;
  }

  validateUserData(userData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email address is required');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!userData.contact || userData.contact.trim().length < 10) {
      errors.push('Valid contact number is required');
    }

    if (!userData.address || userData.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long');
    }

    // Optional field validation
    if (userData.preferredContact) {
      const validPreferences = ['email', 'phone', 'both'];
      if (!validPreferences.includes(userData.preferredContact)) {
        errors.push('Preferred contact must be email, phone, or both');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Concrete factory for creating Veterinarians
export class VeterinarianFactory implements IUserFactory {
  async createUser(vetData: {
    name: string;
    email: string;
    password: string;
    contact: string;
    specialization: string;
    experience: string;
    consultationFeeRange: ConsultationFeeRange;
    hospitalsServed?: string;
    licenseNumber?: string;
    profilePicture?: string;
  }): Promise<Veterinarian> {
    // Validate data before creating veterinarian
    const validation = this.validateUserData(vetData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate unique ID
    const vetId = uuidv4();

    // Create veterinarian instance
    const veterinarian = Veterinarian.create({
      id: vetId,
      name: vetData.name,
      email: vetData.email,
      password: vetData.password,
      contact: vetData.contact,
      specialization: vetData.specialization,
      experience: vetData.experience,
      consultationFeeRange: vetData.consultationFeeRange,
      hospitalsServed: vetData.hospitalsServed || '',
      licenseNumber: vetData.licenseNumber,
      profilePicture: vetData.profilePicture
    });

    return veterinarian;
  }

  validateUserData(vetData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Common validation
    if (!vetData.name || vetData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!vetData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vetData.email)) {
      errors.push('Valid email address is required');
    }

    if (!vetData.password || vetData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!vetData.contact || vetData.contact.trim().length < 10) {
      errors.push('Valid contact number is required');
    }

    // Veterinarian-specific validation
    const validSpecializations = [
      'General Practice', 'Surgery', 'Dental Care', 'Emergency Care',
      'Dermatology', 'Cardiology', 'Orthopedics'
    ];

    if (!vetData.specialization || !validSpecializations.includes(vetData.specialization)) {
      errors.push('Valid specialization is required');
    }

    if (!vetData.experience || vetData.experience.trim().length < 1) {
      errors.push('Experience information is required');
    }

    // Consultation fee validation
    if (!vetData.consultationFeeRange) {
      errors.push('Consultation fee range is required');
    } else {
      const { min, max } = vetData.consultationFeeRange;
      if (!min || !max || min < 10 || max <= min) {
        errors.push('Valid consultation fee range is required (min >= $10, max > min)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Factory selector - determines which factory to use based on user type
export class UserFactorySelector {
  static getFactory(userType: 'user' | 'veterinarian'): IUserFactory {
    switch (userType) {
      case 'user':
        return new PetParentFactory();
      case 'veterinarian':
        return new VeterinarianFactory();
      default:
        throw new Error(`Unknown user type: ${userType}`);
    }
  }

  static async createUser(userType: 'user' | 'veterinarian', userData: any): Promise<BaseUser> {
    const factory = this.getFactory(userType);
    return await factory.createUser(userData);
  }

  static validateUserData(userType: 'user' | 'veterinarian', userData: any): { isValid: boolean; errors: string[] } {
    const factory = this.getFactory(userType);
    return factory.validateUserData(userData);
  }
}

// Usage examples and helper functions
export class RegistrationService {
  static async registerUser(userType: 'user' | 'veterinarian', userData: any): Promise<BaseUser> {
    try {
      // Use factory to create user
      const user = await UserFactorySelector.createUser(userType, userData);
      
      // Additional business logic can be added here
      console.log(`Created ${userType}: ${user.email}`);
      
      // Save to database (would integrate with your existing models)
      // await this.saveToDatabase(user);
      
      return user;
    } catch (error) {
      console.error(`Registration failed for ${userType}:`, error);
      throw error;
    }
  }

  static async validateRegistrationData(userType: 'user' | 'veterinarian', userData: any): Promise<{ isValid: boolean; errors: string[] }> {
    return UserFactorySelector.validateUserData(userType, userData);
  }

  // Helper method to check if email already exists (would integrate with database)
  static async isEmailAvailable(email: string): Promise<boolean> {
    // This would check both User and Veterinarian collections
    // return !await User.findOne({ email }) && !await Veterinarian.findOne({ email });
    return true; // Placeholder
  }
}
