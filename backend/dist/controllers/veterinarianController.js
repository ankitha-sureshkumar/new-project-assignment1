"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVeterinarianProfile = exports.getVeterinarianProfile = exports.getVeterinarianById = exports.getVeterinarians = exports.loginVeterinarian = exports.registerVeterinarian = void 0;
const express_validator_1 = require("express-validator");
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const upload_1 = require("../middleware/upload");
const registerVeterinarian = async (req, res) => {
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
        const { name, email, password, contact, specialization, experience, consultationFeeRange, hospitalsServed, availability } = req.body;
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
        let certificationFiles = [];
        if (req.files) {
            const files = req.files;
            if (files.profilePicture && files.profilePicture[0]) {
                profilePictureUrl = (0, upload_1.getFileUrl)(files.profilePicture[0].filename, 'profiles');
            }
            if (files.certifications && files.certifications.length > 0) {
                certificationFiles = files.certifications.map(file => (0, upload_1.getFileUrl)(file.filename, 'certifications'));
            }
        }
        let processedAvailability = [];
        if (availability && Array.isArray(availability)) {
            processedAvailability = availability.map((day) => ({
                day,
                startTime: '09:00',
                endTime: '17:00',
                enabled: true
            }));
        }
        const veterinarianData = {
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
        const veterinarian = new Veterinarian_1.default(veterinarianData);
        await veterinarian.save();
        const token = (0, jwt_1.generateToken)(veterinarian);
        const refreshToken = (0, jwt_1.generateRefreshToken)(veterinarian._id?.toString() || '');
        const veterinarianResponse = veterinarian.toObject();
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
    }
    catch (error) {
        console.error('Veterinarian registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Veterinarian registration failed'
        });
    }
};
exports.registerVeterinarian = registerVeterinarian;
const loginVeterinarian = async (req, res) => {
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
        const veterinarian = await Veterinarian_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        if (!veterinarian) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
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
        if (veterinarian.isBlocked) {
            res.status(401).json({
                success: false,
                message: 'Your account has been blocked. Please contact support for assistance.'
            });
            return;
        }
        const isPasswordValid = await veterinarian.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        const token = (0, jwt_1.generateToken)(veterinarian);
        const refreshToken = (0, jwt_1.generateRefreshToken)(veterinarian._id?.toString() || '');
        const veterinarianResponse = veterinarian.toObject();
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
    }
    catch (error) {
        console.error('Veterinarian login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};
exports.loginVeterinarian = loginVeterinarian;
const getVeterinarians = async (req, res) => {
    try {
        const { specialization, available } = req.query;
        const filter = {
            approvalStatus: { $in: ['approved', 'pending'] },
            isBlocked: false
        };
        if (specialization) {
            filter.specialization = specialization;
        }
        const veterinarians = await Veterinarian_1.default.find(filter)
            .select('name email specialization experience consultationFeeRange availability rating totalReviews profilePicture')
            .sort({ rating: -1, totalReviews: -1 });
        let filteredVets = veterinarians;
        if (available === 'true') {
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
    }
    catch (error) {
        console.error('Get veterinarians error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get veterinarians'
        });
    }
};
exports.getVeterinarians = getVeterinarians;
const getVeterinarianById = async (req, res) => {
    try {
        const { id } = req.params;
        const veterinarian = await Veterinarian_1.default.findOne({
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
    }
    catch (error) {
        console.error('Get veterinarian error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get veterinarian'
        });
    }
};
exports.getVeterinarianById = getVeterinarianById;
const getVeterinarianProfile = async (req, res) => {
    try {
        const veterinarianId = req.userId;
        const veterinarian = await Veterinarian_1.default.findById(veterinarianId).select('-password');
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
    }
    catch (error) {
        console.error('Get veterinarian profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get veterinarian profile'
        });
    }
};
exports.getVeterinarianProfile = getVeterinarianProfile;
const updateVeterinarianProfile = async (req, res) => {
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
        const veterinarianId = req.userId;
        const updateData = req.body;
        delete updateData.password;
        delete updateData.email;
        if (req.files) {
            const files = req.files;
            if (files.profilePicture && files.profilePicture[0]) {
                updateData.profilePicture = (0, upload_1.getFileUrl)(files.profilePicture[0].filename, 'profiles');
            }
            if (files.certifications && files.certifications.length > 0) {
                const certificationFiles = files.certifications.map(file => (0, upload_1.getFileUrl)(file.filename, 'certifications'));
                updateData.certifications = certificationFiles;
            }
        }
        const veterinarian = await Veterinarian_1.default.findByIdAndUpdate(veterinarianId, updateData, { new: true, runValidators: true }).select('-password');
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
    }
    catch (error) {
        console.error('Update veterinarian profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};
exports.updateVeterinarianProfile = updateVeterinarianProfile;
exports.default = {
    registerVeterinarian: exports.registerVeterinarian,
    loginVeterinarian: exports.loginVeterinarian,
    getVeterinarians: exports.getVeterinarians,
    getVeterinarianById: exports.getVeterinarianById,
    getVeterinarianProfile: exports.getVeterinarianProfile,
    updateVeterinarianProfile: exports.updateVeterinarianProfile
};
//# sourceMappingURL=veterinarianController.js.map