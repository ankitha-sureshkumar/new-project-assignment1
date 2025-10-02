import { IVeterinarian } from '../models/Veterinarian';
export interface IVeterinarianRepository {
    findById(id: string): Promise<IVeterinarian | null>;
    listApproved(): Promise<IVeterinarian[]>;
}
export declare class VeterinarianRepository implements IVeterinarianRepository {
    findById(id: string): Promise<IVeterinarian | null>;
    listApproved(): Promise<IVeterinarian[]>;
}
//# sourceMappingURL=VeterinarianRepository.d.ts.map