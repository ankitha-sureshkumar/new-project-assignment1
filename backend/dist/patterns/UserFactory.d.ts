import { User } from '../classes/User';
import { Veterinarian, ConsultationFeeRange } from '../classes/Veterinarian';
import { BaseUser } from '../classes/BaseUser';
export interface IUserFactory {
    createUser(userData: any): Promise<BaseUser>;
    validateUserData(userData: any): {
        isValid: boolean;
        errors: string[];
    };
}
export declare class PetParentFactory implements IUserFactory {
    createUser(userData: {
        name: string;
        email: string;
        password: string;
        contact: string;
        address: string;
        petOwnership?: string;
        preferredContact?: 'email' | 'phone' | 'both';
        profilePicture?: string;
    }): Promise<User>;
    validateUserData(userData: any): {
        isValid: boolean;
        errors: string[];
    };
}
export declare class VeterinarianFactory implements IUserFactory {
    createUser(vetData: {
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
    }): Promise<Veterinarian>;
    validateUserData(vetData: any): {
        isValid: boolean;
        errors: string[];
    };
}
export declare class UserFactorySelector {
    static getFactory(userType: 'user' | 'veterinarian'): IUserFactory;
    static createUser(userType: 'user' | 'veterinarian', userData: any): Promise<BaseUser>;
    static validateUserData(userType: 'user' | 'veterinarian', userData: any): {
        isValid: boolean;
        errors: string[];
    };
}
export declare class RegistrationService {
    static registerUser(userType: 'user' | 'veterinarian', userData: any): Promise<BaseUser>;
    static validateRegistrationData(userType: 'user' | 'veterinarian', userData: any): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    static isEmailAvailable(email: string): Promise<boolean>;
}
//# sourceMappingURL=UserFactory.d.ts.map