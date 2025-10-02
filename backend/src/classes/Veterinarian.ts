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

/**
 * Veterinarian class extending BaseUser
 * Demonstrates OOP Principles:
 * 1. Inheritance - Extends BaseUser
 * 2. Polymorphism - Overrides abstract methods with veterinarian-specific implementations
 */
export class Veterinarian extends BaseUser {
  // Private fields specific to Veterinarian (Encapsulation)
  private _specialization: string;
  private _experience: string;
  private _consultationFeeRange: ConsultationFeeRange;
  private _hospitalsServed: string;
  private _availability: AvailabilitySlot[];
  private _certifications: string[];
  private _rating: number;
  private _totalReviews: number;
  private _isApproved: boolean;
  private _approvalStatus: 'pending' | 'approved' | 'rejected';
  private _licenseNumber?: string;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    contact: string,
    specialization: string,
    experience: string,
    consultationFeeRange: ConsultationFeeRange,
    hospitalsServed: string = '',
    licenseNumber?: string,
    profilePicture?: string
  ) {
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

  // Getters (Encapsulation)
  get specialization(): string { return this._specialization; }
  get experience(): string { return this._experience; }
  get consultationFeeRange(): ConsultationFeeRange { return { ...this._consultationFeeRange }; }
  get hospitalsServed(): string { return this._hospitalsServed; }
  get availability(): AvailabilitySlot[] { return [...this._availability]; }
  get certifications(): string[] { return [...this._certifications]; }
  get rating(): number { return this._rating; }
  get totalReviews(): number { return this._totalReviews; }
  get isApproved(): boolean { return this._isApproved; }
  get approvalStatus(): 'pending' | 'approved' | 'rejected' { return this._approvalStatus; }
  get licenseNumber(): string | undefined { return this._licenseNumber; }

  // Setters (Encapsulation)
  set specialization(value: string) {
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

  set experience(value: string) {
    this._experience = value;
    this.updateTimestamp();
  }

  set consultationFeeRange(value: ConsultationFeeRange) {
    if (value.min < 10 || value.max <= value.min) {
      throw new Error('Invalid consultation fee range');
    }
    this._consultationFeeRange = { ...value };
    this.updateTimestamp();
  }

  set hospitalsServed(value: string) {
    this._hospitalsServed = value;
    this.updateTimestamp();
  }

  set isApproved(value: boolean) {
    this._isApproved = value;
    this._approvalStatus = value ? 'approved' : 'rejected';
    this.updateTimestamp();
  }

  set licenseNumber(value: string | undefined) {
    this._licenseNumber = value;
    this.updateTimestamp();
  }

  // Implementation of abstract methods (Polymorphism)
  getRole(): 'veterinarian' {
    return 'veterinarian';
  }

  getPermissions(): string[] {
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

  // Polymorphic implementation - Veterinarian-specific dashboard data
  async getDashboardData(): Promise<any> {
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

  // Veterinarian-specific methods
  private async getTotalAppointments(): Promise<number> {
    // Implementation would query Appointment model
    return 0; // Placeholder
  }

  private async getUpcomingAppointments(): Promise<number> {
    // Implementation would query Appointment model
    return 0; // Placeholder
  }

  private async getCompletedToday(): Promise<number> {
    // Implementation would query Appointment model
    return 0; // Placeholder
  }

  private async getNotifications(): Promise<any[]> {
    // Implementation would query Notification model
    return []; // Placeholder
  }

  private async getEarningsSummary(): Promise<any> {
    // Implementation would calculate earnings
    return {
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    };
  }

  private getDefaultAvailability(): AvailabilitySlot[] {
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

  // Business logic methods
  updateAvailability(availability: AvailabilitySlot[]): void {
    // Validate availability slots
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

  private isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  addCertification(certification: string): void {
    if (!this._certifications.includes(certification)) {
      this._certifications.push(certification);
      this.updateTimestamp();
    }
  }

  removeCertification(certification: string): void {
    this._certifications = this._certifications.filter(cert => cert !== certification);
    this.updateTimestamp();
  }

  updateRating(newRating: number): void {
    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    
    // Calculate new average rating
    const totalRatingPoints = this._rating * this._totalReviews + newRating;
    this._totalReviews += 1;
    this._rating = Math.round((totalRatingPoints / this._totalReviews) * 100) / 100;
    this.updateTimestamp();
  }

  isAvailableOnDay(day: string): boolean {
    const slot = this._availability.find(a => a.day === day);
    return slot ? slot.enabled : false;
  }

  getAvailableTimesForDay(day: string): string[] {
    const slot = this._availability.find(a => a.day === day);
    if (!slot || !slot.enabled) return [];

    const times: string[] = [];
    const start = this.timeToMinutes(slot.startTime);
    const end = this.timeToMinutes(slot.endTime);

    // Generate 30-minute slots
    for (let time = start; time < end; time += 30) {
      times.push(this.minutesToTime(time));
    }

    return times;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  canAcceptAppointments(): boolean {
    return this._isApproved && !this.isBlocked && this.isEmailVerified;
  }

  // Override validation to include veterinarian-specific fields
  validate(): { isValid: boolean; errors: string[] } {
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

  // Override toDocument to include veterinarian-specific fields
  toDocument(): any {
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

  // Static factory method for creating Veterinarian instances
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
  }): Veterinarian {
    return new Veterinarian(
      vetData.id,
      vetData.name,
      vetData.email,
      vetData.password,
      vetData.contact,
      vetData.specialization,
      vetData.experience,
      vetData.consultationFeeRange,
      vetData.hospitalsServed,
      vetData.licenseNumber,
      vetData.profilePicture
    );
  }
}

export { AvailabilitySlot, ConsultationFeeRange };