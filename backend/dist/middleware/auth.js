"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.optionalAuth = exports.checkResourceOwnership = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
            return;
        }
        const token = authHeader.substring(7);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }
        const payload = (0, jwt_1.verifyToken)(token);
        let user = null;
        if (payload.role === 'user') {
            user = await User_1.default.findById(payload.userId).select('-password');
        }
        else if (payload.role === 'veterinarian') {
            user = await Veterinarian_1.default.findById(payload.userId).select('-password');
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
            return;
        }
        req.user = user;
        req.userId = user._id?.toString() || '';
        req.userRole = payload.role;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid token.'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
            return;
        }
        if (!roles.includes(req.userRole)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const checkResourceOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.userId;
            const userRole = req.userRole;
            if (userRole === 'veterinarian') {
                next();
                return;
            }
            if (!resourceId || !userId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing resource ID or user ID.'
                });
                return;
            }
            if (resourceId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own resources.'
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error during authorization check.'
            });
        }
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token) {
                try {
                    const payload = (0, jwt_1.verifyToken)(token);
                    let user = null;
                    if (payload.role === 'user') {
                        user = await User_1.default.findById(payload.userId).select('-password');
                    }
                    else if (payload.role === 'veterinarian') {
                        user = await Veterinarian_1.default.findById(payload.userId).select('-password');
                    }
                    if (user) {
                        req.user = user;
                        req.userId = user._id?.toString() || '';
                        req.userRole = payload.role;
                    }
                }
                catch (error) {
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
exports.authenticateToken = exports.authenticate;
//# sourceMappingURL=auth.js.map