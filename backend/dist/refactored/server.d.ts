import { Application } from 'express';
declare class PetHospitalServer {
    private app;
    private notificationManager;
    private dashboardFacade;
    constructor();
    private setupSecurity;
    private setupMiddleware;
    private setupRoutes;
    private setupErrorHandling;
    private initializeServices;
    start(): Promise<void>;
    shutdown(): Promise<void>;
    getApp(): Application;
}
declare const server: PetHospitalServer;
export default server;
export { PetHospitalServer };
//# sourceMappingURL=server.d.ts.map