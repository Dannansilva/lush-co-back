const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  staffMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StaffMember',
    required: [true, 'Staff member is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT'],
    required: [true, 'Attendance status is required']
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by user is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce that a staff member has exactly one attendance record per day
AttendanceSchema.index({ staffMember: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
