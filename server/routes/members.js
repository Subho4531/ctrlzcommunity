const express = require('express');
const { query, body } = require('express-validator');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middlewares/authMiddleware');
const adminAuth = require('../middlewares/adminAuth');
const membersController = require('../controllers/membersController');
const { saveFileLocally } = require('../utils/fileUpload');

const router = express.Router();

// Multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, folder = 'community_members') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * GET /api/members
 * Get all members with optional filtering
 * PUBLIC - No authentication required
 * Query params: search, domain, page, limit
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  membersController.getAllMembers
);

/**
 * GET /api/members/:id
 * Get a single member by ID
 * PUBLIC - No authentication required
 */
router.get('/:id', membersController.getMemberById);

/**
 * POST /api/members/register
 * Register a new member
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('year').isIn(['1st', '2nd', '3rd', '4th']).withMessage('Invalid academic year'),
    body('domain').trim().notEmpty().withMessage('Domain is required'),
    body('interests').optional().isArray()
  ],
  membersController.registerMember
);

/**
 * POST /api/members/community/:type
 * Admin: Create a new community lead, domain lead, or core member with image upload
 * Type: communityleads, domainleads, coremembers
 */
router.post(
  '/community/:type',
  upload.single('pfp'),
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('about').optional().trim(),
    body('domain').optional().trim(),
    body('position').optional().trim(),
    body('city').optional().trim(),
    body('country').optional().trim(),
    body('github').optional().trim().isURL(),
    body('linkedin').optional().trim().isURL(),
    body('insta').optional().trim().isURL()
  ],
  async (req, res, next) => {
    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, `community_members/${req.params.type}`);
        req.file.cloudinary_url = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(400).json({ message: 'Failed to upload image' });
      }
    }
    next();
  },
  membersController.createCommunityMember
);

/**
 * POST /api/members/create
 * Create a new member with Cloudinary file upload
 * Requires authentication
 */
router.post(
  '/create',
  authMiddleware,
  upload.single('pfp'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('year').optional().trim(),
    body('domain').optional().trim(),
    body('approvalStatus').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('about').optional().trim(),
    body('city').optional().trim(),
    body('country').optional().trim(),
    body('position').optional().trim(),
    body('github').optional().trim(),
    body('linkedin').optional().trim(),
    body('insta').optional().trim()
  ],
  async (req, res, next) => {
    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        const category = req.body.category || 'core members';
        const folderName = category.replace(/\s+/g, '_');
        const result = await uploadBufferToCloudinary(req.file.buffer, `community_members/${folderName}`);
        req.file.cloudinary_url = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Don't fail the request, let controller handle fallback
      }
    }
    next();
  },
  membersController.createMemberWithFileUpload
);

/**
 * PUT /api/members/:id
 * Update an existing member
 * Requires authentication
 */
router.put(
  '/:id',
  authMiddleware,
  upload.single('pfp'),
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('year').optional().trim(),
    body('domain').optional().trim(),
    body('approvalStatus').optional().isIn(['pending', 'approved', 'rejected']),
    body('category').optional().isIn(['community leads', 'domain lead', 'core members']),
    body('about').optional().trim(),
    body('city').optional().trim(),
    body('country').optional().trim(),
    body('position').optional().trim(),
    body('github').optional().trim(),
    body('linkedin').optional().trim(),
    body('insta').optional().trim()
  ],
  async (req, res, next) => {
    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        const category = req.body.category || 'core members';
        const folderName = category.replace(/\s+/g, '_');
        const result = await uploadBufferToCloudinary(req.file.buffer, `community_members/${folderName}`);
        req.file.cloudinary_url = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Don't fail the request, let controller handle fallback
      }
    }
    next();
  },
  membersController.updateMember
);

/**
 * DELETE /api/members/:id
 * Delete a member
 * Requires authentication
 */
router.delete(
  '/:id',
  authMiddleware,
  membersController.deleteMember
);

module.exports = router;
