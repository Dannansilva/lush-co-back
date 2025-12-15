const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/admin/users
// @desc    Get all users (admin and chairman only)
// @access  Private/Admin
router.get('/users', protect, authorize('admin', 'ADMIN', 'chairman', 'CHAIRMAN'), async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/dashboard
// @desc    Admin dashboard stats (admin and chairman only)
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin', 'ADMIN', 'chairman', 'CHAIRMAN'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAll = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAdmins,
          totalAll
        },
        message: 'Welcome to Admin Dashboard!'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user by ID (admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin', 'ADMIN'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
