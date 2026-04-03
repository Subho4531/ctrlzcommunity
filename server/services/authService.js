const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Member = require('../models/members');

/**
 * Authentication Service
 * Handles JWT token generation/verification, password hashing, and OAuth user management
 */
class AuthService {
  /**
   * Generate JWT token with user payload
   * @param {string} userId - User's MongoDB ObjectId
   * @param {string} email - User's email address
   * @param {string} provider - Authentication provider ('local', 'google', 'github')
   * @returns {string} JWT token
   */
  generateToken(userId, email, provider = 'local') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    const payload = {
      userId,
      email,
      provider
    };

    // Token expires in 7 days
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  }

  /**
   * Verify JWT token and return decoded payload
   * @param {string} token - JWT token to verify
   * @returns {object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Create or update user from OAuth profile
   * @param {object} profile - OAuth provider profile
   * @param {string} provider - OAuth provider name ('google', 'github')
   * @returns {Promise<object>} User document
   */
  async handleOAuthUser(profile, provider) {
    // Extract email from profile
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    if (!email) {
      throw new Error('Email not provided by OAuth provider');
    }

    // Check if user exists with this email
    let user = await Member.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user with OAuth information if not already set
      if (!user.authProviderId || user.authProvider !== provider) {
        user.authProvider = provider;
        user.authProviderId = profile.id;
        await user.save();
      }
    } else {
      // Create new user from OAuth profile
      const userData = {
        name: profile.displayName || profile.username || 'Unknown User',
        email: email.toLowerCase(),
        authProvider: provider,
        authProviderId: profile.id,
        approvalStatus: 'approved' // Auto-approve OAuth users
      };

      // Add profile picture if available
      if (profile.photos && profile.photos[0]) {
        userData.pfp = profile.photos[0].value;
      }

      // Add GitHub username if available
      if (provider === 'github' && profile.username) {
        userData.github = `https://github.com/${profile.username}`;
      }

      user = await Member.create(userData);
    }

    return user;
  }

  /**
   * Refresh JWT token
   * @param {string} oldToken - Current JWT token
   * @returns {string} New JWT token
   * @throws {Error} If token is invalid or cannot be refreshed
   */
  refreshToken(oldToken) {
    try {
      // Verify the old token (will throw if expired or invalid)
      const decoded = this.verifyToken(oldToken);

      // Generate new token with same payload
      return this.generateToken(decoded.userId, decoded.email, decoded.provider);
    } catch (error) {
      // Allow refresh even if token is expired (within reasonable time)
      if (error.message === 'Token has expired') {
        // Decode without verification to get payload
        const decoded = jwt.decode(oldToken);
        
        if (!decoded || !decoded.userId || !decoded.email) {
          throw new Error('Invalid token payload');
        }

        // Check if token expired within last 24 hours (refresh window)
        const now = Math.floor(Date.now() / 1000);
        const expirationTime = decoded.exp;
        const timeSinceExpiration = now - expirationTime;
        
        // Allow refresh if expired less than 24 hours ago
        if (timeSinceExpiration <= 24 * 60 * 60) {
          return this.generateToken(decoded.userId, decoded.email, decoded.provider);
        }
        
        throw new Error('Token expired beyond refresh window');
      }
      
      throw error;
    }
  }
}

module.exports = new AuthService();
