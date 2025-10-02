import { Request, Response } from 'express';
export declare class AppointmentController {
    private notificationManager;
    private secureDataService;
    private pricingService;
    constructor();
    bookAppointment(req: Request, res: Response): Promise<void>;
    approveAppointment(req: Request, res: Response): Promise<void>;
    confirmAppointment(req: Request, res: Response): Promise<void>;
    completeAppointment(req: Request, res: Response): Promise<void>;
    getUserAppointments(req: Request, res: Response): Promise<void>;
    getVeterinarianAppointments(req: Request, res: Response): Promise<void>;
    getAvailableSlots(req: Request, res: Response): Promise<void>;
    rateAppointment(req: Request, res: Response): Promise<void>;
    private getTimeOfDay;
}
declare const appointmentController: AppointmentController;
export declare const bookAppointment: (req: Request, res: Response) => Promise<void>, approveAppointment: (req: Request, res: Response) => Promise<void>, confirmAppointment: (req: Request, res: Response) => Promise<void>, completeAppointment: (req: Request, res: Response) => Promise<void>, getUserAppointments: (req: Request, res: Response) => Promise<void>, getVeterinarianAppointments: (req: Request, res: Response) => Promise<void>, getAvailableSlots: (req: Request, res: Response) => Promise<void>, rateAppointment: (req: Request, res: Response) => Promise<void>;
export default appointmentController;
//# sourceMappingURL=AppointmentController.d.ts.map