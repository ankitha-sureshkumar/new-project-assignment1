import { BaseUser } from './BaseUser';
interface AvailabilitySlot {
    day: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
}
interface ConsultationFeeRange {
    min: number;
    max: number;
}
export declare class Veterinarian extends BaseUser {
    private _specialization;
    private _experience;
    private _consultationFeeRange;
    private _hospitalsServed;
    private _availability;
    private _certifications;
    private _rating;
    private _totalReviews;
    private _isApproved;
    private _approvalStatus;
    private _licenseNumber?;
    constructor(id: string, name: string, email: string, password: string, contact: string, specialization: string, experience: string, consultationFeeRange: ConsultationFeeRange, hospitalsServed?: string, licenseNumber?: string, profilePicture?: string);
    get specialization(): string;
    get experience(): string;
    get consultationFeeRange(): ConsultationFeeRange;
    get hospitalsServed(): string;
    get availability(): AvailabilitySlot[];
    get certifications(): string[];
    get rating(): number;
    get totalReviews(): number;
    get isApproved(): boolean;
    get approvalStatus(): 'pending' | 'approved' | 'rejected';
    get licenseNumber(): string | undefined;
    set specialization(value: string);
    set experience(value: string);
    set consultationFeeRange(value: ConsultationFeeRange);
    set hospitalsServed(value: string);
    set isApproved(value: boolean);
    set licenseNumber(value: string | undefined);
    getRole(): 'veterinarian';
    getPermissions(): string[];
    getDashboardData(): Promise<any>;
    private getTotalAppointments;
    private getUpcomingAppointments;
    private getCompletedToday;
    private getNotifications;
    private getEarningsSummary;
    private getDefaultAvailability;
    updateAvailability(availability: AvailabilitySlot[]): void;
    private isValidTimeFormat;
    addCertification(certification: string): void;
    removeCertification(certification: string): void;
    updateRating(newRating: number): void;
    isAvailableOnDay(day: string): boolean;
    getAvailableTimesForDay(day: string): string[];
    private timeToMinutes;
    private minutesToTime;
    canAcceptAppointments(): boolean;
    validate(): {
        isValid: boolean;
        errors: string[];
    };
    toDocument(): any;
    static create(vetData: {
        id: string;
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
    }): Veterinarian;
}
export { AvailabilitySlot, ConsultationFeeRange };
//# sourceMappingURL=Veterinarian.d.ts.map