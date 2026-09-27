const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const cleanBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanBaseName}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types
const allowedExtensions = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar|jpg|jpeg|png|webp|svg/i;
const disallowedExtensions = /exe|bat|cmd|sh|vbs|msi|bin|dll|ps1|scr|pif/i;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  // Reject executables explicitly
  if (disallowedExtensions.test(ext)) {
    return cb(new Error('Executable and script files are strictly prohibited!'), false);
  }

  // Check allowed
  if (allowedExtensions.test(ext)) {
    return cb(null, true);
  } else {
    return cb(
      new Error('File type not supported. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP, Images.'),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter: fileFilter,
});

module.exports = upload;
