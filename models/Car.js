const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Car year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  price: {
    type: Number,
    required: [true, 'Car price is required'],
    min: 0
  },
  image: {
    type: String,
    default: 'default-car.jpg'
  },
  description: {
    type: String,
    required: [true, 'Car description is required'],
    trim: true
  },
  mileage: {
    type: Number,
    default: 0
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Petrol'
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  color: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  features: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
carSchema.index({ make: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
