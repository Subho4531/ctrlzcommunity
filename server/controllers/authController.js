const { validationResult } = require('express-validator');
const Member = require('../models/members');
const authService = require('../services/authService');

/**
 * Authentication Controller
 * Handles user registration, login, token refresh, logout, and current user retrieval
 */
class AuthController {
  /**
   * Register a new user with email and password
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await Member.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await authService.hashPassword(password);

      // Create new user
      const user = await Member.create({
        email: email.toLowerCase(),
        password: undefined, // Don't store plain password
        passwordHash,
        name,
        authProvider: 'local',
        approvalStatus: 'pending'
      });

      // Generate JWT token
      const token = authService.generateToken(user._id, user.email, 'local');

      // Return token and user data
      res.status(201).json({
        token,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await Member.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user registered with OAuth
      if (user.authProvider !== 'local') {
        return res.status(401).json({
          message: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
        });
      }

      // Verify password
      const isPasswordValid = await authService.comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check approval status
      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({ message: 'Your account has been rejected' });
      }

      // Generate JWT token
      const token = authService.generateToken(user._id, user.email, 'local');

      // Return token and user data
      res.status(200).json({
        token,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }

      // Refresh the token
      const newToken = authService.refreshToken(token);

      // Decode new token to get user info
      const decoded = authService.verifyToken(newToken);

      // Fetch user data
      const user = await Member.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        token: newToken,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Token refresh error:', error);

      if (error.message.includes('expired beyond refresh window')) {
        return res.status(401).json({ message: 'Token expired beyond refresh window' });
      }

      res.status(401).json({ message: 'Token refresh failed' });
    }
  }

  /**
   * Admin login
   * POST /api/auth/admin/login
   */
  async adminLogin(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get admin credentials from environment variables
      const adminEmail = process.env.DEFAULT_EMAIL || 'test@example.com';
      const adminPassword = process.env.DEFAULT_PASSWORD || 'TestPassword123';

      // Validate credentials
      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create JWT token for admin (7 day expiration)
      const token = authService.generateToken('admin', email, 'admin');

      // Return token and admin user data
      res.status(200).json({
        token,
        user: {
          id: 'admin',
          email: email,
          name: 'Admin',
          authProvider: 'admin'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  /**
   * Logout user (invalidate token)
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side by removing the token
      // This endpoint can be used for logging purposes or future token blacklist implementation
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      // User is attached to request by authMiddleware
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Fetch fresh user data from database
      const user = await Member.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }
}

module.exports = new AuthController();
