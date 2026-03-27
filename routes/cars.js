const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all cars (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search, make, year, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by make
    if (make) {
      query.make = new RegExp(make, 'i');
    }
    
    // Filter by year
    if (year) {
      query.year = year;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Only show available cars to customers
    query.status = 'available';
    
    const cars = await Car.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Car.countDocuments(query);
    
    res.json({
      cars,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single car by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new car (admin only)
router.post('/', adminAuth, upload.single('image'), [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      make,
      model,
      year,
      price,
      description,
      mileage,
      fuelType,
      transmission,
      color,
      features
    } = req.body;

    const carData = {
      make,
      model,
      year: Number(year),
      price: Number(price),
      description,
      mileage: Number(mileage) || 0,
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Manual',
      color,
      features: features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : []
    };

    if (req.file) {
      carData.image = req.file.filename;
    }

    const car = new Car(carData);
    await car.save();

    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const {
      make,
      model,
      year,
      price,
      description,
      mileage,
      fuelType,
      transmission,
      color,
      features,
      status
    } = req.body;

    // Update fields
    if (make) car.make = make;
    if (model) car.model = model;
    if (year) car.year = Number(year);
    if (price) car.price = Number(price);
    if (description) car.description = description;
    if (mileage !== undefined) car.mileage = Number(mileage);
    if (fuelType) car.fuelType = fuelType;
    if (transmission) car.transmission = transmission;
    if (color) car.color = color;
    if (status) car.status = status;
    if (features) {
      car.features = Array.isArray(features) ? features : features.split(',').map(f => f.trim());
    }

    if (req.file) {
      car.image = req.file.filename;
    }

    await car.save();
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all cars for admin (including sold/reserved)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const cars = await Car.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Car.countDocuments();
    
    res.json({
      cars,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
