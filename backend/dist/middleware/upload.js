"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileUrl = exports.uploadMultiple = exports.uploadCertifications = exports.uploadPetPhoto = exports.uploadProfilePicture = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'general';
        if (file.fieldname === 'profilePicture') {
            folder = 'profiles';
        }
        else if (file.fieldname === 'petPhoto') {
            folder = 'pets';
        }
        else if (file.fieldname === 'certifications') {
            folder = 'certifications';
        }
        const destPath = path_1.default.join(uploadsDir, folder);
        if (!fs_1.default.existsSync(destPath)) {
            fs_1.default.mkdirSync(destPath, { recursive: true });
        }
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    },
    fileFilter: fileFilter
});
exports.uploadProfilePicture = upload.single('profilePicture');
exports.uploadPetPhoto = upload.single('petPhoto');
exports.uploadCertifications = upload.array('certifications', 5);
exports.uploadMultiple = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'petPhoto', maxCount: 5 },
    { name: 'certifications', maxCount: 5 }
]);
const getFileUrl = (filename, folder = 'general') => {
    return `/uploads/${folder}/${filename}`;
};
exports.getFileUrl = getFileUrl;
const deleteFile = (filePath) => {
    try {
        const fullPath = path_1.default.join(uploadsDir, filePath.replace('/uploads/', ''));
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
exports.deleteFile = deleteFile;
exports.default = upload;
//# sourceMappingURL=upload.js.map