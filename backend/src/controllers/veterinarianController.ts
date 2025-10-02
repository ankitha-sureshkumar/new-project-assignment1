import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Veterinarian, { IVeterinarian } from '../models/Veterinarian';
import User from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { getFileUrl } from '../middleware/upload';

// Register veterinarian
export const registerVeterinarian = async (req: Request, res: Response): Promise<void> => {
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
      specialization,
      experience,
      consultationFeeRange,
      hospitalsServed,
      availability
    } = req.body;

    // Check if email already exists (check both User and Veterinarian collections)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    const existingVet = await Veterinarian.findOne({ email: email.toLowerCase() });
    
    if (existingUser || existingVet) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Handle file uploads
    let profilePictureUrl: string | undefined;
    let certificationFiles: string[] = [];

    // Handle multiple file uploads if present
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Handle profile picture
      if (files.profilePicture && files.profilePicture[0]) {
        profilePictureUrl = getFileUrl(files.profilePicture[0].filename, 'profiles');
      }
      
      // Handle certifications
      if (files.certifications && files.certifications.length > 0) {
        certificationFiles = files.certifications.map(file => 
          getFileUrl(file.filename, 'certifications')
        );
      }
    }

    // Process availability data
    let processedAvailability: Array<{
      day: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }> = [];
    if (availability && Array.isArray(availability)) {
      processedAvailability = availability.map((day: string) => ({
        day,
        startTime: '09:00',
        endTime: '17:00',
        enabled: true
      }));
    }

    // Create veterinarian data object
    const veterinarianData: Partial<IVeterinarian> = {
      name,
      email: email.toLowerCase(),
      password,
      contact,
      specialization,
      experience,
      consultationFeeRange: {
        min: parseFloat(consultationFeeRange.min),
        max: parseFloat(consultationFeeRange.max)
      },
      hospitalsServed: hospitalsServed || '',
      availability: processedAvailability,
      certifications: certificationFiles,
      profilePicture: profilePictureUrl
    };

    // Create new veterinarian
    const veterinarian = new Veterinarian(veterinarianData);
    await veterinarian.save();

    // Generate tokens
    const token = generateToken(veterinarian);
    const refreshToken = generateRefreshToken(veterinarian._id?.toString() || '');

    // Remove password from response
    const veterinarianResponse: any = veterinarian.toObject();
    delete veterinarianResponse.password;

    res.status(201).json({
      success: true,
      message: 'Veterinarian registered successfully',
      data: {
        veterinarian: veterinarianResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Veterinarian registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Veterinarian registration failed'
    });
  }
};

// Login veterinarian
export const loginVeterinarian = async (req: Request, res: Response): Promise<void> => {
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

    // Find veterinarian by email and include password for comparison
    const veterinarian = await Veterinarian.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!veterinarian) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if veterinarian is approved
    if (veterinarian.approvalStatus !== 'approved') {
      const statusMessage = {
        pending: 'Your account is still pending approval. Please wait for admin approval before logging in.',
        rejected: 'Your account has been rejected. Please contact support for more information.'
      }[veterinarian.approvalStatus] || 'Your account is not approved for login.';
      
      res.status(401).json({
        success: false,
        message: statusMessage
      });
      return;
    }

    // Check if veterinarian is blocked
    if (veterinarian.isBlocked) {
      res.status(401).json({
        success: false,
        message: 'Your account has been blocked. Please contact support for assistance.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await veterinarian.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate tokens
    const token = generateToken(veterinarian);
    const refreshToken = generateRefreshToken(veterinarian._id?.toString() || '');

    // Remove password from response
    const veterinarianResponse: any = veterinarian.toObject();
    delete veterinarianResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        veterinarian: veterinarianResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Veterinarian login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get all veterinarians (public route for appointment booking)
export const getVeterinarians = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, available } = req.query;
    
    const filter: any = {
      // TEMPORARY: Allow pending veterinarians for testing
      // Change this back to 'approved' only in production
      approvalStatus: { $in: ['approved', 'pending'] }, 
      isBlocked: false
    };
    
    if (specialization) {
      filter.specialization = specialization;
    }

    const veterinarians = await Veterinarian.find(filter)
      .select('name email specialization experience consultationFeeRange availability rating totalReviews profilePicture')
      .sort({ rating: -1, totalReviews: -1 });

    // Filter by availability if requested
    let filteredVets = veterinarians;
    if (available === 'true') {
      // Show veterinarians who have at least one enabled availability day
      // instead of filtering only by today's availability
      filteredVets = veterinarians.filter(vet => {
        return vet.availability && vet.availability.some(avail => avail.enabled);
      });
    }

    res.json({
      success: true,
      data: {
        veterinarians: filteredVets,
        total: filteredVets.length
      }
    });

  } catch (error: any) {
    console.error('Get veterinarians error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get veterinarians'
    });
  }
};

// Get veterinarian by ID (public route)
export const getVeterinarianById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const veterinarian = await Veterinarian.findOne({
      _id: id,
      approvalStatus: 'approved',
      isBlocked: false
    }).select('name email specialization experience consultationFeeRange availability rating totalReviews profilePicture hospitalsServed');

    if (!veterinarian) {
      res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        veterinarian
      }
    });

  } catch (error: any) {
    console.error('Get veterinarian error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get veterinarian'
    });
  }
};

// Get veterinarian profile (protected route)
export const getVeterinarianProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const veterinarianId = req.userId;
    
    const veterinarian = await Veterinarian.findById(veterinarianId).select('-password');
    
    if (!veterinarian) {
      res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        veterinarian
      }
    });

  } catch (error: any) {
    console.error('Get veterinarian profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get veterinarian profile'
    });
  }
};

// Update veterinarian profile
export const updateVeterinarianProfile = async (req: Request, res: Response): Promise<void> => {
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

    const veterinarianId = req.userId;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.email;

    // Handle file uploads
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Handle profile picture update
      if (files.profilePicture && files.profilePicture[0]) {
        updateData.profilePicture = getFileUrl(files.profilePicture[0].filename, 'profiles');
      }
      
      // Handle certifications update
      if (files.certifications && files.certifications.length > 0) {
        const certificationFiles = files.certifications.map(file => 
          getFileUrl(file.filename, 'certifications')
        );
        updateData.certifications = certificationFiles;
      }
    }

    const veterinarian = await Veterinarian.findByIdAndUpdate(
      veterinarianId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!veterinarian) {
      res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        veterinarian
      }
    });

  } catch (error: any) {
    console.error('Update veterinarian profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

export default {
  registerVeterinarian,
  loginVeterinarian,
  getVeterinarians,
  getVeterinarianById,
  getVeterinarianProfile,
  updateVeterinarianProfile
};