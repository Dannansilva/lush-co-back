# Testing Access Control - Quick Start Guide

This guide shows you how to test the role-based access control (RBAC) system using Postman.

## Setup

1. **Start your server**
   ```bash
   npm start
   ```

2. **Seed the database with test users** (if not already done)
   ```bash
   node seedUsers.js
   ```

3. **Import Postman Collection**
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json`

## Test Scenarios

### Scenario 1: OWNER Full Access ✅

**Steps:**
1. Go to **Authentication** → **Login as OWNER**
2. Click **Send**
3. Verify you get a 200 response with a token
4. Token is automatically saved to `{{ownerToken}}` variable

**Now test OWNER permissions:**

| Action | Endpoint | Expected Result |
|--------|----------|----------------|
| View Staff | GET /api/staff | ✅ 200 Success |
| Create Staff | POST /api/staff | ✅ 201 Created |
| Update Staff | PUT /api/staff/:id | ✅ 200 Success |
| Delete Staff | DELETE /api/staff/:id | ✅ 200 Success |

### Scenario 2: RECEPTIONIST Limited Access 🔒

**Steps:**
1. Go to **Authentication** → **Login as RECEPTIONIST**
2. Click **Send**
3. Verify you get a 200 response with a token
4. Token is automatically saved to `{{receptionistToken}}` variable

**Now test RECEPTIONIST permissions:**

| Action | Endpoint | Expected Result |
|--------|----------|----------------|
| View Staff | GET /api/staff (as RECEPTIONIST) | ✅ 200 Success |
| Create Staff | POST /api/staff (RECEPTIONIST - Should Fail) | ❌ 403 Forbidden |
| Update Staff | PUT /api/staff/:id | ❌ 403 Forbidden |
| Delete Staff | DELETE /api/staff/:id | ❌ 403 Forbidden |

## Quick Test Flow

### Test 1: Verify RECEPTIONIST Can View Staff

1. **Login as RECEPTIONIST**
   - Run: `Authentication` → `Login as RECEPTIONIST`
   - Status: 200 ✅

2. **View Staff**
   - Run: `Staff Management` → `Get All Staff (as RECEPTIONIST)`
   - Status: 200 ✅
   - Response: List of all staff members

### Test 2: Verify RECEPTIONIST Cannot Create Staff

1. **Try to Create Staff**
   - Run: `Staff Management` → `Create Staff (RECEPTIONIST - Should Fail)`
   - Status: 403 ❌
   - Response:
   ```json
   {
     "success": false,
     "error": "User type 'RECEPTIONIST' is not authorized to access this route"
   }
   ```

### Test 3: Verify OWNER Can Do Everything

1. **Login as OWNER**
   - Run: `Authentication` → `Login as OWNER`
   - Status: 200 ✅

2. **Create Staff**
   - Run: `Staff Management` → `Create Staff Member`
   - Status: 201 ✅

3. **View Staff**
   - Run: `Staff Management` → `Get All Staff Members`
   - Status: 200 ✅

4. **Update Staff** (use an ID from the list)
   - Run: `Staff Management` → `Update Staff Member`
   - Status: 200 ✅

5. **Delete Staff** (use an ID from the list)
   - Run: `Staff Management` → `Delete Staff Member`
   - Status: 200 ✅

## Understanding the Responses

### 200 OK - Success
```json
{
  "success": true,
  "data": { ... }
}
```

### 201 Created - Resource Created
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    ...
  }
}
```

### 401 Unauthorized - No Token or Invalid Token
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden - Valid Token, Insufficient Permissions
```json
{
  "success": false,
  "error": "User type 'RECEPTIONIST' is not authorized to access this route"
}
```

## Login Credentials

### OWNER
```
Email: ownerlushco@gmail.com
Password: OwnerLush123
```

### RECEPTIONIST
```
Email: frontdesk@gmail.com
Password: frontdesk123
```

## Postman Collection Variables

The collection uses these variables:

- `{{baseUrl}}` - Server URL (default: http://localhost:3000)
- `{{token}}` - Current active token (used by most requests)
- `{{ownerToken}}` - Saved OWNER token
- `{{receptionistToken}}` - Saved RECEPTIONIST token

## Tips

1. **Auto Token Management**: The login requests automatically save tokens to variables
2. **Switch Roles**: After logging in as different roles, the `{{token}}` variable is updated
3. **Test Forbidden Access**: Try RECEPTIONIST requests with create/update/delete to see 403 errors
4. **Check Responses**: Look at the example responses in Postman for expected outputs

## Common Issues

### Issue: Getting 401 Unauthorized
**Solution**: Make sure you've logged in first. The token might be expired (default: 30 days).

### Issue: Getting 403 Forbidden
**Solution**: This is expected when RECEPTIONIST tries to access OWNER-only routes. Verify you're using the correct role for the operation.

### Issue: Cannot find staff member
**Solution**: Run `GET /api/staff` first to get valid staff IDs, then use those IDs in update/delete requests.

## Next Steps

After verifying access control works:

1. Add more RECEPTIONIST-accessible features (appointments, check-ins, etc.)
2. Create additional roles if needed (THERAPIST, MANAGER, etc.)
3. Implement frontend role-based UI rendering
4. Add audit logging for sensitive operations
