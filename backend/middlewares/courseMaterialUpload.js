const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads';
const courseMaterialsDir = path.join(uploadDir, 'course-materials');

if (!fs.existsSync(courseMaterialsDir)) {
  fs.mkdirSync(courseMaterialsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, courseMaterialsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to remove special characters but keep extension
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedOriginalName);
  }
});

// No file filter (accept all types) and no limits as requested
const upload = multer({ 
  storage: storage,
  limits: { fileSize: Infinity } // Explicitly no limit, though default is Infinity
});

module.exports = upload;
