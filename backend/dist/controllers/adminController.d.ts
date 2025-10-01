import { Request, Response } from 'express';
export declare const adminLogin: (req: Request, res: Response) => Promise<Response | void>;
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getAllVeterinarians: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<void>;
export declare const updateVeterinarian: (req: Request, res: Response) => Promise<void>;
export declare const performUserAction: (req: Request, res: Response) => Promise<void>;
export declare const performVeterinarianAction: (req: Request, res: Response) => Promise<Response | void>;
export declare const getSystemHealth: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map