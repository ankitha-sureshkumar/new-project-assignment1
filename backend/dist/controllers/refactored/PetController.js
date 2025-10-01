"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPetPhotos = exports.getPetHistory = exports.deletePet = exports.updatePet = exports.getPetById = exports.getUserPets = exports.createPet = exports.PetController = void 0;
const express_validator_1 = require("express-validator");
const NotificationObserver_1 = require("../../patterns/NotificationObserver");
const AccessProxy_1 = require("../../patterns/AccessProxy");
const upload_1 = require("../../middleware/upload");
const Pet_1 = __importDefault(require("../../models/Pet"));
class PetController {
    constructor() {
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.secureDataService = new AccessProxy_1.SecureDataService();
    }
    async createPet(req, res) {
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
            const { name, type, breed, age, weight, gender, color, microchipId, medicalHistory, vaccinations, allergies, emergencyContact } = req.body;
            let profilePictureUrl;
            if (req.file) {
                profilePictureUrl = (0, upload_1.getFileUrl)(req.file.filename, 'pets');
            }
            const petData = {
                name: name.trim(),
                type,
                breed: breed.trim(),
                age: age.trim(),
                weight: weight ? parseFloat(weight) : undefined,
                gender,
                color: color?.trim(),
                microchipId: microchipId?.trim(),
                owner: userId,
                medicalHistory: medicalHistory || 'No medical history recorded',
                vaccinations: vaccinations || 'No vaccinations recorded',
                profilePicture: profilePictureUrl,
                allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
                emergencyContact: emergencyContact ? {
                    name: emergencyContact.name?.trim(),
                    contact: emergencyContact.contact?.trim(),
                    relation: emergencyContact.relation?.trim()
                } : undefined
            };
            const newPet = new Pet_1.default(petData);
            await newPet.save();
            await this.notificationManager.onUserRegistered({
                _id: userId,
                email: 'user@example.com',
                action: 'pet_added',
                petName: newPet.name,
                petType: newPet.type
            });
            res.status(201).json({
                success: true,
                message: 'Pet added successfully',
                data: {
                    pet: newPet
                }
            });
            console.log(`✅ Pet created successfully: ${newPet.name} for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Create pet error:', error);
            if (error.code === 11000 && error.keyPattern?.microchipId) {
                res.status(409).json({
                    success: false,
                    message: 'A pet with this microchip ID already exists'
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create pet'
            });
        }
    }
    async getUserPets(req, res) {
        try {
            const userId = req.userId;
            const userContext = {
                userId: userId,
                role: 'user',
                permissions: ['READ_OWN_DATA']
            };
            const secureProxy = AccessProxy_1.ProxyFactory.createProxy(userContext);
            const pets = await Pet_1.default.findByOwner(userId);
            res.json({
                success: true,
                data: {
                    pets,
                    count: pets.length
                }
            });
            console.log(`✅ Retrieved ${pets.length} pets for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Get user pets error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve pets'
            });
        }
    }
    async getPetById(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findById(petId);
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found'
                });
                return;
            }
            if (pet.owner.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied - You can only view your own pets'
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    pet
                }
            });
            console.log(`✅ Retrieved pet ${pet.name} for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Get pet by ID error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve pet'
            });
        }
    }
    async updatePet(req, res) {
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
            const { petId } = req.params;
            const userId = req.userId;
            const updateData = { ...req.body };
            if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findById(petId);
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found'
                });
                return;
            }
            if (pet.owner.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied - You can only update your own pets'
                });
                return;
            }
            if (req.file) {
                updateData.profilePicture = (0, upload_1.getFileUrl)(req.file.filename, 'pets');
            }
            delete updateData.owner;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            if (updateData.allergies && typeof updateData.allergies === 'string') {
                updateData.allergies = updateData.allergies.split(',').map((a) => a.trim());
            }
            const updatedPet = await Pet_1.default.findByIdAndUpdate(petId, updateData, { new: true, runValidators: true });
            await updatedPet.updateActivity();
            await this.notificationManager.onUserRegistered({
                _id: userId,
                email: 'user@example.com',
                action: 'pet_updated',
                petName: updatedPet.name,
                petType: updatedPet.type
            });
            res.json({
                success: true,
                message: 'Pet updated successfully',
                data: {
                    pet: updatedPet
                }
            });
            console.log(`✅ Updated pet ${updatedPet.name} for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Update pet error:', error);
            if (error.code === 11000 && error.keyPattern?.microchipId) {
                res.status(409).json({
                    success: false,
                    message: 'A pet with this microchip ID already exists'
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update pet'
            });
        }
    }
    async deletePet(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findById(petId);
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found'
                });
                return;
            }
            if (pet.owner.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied - You can only delete your own pets'
                });
                return;
            }
            const Appointment = require('../../models/Appointment').default;
            const activeAppointments = await Appointment.countDocuments({
                pet: petId,
                status: { $in: ['PENDING', 'APPROVED', 'CONFIRMED'] }
            });
            if (activeAppointments > 0) {
                res.status(400).json({
                    success: false,
                    message: `Cannot delete pet with ${activeAppointments} active appointment(s). Please cancel or complete appointments first.`
                });
                return;
            }
            pet.isActive = false;
            await pet.save();
            await this.notificationManager.onUserRegistered({
                _id: userId,
                email: 'user@example.com',
                action: 'pet_deleted',
                petName: pet.name,
                petType: pet.type
            });
            res.json({
                success: true,
                message: 'Pet deleted successfully'
            });
            console.log(`✅ Deleted pet ${pet.name} for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Delete pet error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete pet'
            });
        }
    }
    async getPetHistory(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findById(petId);
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found'
                });
                return;
            }
            if (pet.owner.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied - You can only view your own pet\'s history'
                });
                return;
            }
            const Appointment = require('../../models/Appointment').default;
            const appointments = await Appointment.find({
                pet: petId,
                status: 'COMPLETED'
            })
                .populate('veterinarian', 'name specialization')
                .sort({ date: -1 })
                .limit(20);
            res.json({
                success: true,
                data: {
                    pet: {
                        name: pet.name,
                        type: pet.type,
                        breed: pet.breed,
                        medicalHistory: pet.medicalHistory,
                        vaccinations: pet.vaccinations,
                        allergies: pet.allergies,
                        lastVisit: pet.lastVisit
                    },
                    appointments,
                    appointmentCount: appointments.length
                }
            });
            console.log(`✅ Retrieved history for pet ${pet.name} for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Get pet history error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve pet history'
            });
        }
    }
    async uploadPetPhotos(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!req.files || !Array.isArray(req.files)) {
                res.status(400).json({
                    success: false,
                    message: 'No photos uploaded'
                });
                return;
            }
            if (!petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findById(petId);
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found'
                });
                return;
            }
            if (pet.owner.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied - You can only upload photos for your own pets'
                });
                return;
            }
            const files = req.files;
            if (pet.photos.length + files.length > 5) {
                res.status(400).json({
                    success: false,
                    message: `Cannot upload ${files.length} photos. Pet can have maximum 5 photos total.`
                });
                return;
            }
            const newPhotoUrls = files.map(file => (0, upload_1.getFileUrl)(file.filename, 'pets'));
            pet.photos.push(...newPhotoUrls);
            await pet.save();
            res.json({
                success: true,
                message: `${files.length} photo(s) uploaded successfully`,
                data: {
                    photos: newPhotoUrls,
                    totalPhotos: pet.photos.length
                }
            });
            console.log(`✅ Uploaded ${files.length} photos for pet ${pet.name}`);
        }
        catch (error) {
            console.error('❌ Upload pet photos error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload photos'
            });
        }
    }
}
exports.PetController = PetController;
const petController = new PetController();
_a = {
    createPet: petController.createPet.bind(petController),
    getUserPets: petController.getUserPets.bind(petController),
    getPetById: petController.getPetById.bind(petController),
    updatePet: petController.updatePet.bind(petController),
    deletePet: petController.deletePet.bind(petController),
    getPetHistory: petController.getPetHistory.bind(petController),
    uploadPetPhotos: petController.uploadPetPhotos.bind(petController)
}, exports.createPet = _a.createPet, exports.getUserPets = _a.getUserPets, exports.getPetById = _a.getPetById, exports.updatePet = _a.updatePet, exports.deletePet = _a.deletePet, exports.getPetHistory = _a.getPetHistory, exports.uploadPetPhotos = _a.uploadPetPhotos;
exports.default = petController;
//# sourceMappingURL=PetController.js.map