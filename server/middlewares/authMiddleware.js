const authService = require('../services/authService');
const Member = require('../models/members');

/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user information to request
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header missing',
        error: 'No token provided'
      });
    }

    // Check if header follows Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Invalid authorization format',
        error: 'Token must be in Bearer format'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        message: 'Token missing',
        error: 'No token provided'
      });
    }

    // Verify token using authService
    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (error) {
      // Handle specific token errors
      if (error.message === 'Token has expired') {
        return res.status(401).json({
          message: 'Token expired',
          error: 'Your session has expired. Please log in again.'
        });
      }
      if (error.message === 'Invalid token') {
        return res.status(401).json({
          message: 'Invalid token',
          error: 'The provided token is invalid'
        });
      }
      // Generic token verification error
      return res.status(401).json({
        message: 'Token verification failed',
        error: error.message
      });
    }

    // Handle admin tokens differently - don't query database
    if (decoded.provider === 'admin' || decoded.authProvider === 'admin') {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        authProvider: 'admin',
        isAdmin: true
      };
      return next();
    }

    // Fetch user from database using userId from token
    const user = await Member.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
        error: 'The user associated with this token no longer exists'
      });
    }

    // Check if user account is approved
    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: 'Account rejected',
        error: 'Your account has been rejected'
      });
    }

    // Attach user object to request for use in route handlers
    req.user = user;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle unexpected errors
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: 'An error occurred during authentication'
    });
  }
}

module.exports = authMiddleware;
