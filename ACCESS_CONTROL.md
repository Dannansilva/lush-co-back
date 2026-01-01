# Access Control & Role-Based Permissions

This document outlines the role-based access control (RBAC) system for the Lush Co backend API.

## User Roles

The system supports two user types:

1. **OWNER** - Full administrative access
2. **RECEPTIONIST** - Limited operational access

## Access Control Matrix

### Authentication Endpoints (`/api/auth`)
| Endpoint | Method | OWNER | RECEPTIONIST | Public |
|----------|--------|-------|--------------|--------|
| `/login` | POST | ✅ | ✅ | ✅ |
| `/me` | GET | ✅ | ✅ | ❌ |

### Staff Management (`/api/staff`)
| Endpoint | Method | OWNER | RECEPTIONIST | Description |
|----------|--------|-------|--------------|-------------|
| `/api/staff` | GET | ✅ | ✅ | View all staff members |
| `/api/staff/:id` | GET | ✅ | ✅ | View single staff member |
| `/api/staff` | POST | ✅ | ❌ | Create new staff member |
| `/api/staff/:id` | PUT | ✅ | ❌ | Update staff member |
| `/api/staff/:id` | DELETE | ✅ | ❌ | Delete staff member |

### Admin Routes (`/api/admin`)
| Endpoint | Method | OWNER | RECEPTIONIST | Description |
|----------|--------|-------|--------------|-------------|
| `/api/admin/users` | GET | ✅ | ❌ | Get all users |
| `/api/admin/dashboard` | GET | ✅ | ❌ | Dashboard statistics |
| `/api/admin/users/:id` | DELETE | ✅ | ❌ | Delete user |

## Implementation Guide

### How to Protect Routes

The system uses two middleware functions from `middleware/auth.js`:

#### 1. `protect` - Verify JWT Token
Ensures the user is authenticated.

```javascript
const { protect } = require('../middleware/auth');

router.get('/protected-route', protect, (req, res) => {
  // Only authenticated users can access this
});
```

#### 2. `authorize` - Check User Type
Ensures the user has the required role.

```javascript
const { protect, authorize } = require('../middleware/auth');

// Only OWNER can access
router.post('/owner-only', protect, authorize('OWNER'), (req, res) => {
  // Only OWNER users can access this
});

// Both OWNER and RECEPTIONIST can access
router.get('/staff-view', protect, authorize('OWNER', 'RECEPTIONIST'), (req, res) => {
  // Both user types can access this
});
```

### Example: Granular Permissions on Staff Routes

```javascript
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Both OWNER and RECEPTIONIST can VIEW staff
router.get('/', protect, authorize('OWNER', 'RECEPTIONIST'), getAllStaff);

// Only OWNER can CREATE staff
router.post('/', protect, authorize('OWNER'), createStaff);

// Only OWNER can UPDATE staff
router.put('/:id', protect, authorize('OWNER'), updateStaff);

// Only OWNER can DELETE staff
router.delete('/:id', protect, authorize('OWNER'), deleteStaff);
```

## Login Credentials (Development)

### OWNER Account
```
Email: ownerlushco@gmail.com
Password: OwnerLush123
```

### RECEPTIONIST Account
```
Email: frontdesk@gmail.com
Password: frontdesk123
```

## Common Use Cases

### OWNER Capabilities
- Full CRUD operations on staff members
- View and manage all users
- Access dashboard statistics
- Delete users
- All RECEPTIONIST capabilities

### RECEPTIONIST Capabilities
- View staff members (read-only)
- View their own profile
- Future: Create and manage appointments
- Future: Check-in customers

## Error Responses

### 401 Unauthorized
No token provided or invalid token:
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden
Valid token but insufficient permissions:
```json
{
  "success": false,
  "error": "User type 'RECEPTIONIST' is not authorized to access this route"
}
```

## Best Practices

1. **Always use both middlewares together**: First `protect`, then `authorize`
2. **Be explicit about permissions**: List all allowed user types
3. **Test with both roles**: Verify each role can only access intended endpoints
4. **Document access levels**: Keep this document updated when adding new routes
5. **Least privilege principle**: Grant minimum necessary permissions

## Testing Access Control

Use the Postman collection to test different roles:

1. Login as OWNER → Get token → Test all endpoints ✅
2. Login as RECEPTIONIST → Get token → Test read-only endpoints ✅
3. Try RECEPTIONIST token on OWNER-only endpoints → Should get 403 ❌

## Future Role Extensions

When adding new features, consider:
- **CUSTOMER** role for customer-facing portal
- **MANAGER** role for mid-level administrative tasks
- **THERAPIST** role for service providers
