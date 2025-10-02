import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth';
import petController from '../controllers/PetController';

const router = express.Router();

// Configure multer for file uploads (pet photos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/pets'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

/**
 * Pet Routes
 * All routes require authentication
 * Users can only access their own pets
 * Veterinarians can view pets for their appointments
 * Admins have full access
 */

// Apply authentication middleware to all pet routes
router.use(authenticate);

/**
 * @route   POST /api/pets
 * @desc    Create a new pet
 * @access  Private (Users only)
 */
router.post('/', authorize('user'), petController.createPet.bind(petController));

/**
 * @route   GET /api/pets
 * @desc    Get all pets for authenticated user
 * @access  Private (Users can see their pets, Vets see pets for their appointments, Admin sees all)
 */
router.get('/', petController.getUserPets.bind(petController));

/**
 * @route   GET /api/pets/all
 * @desc    Get all pets in the system
 * @access  Private (Admin only)
 */
router.get('/all', authorize('admin'), petController.getAllPets.bind(petController));

/**
 * @route   GET /api/pets/:petId
 * @desc    Get a specific pet by ID
 * @access  Private (Owner, assigned veterinarian, or admin)
 */
router.get('/:petId', petController.getPetById.bind(petController));

/**
 * @route   PUT /api/pets/:petId
 * @desc    Update pet information
 * @access  Private (Owner or admin)
 */
router.put('/:petId', petController.updatePet.bind(petController));

/**
 * @route   DELETE /api/pets/:petId
 * @desc    Soft delete a pet (deactivate)
 * @access  Private (Owner or admin)
 */
router.delete('/:petId', petController.deletePet.bind(petController));

/**
 * @route   POST /api/pets/:petId/photo
 * @desc    Upload pet profile picture
 * @access  Private (Owner or admin)
 */
router.post('/:petId/photo', upload.single('photo'), petController.uploadPetPhoto.bind(petController));

/**
 * @route   GET /api/pets/:petId/history
 * @desc    Get pet's medical history (appointments, treatments, etc.)
 * @access  Private (Owner, assigned veterinarian, or admin)
 */
router.get('/:petId/history', petController.getPetHistory.bind(petController));

/**
 * @route   PUT /api/pets/:petId/activate
 * @desc    Reactivate a deactivated pet
 * @access  Private (Owner or admin)
 */
router.put('/:petId/activate', petController.activatePet.bind(petController));

/**
 * @route   GET /api/pets/owner/:ownerId
 * @desc    Get all pets for a specific owner
 * @access  Private (Admin only, or vet with appointment access)
 */
router.get('/owner/:ownerId', authorize('admin', 'veterinarian'), petController.getPetsByOwner.bind(petController));

/**
 * @route   GET /api/pets/search/:query
 * @desc    Search pets by name, type, or breed
 * @access  Private (Admin or veterinarian)
 */
router.get('/search/:query', authorize('admin', 'veterinarian'), petController.searchPets.bind(petController));

/**
 * @route   POST /api/pets/:petId/medical-notes
 * @desc    Add medical notes to a pet (veterinarian only)
 * @access  Private (Veterinarian or admin)
 */
router.post('/:petId/medical-notes', authorize('veterinarian', 'admin'), petController.addMedicalNotes.bind(petController));

export default router;