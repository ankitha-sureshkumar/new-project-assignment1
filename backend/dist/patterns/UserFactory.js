"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = exports.UserFactorySelector = exports.VeterinarianFactory = exports.PetParentFactory = void 0;
const User_1 = require("../classes/User");
const Veterinarian_1 = require("../classes/Veterinarian");
const uuid_1 = require("uuid");
class PetParentFactory {
    async createUser(userData) {
        const validation = this.validateUserData(userData);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        const userId = (0, uuid_1.v4)();
        const user = User_1.User.create({
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
    validateUserData(userData) {
        const errors = [];
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
exports.PetParentFactory = PetParentFactory;
class VeterinarianFactory {
    async createUser(vetData) {
        const validation = this.validateUserData(vetData);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        const vetId = (0, uuid_1.v4)();
        const veterinarian = Veterinarian_1.Veterinarian.create({
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
    validateUserData(vetData) {
        const errors = [];
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
        if (!vetData.consultationFeeRange) {
            errors.push('Consultation fee range is required');
        }
        else {
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
exports.VeterinarianFactory = VeterinarianFactory;
class UserFactorySelector {
    static getFactory(userType) {
        switch (userType) {
            case 'user':
                return new PetParentFactory();
            case 'veterinarian':
                return new VeterinarianFactory();
            default:
                throw new Error(`Unknown user type: ${userType}`);
        }
    }
    static async createUser(userType, userData) {
        const factory = this.getFactory(userType);
        return await factory.createUser(userData);
    }
    static validateUserData(userType, userData) {
        const factory = this.getFactory(userType);
        return factory.validateUserData(userData);
    }
}
exports.UserFactorySelector = UserFactorySelector;
class RegistrationService {
    static async registerUser(userType, userData) {
        try {
            const user = await UserFactorySelector.createUser(userType, userData);
            console.log(`Created ${userType}: ${user.email}`);
            return user;
        }
        catch (error) {
            console.error(`Registration failed for ${userType}:`, error);
            throw error;
        }
    }
    static async validateRegistrationData(userType, userData) {
        return UserFactorySelector.validateUserData(userType, userData);
    }
    static async isEmailAvailable(email) {
        return true;
    }
}
exports.RegistrationService = RegistrationService;
//# sourceMappingURL=UserFactory.js.map