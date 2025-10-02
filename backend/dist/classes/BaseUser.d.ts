export declare abstract class BaseUser {
    private _id;
    private _name;
    private _email;
    private _password;
    private _contact;
    private _profilePicture?;
    private _isEmailVerified;
    private _isBlocked;
    private _createdAt;
    private _updatedAt;
    constructor(id: string, name: string, email: string, password: string, contact: string, profilePicture?: string);
    get id(): string;
    get name(): string;
    get email(): string;
    get contact(): string;
    get profilePicture(): string | undefined;
    get isEmailVerified(): boolean;
    get isBlocked(): boolean;
    get createdAt(): Date;
    get updatedAt(): Date;
    set name(value: string);
    set email(value: string);
    set contact(value: string);
    set profilePicture(value: string | undefined);
    set isEmailVerified(value: boolean);
    set isBlocked(value: boolean);
    protected updateTimestamp(): void;
    protected hashPassword(password: string): Promise<string>;
    comparePassword(candidatePassword: string): Promise<boolean>;
    updatePassword(newPassword: string): Promise<void>;
    get displayName(): string;
    validate(): {
        isValid: boolean;
        errors: string[];
    };
    toDocument(): any;
    toSafeObject(): any;
    abstract getRole(): 'user' | 'veterinarian';
    abstract getDashboardData(): Promise<any>;
    abstract getPermissions(): string[];
}
//# sourceMappingURL=BaseUser.d.ts.map