const { validationResult } = require('express-validator');
const StaffMember = require('../models/StaffMember');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private (OWNER only)
exports.createStaff = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { name, phoneNumber } = req.body;

  try {
    const staff = await StaffMember.create({
      name,
      phoneNumber
    });

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (OWNER only)
exports.getAllStaff = async (req, res, next) => {
  try {
    const staff = await StaffMember.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (OWNER only)
exports.updateStaff = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const staff = await StaffMember.findById(req.params.id);

    if (!staff) {
      return next(new ErrorResponse('Staff member not found', 404));
    }

    const { name, phoneNumber } = req.body;

    // Update only provided fields
    if (name !== undefined) staff.name = name;
    if (phoneNumber !== undefined) staff.phoneNumber = phoneNumber;

    await staff.save();

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (OWNER only)
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await StaffMember.findById(req.params.id);

    if (!staff) {
      return next(new ErrorResponse('Staff member not found', 404));
    }

    await staff.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
