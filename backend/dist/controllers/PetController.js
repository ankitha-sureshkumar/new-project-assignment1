"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetController = void 0;
const Pet_1 = __importDefault(require("../models/Pet"));
const mongoose_1 = __importDefault(require("mongoose"));
class PetController {
    async createPet(req, res) {
        try {
            const { name, type, breed, age, weight, gender, color, microchipId, medicalHistory, vaccinations, allergies, emergencyContact } = req.body;
            if (!name || !type || !breed || !age) {
                res.status(400).json({
                    success: false,
                    message: 'Name, type, breed, and age are required fields'
                });
                return;
            }
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
                return;
            }
            const petData = {
                name,
                type,
                breed,
                age,
                weight: weight ? parseFloat(weight) : undefined,
                gender,
                color,
                microchipId,
                owner: new mongoose_1.default.Types.ObjectId(userId),
                medicalHistory: medicalHistory || 'No medical history recorded',
                vaccinations: vaccinations || 'No vaccinations recorded',
                allergies: allergies ? (Array.isArray(allergies) ? allergies : [allergies]) : [],
                emergencyContact,
                isActive: true
            };
            const pet = new Pet_1.default(petData);
            const savedPet = await pet.save();
            const populatedPet = await Pet_1.default.findById(savedPet._id).populate('owner', 'name email');
            res.status(201).json({
                success: true,
                message: 'Pet created successfully',
                data: { pet: populatedPet }
            });
        }
        catch (error) {
            console.error('Create pet error:', error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err) => err.message);
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            if (error.code === 11000) {
                res.status(400).json({
                    success: false,
                    message: 'Microchip ID already exists'
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create pet'
            });
        }
    }
    async getUserPets(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
                return;
            }
            const pets = await Pet_1.default.find({ owner: userId, isActive: true })
                .populate('owner', 'name email')
                .sort({ createdAt: -1 });
            res.json({
                success: true,
                data: { pets },
                count: pets.length
            });
        }
        catch (error) {
            console.error('Get user pets error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pets'
            });
        }
    }
    async getAllPets(req, res) {
        try {
            res.json({
                success: true,
                data: []
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get all pets' });
        }
    }
    async getPetById(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!mongoose_1.default.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findOne({
                _id: petId,
                owner: userId,
                isActive: true
            }).populate('owner', 'name email');
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found or you do not have access to this pet'
                });
                return;
            }
            res.json({
                success: true,
                data: { pet }
            });
        }
        catch (error) {
            console.error('Get pet by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pet'
            });
        }
    }
    async updatePet(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            const updateData = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            delete updateData.owner;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            if (updateData.weight) {
                updateData.weight = parseFloat(updateData.weight);
            }
            if (updateData.allergies && !Array.isArray(updateData.allergies)) {
                updateData.allergies = [updateData.allergies];
            }
            const pet = await Pet_1.default.findOneAndUpdate({ _id: petId, owner: userId, isActive: true }, updateData, { new: true, runValidators: true }).populate('owner', 'name email');
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found or you do not have access to this pet'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Pet updated successfully',
                data: { pet }
            });
        }
        catch (error) {
            console.error('Update pet error:', error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err) => err.message);
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update pet'
            });
        }
    }
    async deletePet(req, res) {
        try {
            const { petId } = req.params;
            const userId = req.userId;
            if (!mongoose_1.default.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findOneAndUpdate({ _id: petId, owner: userId, isActive: true }, { isActive: false }, { new: true });
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found or you do not have access to this pet'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Pet deleted successfully',
                data: { petId }
            });
        }
        catch (error) {
            console.error('Delete pet error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete pet'
            });
        }
    }
    async uploadPetPhoto(req, res) {
        try {
            const { petId } = req.params;
            res.json({
                success: true,
                message: 'Photo uploaded successfully',
                data: { petId, photoUrl: '/uploads/pets/photo.jpg' }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to upload photo' });
        }
    }
    async getPetHistory(req, res) {
        try {
            const { petId } = req.params;
            res.json({
                success: true,
                data: { petId, history: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get pet history' });
        }
    }
    async activatePet(req, res) {
        try {
            const { petId } = req.params;
            res.json({
                success: true,
                message: 'Pet activated successfully',
                data: { id: petId }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to activate pet' });
        }
    }
    async getPetsByOwner(req, res) {
        try {
            const { ownerId } = req.params;
            res.json({
                success: true,
                data: { ownerId, pets: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get pets by owner' });
        }
    }
    async searchPets(req, res) {
        try {
            const { query } = req.params;
            res.json({
                success: true,
                data: { query, pets: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to search pets' });
        }
    }
    async addMedicalNotes(req, res) {
        try {
            const { petId } = req.params;
            res.json({
                success: true,
                message: 'Medical notes added successfully',
                data: { petId }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to add medical notes' });
        }
    }
}
exports.PetController = PetController;
const petController = new PetController();
exports.default = petController;
//# sourceMappingURL=PetController.js.map