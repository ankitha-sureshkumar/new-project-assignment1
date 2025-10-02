
import { expect } from 'chai';
import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

describe('JWT Utility - Unit Tests', () => {

  // Set a dummy secret for testing purposes
  const JWT_SECRET = 'this-is-a-super-secret-key-for-testing';
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_EXPIRES_IN = '1h';

  const mockUser: Partial<IUser> = {
    _id: 'user123',
    email: 'test@example.com',
    // This is how we can distinguish a user model
    address: '123 Fake St' 
  };

  it('should generate a valid JWT for a user', () => {
    const token = generateToken(mockUser as IUser);
    expect(token).to.be.a('string');

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.userId).to.equal('user123');
    expect(decoded.email).to.equal('test@example.com');
    expect(decoded.role).to.equal('user');
    expect(decoded.iss).to.equal('oggy-pet-hospital');
  });

  it('should verify a valid token and return the payload', () => {
    const token = generateToken(mockUser as IUser);
    const payload = verifyToken(token);

    expect(payload).to.be.an('object');
    expect(payload.userId).to.equal('user123');
    expect(payload.role).to.equal('user');
  });

  it('should throw an error for an invalid token', () => {
    const invalidToken = 'this.is.not.a.real.token';
    expect(() => verifyToken(invalidToken)).to.throw('Invalid token');
  });

  it('should throw an error for an expired token', () => {
    // Create a token that expired 1 second ago
    const expiredToken = jwt.sign(
      { userId: 'user123', role: 'user' },
      JWT_SECRET,
      { expiresIn: '-1s', issuer: 'oggy-pet-hospital', audience: 'oggy-pet-hospital-users' }
    );

    expect(() => verifyToken(expiredToken)).to.throw('Token has expired');
  });

  it('should throw an error if token has wrong issuer', () => {
    const wrongIssuerToken = jwt.sign(
      { userId: 'user123', role: 'user' },
      JWT_SECRET,
      { expiresIn: '1h', issuer: 'wrong-issuer' }
    );

    expect(() => verifyToken(wrongIssuerToken)).to.throw('Invalid token');
  });

  it('should generate and verify a refresh token', () => {
    const userId = 'user456';
    const refreshToken = generateRefreshToken(userId);
    expect(refreshToken).to.be.a('string');

    const payload = verifyRefreshToken(refreshToken);
    expect(payload.userId).to.equal(userId);
  });

  it('should throw an error for an invalid refresh token', () => {
    const invalidRefreshToken = 'this.is.not.a.real.token';
    expect(() => verifyRefreshToken(invalidRefreshToken)).to.throw('Invalid refresh token');
  });

  // Clean up environment variables after tests
  after(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });
});
