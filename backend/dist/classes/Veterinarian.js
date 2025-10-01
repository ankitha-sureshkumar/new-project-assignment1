"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Veterinarian = void 0;
const BaseUser_1 = require("./BaseUser");
class Veterinarian extends BaseUser_1.BaseUser {
    constructor(id, name, email, password, contact, specialization, experience, consultationFeeRange, hospitalsServed = '', licenseNumber, profilePicture) {
        super(id, name, email, password, contact, profilePicture);
        this._specialization = specialization;
        this._experience = experience;
        this._consultationFeeRange = consultationFeeRange;
        this._hospitalsServed = hospitalsServed;
        this._availability = this.getDefaultAvailability();
        this._certifications = [];
        this._rating = 0;
        this._totalReviews = 0;
        this._isApproved = false;
        this._approvalStatus = 'pending';
        this._licenseNumber = licenseNumber;
    }
    get specialization() { return this._specialization; }
    get experience() { return this._experience; }
    get consultationFeeRange() { return { ...this._consultationFeeRange }; }
    get hospitalsServed() { return this._hospitalsServed; }
    get availability() { return [...this._availability]; }
    get certifications() { return [...this._certifications]; }
    get rating() { return this._rating; }
    get totalReviews() { return this._totalReviews; }
    get isApproved() { return this._isApproved; }
    get approvalStatus() { return this._approvalStatus; }
    get licenseNumber() { return this._licenseNumber; }
    set specialization(value) {
        const validSpecializations = [
            'General Practice', 'Surgery', 'Dental Care', 'Emergency Care',
            'Dermatology', 'Cardiology', 'Orthopedics'
        ];
        if (!validSpecializations.includes(value)) {
            throw new Error('Invalid specialization');
        }
        this._specialization = value;
        this.updateTimestamp();
    }
    set experience(value) {
        this._experience = value;
        this.updateTimestamp();
    }
    set consultationFeeRange(value) {
        if (value.min < 10 || value.max <= value.min) {
            throw new Error('Invalid consultation fee range');
        }
        this._consultationFeeRange = { ...value };
        this.updateTimestamp();
    }
    set hospitalsServed(value) {
        this._hospitalsServed = value;
        this.updateTimestamp();
    }
    set isApproved(value) {
        this._isApproved = value;
        this._approvalStatus = value ? 'approved' : 'rejected';
        this.updateTimestamp();
    }
    set licenseNumber(value) {
        this._licenseNumber = value;
        this.updateTimestamp();
    }
    getRole() {
        return 'veterinarian';
    }
    getPermissions() {
        const basePermissions = [
            'view_own_profile',
            'update_own_profile',
            'view_appointments',
            'update_appointment_status',
            'add_veterinarian_notes'
        ];
        if (this._isApproved) {
            return [
                ...basePermissions,
                'accept_appointments',
                'reject_appointments',
                'complete_appointments',
                'prescribe_medications',
                'access_medical_records'
            ];
        }
        return basePermissions;
    }
    async getDashboardData() {
        return {
            userType: 'Veterinarian',
            approvalStatus: this._approvalStatus,
            summary: {
                totalAppointments: await this.getTotalAppointments(),
                upcomingAppointments: await this.getUpcomingAppointments(),
                completedToday: await this.getCompletedToday(),
                averageRating: this._rating,
                totalReviews: this._totalReviews
            },
            quickActions: this._isApproved ? [
                'View Appointments',
                'Update Availability',
                'Medical Records',
                'Patient History'
            ] : [
                'Update Profile',
                'Upload Documents',
                'Contact Support'
            ],
            notifications: await this.getNotifications(),
            earnings: this._isApproved ? await this.getEarningsSummary() : null
        };
    }
    async getTotalAppointments() {
        return 0;
    }
    async getUpcomingAppointments() {
        return 0;
    }
    async getCompletedToday() {
        return 0;
    }
    async getNotifications() {
        return [];
    }
    async getEarningsSummary() {
        return {
            thisWeek: 0,
            thisMonth: 0,
            total: 0
        };
    }
    getDefaultAvailability() {
        return [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Saturday', startTime: '09:00', endTime: '13:00', enabled: false },
            { day: 'Sunday', startTime: '09:00', endTime: '13:00', enabled: false }
        ];
    }
    updateAvailability(availability) {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const slot of availability) {
            if (!validDays.includes(slot.day)) {
                throw new Error(`Invalid day: ${slot.day}`);
            }
            if (!this.isValidTimeFormat(slot.startTime) || !this.isValidTimeFormat(slot.endTime)) {
                throw new Error('Invalid time format. Use HH:MM format');
            }
        }
        this._availability = [...availability];
        this.updateTimestamp();
    }
    isValidTimeFormat(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    }
    addCertification(certification) {
        if (!this._certifications.includes(certification)) {
            this._certifications.push(certification);
            this.updateTimestamp();
        }
    }
    removeCertification(certification) {
        this._certifications = this._certifications.filter(cert => cert !== certification);
        this.updateTimestamp();
    }
    updateRating(newRating) {
        if (newRating < 0 || newRating > 5) {
            throw new Error('Rating must be between 0 and 5');
        }
        const totalRatingPoints = this._rating * this._totalReviews + newRating;
        this._totalReviews += 1;
        this._rating = Math.round((totalRatingPoints / this._totalReviews) * 100) / 100;
        this.updateTimestamp();
    }
    isAvailableOnDay(day) {
        const slot = this._availability.find(a => a.day === day);
        return slot ? slot.enabled : false;
    }
    getAvailableTimesForDay(day) {
        const slot = this._availability.find(a => a.day === day);
        if (!slot || !slot.enabled)
            return [];
        const times = [];
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        for (let time = start; time < end; time += 30) {
            times.push(this.minutesToTime(time));
        }
        return times;
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    canAcceptAppointments() {
        return this._isApproved && !this.isBlocked && this.isEmailVerified;
    }
    validate() {
        const baseValidation = super.validate();
        const errors = [...baseValidation.errors];
        if (!this._specialization) {
            errors.push('Specialization is required');
        }
        if (!this._experience) {
            errors.push('Experience is required');
        }
        if (!this._consultationFeeRange ||
            this._consultationFeeRange.min < 10 ||
            this._consultationFeeRange.max <= this._consultationFeeRange.min) {
            errors.push('Valid consultation fee range is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    toDocument() {
        const baseDocument = super.toDocument();
        return {
            ...baseDocument,
            specialization: this._specialization,
            experience: this._experience,
            consultationFeeRange: this._consultationFeeRange,
            hospitalsServed: this._hospitalsServed,
            availability: this._availability,
            certifications: this._certifications,
            rating: this._rating,
            totalReviews: this._totalReviews,
            isApproved: this._isApproved,
            approvalStatus: this._approvalStatus,
            licenseNumber: this._licenseNumber,
            role: this.getRole()
        };
    }
    static create(vetData) {
        return new Veterinarian(vetData.id, vetData.name, vetData.email, vetData.password, vetData.contact, vetData.specialization, vetData.experience, vetData.consultationFeeRange, vetData.hospitalsServed, vetData.licenseNumber, vetData.profilePicture);
    }
}
exports.Veterinarian = Veterinarian;
//# sourceMappingURL=Veterinarian.js.map