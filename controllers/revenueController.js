const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get overall revenue metrics
// @route   GET /api/revenue/metrics
// @access  Private (OWNER only)
exports.getRevenueMetrics = async (req, res, next) => {
  try {
    const { year, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    } else if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    }

    // Get completed appointments within date range
    const completedAppointments = await Appointment.find({
      appointmentDate: dateFilter,
      status: 'COMPLETED'
    });

    // Calculate total revenue
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);

    // Calculate average transaction
    const avgTransaction = completedAppointments.length > 0
      ? totalRevenue / completedAppointments.length
      : 0;

    // Count unique customers
    const uniqueCustomers = new Set(
      completedAppointments.map(apt => apt.customer.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalAppointments: completedAppointments.length,
        avgTransaction,
        totalCustomers: uniqueCustomers.size
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by staff member
// @route   GET /api/revenue/by-staff
// @access  Private (OWNER only)
exports.getRevenueByStaff = async (req, res, next) => {
  try {
    const { year, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    } else if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    }

    // Aggregate revenue by staff member
    const revenueByStaff = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: dateFilter,
          status: 'COMPLETED'
        }
      },
      {
        $group: {
          _id: '$staff',
          totalRevenue: { $sum: '$price' },
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'staffmembers',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      {
        $unwind: '$staffInfo'
      },
      {
        $project: {
          _id: 1,
          staffName: '$staffInfo.name',
          staffPhoneNumber: '$staffInfo.phoneNumber',
          totalRevenue: 1,
          appointmentCount: 1,
          avgRevenue: { $divide: ['$totalRevenue', '$appointmentCount'] }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: revenueByStaff.length,
      data: revenueByStaff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by service category
// @route   GET /api/revenue/by-category
// @access  Private (OWNER only)
exports.getRevenueByCategory = async (req, res, next) => {
  try {
    const { year, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    } else if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    }

    // Get completed appointments with service details
    const completedAppointments = await Appointment.find({
      appointmentDate: dateFilter,
      status: 'COMPLETED'
    }).populate('services', 'category price');

    // Aggregate revenue by category
    const revenueByCategory = {};

    completedAppointments.forEach(appointment => {
      appointment.services.forEach(service => {
        const category = service.category;
        if (!revenueByCategory[category]) {
          revenueByCategory[category] = {
            category,
            totalRevenue: 0,
            serviceCount: 0
          };
        }
        revenueByCategory[category].totalRevenue += service.price;
        revenueByCategory[category].serviceCount += 1;
      });
    });

    // Convert to array and sort by revenue
    const result = Object.values(revenueByCategory).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue trends (monthly breakdown)
// @route   GET /api/revenue/trends
// @access  Private (OWNER only)
exports.getRevenueTrends = async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get all completed appointments for the year
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: yearStart, $lte: yearEnd },
          status: 'COMPLETED'
        }
      },
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          totalRevenue: { $sum: '$price' },
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create array with all 12 months (fill missing months with 0)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trends = monthNames.map((month, index) => {
      const monthData = monthlyRevenue.find(m => m._id === index + 1);
      return {
        month,
        monthNumber: index + 1,
        revenue: monthData ? monthData.totalRevenue : 0,
        appointmentCount: monthData ? monthData.appointmentCount : 0
      };
    });

    res.status(200).json({
      success: true,
      year: targetYear,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue for a specific staff member
// @route   GET /api/revenue/staff/:staffId
// @access  Private (OWNER only)
exports.getStaffRevenue = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { year, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    } else if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: yearStart, $lte: yearEnd };
    }

    // Get completed appointments for this staff member
    const staffAppointments = await Appointment.find({
      staff: staffId,
      appointmentDate: dateFilter,
      status: 'COMPLETED'
    }).populate('staff', 'name phoneNumber');

    if (staffAppointments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          staffId,
          totalRevenue: 0,
          appointmentCount: 0,
          avgRevenue: 0
        }
      });
    }

    // Calculate metrics
    const totalRevenue = staffAppointments.reduce((sum, apt) => sum + apt.price, 0);
    const avgRevenue = totalRevenue / staffAppointments.length;

    res.status(200).json({
      success: true,
      data: {
        staffId,
        staffName: staffAppointments[0].staff.name,
        staffPhoneNumber: staffAppointments[0].staff.phoneNumber,
        totalRevenue,
        appointmentCount: staffAppointments.length,
        avgRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
