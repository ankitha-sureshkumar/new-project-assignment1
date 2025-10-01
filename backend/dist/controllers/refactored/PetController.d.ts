import { Request, Response } from 'express';
export declare class PetController {
    private notificationManager;
    private secureDataService;
    constructor();
    createPet(req: Request, res: Response): Promise<void>;
    getUserPets(req: Request, res: Response): Promise<void>;
    getPetById(req: Request, res: Response): Promise<void>;
    updatePet(req: Request, res: Response): Promise<void>;
    deletePet(req: Request, res: Response): Promise<void>;
    getPetHistory(req: Request, res: Response): Promise<void>;
    uploadPetPhotos(req: Request, res: Response): Promise<void>;
}
declare const petController: PetController;
export declare const createPet: (req: Request, res: Response) => Promise<void>, getUserPets: (req: Request, res: Response) => Promise<void>, getPetById: (req: Request, res: Response) => Promise<void>, updatePet: (req: Request, res: Response) => Promise<void>, deletePet: (req: Request, res: Response) => Promise<void>, getPetHistory: (req: Request, res: Response) => Promise<void>, uploadPetPhotos: (req: Request, res: Response) => Promise<void>;
export default petController;
//# sourceMappingURL=PetController.d.ts.map