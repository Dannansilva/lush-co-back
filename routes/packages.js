const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/packages
// @desc    Get all packages
// @access  Public
router.get('/', getAllPackages);

// @route   GET /api/packages/:id
// @desc    Get single package
// @access  Public
router.get('/:id', getPackageById);

// Routes below require authentication and OWNER/RECEPTIONIST authorization
router.use(protect);
router.use(authorize('OWNER', 'RECEPTIONIST'));

// @route   POST /api/packages
// @desc    Create new package
// @access  Private (OWNER only - assuming receptionist shouldn't create packages, adjusting if needed)
// overriding authorize for write operations if strictly OWNER only
// But based on services.js, OWNER and RECEPTIONIST are authorized for the router.
// Let's stick to the pattern in services.js but checks strict OWNER permissions if desired.
// For now, I'll allow both as per services.js pattern unless specified otherwise.
// Wait, services.js allowed both for the router base, but then some endpoints might need specific checks?
// Inspecting services.js again...
// It says: router.use(authorize('OWNER', 'RECEPTIONIST'));
// So both can access.
// Let's stick with that.

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Package name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('services')
      .isArray({ min: 1 })
      .withMessage('Package must include at least one service'),
    body('services.*')
      .isMongoId()
      .withMessage('Invalid service ID'),
    body('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 15 })
      .withMessage('Duration must be at least 15 minutes')
  ],
  createPackage
);

// @route   PUT /api/packages/:id
// @desc    Update package
// @access  Private
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid package ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('services')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Package must include at least one service'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('duration')
      .optional()
      .isInt({ min: 15 })
      .withMessage('Duration must be at least 15 minutes')
  ],
  updatePackage
);

// @route   DELETE /api/packages/:id
// @desc    Delete package
// @access  Private
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid package ID')
  ],
  deletePackage
);

module.exports = router;
