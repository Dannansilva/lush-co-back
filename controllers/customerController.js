const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');

// NOTE: This is a placeholder controller for customer management
// You'll need to create a Customer model first

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (OWNER and RECEPTIONIST)
exports.getAllCustomers = async (req, res, next) => {
  try {
    // TODO: Implement after creating Customer model
    // const customers = await Customer.find()
    //   .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Customer management feature coming soon',
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (OWNER and RECEPTIONIST)
exports.getCustomer = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(200).json({
      success: true,
      message: 'Customer details coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (OWNER and RECEPTIONIST)
exports.createCustomer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // TODO: Implement after creating Customer model
    // const { name, email, phoneNumber, address, notes } = req.body;
    // const customer = await Customer.create({
    //   name,
    //   email,
    //   phoneNumber,
    //   address,
    //   notes
    // });

    res.status(201).json({
      success: true,
      message: 'Customer creation coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (OWNER and RECEPTIONIST)
exports.updateCustomer = async (req, res, next) => {
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
      message: 'Customer update coming soon',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (OWNER only)
exports.deleteCustomer = async (req, res, next) => {
  try {
    // TODO: Implement
    res.status(200).json({
      success: true,
      message: 'Customer deletion coming soon',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search customers
// @route   GET /api/customers/search?query=
// @access  Private (OWNER and RECEPTIONIST)
exports.searchCustomers = async (req, res, next) => {
  try {
    // TODO: Implement search by name, email, or phone
    // const { query } = req.query;
    // const customers = await Customer.find({
    //   $or: [
    //     { name: { $regex: query, $options: 'i' } },
    //     { email: { $regex: query, $options: 'i' } },
    //     { phoneNumber: { $regex: query, $options: 'i' } }
    //   ]
    // });

    res.status(200).json({
      success: true,
      message: 'Customer search coming soon',
      count: 0,
      data: []
    });
  } catch (error) {
    next(error);
  }
};
