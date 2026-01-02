const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');
const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (OWNER and RECEPTIONIST)
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
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
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    res.status(200).json({
      success: true,
      data: customer
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
    const { name, email, phoneNumber, address, notes } = req.body;

    // Check if customer with same phone number already exists
    const existingCustomer = await Customer.findOne({ phoneNumber });
    if (existingCustomer) {
      return next(new ErrorResponse('Customer with this phone number already exists', 400));
    }

    // Create customer data object, excluding empty strings
    const customerData = {
      name,
      phoneNumber
    };

    // Only add optional fields if they have values
    if (email && email.trim()) customerData.email = email;
    if (address && address.trim()) customerData.address = address;
    if (notes && notes.trim()) customerData.notes = notes;

    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      data: customer
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
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    // If updating phone number, check if it's already in use by another customer
    if (req.body.phoneNumber && req.body.phoneNumber !== customer.phoneNumber) {
      const existingCustomer = await Customer.findOne({ phoneNumber: req.body.phoneNumber });
      if (existingCustomer) {
        return next(new ErrorResponse('Customer with this phone number already exists', 400));
      }
    }

    // Build update data object, excluding empty strings
    const updateData = {};
    const { name, email, phoneNumber, address, notes } = req.body;

    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) {
      updateData.email = (email && email.trim()) ? email : undefined;
    }
    if (address !== undefined) {
      updateData.address = (address && address.trim()) ? address : undefined;
    }
    if (notes !== undefined) {
      updateData.notes = (notes && notes.trim()) ? notes : undefined;
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: customer
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
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { query } = req.query;

    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};
