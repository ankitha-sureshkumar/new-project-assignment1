import User, { IUser } from '../models/User';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  list(limit?: number): Promise<IUser[]>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('-password');
  }
  async list(limit: number = 50): Promise<IUser[]> {
    return User.find().select('-password').sort({ createdAt: -1 }).limit(limit);
  }
}