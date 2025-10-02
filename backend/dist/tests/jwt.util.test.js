"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('JWT Utility - Unit Tests', () => {
    const JWT_SECRET = 'this-is-a-super-secret-key-for-testing';
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_EXPIRES_IN = '1h';
    const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        address: '123 Fake St'
    };
    it('should generate a valid JWT for a user', () => {
        const token = (0, jwt_1.generateToken)(mockUser);
        (0, chai_1.expect)(token).to.be.a('string');
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        (0, chai_1.expect)(decoded.userId).to.equal('user123');
        (0, chai_1.expect)(decoded.email).to.equal('test@example.com');
        (0, chai_1.expect)(decoded.role).to.equal('user');
        (0, chai_1.expect)(decoded.iss).to.equal('oggy-pet-hospital');
    });
    it('should verify a valid token and return the payload', () => {
        const token = (0, jwt_1.generateToken)(mockUser);
        const payload = (0, jwt_1.verifyToken)(token);
        (0, chai_1.expect)(payload).to.be.an('object');
        (0, chai_1.expect)(payload.userId).to.equal('user123');
        (0, chai_1.expect)(payload.role).to.equal('user');
    });
    it('should throw an error for an invalid token', () => {
        const invalidToken = 'this.is.not.a.real.token';
        (0, chai_1.expect)(() => (0, jwt_1.verifyToken)(invalidToken)).to.throw('Invalid token');
    });
    it('should throw an error for an expired token', () => {
        const expiredToken = jsonwebtoken_1.default.sign({ userId: 'user123', role: 'user' }, JWT_SECRET, { expiresIn: '-1s', issuer: 'oggy-pet-hospital', audience: 'oggy-pet-hospital-users' });
        (0, chai_1.expect)(() => (0, jwt_1.verifyToken)(expiredToken)).to.throw('Token has expired');
    });
    it('should throw an error if token has wrong issuer', () => {
        const wrongIssuerToken = jsonwebtoken_1.default.sign({ userId: 'user123', role: 'user' }, JWT_SECRET, { expiresIn: '1h', issuer: 'wrong-issuer' });
        (0, chai_1.expect)(() => (0, jwt_1.verifyToken)(wrongIssuerToken)).to.throw('Invalid token');
    });
    it('should generate and verify a refresh token', () => {
        const userId = 'user456';
        const refreshToken = (0, jwt_1.generateRefreshToken)(userId);
        (0, chai_1.expect)(refreshToken).to.be.a('string');
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        (0, chai_1.expect)(payload.userId).to.equal(userId);
    });
    it('should throw an error for an invalid refresh token', () => {
        const invalidRefreshToken = 'this.is.not.a.real.token';
        (0, chai_1.expect)(() => (0, jwt_1.verifyRefreshToken)(invalidRefreshToken)).to.throw('Invalid refresh token');
    });
    after(() => {
        delete process.env.JWT_SECRET;
        delete process.env.JWT_EXPIRES_IN;
    });
});
//# sourceMappingURL=jwt.util.test.js.map