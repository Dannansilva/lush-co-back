const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getOwnerDashboard,
  getReceptionistDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/dashboard
// @desc    Get role-aware dashboard (auto-routes to appropriate dashboard)
// @access  Private (OWNER and RECEPTIONIST)
router.get('/', getDashboard);

// @route   GET /api/dashboard/owner
// @desc    Get OWNER dashboard with full statistics
// @access  Private (OWNER only)
router.get('/owner', authorize('OWNER'), getOwnerDashboard);

// @route   GET /api/dashboard/receptionist
// @desc    Get RECEPTIONIST dashboard with limited statistics
// @access  Private (RECEPTIONIST only)
router.get('/receptionist', authorize('RECEPTIONIST'), getReceptionistDashboard);

module.exports = router;
