import { Request, Response } from 'express';
export declare class DashboardController {
    private dashboardFacade;
    private dashboardServiceUser;
    private dashboardServiceVet;
    constructor();
    getDashboard(req: Request, res: Response): Promise<void>;
    getDashboardSummary(req: Request, res: Response): Promise<void>;
    getNotifications(req: Request, res: Response): Promise<void>;
    getUserDashboard(req: Request, res: Response): Promise<void>;
    getVeterinarianDashboard(req: Request, res: Response): Promise<void>;
    getAdminDashboard(req: Request, res: Response): Promise<void>;
    getSystemHealth(req: Request, res: Response): Promise<void>;
    getMyDashboard(req: Request, res: Response): Promise<void>;
    markNotificationRead(req: Request, res: Response): Promise<void>;
    getDashboardByDateRange(req: Request, res: Response): Promise<void>;
}
declare const dashboardController: DashboardController;
export default dashboardController;
//# sourceMappingURL=DashboardController.d.ts.map