/**
 * Members Controller
 * Handles member retrieval, search, and registration
 */

const { validationResult } = require('express-validator');
const Member = require('../models/members');
const { saveFileLocally } = require('../utils/fileUpload');

// Helper function to transform member document
function transformMember(member) {
  if (!member) return null;
  return {
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    year: member.year,
    domain: member.domain,
    about: member.about,
    city: member.city,
    country: member.country,
    github: member.github,
    linkedin: member.linkedin,
    insta: member.insta,
    pfp: member.pfp,
    position: member.position,
    approvalStatus: member.approvalStatus,
    category: member.category,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt
  };
}

class MembersController {
  /**
   * Get all members with optional filtering and pagination
   * GET /api/members
   */
  async getAllMembers(req, res) {
    try {
      const { search, domain, page = 1, limit = 20 } = req.query;
      
      // Build filter object
      let filter = { approvalStatus: 'approved' };

      if (search) {
        filter.$text = { $search: search };
      }

      if (domain) {
        filter.domain = domain;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const pageSize = Math.min(Math.max(1, parseInt(limit)), 100);

      // Get total count
      const total = await Member.countDocuments(filter);

      // Get members
      const members = await Member.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize)
        .select('-passwordHash')
        .exec();

      // Transform members to use id instead of _id
      const transformedMembers = members.map(transformMember);

      res.json({
        members: transformedMembers,
        pagination: {
          page: parseInt(page),
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  }

  /**
   * Get a single member by ID
   * GET /api/members/:id
   */
  async getMemberById(req, res) {
    try {
      const { id } = req.params;

      const member = await Member.findById(id)
        .select('-passwordHash')
        .exec();

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.json(transformMember(member));
    } catch (error) {
      console.error('Error fetching member:', error);
      res.status(500).json({ message: 'Failed to fetch member' });
    }
  }

  /**
   * Register a new member
   * POST /api/members/register
   */
  async registerMember(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, year, domain, interests } = req.body;

      // Check if email already exists
      const existingMember = await Member.findOne({ email: email.toLowerCase() });
      if (existingMember) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Validate year
      const validYears = ['1st', '2nd', '3rd', '4th'];
      if (!validYears.includes(year)) {
        return res.status(400).json({ message: 'Invalid academic year' });
      }

      // Create new member
      const member = await Member.create({
        name,
        email: email.toLowerCase(),
        year,
        domain,
        interests: interests || [],
        approvalStatus: 'pending',
        authProvider: 'admin'
      });

      // Return member without passwordHash
      res.status(201).json(member.toJSON());
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  /**
   * Admin: Create a new community lead, domain lead, or core member
   * POST /api/members/community
   */
  async createCommunityMember(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type } = req.params;
      const { name, email, about, domain, position, city, country, github, linkedin, insta } = req.body;
      
      let pfpUrl = 'Not Uploaded';
      if (req.file) {
        // File was uploaded and processed by file upload middleware
        pfpUrl = req.file.cloudinary_url || 'Not Uploaded';
      }

      let Model;
      let memberData = {
        name,
        email: email.toLowerCase(),
        about,
        city,
        country: country || 'India',
        github,
        linkedin,
        insta,
        pfp: pfpUrl
      };

      // Add type-specific fields
      if (type === 'communityleads') {
        Model = require('../models/communityLeads');
        memberData.position = position;
      } else if (type === 'domainleads') {
        Model = require('../models/domainLeads');
        memberData.domain = domain;
      } else if (type === 'coremembers') {
        Model = require('../models/coreMembers');
        memberData.domain = domain;
      } else {
        return res.status(400).json({ message: 'Invalid member type' });
      }

      const newMember = await Model.create(memberData);
      res.status(201).json({ message: 'Member created successfully', member: newMember });
    } catch (error) {
      console.error('Create community member error:', error);
      res.status(500).json({ message: 'Failed to create member', error: error.message });
    }
  }

  /**
   * Create a new member with Cloudinary file upload
   * POST /api/members/create
   */
  async createMemberWithFileUpload(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        name, 
        email, 
        year, 
        domain, 
        approvalStatus,
        about,
        city,
        country,
        github,
        linkedin,
        insta,
        position
      } = req.body;

      // Check if email already exists
      const existingMember = await Member.findOne({ email: email.toLowerCase() });
      if (existingMember) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Handle file upload to Cloudinary
      let pfpUrl = null;
      if (req.file) {
        // Check if Cloudinary URL was already set by middleware
        if (req.file.cloudinary_url) {
          pfpUrl = req.file.cloudinary_url;
        } else {
          // Fallback to local storage if Cloudinary fails
          try {
            const uploadResult = await saveFileLocally(req.file, 'members');
            pfpUrl = uploadResult.filepath;
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            return res.status(400).json({ message: 'Failed to upload image' });
          }
        }
      }

      // Build member data object
      const memberData = {
        name,
        email: email.toLowerCase(),
        year: year || null,
        domain: domain || null,
        pfp: pfpUrl,
        approvalStatus: approvalStatus || 'pending',
        category: req.body.category || 'core members',
        authProvider: 'admin'
      };

      // Add optional fields if provided
      if (about) memberData.about = about;
      if (city) memberData.city = city;
      if (country) memberData.country = country;
      if (github) memberData.github = github;
      if (linkedin) memberData.linkedin = linkedin;
      if (insta) memberData.insta = insta;
      if (position) memberData.position = position;

      // Create new member
      console.log('Creating member with data:', memberData);

      const member = await Member.create(memberData);

      console.log('Member created successfully:', member._id);

      res.status(201).json({
        message: 'Member created successfully',
        member: transformMember(member)
      });
    } catch (error) {
      console.error('Create member with file upload error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        errors: error.errors,
        stack: error.stack
      });
      res.status(500).json({ 
        message: 'Failed to create member', 
        error: error.message,
        details: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : []
      });
    }
  }

  /**
   * Update an existing member
   * PUT /api/members/:id
   */
  async updateMember(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Invalid member ID' });
      }

      const { 
        name, 
        email, 
        year, 
        domain, 
        approvalStatus, 
        category,
        about,
        city,
        country,
        github,
        linkedin,
        insta,
        position
      } = req.body;

      // Build update object
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (year !== undefined) updateData.year = year;
      if (domain !== undefined) updateData.domain = domain;
      if (approvalStatus !== undefined) updateData.approvalStatus = approvalStatus;
      if (category !== undefined) updateData.category = category;
      
      // Add optional fields
      if (about !== undefined) updateData.about = about;
      if (city !== undefined) updateData.city = city;
      if (country !== undefined) updateData.country = country;
      if (github !== undefined) updateData.github = github;
      if (linkedin !== undefined) updateData.linkedin = linkedin;
      if (insta !== undefined) updateData.insta = insta;
      if (position !== undefined) updateData.position = position;

      // Handle file upload if provided
      if (req.file) {
        // Check if Cloudinary URL was already set by middleware
        if (req.file.cloudinary_url) {
          updateData.pfp = req.file.cloudinary_url;
        } else {
          // Fallback to local storage if Cloudinary fails
          try {
            const uploadResult = await saveFileLocally(req.file, 'members');
            updateData.pfp = uploadResult.filepath;
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            return res.status(400).json({ message: 'Failed to upload image' });
          }
        }
      }

      const member = await Member.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.json({
        message: 'Member updated successfully',
        member: transformMember(member)
      });
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({ message: 'Failed to update member', error: error.message });
    }
  }

  /**
   * Delete a member
   * DELETE /api/members/:id
   */
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Invalid member ID' });
      }

      const member = await Member.findByIdAndDelete(id);

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      console.error('Delete member error:', error);
      res.status(500).json({ message: 'Failed to delete member', error: error.message });
    }
  }
}

module.exports = new MembersController();
