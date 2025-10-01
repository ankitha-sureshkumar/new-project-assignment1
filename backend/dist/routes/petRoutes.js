"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const PetController_1 = __importDefault(require("../controllers/PetController"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads/pets'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)('user'), PetController_1.default.createPet.bind(PetController_1.default));
router.get('/', PetController_1.default.getUserPets.bind(PetController_1.default));
router.get('/all', (0, auth_1.authorize)('admin'), PetController_1.default.getAllPets.bind(PetController_1.default));
router.get('/:petId', PetController_1.default.getPetById.bind(PetController_1.default));
router.put('/:petId', PetController_1.default.updatePet.bind(PetController_1.default));
router.delete('/:petId', PetController_1.default.deletePet.bind(PetController_1.default));
router.post('/:petId/photo', upload.single('photo'), PetController_1.default.uploadPetPhoto.bind(PetController_1.default));
router.get('/:petId/history', PetController_1.default.getPetHistory.bind(PetController_1.default));
router.put('/:petId/activate', PetController_1.default.activatePet.bind(PetController_1.default));
router.get('/owner/:ownerId', (0, auth_1.authorize)('admin', 'veterinarian'), PetController_1.default.getPetsByOwner.bind(PetController_1.default));
router.get('/search/:query', (0, auth_1.authorize)('admin', 'veterinarian'), PetController_1.default.searchPets.bind(PetController_1.default));
router.post('/:petId/medical-notes', (0, auth_1.authorize)('veterinarian', 'admin'), PetController_1.default.addMedicalNotes.bind(PetController_1.default));
exports.default = router;
//# sourceMappingURL=petRoutes.js.map