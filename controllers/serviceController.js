const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');

// NOTE: This is a placeholder controller for service management
// You'll need to create a Service model first

// @desc    Get all services
// @route   GET /api/services
// @access  Public or Private (depending on business needs)
exports.getAllServices = async (req, res, next) => {
  try {
    // TODO: Implement after creating Service model
    // const services = await Service.find({ isActive: true })
    //   .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: 'Service management feature coming soon',
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public or Private
exports.getService = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(200).json({
      success: true,
      message: 'Service details coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (OWNER only)
exports.createService = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // TODO: Implement after creating Service model
    // const { name, description, category, duration, price } = req.body;
    // const service = await Service.create({
    //   name,
    //   description,
    //   category,
    //   duration, // in minutes
    //   price,
    //   isActive: true
    // });

    res.status(201).json({
      success: true,
      message: 'Service creation coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (OWNER only)
exports.updateService = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // TODO: Implement
    res.status(200).json({
      success: true,
      message: 'Service update coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate service
// @route   DELETE /api/services/:id
// @access  Private (OWNER only)
exports.deleteService = async (req, res, next) => {
  try {
    // TODO: Implement soft delete (set isActive = false)
    res.status(200).json({
      success: true,
      message: 'Service deletion coming soon',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public or Private
exports.getServicesByCategory = async (req, res, next) => {
  try {
    // TODO: Implement
    // const { category } = req.params;
    // const services = await Service.find({
    //   category,
    //   isActive: true
    // });

    res.status(200).json({
      success: true,
      message: 'Service category filtering coming soon',
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};
