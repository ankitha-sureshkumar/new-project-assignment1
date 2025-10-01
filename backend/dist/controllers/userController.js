"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const jwt_1 = require("../utils/jwt");
const upload_1 = require("../middleware/upload");
const registerUser = async (req, res) => {
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
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
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
        const user = new User_1.default(userData);
        await user.save();
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id?.toString() || '');
        const userResponse = user.toObject();
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
    }
    catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'User registration failed'
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
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
        const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        if (user.isBlocked) {
            res.status(401).json({
                success: false,
                message: 'Your account has been blocked. Please contact support for assistance.'
            });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        const token = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id?.toString() || '');
        const userResponse = user.toObject();
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
    }
    catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};
exports.loginUser = loginUser;
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                user
            }
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get user profile'
        });
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
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
        const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
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
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};
exports.updateUserProfile = updateUserProfile;
exports.default = {
    registerUser: exports.registerUser,
    loginUser: exports.loginUser,
    getUserProfile: exports.getUserProfile,
    updateUserProfile: exports.updateUserProfile
};
//# sourceMappingURL=userController.js.map