"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVeterinarians = exports.getVeterinarianDashboard = exports.updateVeterinarianProfile = exports.getVeterinarianProfile = exports.loginVeterinarian = exports.registerVeterinarian = exports.VeterinarianController = void 0;
const express_validator_1 = require("express-validator");
const UserFactory_1 = require("../../patterns/UserFactory");
const DashboardFacade_1 = require("../../patterns/DashboardFacade");
const NotificationObserver_1 = require("../../patterns/NotificationObserver");
const AccessProxy_1 = require("../../patterns/AccessProxy");
const jwt_1 = require("../../utils/jwt");
const Veterinarian_1 = require("../../classes/Veterinarian");
const upload_1 = require("../../middleware/upload");
const Veterinarian_2 = __importDefault(require("../../models/Veterinarian"));
const User_1 = __importDefault(require("../../models/User"));
class VeterinarianController {
    constructor() {
        this.dashboardFacade = new DashboardFacade_1.DashboardFacade();
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.secureDataService = new AccessProxy_1.SecureDataService();
    }
    async registerVeterinarian(req, res) {
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
            const { name, email, password, contact, address, specialization, experience, consultationFee, qualifications, hospitalName, hospitalAddress, licenseNumber, availability } = req.body;
            const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
            const existingVet = await Veterinarian_2.default.findOne({ email: email.toLowerCase() });
            if (existingUser || existingVet) {
                res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
                return;
            }
            let profilePictureUrl;
            let licenseDocumentUrl;
            if (req.files && typeof req.files === 'object') {
                const files = req.files;
                if (files.profilePicture && files.profilePicture[0]) {
                    profilePictureUrl = (0, upload_1.getFileUrl)(files.profilePicture[0].filename, 'profiles');
                }
                if (files.licenseDocument && files.licenseDocument[0]) {
                    licenseDocumentUrl = (0, upload_1.getFileUrl)(files.licenseDocument[0].filename, 'documents');
                }
            }
            else if (req.file) {
                profilePictureUrl = (0, upload_1.getFileUrl)(req.file.filename, 'profiles');
            }
            const veterinarianData = {
                name,
                email: email.toLowerCase(),
                password,
                contact,
                address,
                specialization: Array.isArray(specialization) ? specialization : [specialization],
                experience: parseInt(experience) || 0,
                consultationFee: parseFloat(consultationFee) || 0,
                qualifications: Array.isArray(qualifications) ? qualifications : qualifications?.split(',') || [],
                hospitalName,
                hospitalAddress,
                licenseNumber,
                profilePicture: profilePictureUrl,
                licenseDocument: licenseDocumentUrl,
                availability: availability || {
                    monday: { isAvailable: false, slots: [] },
                    tuesday: { isAvailable: false, slots: [] },
                    wednesday: { isAvailable: false, slots: [] },
                    thursday: { isAvailable: false, slots: [] },
                    friday: { isAvailable: false, slots: [] },
                    saturday: { isAvailable: false, slots: [] },
                    sunday: { isAvailable: false, slots: [] }
                }
            };
            const veterinarianInstance = await UserFactory_1.RegistrationService.registerUser('veterinarian', veterinarianData);
            const mongoVeterinarian = new Veterinarian_2.default(veterinarianInstance.toDocument());
            await mongoVeterinarian.save();
            const token = (0, jwt_1.generateToken)(mongoVeterinarian);
            const refreshToken = (0, jwt_1.generateRefreshToken)(mongoVeterinarian._id?.toString() || '');
            await this.notificationManager.onVeterinarianRegistered(mongoVeterinarian.toObject());
            const veterinarianResponse = mongoVeterinarian.toObject();
            delete veterinarianResponse.password;
            res.status(201).json({
                success: true,
                message: 'Veterinarian registered successfully. Your application will be reviewed by our admin team.',
                data: {
                    veterinarian: veterinarianResponse,
                    token,
                    refreshToken,
                    note: 'Your account is pending approval. You will be notified once approved.'
                }
            });
            console.log(`✅ Veterinarian registered: ${email} using Factory Pattern`);
        }
        catch (error) {
            console.error('❌ Veterinarian registration error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Veterinarian registration failed'
            });
        }
    }
    async loginVeterinarian(req, res) {
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
            const mongoVeterinarian = await Veterinarian_2.default.findOne({
                email: email.toLowerCase()
            }).select('+password');
            if (!mongoVeterinarian) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            const veterinarianInstance = this.mongoToVeterinarianInstance(mongoVeterinarian);
            const isPasswordValid = await veterinarianInstance.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
                return;
            }
            if (veterinarianInstance.isBlocked) {
                res.status(401).json({
                    success: false,
                    message: 'Your account has been blocked. Please contact support.'
                });
                return;
            }
            if (!veterinarianInstance.isApproved) {
                res.status(401).json({
                    success: false,
                    message: 'Your account is pending approval. Please wait for admin approval.',
                    data: {
                        approvalStatus: veterinarianInstance.approvalStatus || 'pending'
                    }
                });
                return;
            }
            const token = (0, jwt_1.generateToken)(mongoVeterinarian);
            const refreshToken = (0, jwt_1.generateRefreshToken)(mongoVeterinarian._id?.toString() || '');
            const veterinarianResponse = mongoVeterinarian.toObject();
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
            console.log(`✅ Veterinarian logged in: ${email} using OOP validation`);
        }
        catch (error) {
            console.error('❌ Veterinarian login error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    async getVeterinarianProfile(req, res) {
        try {
            const veterinarianId = req.userId;
            if (!veterinarianId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const userContext = {
                userId: veterinarianId,
                role: 'veterinarian',
                permissions: ['READ_OWN_DATA', 'READ_VETERINARIAN_DATA']
            };
            const secureProxy = AccessProxy_1.ProxyFactory.createProxy(userContext);
            const veterinarianData = await secureProxy.getVeterinarianById(veterinarianId);
            if (!veterinarianData) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    veterinarian: veterinarianData
                }
            });
        }
        catch (error) {
            console.error('❌ Get veterinarian profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get profile'
            });
        }
    }
    async updateVeterinarianProfile(req, res) {
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
            delete updateData.isApproved;
            delete updateData.approvalStatus;
            if (req.files && typeof req.files === 'object') {
                const files = req.files;
                if (files.profilePicture && files.profilePicture[0]) {
                    updateData.profilePicture = (0, upload_1.getFileUrl)(files.profilePicture[0].filename, 'profiles');
                }
                if (files.licenseDocument && files.licenseDocument[0]) {
                    updateData.licenseDocument = (0, upload_1.getFileUrl)(files.licenseDocument[0].filename, 'documents');
                }
            }
            const veterinarian = await Veterinarian_2.default.findByIdAndUpdate(veterinarianId, updateData, { new: true, runValidators: true }).select('-password');
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
            console.error('❌ Update veterinarian profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }
    async getVeterinarianDashboard(req, res) {
        try {
            const veterinarianId = req.userId;
            if (!veterinarianId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const dashboardData = await this.dashboardFacade.getVeterinarianDashboard(veterinarianId);
            res.json({
                success: true,
                data: dashboardData
            });
        }
        catch (error) {
            console.error('❌ Get veterinarian dashboard error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get dashboard data'
            });
        }
    }
    async getAllVeterinarians(req, res) {
        try {
            const { specialization, available, city } = req.query;
            const filter = {
                isApproved: true,
                isBlocked: false
            };
            if (specialization) {
                filter.specialization = { $in: [specialization] };
            }
            if (city) {
                filter.$or = [
                    { 'address.city': new RegExp(city, 'i') },
                    { 'hospitalAddress.city': new RegExp(city, 'i') }
                ];
            }
            const veterinarians = await Veterinarian_2.default.find(filter)
                .select('-password -licenseDocument')
                .sort({ createdAt: -1 })
                .limit(50);
            res.json({
                success: true,
                data: {
                    veterinarians,
                    count: veterinarians.length
                }
            });
        }
        catch (error) {
            console.error('❌ Get all veterinarians error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get veterinarians'
            });
        }
    }
    mongoToVeterinarianInstance(mongoDoc) {
        const data = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;
        return new Veterinarian_1.Veterinarian(data._id?.toString() || '', data.name, data.email, data.password, data.contact, Array.isArray(data.specialization) ? data.specialization[0] : data.specialization, data.experience?.toString() || '0', {
            min: Math.floor(data.consultationFee * 0.8) || 50,
            max: data.consultationFee || 100
        }, data.hospitalName || '', data.licenseNumber, data.profilePicture);
    }
}
exports.VeterinarianController = VeterinarianController;
const veterinarianController = new VeterinarianController();
_a = {
    registerVeterinarian: veterinarianController.registerVeterinarian.bind(veterinarianController),
    loginVeterinarian: veterinarianController.loginVeterinarian.bind(veterinarianController),
    getVeterinarianProfile: veterinarianController.getVeterinarianProfile.bind(veterinarianController),
    updateVeterinarianProfile: veterinarianController.updateVeterinarianProfile.bind(veterinarianController),
    getVeterinarianDashboard: veterinarianController.getVeterinarianDashboard.bind(veterinarianController),
    getAllVeterinarians: veterinarianController.getAllVeterinarians.bind(veterinarianController)
}, exports.registerVeterinarian = _a.registerVeterinarian, exports.loginVeterinarian = _a.loginVeterinarian, exports.getVeterinarianProfile = _a.getVeterinarianProfile, exports.updateVeterinarianProfile = _a.updateVeterinarianProfile, exports.getVeterinarianDashboard = _a.getVeterinarianDashboard, exports.getAllVeterinarians = _a.getAllVeterinarians;
exports.default = veterinarianController;
//# sourceMappingURL=VeterinarianController.js.map