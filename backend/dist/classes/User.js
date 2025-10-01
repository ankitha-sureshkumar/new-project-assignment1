"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const BaseUser_1 = require("./BaseUser");
class User extends BaseUser_1.BaseUser {
    constructor(id, name, email, password, contact, address, petOwnership = '', preferredContact = 'email', profilePicture) {
        super(id, name, email, password, contact, profilePicture);
        this._address = address;
        this._petOwnership = petOwnership;
        this._preferredContact = preferredContact;
    }
    get address() { return this._address; }
    get petOwnership() { return this._petOwnership; }
    get preferredContact() { return this._preferredContact; }
    set address(value) {
        if (!value || value.trim().length < 5) {
            throw new Error('Address must be at least 5 characters');
        }
        this._address = value.trim();
        this.updateTimestamp();
    }
    set petOwnership(value) {
        this._petOwnership = value;
        this.updateTimestamp();
    }
    set preferredContact(value) {
        this._preferredContact = value;
        this.updateTimestamp();
    }
    getRole() {
        return 'user';
    }
    getPermissions() {
        return [
            'view_own_profile',
            'update_own_profile',
            'create_pets',
            'view_own_pets',
            'update_own_pets',
            'create_appointments',
            'view_own_appointments',
            'cancel_own_appointments',
            'rate_appointments'
        ];
    }
    async getDashboardData() {
        return {
            userType: 'Pet Parent',
            summary: {
                totalPets: await this.getTotalPets(),
                upcomingAppointments: await this.getUpcomingAppointments(),
                recentActivity: await this.getRecentActivity()
            },
            quickActions: [
                'Schedule Appointment',
                'View Medical Records',
                'Update Pet Information',
                'Emergency Contacts'
            ],
            notifications: await this.getNotifications()
        };
    }
    async getTotalPets() {
        return 0;
    }
    async getUpcomingAppointments() {
        return 0;
    }
    async getRecentActivity() {
        return [];
    }
    async getNotifications() {
        return [];
    }
    validate() {
        const baseValidation = super.validate();
        const errors = [...baseValidation.errors];
        if (!this._address || this._address.trim().length < 5) {
            errors.push('Address must be at least 5 characters');
        }
        const validPreferredContacts = ['email', 'phone', 'both'];
        if (!validPreferredContacts.includes(this._preferredContact)) {
            errors.push('Preferred contact must be email, phone, or both');
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
            address: this._address,
            petOwnership: this._petOwnership,
            preferredContact: this._preferredContact,
            role: this.getRole()
        };
    }
    canScheduleAppointment() {
        return !this.isBlocked && this.isEmailVerified;
    }
    canCancelAppointment(appointmentDate) {
        const now = new Date();
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        return hoursDiff > 24 && !this.isBlocked;
    }
    getContactPreference() {
        switch (this._preferredContact) {
            case 'email':
                return { method: 'email', value: this.email };
            case 'phone':
                return { method: 'phone', value: this.contact };
            case 'both':
                return { method: 'both', value: `${this.email}, ${this.contact}` };
            default:
                return { method: 'email', value: this.email };
        }
    }
    static create(userData) {
        return new User(userData.id, userData.name, userData.email, userData.password, userData.contact, userData.address, userData.petOwnership, userData.preferredContact, userData.profilePicture);
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map