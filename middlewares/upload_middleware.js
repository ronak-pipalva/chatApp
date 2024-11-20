import multer from "multer";
import path from "path";

// Configure memory storage
const storage = multer.memoryStorage();

// Set file filter to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(ext);
  if (mimeType && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images are allowed!"));
};

// Middleware for handling multiple fields with error handling
const uploadMiddleware = (req, res, next) => {
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
  }).fields([
    { name: "profile_image", maxCount: 1 }, // Single profile image
    { name: "image", maxCount: 5 }, // Up to 5 general images
  ]);

  // Call the multer upload function
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g., file too large)
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      // General errors (e.g., file type not allowed)
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
  });
};

export default uploadMiddleware;
