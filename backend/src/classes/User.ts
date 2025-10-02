import { BaseUser } from './BaseUser';

/**
 * User class extending BaseUser
 * Demonstrates OOP Principles:
 * 1. Inheritance - Extends BaseUser
 * 2. Polymorphism - Overrides abstract methods with specific implementations
 */
export class User extends BaseUser {
  // Private fields specific to User (Encapsulation)
  private _address: string;
  private _petOwnership: string;
  private _preferredContact: 'email' | 'phone' | 'both';

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    contact: string,
    address: string,
    petOwnership: string = '',
    preferredContact: 'email' | 'phone' | 'both' = 'email',
    profilePicture?: string
  ) {
    super(id, name, email, password, contact, profilePicture);
    this._address = address;
    this._petOwnership = petOwnership;
    this._preferredContact = preferredContact;
  }

  // Getters (Encapsulation)
  get address(): string { return this._address; }
  get petOwnership(): string { return this._petOwnership; }
  get preferredContact(): 'email' | 'phone' | 'both' { return this._preferredContact; }

  // Setters (Encapsulation)
  set address(value: string) {
    if (!value || value.trim().length < 5) {
      throw new Error('Address must be at least 5 characters');
    }
    this._address = value.trim();
    this.updateTimestamp();
  }

  set petOwnership(value: string) {
    this._petOwnership = value;
    this.updateTimestamp();
  }

  set preferredContact(value: 'email' | 'phone' | 'both') {
    this._preferredContact = value;
    this.updateTimestamp();
  }

  // Implementation of abstract methods (Polymorphism)
  getRole(): 'user' {
    return 'user';
  }

  getPermissions(): string[] {
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

  // Polymorphic implementation - User-specific dashboard data
  async getDashboardData(): Promise<any> {
    // This would typically fetch from database
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

  // User-specific methods
  private async getTotalPets(): Promise<number> {
    // Implementation would query Pet model
    return 0; // Placeholder
  }

  private async getUpcomingAppointments(): Promise<number> {
    // Implementation would query Appointment model
    return 0; // Placeholder
  }

  private async getRecentActivity(): Promise<any[]> {
    // Implementation would query recent activities
    return []; // Placeholder
  }

  private async getNotifications(): Promise<any[]> {
    // Implementation would query Notification model
    return []; // Placeholder
  }

  // Override validation to include user-specific fields
  validate(): { isValid: boolean; errors: string[] } {
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

  // Override toDocument to include user-specific fields
  toDocument(): any {
    const baseDocument = super.toDocument();
    return {
      ...baseDocument,
      address: this._address,
      petOwnership: this._petOwnership,
      preferredContact: this._preferredContact,
      role: this.getRole()
    };
  }

  // User-specific business logic methods
  canScheduleAppointment(): boolean {
    return !this.isBlocked && this.isEmailVerified;
  }

  canCancelAppointment(appointmentDate: Date): boolean {
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    // Can cancel if appointment is more than 24 hours away
    return hoursDiff > 24 && !this.isBlocked;
  }

  getContactPreference(): { method: string; value: string } {
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

  // Static factory method for creating User instances
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
  }): User {
    return new User(
      userData.id,
      userData.name,
      userData.email,
      userData.password,
      userData.contact,
      userData.address,
      userData.petOwnership,
      userData.preferredContact,
      userData.profilePicture
    );
  }
}