const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const authService = require('../services/authService');

const router = express.Router();

/**
 * Email/Password Authentication Routes
 */

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  authController.register
);

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

/**
 * POST /api/auth/admin/login
 * Login admin with email and password
 */
router.post(
  '/admin/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.adminLogin
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post(
  '/refresh',
  [body('token').notEmpty().withMessage('Token is required')],
  authController.refresh
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * OAuth Routes
 */

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback handler
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      // User is attached by Passport
      const user = req.user;

      // Generate JWT token
      const token = authService.generateToken(user._id, user.email, 'google');

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

/**
 * GET /api/auth/github
 * Initiate GitHub OAuth flow
 */
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

/**
 * GET /api/auth/github/callback
 * GitHub OAuth callback handler
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    try {
      // User is attached by Passport
      const user = req.user;

      // Generate JWT token
      const token = authService.generateToken(user._id, user.email, 'github');

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
