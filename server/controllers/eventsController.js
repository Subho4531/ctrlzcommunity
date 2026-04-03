const { validationResult } = require('express-validator');
const Event = require('../models/events');

// Helper to transform MongoDB _id to id for frontend compatibility
const transformEvent = (event) => {
  if (Array.isArray(event)) {
    return event.map(e => ({
      id: e._id?.toString() || e.id,
      ...e.toObject?.() || e
    }));
  }
  return {
    id: event._id?.toString() || event.id,
    ...event.toObject?.() || event
  };
};

/**
 * Events Controller
 * Handles CRUD operations for events
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10
 */
class EventsController {
  /**
   * Get all events with optional filtering and sorting
   * GET /api/events
   * Query params: status (upcoming|completed)
   */
  async getAllEvents(req, res) {
    try {
      const { status } = req.query;

      // Build filter object
      const filter = {};
      if (status) {
        // Validate status enum
        if (!['upcoming', 'completed'].includes(status)) {
          return res.status(400).json({
            message: 'Invalid status value',
            error: 'Status must be either "upcoming" or "completed"'
          });
        }
        filter.status = status;
      }

      // Fetch events sorted by date descending
      const events = await Event.find(filter)
        .sort({ date: -1 })
        .populate('createdBy', 'name email');

      // Transform _id to id for frontend compatibility
      const transformedEvents = events.map(event => ({
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        status: event.status,
        registrationLink: event.registrationLink,
        capacity: event.capacity,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }));

      res.status(200).json(transformedEvents);
    } catch (error) {
      console.error('Get all events error:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  }

  /**
   * Get a single event by ID
   * GET /api/events/:id
   */
  async getEventById(req, res) {
    try {
      const { id } = req.params;

      const event = await Event.findById(id).populate('createdBy', 'name email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Transform _id to id for frontend compatibility
      const transformedEvent = {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        status: event.status,
        registrationLink: event.registrationLink,
        capacity: event.capacity,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };

      res.status(200).json(transformedEvent);
    } catch (error) {
      console.error('Get event by ID error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  }

  /**
   * Create a new event
   * POST /api/events
   */
  async createEvent(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, date, location, description, status, registrationLink, capacity } = req.body;

      // Create new event
      const event = await Event.create({
        title,
        date,
        location,
        description,
        status: status || 'upcoming',
        registrationLink,
        capacity,
        createdBy: req.user._id
      });

      // Populate createdBy before returning
      await event.populate('createdBy', 'name email');

      // Transform _id to id for frontend compatibility
      const transformedEvent = {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        status: event.status,
        registrationLink: event.registrationLink,
        capacity: event.capacity,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };

      res.status(201).json(transformedEvent);
    } catch (error) {
      console.error('Create event error:', error);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation failed',
          errors: messages
        });
      }
      res.status(500).json({ message: 'Failed to create event' });
    }
  }

  /**
   * Update an existing event
   * PUT /api/events/:id
   */
  async updateEvent(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, date, location, description, status, registrationLink, capacity } = req.body;

      // Find and update event
      const event = await Event.findByIdAndUpdate(
        id,
        {
          title,
          date,
          location,
          description,
          status,
          registrationLink,
          capacity
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Transform _id to id for frontend compatibility
      const transformedEvent = {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        status: event.status,
        registrationLink: event.registrationLink,
        capacity: event.capacity,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };

      res.status(200).json(transformedEvent);
    } catch (error) {
      console.error('Update event error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found' });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation failed',
          errors: messages
        });
      }
      res.status(500).json({ message: 'Failed to update event' });
    }
  }

  /**
   * Delete an event
   * DELETE /api/events/:id
   */
  async deleteEvent(req, res) {
    try {
      let { id } = req.params;

      // Validate ID is provided and not undefined
      if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      const event = await Event.findByIdAndDelete(id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete event error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: 'Failed to delete event' });
    }
  }
}

module.exports = new EventsController();
