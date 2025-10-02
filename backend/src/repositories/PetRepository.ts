import Pet from '../models/Pet';

export interface IPetRepository {
  listByOwner(ownerId: string): Promise<any[]>;
}

export class PetRepository implements IPetRepository {
  async listByOwner(ownerId: string): Promise<any[]> {
    return Pet.find({ owner: ownerId, isActive: true }).sort({ createdAt: -1 });
  }
}