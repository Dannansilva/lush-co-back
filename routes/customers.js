const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/customers/search
// @desc    Search customers
// @access  Private (OWNER and RECEPTIONIST)
router.get(
  '/search',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    query('query')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
  ],
  searchCustomers
);

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private (OWNER and RECEPTIONIST)
router.get('/', authorize('OWNER', 'RECEPTIONIST'), getAllCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private (OWNER and RECEPTIONIST)
router.get(
  '/:id',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid customer ID')
  ],
  getCustomer
);

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private (OWNER and RECEPTIONIST)
router.post(
  '/',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phoneNumber')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number'),
    body('address')
      .optional()
      .trim(),
    body('notes')
      .optional()
      .trim()
  ],
  createCustomer
);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (OWNER and RECEPTIONIST)
router.put(
  '/:id',
  authorize('OWNER', 'RECEPTIONIST'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid customer ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
      .withMessage('Please provide a valid phone number')
  ],
  updateCustomer
);

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (OWNER only)
router.delete(
  '/:id',
  authorize('OWNER'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid customer ID')
  ],
  deleteCustomer
);

module.exports = router;
