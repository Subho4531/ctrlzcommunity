const { validationResult } = require('express-validator');
const Contact = require('../models/contact');

/**
 * Contact Controller
 * Handles contact form submissions
 */
class ContactController {
  /**
   * Submit a contact form
   * POST /api/contact
   */
  async submitContact(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;

      // Validate subject length
      if (subject.length < 5 || subject.length > 200) {
        return res.status(400).json({
          message: 'Subject must be between 5 and 200 characters'
        });
      }

      // Validate message length
      if (message.length < 10 || message.length > 1000) {
        return res.status(400).json({
          message: 'Message must be between 10 and 1000 characters'
        });
      }

      // Create contact submission
      const contact = await Contact.create({
        name,
        email: email.toLowerCase(),
        subject,
        message,
        status: 'new'
      });

      res.status(201).json({
        message: 'Contact form submitted successfully',
        id: contact._id
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      res.status(500).json({ message: 'Failed to submit contact form' });
    }
  }
}

module.exports = new ContactController();
