const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const {
  getRevenueMetrics,
  getRevenueByStaff,
  getRevenueByCategory,
  getRevenueTrends,
  getMonthlyRevenue,
  getDailyRevenue,
  getStaffRevenue
} = require('../controllers/revenueController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and OWNER role
router.use(protect);
router.use(authorize('OWNER'));

// @route   GET /api/revenue/metrics
// @desc    Get overall revenue metrics
// @access  Private (OWNER only)
router.get(
  '/metrics',
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ],
  getRevenueMetrics
);

// @route   GET /api/revenue/by-staff
// @desc    Get revenue by staff member
// @access  Private (OWNER only)
router.get(
  '/by-staff',
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ],
  getRevenueByStaff
);

// @route   GET /api/revenue/by-category
// @desc    Get revenue by service category
// @access  Private (OWNER only)
router.get(
  '/by-category',
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ],
  getRevenueByCategory
);

// @route   GET /api/revenue/trends
// @desc    Get revenue trends (monthly breakdown)
// @access  Private (OWNER only)
router.get(
  '/trends',
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100')
  ],
  getRevenueTrends
);

// @route   GET /api/revenue/monthly
// @desc    Get monthly revenue with filters (current, last, specific month)
// @access  Private (OWNER only)
router.get(
  '/monthly',
  [
    query('filter')
      .optional()
      .isIn(['current', 'last'])
      .withMessage('Filter must be either "current" or "last"'),
    query('month')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100')
  ],
  getMonthlyRevenue
);

// @route   GET /api/revenue/daily
// @desc    Get daily revenue breakdown
// @access  Private (OWNER only)
router.get(
  '/daily',
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ],
  getDailyRevenue
);

// @route   GET /api/revenue/staff/:staffId
// @desc    Get revenue for a specific staff member
// @access  Private (OWNER only)
router.get(
  '/staff/:staffId',
  [
    param('staffId')
      .isMongoId()
      .withMessage('Invalid staff ID'),
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid year between 2000 and 2100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ],
  getStaffRevenue
);

module.exports = router;
