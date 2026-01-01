const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getCategories
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/services/categories
// @desc    Get all service categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public (or Private based on business needs)
router.get('/category/:category', getServicesByCategory);

// @route   GET /api/services
// @desc    Get all services
// @access  Public (or Private based on business needs)
router.get('/', getAllServices);

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public (or Private based on business needs)
router.get('/:id', getService);

// Routes below require authentication and OWNER authorization
router.use(protect);
router.use(authorize('OWNER'));

// @route   POST /api/services
// @desc    Create new service
// @access  Private (OWNER only)
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Service name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim(),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn(['HAIR_STYLING', 'HAIR_COLORING', 'FACIAL', 'MASSAGE', 'BODY_TREATMENT', 'NAIL_CARE', 'HAIR_REMOVAL', 'MAKEUP', 'SKINCARE', 'OTHER'])
      .withMessage('Invalid category'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 15, max: 300 })
      .withMessage('Duration must be between 15 and 300 minutes'),
    body('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ],
  createService
);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (OWNER only)
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid service ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('category')
      .optional()
      .isIn(['HAIR_STYLING', 'HAIR_COLORING', 'FACIAL', 'MASSAGE', 'BODY_TREATMENT', 'NAIL_CARE', 'HAIR_REMOVAL', 'MAKEUP', 'SKINCARE', 'OTHER'])
      .withMessage('Invalid category'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 300 })
      .withMessage('Duration must be between 15 and 300 minutes'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ],
  updateService
);

// @route   DELETE /api/services/:id
// @desc    Delete/Deactivate service
// @access  Private (OWNER only)
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid service ID')
  ],
  deleteService
);

module.exports = router;
