const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = 'uploads';
const documentsDir = path.join(uploadDir, 'documents'); // For PDFs (Aadhar, PAN, License)
const tempDir = path.join(uploadDir, 'temp'); // For Excel files
const imagesDir = path.join(uploadDir, 'images'); // For image documents

// Create directories if they don't exist
[documentsDir, tempDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // PDF documents (Aadhar, PAN, Driving License, etc.)
    if (file.mimetype === 'application/pdf') {
      cb(null, documentsDir);
    } 
    // Excel files (bulk upload)
    else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, tempDir);
    } 
    // Image files (Aadhar, PAN, Driving License scans)
    else if (
      file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/png'
    ) {
      cb(null, imagesDir);
    } 
    else {
      cb(new Error('Invalid file type'), false);
    }
  },
  filename: function (req, file, cb) {
    // Create unique filename with field name, timestamp, and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFieldname = file.fieldname.replace(/\s+/g, '_'); // Replace spaces with underscores
    cb(null, sanitizedFieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Excel, JPG, and PNG files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
