import { Request, Response } from 'express';
export declare class AdminController {
    private dashboardFacade;
    private notificationManager;
    private secureDataService;
    constructor();
    adminLogin(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
    getAllVeterinarians(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    updateVeterinarian(req: Request, res: Response): Promise<void>;
    performUserAction(req: Request, res: Response): Promise<void>;
    performVeterinarianAction(req: Request, res: Response): Promise<void>;
    getSystemHealth(req: Request, res: Response): Promise<void>;
}
declare const adminController: AdminController;
export declare const adminLogin: (req: Request, res: Response) => Promise<void>, getDashboardStats: (req: Request, res: Response) => Promise<void>, getAllUsers: (req: Request, res: Response) => Promise<void>, getAllVeterinarians: (req: Request, res: Response) => Promise<void>, updateUser: (req: Request, res: Response) => Promise<void>, updateVeterinarian: (req: Request, res: Response) => Promise<void>, performUserAction: (req: Request, res: Response) => Promise<void>, performVeterinarianAction: (req: Request, res: Response) => Promise<void>, getSystemHealth: (req: Request, res: Response) => Promise<void>;
export default adminController;
//# sourceMappingURL=AdminController.d.ts.map