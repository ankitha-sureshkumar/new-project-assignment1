import { BaseUser } from '../classes/BaseUser';
export declare enum Permission {
    READ_OWN_DATA = "read_own_data",
    READ_ALL_DATA = "read_all_data",
    WRITE_OWN_DATA = "write_own_data",
    WRITE_ALL_DATA = "write_all_data",
    DELETE_OWN_DATA = "delete_own_data",
    DELETE_ALL_DATA = "delete_all_data",
    MANAGE_USERS = "manage_users",
    MANAGE_VETERINARIANS = "manage_veterinarians",
    VIEW_SENSITIVE_DATA = "view_sensitive_data",
    APPROVE_APPOINTMENTS = "approve_appointments",
    ACCESS_MEDICAL_RECORDS = "access_medical_records",
    PRESCRIBE_MEDICATIONS = "prescribe_medications"
}
export interface UserContext {
    userId: string;
    role: 'user' | 'veterinarian' | 'admin';
    permissions: Permission[] | string[];
    isBlocked?: boolean;
    isApproved?: boolean;
}
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
export declare class RealDataAccessor implements IDataAccessor {
    getUserData(userId: string, requestorContext: UserContext): Promise<any>;
    getUserById(userId: string): Promise<any>;
    getAllUsers(): Promise<any[]>;
    getVeterinarianById(vetId: string): Promise<any>;
    getAllVeterinarians(): Promise<any[]>;
    getUserAppointments(userId: string, requestorContext: UserContext): Promise<any[]>;
    getVeterinarianData(vetId: string, requestorContext: UserContext): Promise<any>;
    getMedicalRecords(petId: string, requestorContext: UserContext): Promise<any>;
    updateUserData(userId: string, data: any, requestorContext: UserContext): Promise<any>;
    deleteUser(userId: string, requestorContext: UserContext): Promise<void>;
}
export declare class SecureDataAccessProxy implements IDataAccessor {
    private realAccessor;
    private accessLogger;
    constructor(realAccessor: RealDataAccessor);
    getUserData(userId: string, requestorContext: UserContext): Promise<any>;
    getUserAppointments(userId: string, requestorContext: UserContext): Promise<any[]>;
    getVeterinarianData(vetId: string, requestorContext: UserContext): Promise<any>;
    getMedicalRecords(petId: string, requestorContext: UserContext): Promise<any>;
    updateUserData(userId: string, data: any, requestorContext: UserContext): Promise<any>;
    deleteUser(userId: string, requestorContext: UserContext): Promise<void>;
    getUserById(userId: string): Promise<any>;
    getAllUsers(): Promise<any[]>;
    getVeterinarianById(vetId: string): Promise<any>;
    getAllVeterinarians(): Promise<any[]>;
    private canAccessUserData;
    private canAccessAppointments;
    private canAccessVeterinarianData;
    private canAccessMedicalRecords;
    private canUpdateUserData;
    private canDeleteUser;
    private filterSensitiveUserData;
    private filterAppointmentData;
    private filterVeterinarianData;
    private filterMedicalRecords;
    private sanitizeUpdateData;
}
export declare class AccessLogger {
    private logs;
    logAccess(userId: string, operation: string, resourceId: string): void;
    logUnauthorizedAccess(userId: string, operation: string, resourceId: string): void;
    getAccessLogs(userId?: string, operation?: string): AccessLog[];
    getUnauthorizedAttempts(): AccessLog[];
}
export interface AccessLog {
    userId: string;
    operation: string;
    resourceId: string;
    timestamp: Date;
    success: boolean;
    reason?: string;
}
export declare class ProxyFactory {
    static createSecureDataAccessor(): IDataAccessor;
    static createProxy(userContext: UserContext): IDataAccessor;
    static createUserContext(user: BaseUser): UserContext;
    private static getPermissionsForRole;
}
export declare class SecureDataService {
    private dataAccessor;
    constructor();
    getUserProfile(userId: string, requestor: BaseUser): Promise<any>;
    getUserAppointments(userId: string, requestor: BaseUser): Promise<any[]>;
    updateUserProfile(userId: string, data: any, requestor: BaseUser): Promise<any>;
}
//# sourceMappingURL=AccessProxy.d.ts.map