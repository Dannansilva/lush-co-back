const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Services are required for a package']
  }],
  price: {
    type: Number,
    required: [true, 'Package price is required'],
    min: [0, 'Price must be a positive number']
  },
  duration: {
    type: Number, // in minutes, calculated sum of services or custom duration
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  image: {
    type: String, // URL or path to image
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
PackageSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Update the updatedAt timestamp before updating
PackageSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Package', PackageSchema);
