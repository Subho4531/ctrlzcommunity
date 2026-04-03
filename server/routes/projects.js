const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const projectsController = require('../controllers/projectsController');

const router = express.Router();

/**
 * Projects Routes
 * All routes require authentication
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 2.5
 */

/**
 * GET /api/projects
 * Get all projects with optional filtering by status and domain
 * PUBLIC - No authentication required
 */
router.get('/', projectsController.getAllProjects);

/**
 * GET /api/projects/:id
 * Get a single project by ID
 * PUBLIC - No authentication required
 */
router.get('/:id', projectsController.getProjectById);

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
    body('domains')
      .isArray({ min: 1 })
      .withMessage('Domains must be an array with at least one element'),
    body('repo')
      .optional()
      .isURL()
      .withMessage('Repository must be a valid URL'),
    body('demo')
      .optional()
      .isURL()
      .withMessage('Demo must be a valid URL'),
    body('status')
      .optional()
      .isIn(['active', 'completed', 'archived'])
      .withMessage('Status must be one of: "active", "completed", or "archived"')
  ],
  projectsController.createProject
);

/**
 * PUT /api/projects/:id
 * Update an existing project
 */
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('summary').optional().trim().notEmpty().withMessage('Summary cannot be empty'),
    body('domains')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Domains must be an array with at least one element'),
    body('repo')
      .optional()
      .isURL()
      .withMessage('Repository must be a valid URL'),
    body('demo')
      .optional()
      .isURL()
      .withMessage('Demo must be a valid URL'),
    body('status')
      .optional()
      .isIn(['active', 'completed', 'archived'])
      .withMessage('Status must be one of: "active", "completed", or "archived"')
  ],
  projectsController.updateProject
);

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', authMiddleware, projectsController.deleteProject);

module.exports = router;
