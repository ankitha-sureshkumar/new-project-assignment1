import { Request, Response } from 'express';
export declare class VeterinarianController {
    private dashboardFacade;
    private notificationManager;
    private secureDataService;
    constructor();
    registerVeterinarian(req: Request, res: Response): Promise<void>;
    loginVeterinarian(req: Request, res: Response): Promise<void>;
    getVeterinarianProfile(req: Request, res: Response): Promise<void>;
    updateVeterinarianProfile(req: Request, res: Response): Promise<void>;
    getVeterinarianDashboard(req: Request, res: Response): Promise<void>;
    getAllVeterinarians(req: Request, res: Response): Promise<void>;
    private mongoToVeterinarianInstance;
}
declare const veterinarianController: VeterinarianController;
export declare const registerVeterinarian: (req: Request, res: Response) => Promise<void>, loginVeterinarian: (req: Request, res: Response) => Promise<void>, getVeterinarianProfile: (req: Request, res: Response) => Promise<void>, updateVeterinarianProfile: (req: Request, res: Response) => Promise<void>, getVeterinarianDashboard: (req: Request, res: Response) => Promise<void>, getAllVeterinarians: (req: Request, res: Response) => Promise<void>;
export default veterinarianController;
//# sourceMappingURL=VeterinarianController.d.ts.map