import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to remove specific characters from the beginning and end of a string
const trim = (str: string, char: string) => {
  if (!str) return "";
  const regex = new RegExp(`^${char}+|${char}+$`, "g");
  return str.replace(regex, "");
};

// Function to escape special characters in regex
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


// Function to normalize file names
const normalizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = (): string => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'projects');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

/**
 * Multer configuration for file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = ensureUploadDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const normalizedName = normalizeFileName(file.originalname);
    const timestamp = Date.now();
    const extension = path.extname(normalizedName);
    const baseName = path.basename(normalizedName, extension);
    const fileName = `${baseName}_${timestamp}${extension}`;
    cb(null, fileName);
  }
});

/**
 * File filter for allowed file types
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

/**
 * Middleware to handle file uploads for projects
 */
export const sendToFileProjectStorage = (req: Request, res: Response, next: NextFunction): void => {
  const uploadHandler = upload.array('files', 5);
  
  uploadHandler(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
            return;
          case 'LIMIT_FILE_COUNT':
            res.status(400).json({
              success: false,
              message: 'Too many files. Maximum is 5 files.'
            });
            return;
          case 'LIMIT_UNEXPECTED_FILE':
            res.status(400).json({
              success: false,
              message: 'Unexpected file field.'
            });
            return;
          default:
            res.status(400).json({
              success: false,
              message: 'File upload error.',
              error: err.message
            });
            return;
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'File upload error.',
          error: err.message
        });
        return;
      }
    }

    // Add file information to request
    if (req.files && Array.isArray(req.files)) {
      const fileInfo = req.files.map(file => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      // Attach file info to request body
      req.body.uploadedFiles = fileInfo;
    }

    next();
  });
};

/**
 * Middleware to handle single file upload
 */
export const sendSingleFileProjectStorage = (req: Request, res: Response, next: NextFunction): void => {
  const uploadHandler = upload.single('file');
  
  uploadHandler(req, res, (err) => {
    if (err) {
      console.error('Single file upload error:', err);
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
            return;
          default:
            res.status(400).json({
              success: false,
              message: 'File upload error.',
              error: err.message
            });
            return;
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'File upload error.',
          error: err.message
        });
        return;
      }
    }

    // Add file information to request
    if (req.file) {
      const fileInfo = {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
      
      // Attach file info to request body
      req.body.uploadedFile = fileInfo;
    }

    next();
  });
};