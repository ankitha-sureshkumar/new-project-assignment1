"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateRefreshToken = exports.verifyToken = void 0;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateToken(userOrId, role) {
    let payload;
    if (typeof userOrId === 'string' && role === 'admin') {
        payload = {
            id: userOrId,
            role: 'admin'
        };
    }
    else {
        const user = userOrId;
        const userRole = 'address' in user ? 'user' : 'permissions' in user ? 'admin' : 'veterinarian';
        payload = {
            userId: user._id?.toString() || '',
            email: user.email,
            role: userRole
        };
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'oggy-pet-hospital',
        audience: 'oggy-pet-hospital-users'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
;
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jsonwebtoken_1.default.verify(token, secret, {
            issuer: 'oggy-pet-hospital',
            audience: 'oggy-pet-hospital-users'
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw new Error('Token verification failed');
    }
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const options = {
        expiresIn: '30d',
        issuer: 'oggy-pet-hospital',
        audience: 'oggy-pet-hospital-refresh'
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jsonwebtoken_1.default.verify(token, secret, {
            issuer: 'oggy-pet-hospital',
            audience: 'oggy-pet-hospital-refresh'
        });
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map