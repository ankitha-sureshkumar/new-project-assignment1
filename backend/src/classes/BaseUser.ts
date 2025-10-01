import bcrypt from 'bcryptjs';

/**
 * Abstract base class for all user types
 * Demonstrates OOP Principles:
 * 1. Abstraction - Abstract class with abstract methods
 * 2. Encapsulation - Private fields with getters/setters
 */
export abstract class BaseUser {
  // Private fields (Encapsulation)
  private _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _contact: string;
  private _profilePicture?: string;
  private _isEmailVerified: boolean;
  private _isBlocked: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    contact: string,
    profilePicture?: string
  ) {
    this._id = id;
    this._name = name;
    this._email = email.toLowerCase();
    this._password = password;
    this._contact = contact;
    this._profilePicture = profilePicture;
    this._isEmailVerified = false;
    this._isBlocked = false;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters (Encapsulation)
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get contact(): string { return this._contact; }
  get profilePicture(): string | undefined { return this._profilePicture; }
  get isEmailVerified(): boolean { return this._isEmailVerified; }
  get isBlocked(): boolean { return this._isBlocked; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Setters (Encapsulation)
  set name(value: string) {
    if (value.length < 2) throw new Error('Name must be at least 2 characters');
    this._name = value;
    this.updateTimestamp();
  }

  set email(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) throw new Error('Invalid email format');
    this._email = value.toLowerCase();
    this.updateTimestamp();
  }

  set contact(value: string) {
    this._contact = value;
    this.updateTimestamp();
  }

  set profilePicture(value: string | undefined) {
    this._profilePicture = value;
    this.updateTimestamp();
  }

  set isEmailVerified(value: boolean) {
    this._isEmailVerified = value;
    this.updateTimestamp();
  }

  set isBlocked(value: boolean) {
    this._isBlocked = value;
    this.updateTimestamp();
  }

  // Protected methods for subclasses
  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  protected async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Public methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this._password);
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    this._password = await this.hashPassword(newPassword);
    this.updateTimestamp();
  }

  // Virtual property for full name formatting
  get displayName(): string {
    return this._name.trim().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Common validation method
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this._name || this._name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!this._email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._email)) {
      errors.push('Valid email is required');
    }

    if (!this._contact) {
      errors.push('Contact number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to plain object for database storage
  toDocument(): any {
    return {
      _id: this._id,
      name: this._name,
      email: this._email,
      password: this._password,
      contact: this._contact,
      profilePicture: this._profilePicture,
      isEmailVerified: this._isEmailVerified,
      isBlocked: this._isBlocked,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  // Convert to safe object for API responses (no password)
  toSafeObject(): any {
    const obj = this.toDocument();
    delete obj.password;
    return obj;
  }

  // Abstract methods that must be implemented by subclasses (Abstraction)
  abstract getRole(): 'user' | 'veterinarian';
  abstract getDashboardData(): Promise<any>; // Polymorphism - different implementations
  abstract getPermissions(): string[];
}