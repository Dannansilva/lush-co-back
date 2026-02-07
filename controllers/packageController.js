const Package = require('../models/Package');
const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).populate('services');
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('services');

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private (Admin/Owner)
exports.createPackage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, services, price, duration, image } = req.body;

    // Verify services exist
    const foundServices = await Service.find({ _id: { $in: services } });
    if (foundServices.length !== services.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more services not found'
      });
    }

    const newPackage = await Package.create({
      name,
      description,
      services,
      price,
      duration,
      image
    });

    res.status(201).json({
      success: true,
      data: newPackage
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private (Admin/Owner)
exports.updatePackage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('services');

    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private (Admin/Owner)
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await pkg.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
