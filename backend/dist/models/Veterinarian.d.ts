import mongoose, { Document } from 'mongoose';
export interface IVeterinarian extends Document {
    name: string;
    email: string;
    password: string;
    contact: string;
    profilePicture?: string;
    isEmailVerified: boolean;
    specialization: string;
    experience: string;
    consultationFeeRange: {
        min: number;
        max: number;
    };
    hospitalsServed?: string;
    availability: Array<{
        day: string;
        startTime: string;
        endTime: string;
        enabled: boolean;
    }>;
    certifications: string[];
    rating: number;
    totalReviews: number;
    isApproved: boolean;
    isBlocked: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectionReason?: string;
    blockedAt?: Date;
    blockedBy?: string;
    blockReason?: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generatePasswordHash(password: string): Promise<string>;
}
declare const Veterinarian: mongoose.Model<IVeterinarian, {}, {}, {}, mongoose.Document<unknown, {}, IVeterinarian, {}, {}> & IVeterinarian & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Veterinarian;
//# sourceMappingURL=Veterinarian.d.ts.map