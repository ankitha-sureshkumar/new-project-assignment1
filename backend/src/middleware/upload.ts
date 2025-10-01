import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';
    
    // Organize files by type
    if (file.fieldname === 'profilePicture') {
      folder = 'profiles';
    } else if (file.fieldname === 'petPhoto') {
      folder = 'pets';
    } else if (file.fieldname === 'certifications') {
      folder = 'certifications';
    }
    
    const destPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter: fileFilter
});

// Upload configurations for different endpoints
export const uploadProfilePicture = upload.single('profilePicture');
export const uploadPetPhoto = upload.single('petPhoto');
export const uploadCertifications = upload.array('certifications', 5);
export const uploadMultiple = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'petPhoto', maxCount: 5 },
  { name: 'certifications', maxCount: 5 }
]);

// Helper function to get file URL
export const getFileUrl = (filename: string, folder: string = 'general'): string => {
  return `/uploads/${folder}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
  try {
    const fullPath = path.join(uploadsDir, filePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default upload;