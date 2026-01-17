const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const StaffMember = require('../models/StaffMember');
const Service = require('../models/Service');

// @desc    Get all appointments (paginated)
// @route   GET /api/appointments?page=1&limit=20
// @access  Private (OWNER and RECEPTIONIST)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await Appointment.countDocuments();

    const appointments = await Appointment.find()
      .populate('customer', 'name phoneNumber email')
      .populate('staff', 'name phoneNumber')
      .populate('services', 'name duration price category')
      .populate('createdBy', 'name email')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private (OWNER and RECEPTIONIST)
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name phoneNumber email')
      .populate('staff', 'name phoneNumber')
      .populate('services', 'name duration price category')
      .populate('createdBy', 'name email');

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (OWNER and RECEPTIONIST)
exports.createAppointment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { customerId, staffId, serviceIds, appointmentDate, notes, status } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    // Verify staff member exists
    const staff = await StaffMember.findById(staffId);
    if (!staff) {
      return next(new ErrorResponse('Staff member not found', 404));
    }

    // Verify all services exist and are active
    const services = await Service.find({ _id: { $in: serviceIds } });

    if (services.length !== serviceIds.length) {
      return next(new ErrorResponse('One or more services not found', 404));
    }

    // Check if all services are active
    const inactiveServices = services.filter(s => !s.isActive);
    if (inactiveServices.length > 0) {
      return next(new ErrorResponse('One or more services are not currently available', 400));
    }

    // Calculate total duration and price
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

    // Create appointment with total duration and price
    const appointment = await Appointment.create({
      customer: customerId,
      staff: staffId,
      services: serviceIds,
      appointmentDate,
      duration: totalDuration,
      price: totalPrice,
      status: status || 'SCHEDULED',
      notes: notes && notes.trim() ? notes : undefined,
      createdBy: req.user._id
    });

    // Populate the appointment before returning
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name phoneNumber email')
      .populate('staff', 'name phoneNumber')
      .populate('services', 'name duration price category')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private (OWNER and RECEPTIONIST)
exports.updateAppointment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    const { customerId, staffId, serviceIds, appointmentDate, notes, status } = req.body;

    // Build update data
    const updateData = {};

    // Verify and update customer if provided
    if (customerId !== undefined) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return next(new ErrorResponse('Customer not found', 404));
      }
      updateData.customer = customerId;
    }

    // Verify and update staff if provided
    if (staffId !== undefined) {
      const staff = await StaffMember.findById(staffId);
      if (!staff) {
        return next(new ErrorResponse('Staff member not found', 404));
      }
      updateData.staff = staffId;
    }

    // Verify services and update duration/price if services are changed
    if (serviceIds !== undefined) {
      const services = await Service.find({ _id: { $in: serviceIds } });

      if (services.length !== serviceIds.length) {
        return next(new ErrorResponse('One or more services not found', 404));
      }

      // Check if all services are active
      const inactiveServices = services.filter(s => !s.isActive);
      if (inactiveServices.length > 0) {
        return next(new ErrorResponse('One or more services are not currently available', 400));
      }

      // Calculate total duration and price
      const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
      const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

      updateData.services = serviceIds;
      updateData.duration = totalDuration;
      updateData.price = totalPrice;
    }

    // Update other fields
    if (appointmentDate !== undefined) updateData.appointmentDate = appointmentDate;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) {
      updateData.notes = (notes && notes.trim()) ? notes : undefined;
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('customer', 'name phoneNumber email')
      .populate('staff', 'name phoneNumber')
      .populate('services', 'name duration price category')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private (OWNER and RECEPTIONIST)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Soft delete by updating status to CANCELLED
    appointment.status = 'CANCELLED';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's appointments (paginated)
// @route   GET /api/appointments/today?page=1&limit=20
// @access  Private (OWNER and RECEPTIONIST)
exports.getTodayAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'CANCELLED' }
    };

    // Get total count for pagination metadata
    const totalCount = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('customer', 'name phoneNumber email')
      .populate('staff', 'name phoneNumber')
      .populate('services', 'name duration price category')
      .populate('createdBy', 'name email')
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};
