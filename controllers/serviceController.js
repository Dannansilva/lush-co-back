const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');
const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public or Private (depending on business needs)
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
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
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }
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
    const { name, description, category, duration, price, isPopular, icon } = req.body;

    const service = await Service.create({
      name,
      description,
      category: category.toUpperCase(),
      duration,
      price,
      isPopular: isPopular || false,
      icon: icon || '💆',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ErrorResponse('Service with this name already exists', 400));
    }
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
    const updateData = {};
    const allowedFields = ['name', 'description', 'category', 'duration', 'price', 'isPopular', 'icon', 'isActive'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'category' ? req.body[field].toUpperCase() : req.body[field];
      }
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }
    next(error);
  }
};

// @desc    Delete/Deactivate service
// @route   DELETE /api/services/:id
// @access  Private (OWNER only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Service deactivated successfully',
      data: service
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }
    next(error);
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public or Private
exports.getServicesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const services = await Service.find({
      category: category.toUpperCase(),
      isActive: true
    }).sort({ isPopular: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};
