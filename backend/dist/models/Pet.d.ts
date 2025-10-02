import mongoose, { Document, Model } from 'mongoose';
export interface IPet extends Document {
    name: string;
    type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
    breed: string;
    age: string;
    weight?: number;
    gender?: 'Male' | 'Female' | 'Unknown';
    color?: string;
    microchipId?: string;
    owner: mongoose.Types.ObjectId;
    medicalHistory: string;
    vaccinations: string;
    photos: string[];
    profilePicture?: string;
    lastVisit?: Date;
    allergies?: string[];
    isActive: boolean;
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date;
    }>;
    emergencyContact?: {
        name: string;
        contact: string;
        relation: string;
    };
    createdAt: Date;
    updatedAt: Date;
    updateActivity(): Promise<IPet>;
}
export interface IPetModel extends Model<IPet> {
    findByOwner(ownerId: string): Promise<IPet[]>;
}
declare const Pet: IPetModel;
export default Pet;
//# sourceMappingURL=Pet.d.ts.map