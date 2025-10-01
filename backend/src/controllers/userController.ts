import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import Veterinarian from '../models/Veterinarian';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { getFileUrl } from '../middleware/upload';

// Register user (pet parent)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      name,
      email,
      password,
      contact,
      address,
      petOwnership,
      preferredContact
    } = req.body;

    // Check if user already exists (check both User and Veterinarian collections)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    const existingVet = await Veterinarian.findOne({ email: email.toLowerCase() });
    
    if (existingUser || existingVet) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Handle file upload
    let profilePictureUrl: string | undefined;
    if (req.file) {
      profilePictureUrl = getFileUrl(req.file.filename, 'profiles');
    }

    // Create user data object
    const userData: Partial<IUser> = {
      name,
      email: email.toLowerCase(),
      password,
      contact,
      address,
      petOwnership: petOwnership || '',
      preferredContact: preferredContact || 'email',
      profilePicture: profilePictureUrl
    };

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id?.toString() || '');

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'User registration failed'
    });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(401).json({
        success: false,
        message: 'Your account has been blocked. Please contact support for assistance.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id?.toString() || '');

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get user profile (via SecureDataAccessProxy)
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { SecureDataAccessProxy, RealDataAccessor } = await import('../patterns/AccessProxy');
    const { buildUserContext } = await import('../patterns/AccessContext');

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const context = buildUserContext(req as any);
    const proxy = new SecureDataAccessProxy(new RealDataAccessor());

    const user = await proxy.getUserData(userId, context);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const userId = req.userId;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.email;

    // Handle profile picture update
    if (req.file) {
      updateData.profilePicture = getFileUrl(req.file.filename, 'profiles');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error: any) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};