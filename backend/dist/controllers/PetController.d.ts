import { Request, Response } from 'express';
export declare class PetController {
    createPet(req: Request, res: Response): Promise<void>;
    getUserPets(req: Request, res: Response): Promise<void>;
    getAllPets(req: Request, res: Response): Promise<void>;
    getPetById(req: Request, res: Response): Promise<void>;
    updatePet(req: Request, res: Response): Promise<void>;
    deletePet(req: Request, res: Response): Promise<void>;
    uploadPetPhoto(req: Request, res: Response): Promise<void>;
    getPetHistory(req: Request, res: Response): Promise<void>;
    activatePet(req: Request, res: Response): Promise<void>;
    getPetsByOwner(req: Request, res: Response): Promise<void>;
    searchPets(req: Request, res: Response): Promise<void>;
    addMedicalNotes(req: Request, res: Response): Promise<void>;
}
declare const petController: PetController;
export default petController;
//# sourceMappingURL=PetController.d.ts.map