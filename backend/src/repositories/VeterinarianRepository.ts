import Veterinarian, { IVeterinarian } from '../models/Veterinarian';

export interface IVeterinarianRepository {
  findById(id: string): Promise<IVeterinarian | null>;
  listApproved(): Promise<IVeterinarian[]>;
}

export class VeterinarianRepository implements IVeterinarianRepository {
  async findById(id: string): Promise<IVeterinarian | null> {
    return Veterinarian.findById(id).select('-password');
  }
  async listApproved(): Promise<IVeterinarian[]> {
    return Veterinarian.find({ approvalStatus: 'approved', isBlocked: false }).select('-password').sort({ createdAt: -1 });
  }
}