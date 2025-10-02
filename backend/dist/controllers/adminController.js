"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.performVeterinarianAction = exports.performUserAction = exports.updateVeterinarian = exports.updateUser = exports.getAllVeterinarians = exports.getAllUsers = exports.getDashboardStats = exports.adminLogin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const User_1 = __importDefault(require("../models/User"));
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const jwt_1 = require("../utils/jwt");
const mongoose_1 = __importDefault(require("mongoose"));
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        const admin = await Admin_1.default.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated'
            });
        }
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        admin.lastLogin = new Date();
        await admin.save();
        const token = (0, jwt_1.generateToken)(admin._id.toString(), 'admin');
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
                admin: adminResponse,
                token
            }
        });
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.adminLogin = adminLogin;
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalVeterinarians = await Veterinarian_1.default.countDocuments();
        const blockedUsers = await User_1.default.countDocuments({ isBlocked: true });
        const blockedVeterinarians = await Veterinarian_1.default.countDocuments({ isBlocked: true });
        const pendingVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'pending' });
        const approvedVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'approved' });
        const rejectedVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'rejected' });
        let totalAppointments = 0;
        try {
            totalAppointments = await Appointment_1.default.countDocuments();
        }
        catch (err) {
            console.log('Appointment model not available');
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await User_1.default.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 }).limit(10);
        const recentVeterinarians = await Veterinarian_1.default.find({
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
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: { users }
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getAllUsers = getAllUsers;
const getAllVeterinarians = async (req, res) => {
    try {
        const veterinarians = await Veterinarian_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Veterinarians retrieved successfully',
            data: { veterinarians }
        });
    }
    catch (error) {
        console.error('Get all veterinarians error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getAllVeterinarians = getAllVeterinarians;
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.password;
        const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.updateUser = updateUser;
const updateVeterinarian = async (req, res) => {
    try {
        const { veterinarianId } = req.params;
        const updateData = req.body;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.password;
        const veterinarian = await Veterinarian_1.default.findByIdAndUpdate(veterinarianId, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        console.error('Update veterinarian error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.updateVeterinarian = updateVeterinarian;
const performUserAction = async (req, res) => {
    try {
        const { userId, action, reason } = req.body;
        const adminId = req.user.id;
        if (!userId || !action) {
            res.status(400).json({
                success: false,
                message: 'User ID and action are required'
            });
            return;
        }
        const user = await User_1.default.findById(userId);
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
                await User_1.default.findByIdAndDelete(userId);
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
    }
    catch (error) {
        console.error('Perform user action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.performUserAction = performUserAction;
const performVeterinarianAction = async (req, res) => {
    try {
        const { veterinarianId, action, reason } = req.body;
        const adminId = req.user.id;
        if (!veterinarianId || !action) {
            return res.status(400).json({
                success: false,
                message: 'Veterinarian ID and action are required'
            });
        }
        const veterinarian = await Veterinarian_1.default.findById(veterinarianId);
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
                await Veterinarian_1.default.findByIdAndDelete(veterinarianId);
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
    }
    catch (error) {
        console.error('Perform veterinarian action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.performVeterinarianAction = performVeterinarianAction;
const getSystemHealth = async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        };
        res.status(200).json({
            success: true,
            message: 'System health retrieved successfully',
            data: healthStatus
        });
    }
    catch (error) {
        console.error('Get system health error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getSystemHealth = getSystemHealth;
//# sourceMappingURL=adminController.js.map