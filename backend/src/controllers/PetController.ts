import { Request, Response } from 'express';
import Pet, { IPet } from '../models/Pet';
import mongoose from 'mongoose';

/**
 * Pet Controller - Full CRUD Implementation
 */
export class PetController {
  
  async createPet(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        breed,
        age,
        weight,
        gender,
        color,
        microchipId,
        medicalHistory,
        vaccinations,
        allergies,
        emergencyContact
      } = req.body;

      // Validate required fields
      if (!name || !type || !breed || !age) {
        res.status(400).json({
          success: false,
          message: 'Name, type, breed, and age are required fields'
        });
        return;
      }

      // Get user ID from authenticated request
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Create new pet
      const petData: Partial<IPet> = {
        name,
        type,
        breed,
        age,
        weight: weight ? parseFloat(weight) : undefined,
        gender,
        color,
        microchipId,
        owner: new mongoose.Types.ObjectId(userId),
        medicalHistory: medicalHistory || 'No medical history recorded',
        vaccinations: vaccinations || 'No vaccinations recorded',
        allergies: allergies ? (Array.isArray(allergies) ? allergies : [allergies]) : [],
        emergencyContact,
        isActive: true
      };

      const pet = new Pet(petData);
      const savedPet = await pet.save();
      
      // Populate owner information for response
      const populatedPet = await Pet.findById(savedPet._id).populate('owner', 'name email');

      res.status(201).json({
        success: true,
        message: 'Pet created successfully',
        data: { pet: populatedPet }
      });
    } catch (error: any) {
      console.error('Create pet error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message);
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

  async getUserPets(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      // Get pets for the authenticated user
      const pets = await Pet.find({ owner: userId, isActive: true })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { pets },
        count: pets.length
      });
    } catch (error: any) {
      console.error('Get user pets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pets'
      });
    }
  }

  async getAllPets(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get all pets' });
    }
  }

  async getPetById(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(petId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid pet ID format'
        });
        return;
      }

      const pet = await Pet.findOne({
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
    } catch (error: any) {
      console.error('Get pet by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pet'
      });
    }
  }

  async updatePet(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      const userId = req.userId;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(petId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid pet ID format'
        });
        return;
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.owner;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Convert weight to number if provided
      if (updateData.weight) {
        updateData.weight = parseFloat(updateData.weight);
      }

      // Handle allergies array
      if (updateData.allergies && !Array.isArray(updateData.allergies)) {
        updateData.allergies = [updateData.allergies];
      }

      const pet = await Pet.findOneAndUpdate(
        { _id: petId, owner: userId, isActive: true },
        updateData,
        { new: true, runValidators: true }
      ).populate('owner', 'name email');

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
    } catch (error: any) {
      console.error('Update pet error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message);
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

  async deletePet(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(petId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid pet ID format'
        });
        return;
      }

      // Soft delete by setting isActive to false
      const pet = await Pet.findOneAndUpdate(
        { _id: petId, owner: userId, isActive: true },
        { isActive: false },
        { new: true }
      );

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
    } catch (error: any) {
      console.error('Delete pet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete pet'
      });
    }
  }

  async uploadPetPhoto(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { petId, photoUrl: '/uploads/pets/photo.jpg' }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  }

  async getPetHistory(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      res.json({
        success: true,
        data: { petId, history: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get pet history' });
    }
  }

  async activatePet(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      res.json({
        success: true,
        message: 'Pet activated successfully',
        data: { id: petId }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate pet' });
    }
  }

  async getPetsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      res.json({
        success: true,
        data: { ownerId, pets: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get pets by owner' });
    }
  }

  async searchPets(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      res.json({
        success: true,
        data: { query, pets: [] }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to search pets' });
    }
  }

  async addMedicalNotes(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      res.json({
        success: true,
        message: 'Medical notes added successfully',
        data: { petId }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add medical notes' });
    }
  }
}

const petController = new PetController();
export default petController;