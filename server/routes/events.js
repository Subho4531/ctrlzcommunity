const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const eventsController = require('../controllers/eventsController');

const router = express.Router();

/**
 * Events Routes
 * All routes require authentication
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 2.5
 */

/**
 * GET /api/events
 * Get all events with optional filtering by status
 * PUBLIC - No authentication required
 */
router.get('/', eventsController.getAllEvents);

/**
 * GET /api/events/:id
 * Get a single event by ID
 * PUBLIC - No authentication required
 */
router.get('/:id', eventsController.getEventById);

/**
 * POST /api/events
 * Create a new event
 */
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('status')
      .optional()
      .isIn(['upcoming', 'completed'])
      .withMessage('Status must be either "upcoming" or "completed"'),
    body('registrationLink').optional().isURL().withMessage('Registration link must be a valid URL'),
    body('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a non-negative number')
  ],
  eventsController.createEvent
);

/**
 * PUT /api/events/:id
 * Update an existing event
 */
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date'),
    body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('status')
      .optional()
      .isIn(['upcoming', 'completed'])
      .withMessage('Status must be either "upcoming" or "completed"'),
    body('registrationLink').optional().isURL().withMessage('Registration link must be a valid URL'),
    body('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a non-negative number')
  ],
  eventsController.updateEvent
);

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete('/:id', authMiddleware, eventsController.deleteEvent);

module.exports = router;
