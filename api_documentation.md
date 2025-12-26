# Fitness First Elite API Documentation

**Version**: 2.0
**System**: Multi-Branch Gym Management System
**Base URL**: `http://localhost:3001`
**Authentication**: JWT Bearer Token
**Format**: JSON

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Available Endpoints](#available-endpoints)
3. [Platform Architecture](#platform-architecture)
4. [Test Credentials](#test-credentials)
5. [Error Handling](#error-handling)
6. [Quick Start](#quick-start)

---

## 🔐 Authentication

### Platform-Specific Login

The system supports different platforms with role-based access:

#### Admin Web Panel (Superadmin)
**Platform**: Admin Web Panel
**Use Case**: Full system management across all branches
**Endpoint**: `POST /auth/login`

**Credentials:**
- Email: `superadmin@fitnessfirstelite.com`
- Password: `SuperAdmin123!`

#### Mobile App - Admin (Branch Level)
**Platform**: Android Mobile App
**Use Case**: Branch-specific management
**Endpoint**: `POST /auth/login`

**Credentials:**
- Email: `admin@fitnessfirstelite.com`
- Password: `Admin123!`

#### Mobile App - Trainer
**Platform**: Android Mobile App
**Use Case**: Member assignments, workout/diet plans, progress tracking
**Endpoint**: `POST /auth/login`

**Credentials:**
- Email: `trainer.marcus.sterling@fitnessfirstelite.com`
- Password: `Trainer123!`
- Pattern: `trainer.<firstname>.<lastname>@fitnessfirstelite.com`
- Available: 20 trainers (5 per branch)

#### Mobile App - Member
**Platform**: Android Mobile App
**Use Case**: Own profile, workout plans, diet plans, progress, attendance
**Endpoint**: `POST /auth/login`

**Credentials:**
- Email: `victoria.pembroke0@email.com`
- Password: `Member123!`
- Pattern: `<firstname>.<lastname><index>@email.com`
- Available: 100 members (25 per branch)

### Login Response Structure

Successful login returns:
- `userid`: User ID
- `access_token`: JWT token for authentication

---

## 📡 Available Endpoints

### Authentication
- `POST /auth/login` - Authenticate and receive JWT token
- `POST /auth/logout` - User logout (client-side token discard)

### Gym & Branch Management
- `POST /gyms` - Create gym
- `GET /gyms` - List all gyms
- `GET /gyms/:id` - Get gym details
- `PATCH /gyms/:id` - Update gym
- `DELETE /gyms/:id` - Delete gym
- `POST /gyms/:gymId/branches` - Create branch
- `GET /gyms/:gymId/branches` - Get gym branches
- `GET /gyms/:gymId/members` - Get gym members
- `GET /branches` - List all branches
- `GET /branches/:id` - Get branch details
- `PATCH /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch

### Member Management
- `POST /members` - Create member
- `GET /members` - List all members
- `GET /members/:id` - Get member details
- `PATCH /members/:id` - Update member
- `DELETE /members/:id` - Delete member
- `GET /members/:memberId/dashboard` - Member dashboard data
- `GET /branches/:branchId/members` - Branch-specific members

### Trainer Management
- `POST /trainers` - Create trainer
- `GET /trainers` - List all trainers
- `GET /trainers/:id` - Get trainer details
- `PATCH /trainers/:id` - Update trainer
- `DELETE /trainers/:id` - Delete trainer
- `GET /branches/:branchId/trainers` - Branch-specific trainers

### Membership Plans
- `POST /membership-plans` - Create membership plan
- `GET /membership-plans` - List all plans
- `GET /membership-plans/:id` - Get plan details
- `PATCH /membership-plans/:id` - Update plan
- `DELETE /membership-plans/:id` - Delete plan
- `GET /branches/:branchId/membership-plans` - Branch-specific plans

### Subscriptions
- `POST /subscriptions` - Create subscription (assign member to plan)
- `GET /subscriptions` - List all subscriptions
- `GET /subscriptions/:id` - Get subscription details
- `PATCH /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription
- `POST /subscriptions/:id/cancel` - Cancel subscription
- `GET /members/:memberId/subscription` - Member's subscription

### Classes Management
- `POST /classes` - Create class
- `GET /classes` - List all classes
- `GET /classes/:id` - Get class details
- `PATCH /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class
- `GET /branches/:branchId/classes` - Branch-specific classes
- `GET /gyms/:gymId/classes` - Gym-specific classes

### Attendance Tracking
- `POST /attendance` - Mark attendance (check-in)
- `PATCH /attendance/:id/checkout` - Check out
- `GET /attendance` - List all attendance records
- `GET /attendance/:id` - Get attendance record
- `GET /members/:memberId/attendance` - Member attendance history
- `GET /trainers/:trainerId/attendance` - Trainer attendance history
- `GET /branches/:branchId/attendance` - Branch attendance records

### Lead Management (Inquiries)
- `POST /inquiries` - Create inquiry
- `GET /inquiries` - List inquiries (with filtering & pagination)
- `GET /inquiries/pending` - Get pending inquiries
- `GET /inquiries/stats` - Get inquiry statistics
- `GET /inquiries/:id` - Get inquiry details
- `GET /inquiries/email/:email` - Get inquiry by email
- `PATCH /inquiries/:id` - Update inquiry
- `PATCH /inquiries/:id/status` - Update inquiry status
- `POST /inquiries/:id/convert` - Convert inquiry to member
- `DELETE /inquiries/:id` - Delete inquiry

### Invoice Management
- `POST /invoices` - Create invoice
- `GET /invoices` - List all invoices
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice
- `POST /invoices/:id/cancel` - Cancel invoice
- `GET /members/:memberId/invoices` - Member invoices

### Analytics & Reporting
- `GET /analytics/gym/:gymId/dashboard` - Gym dashboard analytics
- `GET /analytics/branch/:branchId/dashboard` - Branch dashboard analytics
- `GET /analytics/gym/:gymId/members` - Gym member analytics
- `GET /analytics/branch/:branchId/members` - Branch member analytics
- `GET /analytics/gym/:gymId/attendance` - Gym attendance analytics
- `GET /analytics/branch/:branchId/attendance` - Branch attendance analytics
- `GET /analytics/gym/:gymId/payments/recent` - Recent gym payments
- `GET /analytics/branch/:branchId/payments/recent` - Recent branch payments

### Fitness Tracking
- `POST /diet-plans` - Create diet plan
- `GET /diet-plans` - List all diet plans
- `GET /diet-plans/:id` - Get diet plan details
- `PATCH /diet-plans/:id` - Update diet plan
- `DELETE /diet-plans/:id` - Delete diet plan
- `GET /diet-plans/member/:memberId` - Member diet plans
- `GET /diet-plans/user/my-diet-plans` - User's created diet plans

- `POST /workouts` - Create workout plan
- `GET /workouts` - List all workout plans
- `GET /workouts/:id` - Get workout plan details
- `PATCH /workouts/:id` - Update workout plan
- `DELETE /workouts/:id` - Delete workout plan
- `GET /workouts/member/:memberId` - Member workout plans
- `GET /workouts/user/my-workout-plans` - User's created workout plans

- `POST /progress-tracking` - Create progress record
- `GET /progress-tracking` - List all progress records
- `GET /progress-tracking/:id` - Get progress record details
- `PATCH /progress-tracking/:id` - Update progress record
- `DELETE /progress-tracking/:id` - Delete progress record
- `GET /progress-tracking/member/:memberId` - Member progress records
- `GET /progress-tracking/user/my-progress-records` - User's created progress records

- `POST /goals` - Create fitness goal
- `GET /goals` - List all goals
- `GET /goals/:id` - Get goal details
- `PATCH /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal
- `GET /goals/member/:memberId` - Member goals
- `GET /goals/user/my-goals` - User's created goals

### User Management
- `POST /users` - Create user
- `GET /users` - List all users
- `GET /users/profile` - Current user profile
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

---

## 📱 Platform Architecture

### Admin Web Panel
- **Frontend**: Web Dashboard
- **User**: Superadmin only
- **Access**: Full system management
- **Key Features**:
  - Cross-branch analytics
  - Financial oversight
  - Gym/branch creation
  - User management
  - System configuration

### Android Mobile App
- **Frontend**: Mobile App
- **Users**: Admin, Trainer, Member
- **Access**: Role-based capabilities

**Admin (Branch Level):**
- Branch management
- Member oversight
- Local reporting
- Staff management

**Trainer:**
- Member assignments
- Workout plan creation
- Diet plan creation
- Progress tracking
- Goal setting

**Member:**
- Profile management
- View workout plans
- View diet plans
- Track progress
- Check attendance
- Log workouts

---

## 🎯 Test Credentials

### Superadmin (Admin Web Panel)
```
Email: superadmin@fitnessfirstelite.com
Password: SuperAdmin123!
```

### Admin (Mobile App - Branch Level)
```
Email: admin@fitnessfirstelite.com
Password: Admin123!
```

### Trainers (Mobile App - 20 Available)
```
Pattern: trainer.<firstname>.<lastname>@fitnessfirstelite.com
Password: Trainer123!

Examples:
- trainer.marcus.sterling@fitnessfirstelite.com
- trainer.sophia.valentine@fitnessfirstelite.com
- trainer.alexander.blackwood@fitnessfirstelite.com
```

### Members (Mobile App - 100 Available)
```
Pattern: <firstname>.<lastname><index>@email.com
Password: Member123!

Examples:
- victoria.pembroke0@email.com
- sophia.johnson-smith1@email.com
- marcus.kingsley2@email.com
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed: email must be a valid email",
  "error": "Bad Request"
}
```

### Common Error Codes
- **400 Bad Request**: Invalid request body or parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks required permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate or constraint violation
- **422 Unprocessable Entity**: Validation failed
- **500 Internal Server Error**: Server error

---

## 🚀 Quick Start

### 1. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@fitnessfirstelite.com","password":"SuperAdmin123!"}'
```

### 2. Use Token
```bash
# Store token from response
TOKEN="your-jwt-token-here"

# Make authenticated request
curl -X GET http://localhost:3001/members \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Access Swagger UI
```
http://localhost:3001/api
```

---

## 📚 Additional Resources

- **Swagger UI**: `http://localhost:3001/api`
- **Health Check**: `GET /health`
- **Server Status**: Running on port 3001

---

**Document Version**: 2.0
**Last Updated**: 2024
**System**: Fitness First Elite Multi-Branch Gym Management
**Status**: ✅ Ready for Testing
