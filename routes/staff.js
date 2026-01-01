const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/staff
// @desc    Get all staff members
// @access  Private (OWNER and RECEPTIONIST)
router.get('/', authorize('OWNER', 'RECEPTIONIST'), getAllStaff);

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Private (OWNER only)
router.post(
  '/',
  authorize('OWNER'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('phoneNumber')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number')
  ],
  createStaff
);

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (OWNER only)
router.put(
  '/:id',
  authorize('OWNER'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid staff member ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number')
  ],
  updateStaff
);

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Private (OWNER only)
router.delete(
  '/:id',
  authorize('OWNER'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid staff member ID')
  ],
  deleteStaff
);

module.exports = router;
