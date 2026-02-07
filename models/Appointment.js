const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StaffMember',
    required: [true, 'Staff member is required']
  },
  services: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }],
    default: []
  },
  packages: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    }],
    default: []
  },
  // We need a custom validator to ensure at least one service or package is selected
  // This logic is better handled in the controller or pre-validate hook, but can be done here too
  // For simplicity in schema, we'll keep them as arrays and validate in pre-save or controller
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date and time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  status: {
    type: String,
    enum: {
      values: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      message: '{VALUE} is not a valid status'
    },
    default: 'SCHEDULED',
    uppercase: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
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
AppointmentSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// Update the updatedAt timestamp before updating
AppointmentSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Index for efficient queries
AppointmentSchema.index({ appointmentDate: 1, status: 1 });
AppointmentSchema.index({ customer: 1 });
AppointmentSchema.index({ staff: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
