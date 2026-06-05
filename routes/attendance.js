const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const {
  getAttendance,
  markAttendance,
  getAttendanceHistory
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/attendance/history
// @desc    Get attendance history for a staff member (Monday to Sunday)
// @access  Private (OWNER and RECEPTIONIST)
router.get(
  '/history',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    query('staffMember')
      .notEmpty()
      .withMessage('Staff member is required')
      .isMongoId()
      .withMessage('Invalid staff member ID'),
    query('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    query('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Days must be an integer between 1 and 30')
  ],
  getAttendanceHistory
);

// @route   GET /api/attendance
// @desc    Get all staff attendance records for a specific date
// @access  Private (OWNER and RECEPTIONIST)
router.get(
  '/', 
  authorize('OWNER', 'RECEPTIONIST'), 
  [
    query('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format')
  ],
  getAttendance
);

// @route   POST /api/attendance
// @desc    Mark/save bulk attendance records for a specific date
// @access  Private (OWNER and RECEPTIONIST)
router.post(
  '/',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    body('records')
      .isArray({ min: 1 })
      .withMessage('Records must be a non-empty array'),
    body('records.*.staffMember')
      .isMongoId()
      .withMessage('Invalid staff member ID'),
    body('records.*.status')
      .isIn(['PRESENT', 'ABSENT'])
      .withMessage('Status must be PRESENT or ABSENT')
  ],
  markAttendance
);

module.exports = router;
