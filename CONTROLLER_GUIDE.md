# Controller Organization Guide

This guide explains how to organize controllers for different pages and features in your Lush Co backend.

## What is a Controller?

A **controller** is a module that contains the business logic for handling requests. Controllers:
- Process incoming requests
- Interact with models (database)
- Return responses
- Handle errors

## MVC Pattern Structure

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Routes    │─────→│ Controllers │─────→│   Models    │
│  (URL Map)  │      │  (Logic)    │      │ (Database)  │
└─────────────┘      └─────────────┘      └─────────────┘
      ↓                     ↓                     ↓
  Define URLs      Process Requests      Query Data
```

## Project Structure

```
lush-co-backend/
│
├── routes/               # Route definitions (URL mapping)
│   ├── auth.js          # /api/auth routes
│   ├── staff.js         # /api/staff routes
│   ├── dashboard.js     # /api/dashboard routes
│   ├── appointments.js  # /api/appointments routes
│   ├── customers.js     # /api/customers routes
│   └── services.js      # /api/services routes
│
├── controllers/          # Business logic
│   ├── authController.js
│   ├── staffController.js
│   ├── dashboardController.js
│   ├── appointmentController.js
│   ├── customerController.js
│   └── serviceController.js
│
├── models/              # Database schemas
│   ├── User.js
│   ├── StaffMember.js
│   ├── Appointment.js (to be created)
│   ├── Customer.js (to be created)
│   └── Service.js (to be created)
│
└── app.js              # Mount all routes
```

## Current Controllers

### 1. Authentication Controller (`authController.js`)
**Purpose:** Handle user login and authentication

**Endpoints:**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Access:** Public (login), Private (me)

---

### 2. Staff Controller (`staffController.js`)
**Purpose:** Manage staff members

**Endpoints:**
- `GET /api/staff` - Get all staff (OWNER + RECEPTIONIST)
- `POST /api/staff` - Create staff (OWNER only)
- `PUT /api/staff/:id` - Update staff (OWNER only)
- `DELETE /api/staff/:id` - Delete staff (OWNER only)

**Access:** Private with role-based permissions

---

### 3. Dashboard Controller (`dashboardController.js`)
**Purpose:** Provide dashboard statistics and overview

**Endpoints:**
- `GET /api/dashboard` - Role-aware dashboard
- `GET /api/dashboard/owner` - OWNER dashboard
- `GET /api/dashboard/receptionist` - RECEPTIONIST dashboard

**Access:** Private (role-specific views)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalStaff": 5,
      "totalUsers": 2
    },
    "recentStaff": [...],
    "greeting": "Welcome back, Owner!",
    "userType": "OWNER"
  }
}
```

---

### 4. Appointment Controller (`appointmentController.js`)
**Purpose:** Manage appointments (Coming Soon)

**Planned Endpoints:**
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

**Access:** Private (OWNER and RECEPTIONIST)

**Status:** Placeholder - requires Appointment model

---

### 5. Customer Controller (`customerController.js`)
**Purpose:** Manage customers (Coming Soon)

**Planned Endpoints:**
- `GET /api/customers` - Get all customers
- `GET /api/customers/search?query=` - Search customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Access:** Private (OWNER and RECEPTIONIST for read/create, OWNER only for delete)

**Status:** Placeholder - requires Customer model

---

### 6. Service Controller (`serviceController.js`)
**Purpose:** Manage spa services (Coming Soon)

**Planned Endpoints:**
- `GET /api/services` - Get all services
- `GET /api/services/category/:category` - Filter by category
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete/deactivate service

**Service Categories:**
- FACIAL
- MASSAGE
- BODY_TREATMENT
- NAIL_CARE
- HAIR_REMOVAL
- OTHER

**Access:** Public (read), OWNER only (write)

**Status:** Placeholder - requires Service model

---

## How to Create a New Controller

### Step 1: Create the Controller File

Create `controllers/yourFeatureController.js`:

```javascript
const { validationResult } = require('express-validator');
const YourModel = require('../models/YourModel');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all items
// @route   GET /api/yourfeature
// @access  Private
exports.getAllItems = async (req, res, next) => {
  try {
    const items = await YourModel.find();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/yourfeature
// @access  Private
exports.createItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const item = await YourModel.create(req.body);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Add more methods: getItem, updateItem, deleteItem
```

### Step 2: Create the Route File

Create `routes/yourFeature.js`:

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllItems,
  createItem
} = require('../controllers/yourFeatureController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/yourfeature
// @desc    Get all items
// @access  Private (OWNER and RECEPTIONIST)
router.get('/', authorize('OWNER', 'RECEPTIONIST'), getAllItems);

// @route   POST /api/yourfeature
// @desc    Create new item
// @access  Private (OWNER only)
router.post(
  '/',
  authorize('OWNER'),
  [
    body('fieldName').notEmpty().withMessage('Field is required')
  ],
  createItem
);

module.exports = router;
```

### Step 3: Mount the Route in app.js

Add to `app.js`:

```javascript
var yourFeatureRouter = require('./routes/yourFeature');

// Mount the route
app.use('/api/yourfeature', yourFeatureRouter);
```

### Step 4: Create the Model (if needed)

Create `models/YourModel.js`:

```javascript
const mongoose = require('mongoose');

const YourModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  // Add more fields
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('YourModel', YourModelSchema);
```

## Controller Best Practices

### 1. **One Controller Per Feature/Resource**
```
✅ staffController.js - handles all staff operations
❌ createStaff.js, updateStaff.js, deleteStaff.js - too fragmented
```

### 2. **Use Consistent Naming**
```javascript
exports.getAllItems   // GET collection
exports.getItem       // GET single item
exports.createItem    // POST (create)
exports.updateItem    // PUT (update)
exports.deleteItem    // DELETE
```

### 3. **Always Use Try-Catch**
```javascript
exports.getItem = async (req, res, next) => {
  try {
    // Your logic here
  } catch (error) {
    next(error);  // Pass to error handler
  }
};
```

### 4. **Validate Input**
```javascript
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({
    success: false,
    errors: errors.array()
  });
}
```

### 5. **Use Consistent Response Format**
```javascript
// Success
res.status(200).json({
  success: true,
  data: result
});

// Error (handled by ErrorResponse)
throw new ErrorResponse('Item not found', 404);
```

### 6. **Document Your Controllers**
```javascript
// @desc    What this function does
// @route   HTTP_METHOD /api/route
// @access  Public/Private (roles)
exports.functionName = async (req, res, next) => {
  // Implementation
};
```

## Access Control Patterns

### Pattern 1: Same Access for All Routes
```javascript
// All routes require OWNER
router.use(protect);
router.use(authorize('OWNER'));

router.get('/', getAllItems);
router.post('/', createItem);
```

### Pattern 2: Different Access Per Route
```javascript
// All routes require authentication
router.use(protect);

// Different permissions per route
router.get('/', authorize('OWNER', 'RECEPTIONIST'), getAllItems);
router.post('/', authorize('OWNER'), createItem);
```

### Pattern 3: Public and Private Mix
```javascript
// Public routes first (no middleware)
router.get('/', getAllItems);
router.get('/:id', getItem);

// Protected routes (apply middleware)
router.use(protect);
router.use(authorize('OWNER'));

router.post('/', createItem);
router.put('/:id', updateItem);
```

## Testing Your Controllers

### Using Postman:

1. **Test GET endpoints:**
   ```
   GET http://localhost:3000/api/dashboard
   Headers: Authorization: Bearer {{token}}
   ```

2. **Test POST endpoints:**
   ```
   POST http://localhost:3000/api/customers
   Headers:
     - Authorization: Bearer {{token}}
     - Content-Type: application/json
   Body:
     {
       "name": "John Doe",
       "phoneNumber": "+1234567890"
     }
   ```

3. **Test role-based access:**
   - Login as OWNER → Should access all endpoints
   - Login as RECEPTIONIST → Should get 403 on OWNER-only endpoints

## Common Controller Patterns

### 1. Role-Aware Logic
```javascript
exports.getDashboard = async (req, res, next) => {
  try {
    if (req.user.userType === 'OWNER') {
      // Show full dashboard
    } else if (req.user.userType === 'RECEPTIONIST') {
      // Show limited dashboard
    }
  } catch (error) {
    next(error);
  }
};
```

### 2. Search/Filter
```javascript
exports.searchItems = async (req, res, next) => {
  try {
    const { query } = req.query;
    const items = await Model.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
```

### 3. Pagination
```javascript
exports.getAllItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const items = await Model.find()
      .skip(skip)
      .limit(limit);

    const total = await Model.countDocuments();

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (error) {
    next(error);
  }
};
```

## Next Steps

1. **Implement the Dashboard** - Already ready to use!
2. **Create Models** - Create Appointment, Customer, Service models
3. **Complete Controllers** - Fill in the TODOs in placeholder controllers
4. **Update Postman Collection** - Add new endpoints
5. **Add More Features** - Invoices, reports, notifications, etc.

## Questions?

- Check `ACCESS_CONTROL.md` for permission details
- Check `TESTING_ACCESS_CONTROL.md` for testing guide
- Read existing controllers for examples
