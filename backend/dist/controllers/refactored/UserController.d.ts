import { Request, Response } from 'express';
export declare class UserController {
    private dashboardFacade;
    private notificationManager;
    private secureDataService;
    constructor();
    registerUser(req: Request, res: Response): Promise<void>;
    loginUser(req: Request, res: Response): Promise<void>;
    getUserProfile(req: Request, res: Response): Promise<void>;
    getUserDashboard(req: Request, res: Response): Promise<void>;
    updateUserProfile(req: Request, res: Response): Promise<void>;
    private mongoToUserInstance;
}
declare const userController: UserController;
export declare const registerUser: (req: Request, res: Response) => Promise<void>, loginUser: (req: Request, res: Response) => Promise<void>, getUserProfile: (req: Request, res: Response) => Promise<void>, updateUserProfile: (req: Request, res: Response) => Promise<void>;
export default userController;
//# sourceMappingURL=UserController.d.ts.map