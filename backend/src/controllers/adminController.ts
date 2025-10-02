import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import User from '../models/User';
import Veterinarian from '../models/Veterinarian';
import Appointment from '../models/Appointment';
import { generateToken } from '../utils/jwt';
import mongoose from 'mongoose';

// Admin authentication
export const adminLogin = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken((admin._id as any).toString(), 'admin');

    // Remove password from response
    const adminResponse: any = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminResponse,
        token
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalVeterinarians = await Veterinarian.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const blockedVeterinarians = await Veterinarian.countDocuments({ isBlocked: true });
    
    // Veterinarian approval stats
    const pendingVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'pending' });
    const approvedVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'approved' });
    const rejectedVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'rejected' });
    
    // Get total appointments (if Appointment model exists)
    let totalAppointments = 0;
    try {
      totalAppointments = await Appointment.countDocuments();
    } catch (err) {
      // Appointment model might not exist yet
      console.log('Appointment model not available');
    }

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);

    const recentVeterinarians = await Veterinarian.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);

    const stats = {
      totalUsers,
      totalVeterinarians,
      pendingVeterinarians,
      approvedVeterinarians,
      rejectedVeterinarians,
      blockedUsers,
      blockedVeterinarians,
      totalAppointments,
      recentRegistrations: {
        users: recentUsers,
        veterinarians: recentVeterinarians
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users }
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all veterinarians
export const getAllVeterinarians = async (req: Request, res: Response): Promise<void> => {
  try {
    const veterinarians = await Veterinarian.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Veterinarians retrieved successfully',
      data: { veterinarians }
    });
  } catch (error: any) {
    console.error('Get all veterinarians error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update veterinarian
export const updateVeterinarian = async (req: Request, res: Response): Promise<void> => {
  try {
    const { veterinarianId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.password;

    const veterinarian = await Veterinarian.findByIdAndUpdate(
      veterinarianId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!veterinarian) {
      res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Veterinarian updated successfully',
      data: { veterinarian }
    });
  } catch (error: any) {
    console.error('Update veterinarian error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Perform user action (block, unblock, delete)
export const performUserAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, action, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!userId || !action) {
      res.status(400).json({
        success: false,
        message: 'User ID and action are required'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    switch (action) {
      case 'block':
        if (!reason) {
          res.status(400).json({
            success: false,
            message: 'Reason is required for blocking a user'
          });
          return;
        }
        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockedBy = adminId;
        user.blockReason = reason;
        await user.save();
        break;

      case 'unblock':
        user.isBlocked = false;
        user.blockedAt = undefined;
        user.blockedBy = undefined;
        user.blockReason = undefined;
        await user.save();
        break;

      case 'delete':
        await User.findByIdAndDelete(userId);
        res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        });
        return;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
        return;
    }

    res.status(200).json({
      success: true,
      message: `User ${action}ed successfully`,
      data: { user }
    });
  } catch (error: any) {
    console.error('Perform user action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Perform veterinarian action (approve, reject, block, unblock, delete)
export const performVeterinarianAction = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { veterinarianId, action, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!veterinarianId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Veterinarian ID and action are required'
      });
    }

    const veterinarian = await Veterinarian.findById(veterinarianId);
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    switch (action) {
      case 'approve':
        veterinarian.approvalStatus = 'approved';
        veterinarian.isApproved = true;
        veterinarian.approvedAt = new Date();
        veterinarian.approvedBy = adminId;
        // Clear any rejection data
        veterinarian.rejectedAt = undefined;
        veterinarian.rejectedBy = undefined;
        veterinarian.rejectionReason = undefined;
        await veterinarian.save();
        break;

      case 'reject':
        if (!reason) {
          return res.status(400).json({
            success: false,
            message: 'Reason is required for rejecting a veterinarian'
          });
        }
        veterinarian.approvalStatus = 'rejected';
        veterinarian.isApproved = false;
        veterinarian.rejectedAt = new Date();
        veterinarian.rejectedBy = adminId;
        veterinarian.rejectionReason = reason;
        // Clear any approval data
        veterinarian.approvedAt = undefined;
        veterinarian.approvedBy = undefined;
        await veterinarian.save();
        break;

      case 'block':
        if (!reason) {
          return res.status(400).json({
            success: false,
            message: 'Reason is required for blocking a veterinarian'
          });
        }
        veterinarian.isBlocked = true;
        veterinarian.blockedAt = new Date();
        veterinarian.blockedBy = adminId;
        veterinarian.blockReason = reason;
        await veterinarian.save();
        break;

      case 'unblock':
        veterinarian.isBlocked = false;
        veterinarian.blockedAt = undefined;
        veterinarian.blockedBy = undefined;
        veterinarian.blockReason = undefined;
        await veterinarian.save();
        break;

      case 'delete':
        await Veterinarian.findByIdAndDelete(veterinarianId);
        return res.status(200).json({
          success: true,
          message: 'Veterinarian deleted successfully'
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.status(200).json({
      success: true,
      message: `Veterinarian ${action}ed successfully`,
      data: { veterinarian }
    });
  } catch (error: any) {
    console.error('Perform veterinarian action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get system health status
export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json({
      success: true,
      message: 'System health retrieved successfully',
      data: healthStatus
    });
  } catch (error: any) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
