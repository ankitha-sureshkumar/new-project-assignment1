export interface IPetRepository {
    listByOwner(ownerId: string): Promise<any[]>;
}
export declare class PetRepository implements IPetRepository {
    listByOwner(ownerId: string): Promise<any[]>;
}
//# sourceMappingURL=PetRepository.d.ts.map