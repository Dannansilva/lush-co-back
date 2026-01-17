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

    // Count unique customers (filter out appointments with null customers)
    const uniqueCustomers = new Set(
      completedAppointments
        .filter(apt => apt.customer)
        .map(apt => apt.customer.toString())
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
      if (!appointment.services) return;

      appointment.services.forEach(service => {
        // Skip if service is null (deleted service)
        if (!service) return;

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

// @desc    Get monthly revenue (current or specific month)
// @route   GET /api/revenue/monthly
// @access  Private (OWNER only)
exports.getMonthlyRevenue = async (req, res, next) => {
  try {
    const { filter, month, year } = req.query;

    let targetMonth, targetYear;
    const now = new Date();

    // Determine target month and year
    if (filter === 'current') {
      targetMonth = now.getMonth() + 1; // 1-12
      targetYear = now.getFullYear();
    } else if (filter === 'last') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      targetMonth = lastMonth.getMonth() + 1;
      targetYear = lastMonth.getFullYear();
    } else {
      targetMonth = month ? parseInt(month) : now.getMonth() + 1;
      targetYear = year ? parseInt(year) : now.getFullYear();
    }

    // Build date range for the specific month
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Get all completed appointments for the month
    const completedAppointments = await Appointment.find({
      appointmentDate: { $gte: monthStart, $lte: monthEnd },
      status: 'COMPLETED'
    }).populate('services', 'category price name')
      .populate('staff', 'name phoneNumber');

    // Calculate total revenue
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);

    // Calculate revenue by staff
    const revenueByStaff = {};
    completedAppointments.forEach(appointment => {
      // Skip if staff is null (deleted staff member)
      if (!appointment.staff) return;

      const staffId = appointment.staff._id.toString();
      if (!revenueByStaff[staffId]) {
        revenueByStaff[staffId] = {
          staffId,
          staffName: appointment.staff.name,
          staffPhoneNumber: appointment.staff.phoneNumber,
          totalRevenue: 0,
          appointmentCount: 0
        };
      }
      revenueByStaff[staffId].totalRevenue += appointment.price;
      revenueByStaff[staffId].appointmentCount += 1;
    });

    // Calculate revenue by category
    const revenueByCategory = {};
    completedAppointments.forEach(appointment => {
      if (!appointment.services) return;

      appointment.services.forEach(service => {
        // Skip if service is null (deleted service)
        if (!service) return;

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

    // Convert objects to arrays and sort
    const staffArray = Object.values(revenueByStaff).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );
    const categoryArray = Object.values(revenueByCategory).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        monthName: monthNames[targetMonth - 1],
        year: targetYear,
        totalRevenue,
        totalAppointments: completedAppointments.length,
        avgTransaction: completedAppointments.length > 0
          ? totalRevenue / completedAppointments.length
          : 0,
        revenueByStaff: staffArray,
        revenueByCategory: categoryArray
      }
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
