const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Convert file buffer to base64 string
 */
const fileToBase64 = (buffer) => {
  return buffer.toString('base64');
};

/**
 * Convert base64 string back to buffer
 */
const base64ToFile = (base64String) => {
  return Buffer.from(base64String, 'base64');
};

/**
 * Save file locally and return base64 data URI
 */
const saveFileLocally = async (file, folder = 'members') => {
  if (!file) return null;

  try {
    // Create folder if it doesn't exist
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    const filepath = path.join(folderPath, filename);

    // Save file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return both the file path and base64 encoded data
    const base64 = fileToBase64(file.buffer);
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    return {
      filename,
      filepath: `/uploads/${folder}/${filename}`,
      base64: dataUri,
      mimetype: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
};

/**
 * Delete file locally
 */
const deleteFileLocally = (filepath) => {
  try {
    const fullPath = path.join(__dirname, '..', filepath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  uploadsDir,
  fileToBase64,
  base64ToFile,
  saveFileLocally,
  deleteFileLocally
};
