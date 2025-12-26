# Postman Collection Setup Guide

## 📋 Overview

A complete Postman collection has been created for your NestJS Gym Management System API. The collection includes **all endpoints** organized into logical folders with authentication, request examples, and automatic token management.

## 📁 Collection Structure

The collection is organized into 10 main folders:

1. **🔐 Authentication** - Login/logout endpoints
2. **🏢 Gym & Branch Management** - Multi-tenant gym operations
3. **👥 Member Management** - Member CRUD and dashboard
4. **💪 Trainers & Classes** - Trainer management and fitness classes
5. **💳 Subscriptions & Financial** - Subscriptions, invoices, and payments
6. **📅 Attendance** - Check-in/check-out tracking
7. **📊 Analytics & Reporting** - Business dashboards and metrics
8. **🎯 Fitness Tracking** - Workout plans, diet plans, progress, and goals
9. **👥 User & Roles** - User management and RBAC
10. **📝 Inquiries & Leads** - Lead management and conversion
11. **🔧 Assignments & Other** - Member-trainer assignments and utilities

## 🚀 Quick Start

### 1. Import Collection

1. Open Postman
2. Click **Import** (top left)
3. Select **Import File** or **Import Folder**
4. Choose the `gym-management-api.postman_collection.json` file
5. Click **Import**

### 2. Configure Environment

1. In Postman, go to **Environments** (gear icon in sidebar)
2. Click **+ Add** to create a new environment
3. Name it: `Gym Management - Local`
4. Add the following variables:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` | API server URL |
| `jwtToken` | (leave empty) | (leave empty) | Auto-filled after login |
| `userId` | (leave empty) | (leave empty) | Auto-filled after login |

5. Click **Save**
6. Make sure the environment is selected (checkmark next to it)

### 3. Authentication Flow

**Step 1: Login**
- Navigate to: `🔐 Authentication` → `Login`
- Update the request body with your credentials:
  ```json
  {
    "email": "your-admin@example.com",
    "password": "your-password"
  }
  ```
- Click **Send**
- The JWT token will be **automatically saved** to your environment variables

**Step 2: Test Authentication**
- All subsequent requests will automatically use the JWT token
- The collection has a test script that extracts the token after login

### 4. Make API Requests

1. Select any request from the folders
2. The `Authorization` header is pre-configured as `Bearer {{jwtToken}}`
3. Update path variables (like `{{memberId}}`) as needed
4. Modify request bodies with your actual data
5. Click **Send**

## 🔧 Environment Variables

The collection includes these pre-configured variables:

```javascript
baseUrl: http://localhost:3000
jwtToken: (auto-filled after login)
userId: (auto-filled after login)

// Example IDs for testing:
gymId: gym-123e4567-e89b-12d3-a456-426614174000
branchId: branch-123e4567-e89b-12d3-a456-426614174000
memberId: 123
trainerId: 101
classId: cls-123e4567-e89b-12d3-a456-426614174000
subscriptionId: 12345
invoiceId: invoice_1234567890abcdef
paymentId: payment_1234567890abcdef
attendanceId: att-123e4567-e89b-12d3-a456-426614174000
```

## 🔄 Automatic Token Management

The collection includes **automatic scripts**:

### Pre-request Script
- Sets timestamp variables

### Test Script
- Automatically extracts JWT token after login
- Stores user ID for reference
- Logs success messages to console

## 📝 Common Workflows

### Complete Member Onboarding Flow

1. **Login** (Authentication)
2. **Create Member** (Member Management)
3. **Create Subscription** (Subscriptions & Financial)
4. **Create Invoice** (Subscriptions & Financial)
5. **Record Payment** (Subscriptions & Financial)

### Trainer Management Flow

1. **Login** (Authentication)
2. **Create Trainer** (Trainers & Classes)
3. **Create Class** (Trainers & Classes)
4. **Assign Member to Trainer** (Assignments & Other)

### Attendance Tracking Flow

1. **Login** (Authentication)
2. **Mark Attendance** (Attendance) - Check-in
3. **Check Out** (Attendance) - Check-out
4. **Get Member Attendance** (Attendance) - View history

### Analytics Flow

1. **Login** (Authentication)
2. **Gym Dashboard Analytics** (Analytics & Reporting)
3. **Branch Member Analytics** (Analytics & Reporting)
4. **Gym Attendance Analytics** (Analytics & Reporting)

## 🎯 Example Requests

### 1. Login and Get Token
```
POST {{baseUrl}}/auth/login
Body: {"email": "admin@example.com", "password": "password123"}
```

### 2. Create a Member
```
POST {{baseUrl}}/members
Authorization: Bearer {{jwtToken}}
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "branchId": "{{branchId}}"
}
```

### 3. Check Attendance
```
POST {{baseUrl}}/attendance
Authorization: Bearer {{jwtToken}}
Body: {
  "memberId": {{memberId}},
  "attendanceType": "gym_visit",
  "branchId": "{{branchId}}"
}
```

### 4. Get Analytics
```
GET {{baseUrl}}/analytics/gym/{{gymId}}/dashboard
Authorization: Bearer {{jwtToken}}
```

## 🔍 Testing Tips

### 1. Use Examples
Each request includes example values in:
- Request bodies
- Query parameters
- Path variables

### 2. View Responses
- Responses are formatted with syntax highlighting
- Status codes and timing are displayed
- Response headers are visible

### 3. Debug Issues
- Check the **Console** (View → Show Postman Console) for script logs
- Verify environment variables are set
- Ensure JWT token is valid and not expired

### 4. Create Environments for Different Servers

**Development:**
- `baseUrl`: `http://localhost:3000`

**Staging:**
- `baseUrl`: `https://staging-api.gymapp.com`

**Production:**
- `baseUrl`: `https://api.gymapp.com`

## 📊 Collection Statistics

- **Total Requests**: 50+
- **Folders**: 11
- **Environment Variables**: 12
- **Automatic Scripts**: 2 (pre-request + test)

## 🎓 Best Practices

1. **Always Login First** - The JWT token is required for most endpoints
2. **Use Environment Variables** - Don't hardcode IDs in requests
3. **Check Response Examples** - Each endpoint shows expected response format
4. **Organize with Folders** - Keep requests grouped by functionality
5. **Update Variables** - Change example IDs to match your actual data

## 🚨 Troubleshooting

### "401 Unauthorized"
- You're not logged in or token expired
- Solution: Run the Login request again

### "404 Not Found"
- The resource ID doesn't exist
- Solution: Check the ID or create the resource first

### "400 Bad Request"
- Invalid request body or parameters
- Solution: Check the request format against examples

### Token Not Auto-Saved
- Check that the test script is enabled
- Verify the response contains `access_token`
- Look for errors in Postman Console

## 📚 Additional Resources

- **API Documentation**: Navigate to `http://localhost:3000/api` when server is running
- **Swagger UI**: Interactive API documentation with try-it-out functionality
- **Source Code**: Check individual controller files for detailed endpoint descriptions

## ✅ Next Steps

1. Import the collection into Postman
2. Set up your environment variables
3. Login to get your JWT token
4. Start testing the endpoints!
5. Create additional environments for staging/production

---

**Note**: This collection is auto-generated from your NestJS controllers and includes all documented endpoints with proper authentication, examples, and organization.