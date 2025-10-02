import { Request, Response } from 'express';
export declare class AvailabilityController {
    getMyAvailability(req: Request, res: Response): Promise<void>;
    updateAvailability(req: Request, res: Response): Promise<void>;
    toggleTimeSlot(req: Request, res: Response): Promise<void>;
    getAvailableSlots(req: Request, res: Response): Promise<void>;
    private generateTimeSlots;
}
declare const availabilityController: AvailabilityController;
export default availabilityController;
//# sourceMappingURL=AvailabilityController.d.ts.map