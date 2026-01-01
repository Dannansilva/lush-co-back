# API Endpoints Reference

Quick reference for all API endpoints in the Lush Co backend.

## Base URL
```
http://localhost:3000
```

## Authentication & Authorization

All protected routes require:
```
Headers:
  Authorization: Bearer <your-jwt-token>
```

**Roles:**
- 🔑 **OWNER** - Full access
- 👤 **RECEPTIONIST** - Limited access

---

## 1. Authentication (`/api/auth`)

### Login
```http
POST /api/auth/login
```
**Access:** Public
**Body:**
```json
{
  "email": "ownerlushco@gmail.com",
  "password": "OwnerLush123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbG..."
  }
}
```

### Get Current User
```http
GET /api/auth/me
```
**Access:** Private (Both roles)

---

## 2. Dashboard (`/api/dashboard`)

### Get Dashboard (Auto-routes based on role)
```http
GET /api/dashboard
```
**Access:** Private (Both roles)
**Returns:** Role-specific dashboard

### Get OWNER Dashboard
```http
GET /api/dashboard/owner
```
**Access:** Private (🔑 OWNER only)
**Returns:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalStaff": 5,
      "totalUsers": 2,
      "totalOwners": 1,
      "totalReceptionists": 1
    },
    "recentStaff": [...],
    "greeting": "Welcome back, Owner!",
    "userType": "OWNER"
  }
}
```

### Get RECEPTIONIST Dashboard
```http
GET /api/dashboard/receptionist
```
**Access:** Private (👤 RECEPTIONIST only)
**Returns:** Limited statistics

---

## 3. Staff Management (`/api/staff`)

### Get All Staff
```http
GET /api/staff
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Create Staff
```http
POST /api/staff
```
**Access:** Private (🔑 OWNER only)
**Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

### Update Staff
```http
PUT /api/staff/:id
```
**Access:** Private (🔑 OWNER only)
**Body:**
```json
{
  "name": "John Updated",
  "phoneNumber": "+9876543210"
}
```

### Delete Staff
```http
DELETE /api/staff/:id
```
**Access:** Private (🔑 OWNER only)

---

## 4. Appointments (`/api/appointments`) 🚧 Coming Soon

### Get All Appointments
```http
GET /api/appointments
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Get Today's Appointments
```http
GET /api/appointments/today
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Get Single Appointment
```http
GET /api/appointments/:id
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Create Appointment
```http
POST /api/appointments
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)
**Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "staffId": "507f1f77bcf86cd799439012",
  "serviceId": "507f1f77bcf86cd799439013",
  "appointmentDate": "2025-12-20T10:00:00Z",
  "notes": "Customer prefers quiet room"
}
```

### Update Appointment
```http
PUT /api/appointments/:id
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)
**Body:**
```json
{
  "status": "CONFIRMED",
  "appointmentDate": "2025-12-20T11:00:00Z"
}
```

**Status Options:**
- SCHEDULED
- CONFIRMED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- NO_SHOW

### Cancel Appointment
```http
DELETE /api/appointments/:id
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

---

## 5. Customers (`/api/customers`) 🚧 Coming Soon

### Get All Customers
```http
GET /api/customers
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Search Customers
```http
GET /api/customers/search?query=john
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Get Single Customer
```http
GET /api/customers/:id
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Create Customer
```http
POST /api/customers
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)
**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City",
  "notes": "Allergic to lavender"
}
```

### Update Customer
```http
PUT /api/customers/:id
```
**Access:** Private (🔑 OWNER + 👤 RECEPTIONIST)

### Delete Customer
```http
DELETE /api/customers/:id
```
**Access:** Private (🔑 OWNER only)

---

## 6. Services (`/api/services`) 🚧 Coming Soon

### Get All Services
```http
GET /api/services
```
**Access:** Public (or Private based on business needs)

### Get Services by Category
```http
GET /api/services/category/FACIAL
```
**Access:** Public
**Categories:**
- FACIAL
- MASSAGE
- BODY_TREATMENT
- NAIL_CARE
- HAIR_REMOVAL
- OTHER

### Get Single Service
```http
GET /api/services/:id
```
**Access:** Public

### Create Service
```http
POST /api/services
```
**Access:** Private (🔑 OWNER only)
**Body:**
```json
{
  "name": "Swedish Massage",
  "description": "Relaxing full-body massage",
  "category": "MASSAGE",
  "duration": 60,
  "price": 89.99
}
```

### Update Service
```http
PUT /api/services/:id
```
**Access:** Private (🔑 OWNER only)

### Delete Service
```http
DELETE /api/services/:id
```
**Access:** Private (🔑 OWNER only)

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Validation Error Response
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Field is required",
      "param": "fieldName"
    }
  ]
}
```

---

## Quick Start

### 1. Login
```bash
POST /api/auth/login
{
  "email": "ownerlushco@gmail.com",
  "password": "OwnerLush123"
}
```

### 2. Copy the token from response

### 3. Use token in subsequent requests
```
Headers:
  Authorization: Bearer <your-token>
```

### 4. Access protected endpoints
```bash
GET /api/dashboard
GET /api/staff
```

---

## Testing with Postman

1. Import `postman_collection.json`
2. Run "Login as OWNER" or "Login as RECEPTIONIST"
3. Token is auto-saved to collection variables
4. Test all endpoints with appropriate permissions

---

## Implementation Status

| Feature | Status | Access |
|---------|--------|--------|
| Authentication | ✅ Ready | Public/Private |
| Dashboard | ✅ Ready | Private (Both) |
| Staff Management | ✅ Ready | Private (Both read, OWNER write) |
| Appointments | 🚧 Coming Soon | Private (Both) |
| Customers | 🚧 Coming Soon | Private (Both) |
| Services | 🚧 Coming Soon | Public read, OWNER write |

---

## Notes

- 🚧 **Coming Soon** endpoints have placeholder controllers and routes but require models
- All dates should be in ISO 8601 format: `2025-12-20T10:00:00Z`
- Phone numbers accept international format: `+1234567890` or `(123) 456-7890`
- JWT tokens expire in 30 days (configurable in `.env`)
