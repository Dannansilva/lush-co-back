const User = require('../models/User');
const StaffMember = require('../models/StaffMember');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get dashboard statistics for OWNER
// @route   GET /api/dashboard/owner
// @access  Private (OWNER only)
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    // Get various statistics
    const totalStaff = await StaffMember.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ userType: 'OWNER' });
    const totalReceptionists = await User.countDocuments({ userType: 'RECEPTIONIST' });

    // Get recent staff members (last 5)
    const recentStaff = await StaffMember.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phoneNumber createdAt');

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalStaff,
          totalUsers,
          totalOwners,
          totalReceptionists
        },
        recentStaff,
        greeting: `Welcome back, ${req.user.name}!`,
        userType: req.user.userType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for RECEPTIONIST
// @route   GET /api/dashboard/receptionist
// @access  Private (RECEPTIONIST only)
exports.getReceptionistDashboard = async (req, res, next) => {
  try {
    // Limited statistics for receptionist
    const totalStaff = await StaffMember.countDocuments();

    // Get recent staff members (last 5)
    const recentStaff = await StaffMember.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phoneNumber');

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalStaff
        },
        recentStaff,
        greeting: `Welcome, ${req.user.name}!`,
        userType: req.user.userType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get general dashboard (role-aware)
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    // Route to appropriate dashboard based on user type
    if (req.user.userType === 'OWNER') {
      return exports.getOwnerDashboard(req, res, next);
    } else if (req.user.userType === 'RECEPTIONIST') {
      return exports.getReceptionistDashboard(req, res, next);
    } else {
      return next(new ErrorResponse('Invalid user type', 400));
    }
  } catch (error) {
    next(error);
  }
};
