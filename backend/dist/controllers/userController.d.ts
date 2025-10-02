import { Request, Response } from 'express';
export declare const registerUser: (req: Request, res: Response) => Promise<void>;
export declare const loginUser: (req: Request, res: Response) => Promise<void>;
export declare const getUserProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateUserProfile: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    registerUser: (req: Request, res: Response) => Promise<void>;
    loginUser: (req: Request, res: Response) => Promise<void>;
    getUserProfile: (req: Request, res: Response) => Promise<void>;
    updateUserProfile: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=userController.d.ts.map