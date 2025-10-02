import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AppointmentController {
    private notificationManager;
    constructor();
    bookAppointment(req: AuthRequest, res: Response): Promise<void>;
    getMyAppointments(req: AuthRequest, res: Response): Promise<void>;
    getAllAppointments(req: Request, res: Response): Promise<void>;
    getAppointmentStats(req: AuthRequest, res: Response): Promise<void>;
    getAppointmentById(req: AuthRequest, res: Response): Promise<void>;
    approveAppointment(req: AuthRequest, res: Response): Promise<void>;
    confirmAppointment(req: AuthRequest, res: Response): Promise<void>;
    completeAppointment(req: AuthRequest, res: Response): Promise<void>;
    cancelAppointment(req: AuthRequest, res: Response): Promise<void>;
    rejectAppointment(req: AuthRequest, res: Response): Promise<void>;
    rescheduleAppointment(req: AuthRequest, res: Response): Promise<void>;
    rateAppointment(req: AuthRequest, res: Response): Promise<void>;
    getUserAppointments(req: Request, res: Response): Promise<void>;
    getVetAppointments(req: Request, res: Response): Promise<void>;
    getAvailableSlots(req: Request, res: Response): Promise<void>;
    getPetAppointments(req: Request, res: Response): Promise<void>;
    getTodaysSchedule(req: Request, res: Response): Promise<void>;
    getUpcomingReminders(req: Request, res: Response): Promise<void>;
}
declare const appointmentController: AppointmentController;
export default appointmentController;
//# sourceMappingURL=AppointmentController.d.ts.map