"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = exports.UserController = void 0;
const express_validator_1 = require("express-validator");
const UserFactory_1 = require("../../patterns/UserFactory");
const DashboardFacade_1 = require("../../patterns/DashboardFacade");
const NotificationObserver_1 = require("../../patterns/NotificationObserver");
const AccessProxy_1 = require("../../patterns/AccessProxy");
const Singletons_1 = require("../../patterns/Singletons");
const jwt_1 = require("../../utils/jwt");
const User_1 = require("../../classes/User");
const upload_1 = require("../../middleware/upload");
const User_2 = __importDefault(require("../../models/User"));
const Veterinarian_1 = __importDefault(require("../../models/Veterinarian"));
class UserController {
    constructor() {
        this.dashboardFacade = new DashboardFacade_1.DashboardFacade();
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.secureDataService = new AccessProxy_1.SecureDataService();
    }
    async registerUser(req, res) {
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
            const { name, email, password, contact, address, petOwnership, preferredContact } = req.body;
            const existingUser = await User_2.default.findOne({ email: email.toLowerCase() });
            const existingVet = await Veterinarian_1.default.findOne({ email: email.toLowerCase() });
            if (existingUser || existingVet) {
                res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
                return;
            }
            let profilePictureUrl;
            if (req.file) {
                profilePictureUrl = (0, upload_1.getFileUrl)(req.file.filename, 'profiles');
            }
            const userData = {
                name,
                email: email.toLowerCase(),
                password,
                contact,
                address,
                petOwnership: petOwnership || '',
                preferredContact: preferredContact || 'email',
                profilePicture: profilePictureUrl
            };
            const userInstance = await UserFactory_1.RegistrationService.registerUser('user', userData);
            const mongoUser = new User_2.default(userData);
            await mongoUser.save();
            const jwtConfig = Singletons_1.configManager.getJWTConfig();
            const token = (0, jwt_1.generateToken)(mongoUser);
            const refreshToken = (0, jwt_1.generateRefreshToken)(mongoUser._id?.toString() || '');
            await this.notificationManager.onUserRegistered(mongoUser.toObject());
            const userResponse = mongoUser.toObject();
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
            console.log(`✅ User registered successfully: ${email} using Factory Pattern`);
        }
        catch (error) {
            console.error('❌ User registration error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'User registration failed'
            });
        }
    }
    async loginUser(req, res) {
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
            const mongoUser = await User_2.default.findOne({ email: email.toLowerCase() }).select('+password');
            if (!mongoUser) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            const userInstance = this.mongoToUserInstance(mongoUser);
            const isPasswordValid = await userInstance.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            if (userInstance.isBlocked) {
                res.status(401).json({
                    success: false,
                    message: 'Your account has been blocked. Please contact support for assistance.'
                });
                return;
            }
            const token = (0, jwt_1.generateToken)(mongoUser);
            const refreshToken = (0, jwt_1.generateRefreshToken)(mongoUser._id?.toString() || '');
            const userResponse = mongoUser.toObject();
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
            console.log(`✅ User logged in successfully: ${email} using OOP validation`);
        }
        catch (error) {
            console.error('❌ User login error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    async getUserProfile(req, res) {
        try {
            const userId = req.userId;
            const userContext = {
                userId: userId,
                role: 'user',
                permissions: ['READ_OWN_DATA']
            };
            const secureProxy = AccessProxy_1.ProxyFactory.createProxy(userContext);
            const userData = await secureProxy.getUserById(userId);
            if (!userData) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    user: userData
                }
            });
            console.log(`✅ User profile accessed securely via Proxy Pattern: ${userId}`);
        }
        catch (error) {
            console.error('❌ Get user profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get user profile'
            });
        }
    }
    async getUserDashboard(req, res) {
        try {
            const userId = req.userId;
            const dashboardData = await this.dashboardFacade.getUserDashboard(userId);
            res.json({
                success: true,
                data: dashboardData
            });
            console.log(`✅ Dashboard generated via Facade Pattern for: ${userId}`);
        }
        catch (error) {
            console.error('❌ Get user dashboard error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get user dashboard'
            });
        }
    }
    async updateUserProfile(req, res) {
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
            const userId = req.userId;
            const updateData = req.body;
            delete updateData.password;
            delete updateData.email;
            if (req.file) {
                updateData.profilePicture = (0, upload_1.getFileUrl)(req.file.filename, 'profiles');
            }
            const mongoUser = await User_2.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
            if (!mongoUser) {
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
                    user: mongoUser
                }
            });
            console.log(`✅ User profile updated: ${userId}`);
        }
        catch (error) {
            console.error('❌ Update user profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update user profile'
            });
        }
    }
    mongoToUserInstance(mongoDoc) {
        const data = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;
        return new User_1.User(data._id?.toString() || data.id, data.name, data.email, data.password, data.contact, data.address, data.petOwnership, data.preferredContact, data.profilePicture);
    }
}
exports.UserController = UserController;
const userController = new UserController();
_a = {
    registerUser: userController.registerUser.bind(userController),
    loginUser: userController.loginUser.bind(userController),
    getUserProfile: userController.getUserProfile.bind(userController),
    updateUserProfile: userController.updateUserProfile.bind(userController)
}, exports.registerUser = _a.registerUser, exports.loginUser = _a.loginUser, exports.getUserProfile = _a.getUserProfile, exports.updateUserProfile = _a.updateUserProfile;
exports.default = userController;
//# sourceMappingURL=UserController.js.map