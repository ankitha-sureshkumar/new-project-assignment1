"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.performVeterinarianAction = exports.performUserAction = exports.updateVeterinarian = exports.updateUser = exports.getAllVeterinarians = exports.getAllUsers = exports.getDashboardStats = exports.adminLogin = exports.AdminController = void 0;
const express_validator_1 = require("express-validator");
const DashboardFacade_1 = require("../../patterns/DashboardFacade");
const NotificationObserver_1 = require("../../patterns/NotificationObserver");
const AccessProxy_1 = require("../../patterns/AccessProxy");
const jwt_1 = require("../../utils/jwt");
const Admin_1 = __importDefault(require("../../models/Admin"));
const User_1 = __importDefault(require("../../models/User"));
const Veterinarian_1 = __importDefault(require("../../models/Veterinarian"));
class AdminController {
    constructor() {
        this.dashboardFacade = new DashboardFacade_1.DashboardFacade();
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.secureDataService = new AccessProxy_1.SecureDataService();
    }
    async adminLogin(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const { email, password } = req.body;
            const admin = await Admin_1.default.findOne({ email }).select('+password');
            if (!admin) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            if (!admin.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Admin account is deactivated'
                });
                return;
            }
            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            admin.lastLogin = new Date();
            await admin.save();
            const token = (0, jwt_1.generateToken)(admin._id.toString(), 'admin');
            const adminResponse = admin.toObject();
            delete adminResponse.password;
            await this.notificationManager.onAdminLogin(adminResponse);
            res.status(200).json({
                success: true,
                message: 'Admin login successful',
                data: {
                    admin: adminResponse,
                    token,
                    sessionInfo: {
                        loginTime: admin.lastLogin,
                        permissions: ['ADMIN_ALL']
                    }
                }
            });
            console.log(`✅ Admin logged in: ${email} using enhanced security`);
        }
        catch (error) {
            console.error('❌ Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async getDashboardStats(req, res) {
        try {
            const adminId = req.user.id;
            const dashboardStats = await this.dashboardFacade.getAdminDashboard(adminId);
            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: dashboardStats
            });
            console.log(`✅ Admin dashboard stats retrieved using Facade pattern`);
        }
        catch (error) {
            console.error('❌ Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const adminId = req.user.id;
            const adminContext = {
                userId: adminId,
                role: 'admin',
                permissions: ['READ_ALL_USERS', 'ADMIN_ACCESS']
            };
            const secureProxy = AccessProxy_1.ProxyFactory.createProxy(adminContext);
            const users = await secureProxy.getAllUsers();
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    count: users.length,
                    retrievedBy: 'SecureProxy'
                }
            });
            console.log(`✅ Admin retrieved all users using Proxy pattern`);
        }
        catch (error) {
            console.error('❌ Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async getAllVeterinarians(req, res) {
        try {
            const adminId = req.user.id;
            const adminContext = {
                userId: adminId,
                role: 'admin',
                permissions: ['READ_ALL_VETERINARIANS', 'ADMIN_ACCESS']
            };
            const secureProxy = AccessProxy_1.ProxyFactory.createProxy(adminContext);
            const veterinarians = await secureProxy.getAllVeterinarians();
            res.status(200).json({
                success: true,
                message: 'Veterinarians retrieved successfully',
                data: {
                    veterinarians,
                    count: veterinarians.length,
                    retrievedBy: 'SecureProxy'
                }
            });
            console.log(`✅ Admin retrieved all veterinarians using Proxy pattern`);
        }
        catch (error) {
            console.error('❌ Get all veterinarians error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updateData = req.body;
            const adminId = req.user.id;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.password;
            const user = await User_1.default.findByIdAndUpdate(userId, { ...updateData, lastModifiedBy: adminId }, { new: true, runValidators: true });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            await this.notificationManager.onUserProfileUpdated(user.toObject(), adminId);
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: {
                    user,
                    updatedBy: 'admin',
                    updateTime: new Date()
                }
            });
            console.log(`✅ Admin updated user: ${userId} with Observer notification`);
        }
        catch (error) {
            console.error('❌ Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async updateVeterinarian(req, res) {
        try {
            const { veterinarianId } = req.params;
            const updateData = req.body;
            const adminId = req.user.id;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.password;
            const veterinarian = await Veterinarian_1.default.findByIdAndUpdate(veterinarianId, { ...updateData, lastModifiedBy: adminId }, { new: true, runValidators: true });
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            await this.notificationManager.onVeterinarianProfileUpdated(veterinarian.toObject(), adminId);
            res.status(200).json({
                success: true,
                message: 'Veterinarian updated successfully',
                data: {
                    veterinarian,
                    updatedBy: 'admin',
                    updateTime: new Date()
                }
            });
            console.log(`✅ Admin updated veterinarian: ${veterinarianId} with Observer notification`);
        }
        catch (error) {
            console.error('❌ Update veterinarian error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async performUserAction(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
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
            let actionResult = {};
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
                    await this.notificationManager.onUserBlocked(user.toObject(), reason, adminId);
                    actionResult = { action: 'blocked', reason };
                    break;
                case 'unblock':
                    user.isBlocked = false;
                    user.blockedAt = undefined;
                    user.blockedBy = undefined;
                    user.blockReason = undefined;
                    await user.save();
                    await this.notificationManager.onUserUnblocked(user.toObject(), adminId);
                    actionResult = { action: 'unblocked' };
                    break;
                case 'delete':
                    const userData = user.toObject();
                    await User_1.default.findByIdAndDelete(userId);
                    await this.notificationManager.onUserDeleted(userData, adminId);
                    res.status(200).json({
                        success: true,
                        message: 'User deleted successfully',
                        data: {
                            action: 'deleted',
                            deletedUser: userData.email,
                            deletedBy: adminId,
                            deletionTime: new Date()
                        }
                    });
                    return;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Invalid action. Allowed actions: block, unblock, delete'
                    });
                    return;
            }
            res.status(200).json({
                success: true,
                message: `User ${action}ed successfully`,
                data: {
                    user,
                    actionResult,
                    performedBy: adminId,
                    actionTime: new Date()
                }
            });
            console.log(`✅ Admin performed action '${action}' on user: ${userId} using Observer pattern`);
        }
        catch (error) {
            console.error('❌ Perform user action error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async performVeterinarianAction(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const { veterinarianId, action, reason } = req.body;
            const adminId = req.user.id;
            if (!veterinarianId || !action) {
                res.status(400).json({
                    success: false,
                    message: 'Veterinarian ID and action are required'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findById(veterinarianId);
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            let actionResult = {};
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
                    await this.notificationManager.onVeterinarianApproved(veterinarian.toObject());
                    actionResult = { action: 'approved', approvedAt: veterinarian.approvedAt };
                    break;
                case 'reject':
                    if (!reason) {
                        res.status(400).json({
                            success: false,
                            message: 'Reason is required for rejecting a veterinarian'
                        });
                        return;
                    }
                    veterinarian.approvalStatus = 'rejected';
                    veterinarian.isApproved = false;
                    veterinarian.rejectedAt = new Date();
                    veterinarian.rejectedBy = adminId;
                    veterinarian.rejectionReason = reason;
                    veterinarian.approvedAt = undefined;
                    veterinarian.approvedBy = undefined;
                    await veterinarian.save();
                    await this.notificationManager.onVeterinarianRejected(veterinarian.toObject());
                    actionResult = { action: 'rejected', reason, rejectedAt: veterinarian.rejectedAt };
                    break;
                case 'block':
                    if (!reason) {
                        res.status(400).json({
                            success: false,
                            message: 'Reason is required for blocking a veterinarian'
                        });
                        return;
                    }
                    veterinarian.isBlocked = true;
                    veterinarian.blockedAt = new Date();
                    veterinarian.blockedBy = adminId;
                    veterinarian.blockReason = reason;
                    await veterinarian.save();
                    await this.notificationManager.onVeterinarianBlocked(veterinarian.toObject(), reason, adminId);
                    actionResult = { action: 'blocked', reason };
                    break;
                case 'unblock':
                    veterinarian.isBlocked = false;
                    veterinarian.blockedAt = undefined;
                    veterinarian.blockedBy = undefined;
                    veterinarian.blockReason = undefined;
                    await veterinarian.save();
                    await this.notificationManager.onVeterinarianUnblocked(veterinarian.toObject(), adminId);
                    actionResult = { action: 'unblocked' };
                    break;
                case 'delete':
                    const veterinarianData = veterinarian.toObject();
                    await Veterinarian_1.default.findByIdAndDelete(veterinarianId);
                    await this.notificationManager.onVeterinarianDeleted(veterinarianData, adminId);
                    res.status(200).json({
                        success: true,
                        message: 'Veterinarian deleted successfully',
                        data: {
                            action: 'deleted',
                            deletedVeterinarian: veterinarianData.email,
                            deletedBy: adminId,
                            deletionTime: new Date()
                        }
                    });
                    return;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Invalid action. Allowed actions: approve, reject, block, unblock, delete'
                    });
                    return;
            }
            res.status(200).json({
                success: true,
                message: `Veterinarian ${action}ed successfully`,
                data: {
                    veterinarian,
                    actionResult,
                    performedBy: adminId,
                    actionTime: new Date()
                }
            });
            console.log(`✅ Admin performed action '${action}' on veterinarian: ${veterinarianId} using Observer pattern`);
        }
        catch (error) {
            console.error('❌ Perform veterinarian action error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    async getSystemHealth(req, res) {
        try {
            const adminId = req.user.id;
            const systemHealth = await this.dashboardFacade.getSystemHealthMetrics(adminId);
            res.status(200).json({
                success: true,
                message: 'System health metrics retrieved successfully',
                data: systemHealth
            });
            console.log(`✅ Admin retrieved system health using Facade pattern`);
        }
        catch (error) {
            console.error('❌ Get system health error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}
exports.AdminController = AdminController;
const adminController = new AdminController();
_a = {
    adminLogin: adminController.adminLogin.bind(adminController),
    getDashboardStats: adminController.getDashboardStats.bind(adminController),
    getAllUsers: adminController.getAllUsers.bind(adminController),
    getAllVeterinarians: adminController.getAllVeterinarians.bind(adminController),
    updateUser: adminController.updateUser.bind(adminController),
    updateVeterinarian: adminController.updateVeterinarian.bind(adminController),
    performUserAction: adminController.performUserAction.bind(adminController),
    performVeterinarianAction: adminController.performVeterinarianAction.bind(adminController),
    getSystemHealth: adminController.getSystemHealth.bind(adminController)
}, exports.adminLogin = _a.adminLogin, exports.getDashboardStats = _a.getDashboardStats, exports.getAllUsers = _a.getAllUsers, exports.getAllVeterinarians = _a.getAllVeterinarians, exports.updateUser = _a.updateUser, exports.updateVeterinarian = _a.updateVeterinarian, exports.performUserAction = _a.performUserAction, exports.performVeterinarianAction = _a.performVeterinarianAction, exports.getSystemHealth = _a.getSystemHealth;
exports.default = adminController;
//# sourceMappingURL=AdminController.js.map