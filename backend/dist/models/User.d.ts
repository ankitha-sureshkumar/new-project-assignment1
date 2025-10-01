import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    contact: string;
    profilePicture?: string;
    isEmailVerified: boolean;
    address: string;
    petOwnership?: string;
    preferredContact: 'email' | 'phone' | 'both';
    isBlocked: boolean;
    blockedAt?: Date;
    blockedBy?: string;
    blockReason?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generatePasswordHash(password: string): Promise<string>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map