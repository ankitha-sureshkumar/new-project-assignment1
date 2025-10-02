"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: 'JWT secret not configured'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        const admin = await Admin_1.default.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found.'
            });
        }
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated.'
            });
        }
        req.user = {
            id: admin._id.toString(),
            role: 'admin',
            admin: admin
        };
        next();
    }
    catch (error) {
        console.error('Admin authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
//# sourceMappingURL=adminAuth.js.map