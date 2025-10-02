import { BaseUser } from './BaseUser';
export declare class User extends BaseUser {
    private _address;
    private _petOwnership;
    private _preferredContact;
    constructor(id: string, name: string, email: string, password: string, contact: string, address: string, petOwnership?: string, preferredContact?: 'email' | 'phone' | 'both', profilePicture?: string);
    get address(): string;
    get petOwnership(): string;
    get preferredContact(): 'email' | 'phone' | 'both';
    set address(value: string);
    set petOwnership(value: string);
    set preferredContact(value: 'email' | 'phone' | 'both');
    getRole(): 'user';
    getPermissions(): string[];
    getDashboardData(): Promise<any>;
    private getTotalPets;
    private getUpcomingAppointments;
    private getRecentActivity;
    private getNotifications;
    validate(): {
        isValid: boolean;
        errors: string[];
    };
    toDocument(): any;
    canScheduleAppointment(): boolean;
    canCancelAppointment(appointmentDate: Date): boolean;
    getContactPreference(): {
        method: string;
        value: string;
    };
    static create(userData: {
        id: string;
        name: string;
        email: string;
        password: string;
        contact: string;
        address: string;
        petOwnership?: string;
        preferredContact?: 'email' | 'phone' | 'both';
        profilePicture?: string;
    }): User;
}
//# sourceMappingURL=User.d.ts.map