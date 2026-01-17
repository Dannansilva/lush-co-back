const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getTodayAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/appointments/today
// @desc    Get today's appointments
// @access  Private (OWNER and RECEPTIONIST)
router.get('/today', authorize('OWNER', 'RECEPTIONIST'), getTodayAppointments);

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private (OWNER and RECEPTIONIST)
router.get('/', authorize('OWNER', 'RECEPTIONIST'), getAllAppointments);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private (OWNER and RECEPTIONIST)
router.get('/:id', authorize('OWNER', 'RECEPTIONIST'), getAppointment);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (OWNER and RECEPTIONIST)
router.post(
  '/',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    body('customerId')
      .notEmpty()
      .withMessage('Customer ID is required')
      .isMongoId()
      .withMessage('Invalid customer ID'),
    body('staffId')
      .notEmpty()
      .withMessage('Staff ID is required')
      .isMongoId()
      .withMessage('Invalid staff ID'),
    body('serviceIds')
      .isArray({ min: 1 })
      .withMessage('At least one service is required'),
    body('serviceIds.*')
      .isMongoId()
      .withMessage('Invalid service ID'),
    body('appointmentDate')
      .notEmpty()
      .withMessage('Appointment date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('status')
      .optional()
      .isIn(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
      .withMessage('Invalid status'),
    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),
    body('price')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number')
      .toFloat()
  ],
  createAppointment
);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (OWNER and RECEPTIONIST)
router.put(
  '/:id',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('customerId')
      .optional()
      .isMongoId()
      .withMessage('Invalid customer ID'),
    body('staffId')
      .optional()
      .isMongoId()
      .withMessage('Invalid staff ID'),
    body('serviceIds')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one service is required'),
    body('serviceIds.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid service ID'),
    body('appointmentDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('status')
      .optional()
      .isIn(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
      .withMessage('Invalid status'),
    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim(),
    body('price')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number')
      .toFloat()
  ],
  updateAppointment
);

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private (OWNER and RECEPTIONIST)
router.delete(
  '/:id',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID')
  ],
  cancelAppointment
);

module.exports = router;
