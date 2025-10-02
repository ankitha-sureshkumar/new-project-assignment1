"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class BaseUser {
    constructor(id, name, email, password, contact, profilePicture) {
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
    get id() { return this._id; }
    get name() { return this._name; }
    get email() { return this._email; }
    get contact() { return this._contact; }
    get profilePicture() { return this._profilePicture; }
    get isEmailVerified() { return this._isEmailVerified; }
    get isBlocked() { return this._isBlocked; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    set name(value) {
        if (value.length < 2)
            throw new Error('Name must be at least 2 characters');
        this._name = value;
        this.updateTimestamp();
    }
    set email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
            throw new Error('Invalid email format');
        this._email = value.toLowerCase();
        this.updateTimestamp();
    }
    set contact(value) {
        this._contact = value;
        this.updateTimestamp();
    }
    set profilePicture(value) {
        this._profilePicture = value;
        this.updateTimestamp();
    }
    set isEmailVerified(value) {
        this._isEmailVerified = value;
        this.updateTimestamp();
    }
    set isBlocked(value) {
        this._isBlocked = value;
        this.updateTimestamp();
    }
    updateTimestamp() {
        this._updatedAt = new Date();
    }
    async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(12);
        return bcryptjs_1.default.hash(password, salt);
    }
    async comparePassword(candidatePassword) {
        return bcryptjs_1.default.compare(candidatePassword, this._password);
    }
    async updatePassword(newPassword) {
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        this._password = await this.hashPassword(newPassword);
        this.updateTimestamp();
    }
    get displayName() {
        return this._name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    validate() {
        const errors = [];
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
    toDocument() {
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
    toSafeObject() {
        const obj = this.toDocument();
        delete obj.password;
        return obj;
    }
}
exports.BaseUser = BaseUser;
//# sourceMappingURL=BaseUser.js.map