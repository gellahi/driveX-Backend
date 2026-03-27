const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const Car = require('../models/Car');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create new request (test drive or booking) - customer only
router.post('/', auth, [
  body('carId').notEmpty().withMessage('Car ID is required'),
  body('type').isIn(['test_drive', 'booking']).withMessage('Type must be test_drive or booking'),
  body('preferredDate').isISO8601().withMessage('Valid preferred date is required'),
  body('preferredTime').notEmpty().withMessage('Preferred time is required'),
  body('contactPhone').notEmpty().withMessage('Contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carId, type, preferredDate, preferredTime, message, contactPhone } = req.body;

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.status !== 'available') {
      return res.status(400).json({ message: 'Car is not available' });
    }

    // Check if user already has a pending request for this car
    const existingRequest = await Request.findOne({
      customer: req.user._id,
      car: carId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this car' });
    }

    const newRequest = new Request({
      customer: req.user._id,
      car: carId,
      type,
      preferredDate,
      preferredTime,
      message,
      contactPhone
    });

    await newRequest.save();

    // Populate the request with car and customer details
    const populatedRequest = await Request.findById(newRequest._id)
      .populate('car', 'make model year image')
      .populate('customer', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's requests - customer only
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ customer: req.user._id })
      .populate('car', 'make model year image price')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests - admin only
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const requests = await Request.find(query)
      .populate('car', 'make model year image')
      .populate('customer', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status - admin only
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'approved', 'rejected', 'completed']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (adminNotes) {
      request.adminNotes = adminNotes;
    }

    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('car', 'make model year image')
      .populate('customer', 'name email phone');

    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single request details
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('car')
      .populate('customer', 'name email phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is authorized to view this request
    if (req.user.role !== 'admin' && request.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete request - customer can delete their own, admin can delete any
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get request statistics - admin only
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const testDriveRequests = await Request.countDocuments({ type: 'test_drive' });
    const bookingRequests = await Request.countDocuments({ type: 'booking' });

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      testDriveRequests,
      bookingRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
