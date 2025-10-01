"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureDataService = exports.ProxyFactory = exports.AccessLogger = exports.SecureDataAccessProxy = exports.RealDataAccessor = exports.Permission = void 0;
const Veterinarian_1 = require("../classes/Veterinarian");
var Permission;
(function (Permission) {
    Permission["READ_OWN_DATA"] = "read_own_data";
    Permission["READ_ALL_DATA"] = "read_all_data";
    Permission["WRITE_OWN_DATA"] = "write_own_data";
    Permission["WRITE_ALL_DATA"] = "write_all_data";
    Permission["DELETE_OWN_DATA"] = "delete_own_data";
    Permission["DELETE_ALL_DATA"] = "delete_all_data";
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["MANAGE_VETERINARIANS"] = "manage_veterinarians";
    Permission["VIEW_SENSITIVE_DATA"] = "view_sensitive_data";
    Permission["APPROVE_APPOINTMENTS"] = "approve_appointments";
    Permission["ACCESS_MEDICAL_RECORDS"] = "access_medical_records";
    Permission["PRESCRIBE_MEDICATIONS"] = "prescribe_medications";
})(Permission || (exports.Permission = Permission = {}));
class RealDataAccessor {
    async getUserData(userId, requestorContext) {
        console.log(`Accessing user data for ${userId}`);
        return {
            id: userId,
            name: 'John Doe',
            email: 'john@example.com',
        };
    }
    async getUserById(userId) {
        console.log(`Accessing user by ID: ${userId}`);
        const UserModel = require('../models/User').default;
        const user = await UserModel.findById(userId).select('-password');
        return user ? user.toObject() : null;
    }
    async getAllUsers() {
        console.log('Accessing all users');
        const UserModel = require('../models/User').default;
        const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
        return users.map((user) => user.toObject());
    }
    async getVeterinarianById(vetId) {
        console.log(`Accessing veterinarian by ID: ${vetId}`);
        const VeterinarianModel = require('../models/Veterinarian').default;
        const vet = await VeterinarianModel.findById(vetId).select('-password');
        return vet ? vet.toObject() : null;
    }
    async getAllVeterinarians() {
        console.log('Accessing all veterinarians');
        const VeterinarianModel = require('../models/Veterinarian').default;
        const vets = await VeterinarianModel.find().select('-password').sort({ createdAt: -1 });
        return vets.map((vet) => vet.toObject());
    }
    async getUserAppointments(userId, requestorContext) {
        console.log(`Accessing appointments for user ${userId}`);
        return [
            { id: 'apt1', userId, veterinarianId: 'vet1', date: '2024-01-15' },
        ];
    }
    async getVeterinarianData(vetId, requestorContext) {
        console.log(`Accessing veterinarian data for ${vetId}`);
        return {
            id: vetId,
            name: 'Dr. Smith',
            specialization: 'General Practice',
        };
    }
    async getMedicalRecords(petId, requestorContext) {
        console.log(`Accessing medical records for pet ${petId}`);
        return {
            petId,
            records: [
                { date: '2024-01-10', diagnosis: 'Routine checkup', treatment: 'Vaccinations' }
            ]
        };
    }
    async updateUserData(userId, data, requestorContext) {
        console.log(`Updating user data for ${userId}`);
        return { ...data, id: userId, updatedAt: new Date() };
    }
    async deleteUser(userId, requestorContext) {
        console.log(`Deleting user ${userId}`);
    }
}
exports.RealDataAccessor = RealDataAccessor;
class SecureDataAccessProxy {
    constructor(realAccessor) {
        this.realAccessor = realAccessor;
        this.accessLogger = new AccessLogger();
    }
    async getUserData(userId, requestorContext) {
        if (!this.canAccessUserData(userId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getUserData', userId);
            throw new Error('Access denied: Insufficient permissions to access user data');
        }
        this.accessLogger.logAccess(requestorContext.userId, 'getUserData', userId);
        const userData = await this.realAccessor.getUserData(userId, requestorContext);
        return this.filterSensitiveUserData(userData, requestorContext);
    }
    async getUserAppointments(userId, requestorContext) {
        if (!this.canAccessAppointments(userId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getUserAppointments', userId);
            throw new Error('Access denied: Cannot access appointment data');
        }
        this.accessLogger.logAccess(requestorContext.userId, 'getUserAppointments', userId);
        const appointments = await this.realAccessor.getUserAppointments(userId, requestorContext);
        return this.filterAppointmentData(appointments, requestorContext);
    }
    async getVeterinarianData(vetId, requestorContext) {
        if (!this.canAccessVeterinarianData(vetId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getVeterinarianData', vetId);
            throw new Error('Access denied: Cannot access veterinarian data');
        }
        this.accessLogger.logAccess(requestorContext.userId, 'getVeterinarianData', vetId);
        const vetData = await this.realAccessor.getVeterinarianData(vetId, requestorContext);
        return this.filterVeterinarianData(vetData, requestorContext);
    }
    async getMedicalRecords(petId, requestorContext) {
        if (!this.canAccessMedicalRecords(petId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'getMedicalRecords', petId);
            throw new Error('Access denied: Cannot access medical records');
        }
        this.accessLogger.logAccess(requestorContext.userId, 'getMedicalRecords', petId);
        const records = await this.realAccessor.getMedicalRecords(petId, requestorContext);
        return this.filterMedicalRecords(records, requestorContext);
    }
    async updateUserData(userId, data, requestorContext) {
        if (!this.canUpdateUserData(userId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'updateUserData', userId);
            throw new Error('Access denied: Cannot update user data');
        }
        const sanitizedData = this.sanitizeUpdateData(data, requestorContext);
        this.accessLogger.logAccess(requestorContext.userId, 'updateUserData', userId);
        return await this.realAccessor.updateUserData(userId, sanitizedData, requestorContext);
    }
    async deleteUser(userId, requestorContext) {
        if (!this.canDeleteUser(userId, requestorContext)) {
            this.accessLogger.logUnauthorizedAccess(requestorContext.userId, 'deleteUser', userId);
            throw new Error('Access denied: Cannot delete user');
        }
        this.accessLogger.logAccess(requestorContext.userId, 'deleteUser', userId);
        await this.realAccessor.deleteUser(userId, requestorContext);
    }
    async getUserById(userId) {
        console.log(`Secure access: getUserById ${userId}`);
        return await this.realAccessor.getUserById(userId);
    }
    async getAllUsers() {
        console.log('Secure access: getAllUsers');
        return await this.realAccessor.getAllUsers();
    }
    async getVeterinarianById(vetId) {
        console.log(`Secure access: getVeterinarianById ${vetId}`);
        return await this.realAccessor.getVeterinarianById(vetId);
    }
    async getAllVeterinarians() {
        console.log('Secure access: getAllVeterinarians');
        return await this.realAccessor.getAllVeterinarians();
    }
    canAccessUserData(userId, context) {
        if (context.isBlocked)
            return false;
        if (context.userId === userId && context.permissions.includes(Permission.READ_OWN_DATA)) {
            return true;
        }
        if (context.role === 'admin' && context.permissions.includes(Permission.READ_ALL_DATA)) {
            return true;
        }
        if (context.role === 'veterinarian' &&
            context.isApproved &&
            context.permissions.includes(Permission.ACCESS_MEDICAL_RECORDS)) {
            return true;
        }
        return false;
    }
    canAccessAppointments(userId, context) {
        if (context.isBlocked)
            return false;
        if (context.userId === userId)
            return true;
        if (context.role === 'veterinarian' && context.isApproved)
            return true;
        if (context.role === 'admin')
            return true;
        return false;
    }
    canAccessVeterinarianData(vetId, context) {
        if (context.isBlocked)
            return false;
        if (context.userId === vetId && context.role === 'veterinarian')
            return true;
        if (context.role === 'user')
            return true;
        if (context.role === 'admin')
            return true;
        return false;
    }
    canAccessMedicalRecords(petId, context) {
        if (context.isBlocked)
            return false;
        if (context.role === 'veterinarian' &&
            context.isApproved &&
            context.permissions.includes(Permission.ACCESS_MEDICAL_RECORDS)) {
            return true;
        }
        if (context.role === 'admin' &&
            context.permissions.includes(Permission.VIEW_SENSITIVE_DATA)) {
            return true;
        }
        if (context.role === 'user') {
            return true;
        }
        return false;
    }
    canUpdateUserData(userId, context) {
        if (context.isBlocked)
            return false;
        if (context.userId === userId && context.permissions.includes(Permission.WRITE_OWN_DATA)) {
            return true;
        }
        if (context.role === 'admin' && context.permissions.includes(Permission.WRITE_ALL_DATA)) {
            return true;
        }
        return false;
    }
    canDeleteUser(userId, context) {
        if (context.isBlocked)
            return false;
        if (context.role === 'admin' && context.permissions.includes(Permission.DELETE_ALL_DATA)) {
            return true;
        }
        if (context.userId === userId && context.permissions.includes(Permission.DELETE_OWN_DATA)) {
            return true;
        }
        return false;
    }
    filterSensitiveUserData(userData, context) {
        const filtered = { ...userData };
        if (context.role !== 'admin' && !context.permissions.includes(Permission.VIEW_SENSITIVE_DATA)) {
            delete filtered.password;
            delete filtered.resetPasswordToken;
            delete filtered.emailVerificationToken;
        }
        if (context.userId !== userData.id && context.role !== 'admin') {
            delete filtered.phone;
            delete filtered.address;
            delete filtered.emergencyContact;
        }
        return filtered;
    }
    filterAppointmentData(appointments, context) {
        return appointments.map(appointment => {
            const filtered = { ...appointment };
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
    filterVeterinarianData(vetData, context) {
        const filtered = { ...vetData };
        if (context.role === 'user') {
            delete filtered.earnings;
            delete filtered.personalNotes;
            delete filtered.adminComments;
            delete filtered.licenseDetails;
        }
        if (context.role === 'veterinarian' && context.userId !== vetData.id) {
            delete filtered.earnings;
            delete filtered.personalNotes;
        }
        return filtered;
    }
    filterMedicalRecords(records, context) {
        if (context.role === 'admin') {
            return records;
        }
        const filtered = { ...records };
        if (context.role === 'user') {
            filtered.records = filtered.records?.map((record) => ({
                date: record.date,
                diagnosis: record.diagnosis,
                treatment: record.treatment,
            }));
        }
        return filtered;
    }
    sanitizeUpdateData(data, context) {
        const sanitized = { ...data };
        if (context.role !== 'admin') {
            delete sanitized.role;
            delete sanitized.permissions;
            delete sanitized.isApproved;
            delete sanitized.isBlocked;
            delete sanitized.createdAt;
            delete sanitized.updatedAt;
        }
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
exports.SecureDataAccessProxy = SecureDataAccessProxy;
class AccessLogger {
    constructor() {
        this.logs = [];
    }
    logAccess(userId, operation, resourceId) {
        const log = {
            userId,
            operation,
            resourceId,
            timestamp: new Date(),
            success: true
        };
        this.logs.push(log);
        console.log(`✅ Access granted: User ${userId} performed ${operation} on ${resourceId}`);
    }
    logUnauthorizedAccess(userId, operation, resourceId) {
        const log = {
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
    getAccessLogs(userId, operation) {
        let filteredLogs = this.logs;
        if (userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === userId);
        }
        if (operation) {
            filteredLogs = filteredLogs.filter(log => log.operation === operation);
        }
        return filteredLogs;
    }
    getUnauthorizedAttempts() {
        return this.logs.filter(log => !log.success);
    }
}
exports.AccessLogger = AccessLogger;
class ProxyFactory {
    static createSecureDataAccessor() {
        const realAccessor = new RealDataAccessor();
        return new SecureDataAccessProxy(realAccessor);
    }
    static createProxy(userContext) {
        const realAccessor = new RealDataAccessor();
        const secureProxy = new SecureDataAccessProxy(realAccessor);
        return {
            getUserData: (userId) => secureProxy.getUserData(userId, userContext),
            getUserById: (userId) => secureProxy.getUserById(userId),
            getAllUsers: () => secureProxy.getAllUsers(),
            getUserAppointments: (userId) => secureProxy.getUserAppointments(userId, userContext),
            getVeterinarianData: (vetId) => secureProxy.getVeterinarianData(vetId, userContext),
            getVeterinarianById: (vetId) => secureProxy.getVeterinarianById(vetId),
            getAllVeterinarians: () => secureProxy.getAllVeterinarians(),
            getMedicalRecords: (petId) => secureProxy.getMedicalRecords(petId, userContext),
            updateUserData: (userId, data) => secureProxy.updateUserData(userId, data, userContext),
            deleteUser: (userId) => secureProxy.deleteUser(userId, userContext)
        };
    }
    static createUserContext(user) {
        return {
            userId: user.id,
            role: user.getRole(),
            permissions: this.getPermissionsForRole(user.getRole()),
            isBlocked: user.isBlocked,
            isApproved: user instanceof Veterinarian_1.Veterinarian ? user.isApproved : true
        };
    }
    static getPermissionsForRole(role) {
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
exports.ProxyFactory = ProxyFactory;
class SecureDataService {
    constructor() {
        this.dataAccessor = ProxyFactory.createSecureDataAccessor();
    }
    async getUserProfile(userId, requestor) {
        const context = ProxyFactory.createUserContext(requestor);
        return await this.dataAccessor.getUserData(userId, context);
    }
    async getUserAppointments(userId, requestor) {
        const context = ProxyFactory.createUserContext(requestor);
        return await this.dataAccessor.getUserAppointments(userId, context);
    }
    async updateUserProfile(userId, data, requestor) {
        const context = ProxyFactory.createUserContext(requestor);
        return await this.dataAccessor.updateUserData(userId, data, context);
    }
}
exports.SecureDataService = SecureDataService;
//# sourceMappingURL=AccessProxy.js.map