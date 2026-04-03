const { validationResult } = require('express-validator');
const Project = require('../models/projects');

// Helper to transform MongoDB _id to id for frontend compatibility
const transformProject = (project) => {
  if (Array.isArray(project)) {
    return project.map(p => ({
      id: p._id?.toString() || p.id,
      ...p.toObject?.() || p
    }));
  }
  return {
    id: project._id?.toString() || project.id,
    ...project.toObject?.() || project
  };
};

/**
 * Projects Controller
 * Handles CRUD operations for projects
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10
 */
class ProjectsController {
  /**
   * Get all projects with optional filtering by status and domain
   * GET /api/projects
   * Query params: status (active|completed|archived), domain (string)
   */
  async getAllProjects(req, res) {
    try {
      const { status, domain } = req.query;

      // Build filter object
      const filter = {};
      if (status) {
        // Validate status enum
        if (!['active', 'completed', 'archived'].includes(status)) {
          return res.status(400).json({
            message: 'Invalid status value',
            error: 'Status must be one of: "active", "completed", or "archived"'
          });
        }
        filter.status = status;
      }

      if (domain) {
        // Filter by domain in domains array
        filter.domains = domain;
      }

      // Fetch projects
      const projects = await Project.find(filter)
        .populate('createdBy', 'name email');

      // Transform _id to id for frontend compatibility
      const transformedProjects = projects.map(project => ({
        id: project._id.toString(),
        title: project.title,
        summary: project.summary,
        domains: project.domains,
        status: project.status,
        repo: project.repo,
        demo: project.demo,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }));

      res.status(200).json(transformedProjects);
    } catch (error) {
      console.error('Get all projects error:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  }

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id).populate('createdBy', 'name email');

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Transform _id to id for frontend compatibility
      const transformedProject = {
        id: project._id.toString(),
        title: project.title,
        summary: project.summary,
        domains: project.domains,
        status: project.status,
        repo: project.repo,
        demo: project.demo,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };

      res.status(200).json(transformedProject);
    } catch (error) {
      console.error('Get project by ID error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  async createProject(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, summary, domains, repo, demo, status } = req.body;

      // Create new project
      const project = await Project.create({
        title,
        summary,
        domains,
        repo,
        demo,
        status: status || 'active',
        createdBy: req.user._id
      });

      // Populate createdBy before returning
      await project.populate('createdBy', 'name email');

      // Transform _id to id for frontend compatibility
      const transformedProject = {
        id: project._id.toString(),
        title: project.title,
        summary: project.summary,
        domains: project.domains,
        status: project.status,
        repo: project.repo,
        demo: project.demo,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };

      res.status(201).json(transformedProject);
    } catch (error) {
      console.error('Create project error:', error);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation failed',
          errors: messages
        });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  }

  /**
   * Update an existing project
   * PUT /api/projects/:id
   */
  async updateProject(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, summary, domains, repo, demo, status } = req.body;

      // Find and update project
      const project = await Project.findByIdAndUpdate(
        id,
        {
          title,
          summary,
          domains,
          repo,
          demo,
          status
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Transform _id to id for frontend compatibility
      const transformedProject = {
        id: project._id.toString(),
        title: project.title,
        summary: project.summary,
        domains: project.domains,
        status: project.status,
        repo: project.repo,
        demo: project.demo,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };

      res.status(200).json(transformedProject);
    } catch (error) {
      console.error('Update project error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Project not found' });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation failed',
          errors: messages
        });
      }
      res.status(500).json({ message: 'Failed to update project' });
    }
  }

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  async deleteProject(req, res) {
    try {
      let { id } = req.params;

      // Validate ID is provided and not undefined
      if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Failed to delete project' });
    }
  }
}

module.exports = new ProjectsController();
