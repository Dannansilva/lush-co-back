# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Express backend application for Lush Co, using the traditional Express generator structure with Jade (now Pug) templating engine.

## Development Commands

### Starting the Server
```bash
npm start
```
Starts the server on port 3000 (or PORT environment variable if set). The server is defined in `bin/www`.

### Package Manager
This project uses **Bun** as its package manager (indicated by `bun.lock` file). Use `bun install` to install dependencies instead of `npm install`.

## Architecture

### Application Structure

- **Entry Point**: `bin/www` - HTTP server configuration and initialization
- **Application Config**: `app.js` - Express app setup, middleware configuration, and route registration
- **Routes**: `routes/` directory
  - `routes/index.js` - Root route handler (serves home page)
  - `routes/users.js` - User-related routes (mounted at `/users`)
- **Views**: `views/` directory - Jade template files
- **Public Assets**: `public/` directory - Static files (images, CSS, JavaScript)

### Middleware Stack (in order)

1. **morgan** ('dev') - HTTP request logger
2. **express.json()** - JSON body parser
3. **express.urlencoded()** - URL-encoded body parser (not extended)
4. **cookie-parser** - Cookie parsing
5. **express.static** - Static file serving from `public/`

### Route Organization

Routes are defined as Express Router modules and mounted in `app.js`:
- `/` → `routes/index.js`
- `/users` → `routes/users.js`

### Error Handling

- 404 errors: Caught by middleware at app.js:26-28
- General errors: Handled by error middleware at app.js:31-39
  - In development: Full error stack shown
  - In production: Only error message shown
  - Errors rendered via `error.jade` view

### View Engine

- **Template Engine**: Jade (legacy version ~1.11.0)
- **Views Directory**: `views/`
- Templates use Jade syntax, not the newer Pug syntax

## Key Dependencies

- **express** (~4.16.1) - Web framework
- **jade** (~1.11.0) - Template engine (legacy, consider upgrading to Pug)
- **morgan** - Request logging
- **cookie-parser** - Cookie handling
- **http-errors** - HTTP error creation
- **debug** - Debugging utility (namespace: 'lush-co-backend:server')

## Environment Configuration

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Set to 'development' for detailed error pages

## API Documentation

### Postman Collection

**IMPORTANT**: Whenever you make major changes to the API (new routes, modified endpoints, changed request/response structures), you MUST create or update a Postman collection file.

Major changes include:
- Adding new routes or endpoints
- Modifying existing endpoint methods (GET, POST, PUT, DELETE, etc.)
- Changing request body schemas
- Updating response formats
- Adding or modifying authentication/authorization
- Creating new route files

The Postman collection should:
- Be saved as `postman_collection.json` in the project root
- Include all API endpoints with example requests
- Document request bodies, headers, and query parameters
- Include example responses
- Be organized by route modules (users, products, etc.)

## Database & Models

### MongoDB & Mongoose

This project uses MongoDB with Mongoose ODM. Connection string is configured via `MONGODB_URI` environment variable.

### Model Directory Structure

- **models/** - Mongoose schema definitions
  - `User.js` - User authentication model
  - `Customer.js` - Customer/client management
  - `StaffMember.js` - Staff member records
  - `Service.js` - Service catalog

### Mongoose Middleware Patterns

**IMPORTANT**: When creating Mongoose middleware (pre/post hooks), always use the async/await pattern:

```javascript
// ✅ CORRECT - Use async function without next callback
CustomerSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// ❌ INCORRECT - Don't use function(next) pattern
CustomerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next(); // This will cause "next is not a function" error
});
```

**Why?** Modern Mongoose (v5+) handles async middleware automatically. Using the old callback pattern with `next` can cause runtime errors.

**Example from User.js:**
```javascript
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

### Common Mongoose Patterns in This Project

1. **Schema Validation**: Use built-in validators (required, min, max, match, etc.)
2. **Indexes**: Add indexes for frequently queried fields (especially for search)
3. **Timestamps**: Manually manage `createdAt` and `updatedAt` in pre-save hooks
4. **Virtual Fields**: Keep models simple; calculate derived data in controllers if needed

### Handling Optional Fields

When creating or updating documents with optional fields (like email, address, notes), follow this pattern to avoid storing empty strings:

**In Route Validation (routes/):**
```javascript
body('email')
  .optional({ nullable: true, checkFalsy: true })  // Allows null, undefined, empty string
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail(),
```

**In Controllers - CREATE:**
```javascript
const { name, email, phoneNumber, address, notes } = req.body;

// Build data object with only non-empty values
const customerData = {
  name,
  phoneNumber  // required fields
};

// Only add optional fields if they have values
if (email && email.trim()) customerData.email = email;
if (address && address.trim()) customerData.address = address;
if (notes && notes.trim()) customerData.notes = notes;

const customer = await Customer.create(customerData);
```

**In Controllers - UPDATE:**
```javascript
const updateData = {};
const { name, email, phoneNumber, address, notes } = req.body;

if (name !== undefined) updateData.name = name;
if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

// For optional fields, convert empty strings to undefined
if (email !== undefined) {
  updateData.email = (email && email.trim()) ? email : undefined;
}
if (address !== undefined) {
  updateData.address = (address && address.trim()) ? address : undefined;
}

const customer = await Customer.findByIdAndUpdate(id, updateData, {
  new: true,
  runValidators: true
});
```

**Why?** This prevents storing empty strings `""` in the database, which can cause issues with unique sparse indexes and makes data cleaner. Undefined values won't be stored in MongoDB documents.

### Working with Referenced Arrays (One-to-Many)

When a document references an array of other documents (like appointments with multiple services), follow these patterns:

**Model Definition:**
```javascript
services: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  validate: {
    validator: function(v) {
      return v && v.length > 0;
    },
    message: 'At least one service is required'
  },
  required: [true, 'Services are required']
}
```

**Route Validation:**
```javascript
body('serviceIds')
  .isArray({ min: 1 })
  .withMessage('At least one service is required'),
body('serviceIds.*')
  .isMongoId()
  .withMessage('Invalid service ID'),
```

**Controller - Validate and Process Array:**
```javascript
// Verify all services exist
const services = await Service.find({ _id: { $in: serviceIds } });

if (services.length !== serviceIds.length) {
  return next(new ErrorResponse('One or more services not found', 404));
}

// Calculate aggregated values
const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

// Create document with array reference
const appointment = await Appointment.create({
  services: serviceIds,
  duration: totalDuration,
  price: totalPrice,
  // ... other fields
});

// Populate the array when returning
const populated = await Appointment.findById(appointment._id)
  .populate('services', 'name duration price category');
```

**Why?** This pattern ensures all referenced documents exist before creating the relationship, calculates aggregated values (like totals), and properly validates array inputs.

## Notes for Future Development

- The server listens on all network interfaces (0.0.0.0)
- Debug logging uses the namespace 'lush-co-backend:server' - enable with `DEBUG=lush-co-backend:server npm start`
- Jade is deprecated; consider migrating to Pug for new features
