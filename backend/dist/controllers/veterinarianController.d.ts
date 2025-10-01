import { Request, Response } from 'express';
export declare const registerVeterinarian: (req: Request, res: Response) => Promise<void>;
export declare const loginVeterinarian: (req: Request, res: Response) => Promise<void>;
export declare const getVeterinarians: (req: Request, res: Response) => Promise<void>;
export declare const getVeterinarianById: (req: Request, res: Response) => Promise<void>;
export declare const getVeterinarianProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateVeterinarianProfile: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    registerVeterinarian: (req: Request, res: Response) => Promise<void>;
    loginVeterinarian: (req: Request, res: Response) => Promise<void>;
    getVeterinarians: (req: Request, res: Response) => Promise<void>;
    getVeterinarianById: (req: Request, res: Response) => Promise<void>;
    getVeterinarianProfile: (req: Request, res: Response) => Promise<void>;
    updateVeterinarianProfile: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=veterinarianController.d.ts.map