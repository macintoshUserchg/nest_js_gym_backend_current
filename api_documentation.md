# Gym Management System - API Documentation

## Overview

This document provides comprehensive API documentation for the Gym Management System built with NestJS. The system offers a complete suite of endpoints for managing gyms, members, trainers, classes, attendance, subscriptions, financial transactions, and lead management.

## Base URL

```
https://your-domain.com/api
```

## Authentication

### JWT Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "userid": "user-uuid",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- 401 Unauthorized: Invalid credentials

#### POST /auth/logout

Logout a user (client-side token removal).

**Response (200 OK):**

```json
{
  "message": "Logged out successfully. Please discard your token."
}
```

## API Endpoints

### User Management

#### POST /users

Create a new user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "gymId": "gym-uuid",
  "branchId": "branch-uuid",
  "roleId": "role-uuid",
  "memberId": 1,
  "trainerId": 1
}
```

**Response (201 Created):**

```json
{
  "userId": "user-uuid",
  "email": "john@example.com",
  "gymId": "gym-uuid",
  "branchId": "branch-uuid",
  "roleId": "role-uuid",
  "memberId": 1,
  "trainerId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /users

Get all users (Authenticated).

**Response (200 OK):**

```json
[
  {
    "userId": "user-uuid",
    "email": "john@example.com",
    "gymId": "gym-uuid",
    "branchId": "branch-uuid",
    "roleId": "role-uuid",
    "memberId": 1,
    "trainerId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /users/profile

Get current user profile (Authenticated).

**Response (200 OK):**

```json
{
  "userId": "user-uuid",
  "email": "john@example.com",
  "gymId": "gym-uuid",
  "branchId": "branch-uuid",
  "roleId": "role-uuid",
  "memberId": 1,
  "trainerId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /users/:id

Get user by ID (Authenticated).

**Response (200 OK):**

```json
{
  "userId": "user-uuid",
  "email": "john@example.com",
  "gymId": "gym-uuid",
  "branchId": "branch-uuid",
  "roleId": "role-uuid",
  "memberId": 1,
  "trainerId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /users/:id

Update user (Authenticated).

**Request Body:**

```json
{
  "email": "newemail@example.com",
  "gymId": "new-gym-uuid",
  "branchId": "new-branch-uuid",
  "roleId": "new-role-uuid"
}
```

#### DELETE /users/:id

Delete user (Authenticated).

### Role Management

#### GET /roles

Get all roles.

**Response (200 OK):**

```json
[
  {
    "id": "role-uuid",
    "name": "ADMIN",
    "description": "Administrator role"
  }
]
```

#### GET /roles/:id

Get role by ID.

#### GET /roles/name/:name

Get role by name.

### Gym Management

#### POST /gyms

Create a new gym.

**Request Body:**

```json
{
  "name": "Fitness Center",
  "ownerId": "owner-uuid",
  "email": "gym@example.com",
  "phone": "+1234567890",
  "address": "123 Gym Street",
  "location": "City Center"
}
```

#### GET /gyms

Get all gyms.

#### GET /gyms/:id

Get gym by ID.

#### PATCH /gyms/:id

Update gym.

#### DELETE /gyms/:id

Delete gym.

### Branch Management

#### POST /gyms/:gymId/branches

Create a new branch for a gym.

**Request Body:**

```json
{
  "name": "Downtown Branch",
  "email": "branch@example.com",
  "phone": "+1234567891",
  "address": "456 Branch Street",
  "location": "Downtown",
  "state": "CA",
  "mainBranch": true,
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

#### GET /branches

Get all branches.

#### GET /branches/:id

Get branch by ID.

#### PATCH /branches/:id

Update branch.

#### DELETE /branches/:id

Delete branch.

### Member Management

#### POST /members

Create a new member.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 1",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "avatarUrl": "https://example.com/avatar.jpg",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567891",
  "isActive": true,
  "branchId": "branch-uuid"
}
```

#### GET /members

Get all members.

#### GET /members/:id

Get member by ID.

#### PATCH /members/:id

Update member.

#### DELETE /members/:id

Delete member.

#### GET /branches/:branchId/members

Get members by branch.

### Trainer Management

#### POST /trainers

Create a new trainer.

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567892",
  "specialization": "Personal Training",
  "avatarUrl": "https://example.com/trainer.jpg",
  "branchId": "branch-uuid"
}
```

#### GET /trainers

Get all trainers.

#### GET /trainers/:id

Get trainer by ID.

#### PATCH /trainers/:id

Update trainer.

#### DELETE /trainers/:id

Delete trainer.

#### GET /branches/:branchId/trainers

Get trainers by branch.

### Membership Plans

#### POST /membership-plans

Create a new membership plan.

**Request Body:**

```json
{
  "name": "Premium Plan",
  "price": 50,
  "durationInDays": 30,
  "description": "Premium membership with full access",
  "branchId": "branch-uuid"
}
```

#### GET /membership-plans

Get all membership plans.

#### GET /membership-plans/:id

Get membership plan by ID.

#### PATCH /membership-plans/:id

Update membership plan.

#### DELETE /membership-plans/:id

Delete membership plan.

#### GET /branches/:branchId/membership-plans

Get membership plans by branch.

### Subscriptions

#### POST /subscriptions

Create a new subscription for a member.

**Request Body:**

```json
{
  "memberId": 1,
  "planId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

#### GET /subscriptions

Get all subscriptions.

#### GET /subscriptions/:id

Get subscription by ID.

#### PATCH /subscriptions/:id

Update subscription.

#### DELETE /subscriptions/:id

Delete subscription.

#### POST /subscriptions/:id/cancel

Cancel subscription.

#### GET /members/:memberId/subscription

Get member's current subscription.

### Classes

#### POST /classes

Create a new class.

**Request Body:**

```json
{
  "branchId": "branch-uuid",
  "name": "Yoga Class",
  "description": "Beginner yoga session",
  "timings": "morning",
  "recurrenceType": "weekly",
  "daysOfWeek": [1, 3, 5]
}
```

#### GET /classes

Get all classes.

#### GET /classes/:id

Get class by ID.

#### PATCH /classes/:id

Update class.

#### DELETE /classes/:id

Delete class.

#### GET /branches/:branchId/classes

Get classes by branch.

### Member-Trainer Assignments

#### POST /assignments

Assign a member to a trainer.

**Request Body:**

```json
{
  "memberId": 1,
  "trainerId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

#### GET /assignments

Get all assignments.

#### GET /assignments/:id

Get assignment by ID.

#### DELETE /assignments/:id

Delete assignment.

#### GET /members/:memberId/assignments

Get member's trainers.

#### GET /trainers/:trainerId/members

Get trainer's members.

### Attendance

#### POST /attendance

Mark attendance (check-in).

**Request Body:**

```json
{
  "memberId": 1,
  "branchId": "branch-uuid",
  "notes": "Regular check-in"
}
```

**For Trainer Attendance:**

```json
{
  "trainerId": 1,
  "branchId": "branch-uuid",
  "notes": "Staff check-in"
}
```

#### PATCH /attendance/:id/checkout

Check out.

#### GET /attendance

Get all attendance records.

#### GET /attendance/:id

Get attendance record by ID.

#### GET /members/:memberId/attendance

Get member's attendance history.

#### GET /trainers/:trainerId/attendance

Get trainer's attendance history.

#### GET /branches/:branchId/attendance

Get branch attendance records.

### Audit Logs

#### POST /audit-logs

Create an audit log entry.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "entityType": "Member",
  "entityId": "1",
  "action": "CREATE",
  "previousValues": {},
  "newValues": {
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET /audit-logs

Get all audit logs.

#### GET /audit-logs/:id

Get audit log by ID.

#### GET /audit-logs/user/:userId

Get logs by user.

#### GET /audit-logs/entity/:entityType/:entityId

Get logs by entity.

#### GET /audit-logs/action/:action

Get logs by action type.

### Invoices

#### POST /invoices

Create a new invoice.

**Request Body:**

```json
{
  "memberId": 1,
  "subscriptionId": 1,
  "amount": 50.0,
  "description": "Monthly membership fee",
  "dueDate": "2024-01-31"
}
```

#### GET /invoices

Get all invoices.

#### GET /invoices/:id

Get invoice by ID.

#### PATCH /invoices/:id

Update invoice.

#### POST /invoices/:id/cancel

Cancel invoice.

#### GET /members/:memberId/invoices

Get member's invoices.

### Payments

#### POST /payments

Record a payment.

**Request Body:**

```json
{
  "invoiceId": "invoice-uuid",
  "amount": 50.0,
  "paymentMethod": "card",
  "paymentReference": "PAY-123456",
  "status": "completed"
}
```

#### GET /payments

Get all payments.

#### GET /payments/:id

Get payment by ID.

#### GET /invoices/:invoiceId/payments

Get invoice payments.

#### GET /members/:memberId/payments

Get member's payment history.

### Inquiries (Lead Management)

#### POST /inquiries

Create a new inquiry.

**Request Body:**

```json
{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567893",
  "dateOfBirth": "1985-05-15",
  "addressLine1": "789 Prospect Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90210",
  "occupation": "Software Engineer",
  "fitnessGoals": "Weight loss and muscle gain",
  "leadStatus": "new",
  "leadSource": "website",
  "preferredMembershipType": "premium",
  "preferredContactMethod": "email",
  "preferredContactTime": "afternoon",
  "gymExperience": "intermediate",
  "personalTrainingInterest": true,
  "referralCode": "FRIEND10",
  "branchId": "branch-uuid"
}
```

#### GET /inquiries

Get all inquiries with filtering.

**Query Parameters:**

- `status`: Filter by lead status
- `source`: Filter by lead source
- `branchId`: Filter by branch
- `page`: Page number
- `limit`: Items per page

#### GET /inquiries/:id

Get inquiry by ID.

#### PATCH /inquiries/:id

Update inquiry.

#### PATCH /inquiries/:id/status

Update inquiry status.

**Request Body:**

```json
{
  "status": "contacted",
  "statusReason": "Initial contact made"
}
```

#### POST /inquiries/:id/convert

Convert inquiry to member.

#### DELETE /inquiries/:id

Delete inquiry.

#### GET /inquiries/pending

Get pending inquiries.

#### GET /inquiries/stats

Get inquiry statistics.

#### GET /inquiries/email/:email

Get inquiry by email.

### Analytics & Reporting

#### GET /analytics/gym/:gymId/dashboard

Get gym dashboard analytics.

**Response:**

```json
{
  "totalMembers": 150,
  "activeMembers": 120,
  "newMembersThisMonth": 15,
  "revenueThisMonth": 7500.0,
  "totalTrainers": 8,
  "totalBranches": 3
}
```

#### GET /analytics/branch/:branchId/dashboard

Get branch dashboard analytics.

#### GET /analytics/gym/:gymId/members

Get gym member analytics.

#### GET /analytics/branch/:branchId/members

Get branch member analytics.

#### GET /analytics/gym/:gymId/attendance

Get gym attendance analytics.

#### GET /analytics/branch/:branchId/attendance

Get branch attendance analytics.

#### GET /analytics/gym/:gymId/payments/recent

Get recent gym payments.

#### GET /analytics/branch/:branchId/payments/recent

Get recent branch payments.

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

## Data Models

### User

```json
{
  "userId": "uuid",
  "email": "string",
  "gymId": "uuid",
  "branchId": "uuid",
  "roleId": "uuid",
  "memberId": "number",
  "trainerId": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Member

```json
{
  "id": "number",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "gender": "male|female|other",
  "dateOfBirth": "date",
  "addressLine1": "string",
  "addressLine2": "string",
  "city": "string",
  "state": "string",
  "postalCode": "string",
  "avatarUrl": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string",
  "isActive": "boolean",
  "branchId": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Trainer

```json
{
  "id": "number",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "specialization": "string",
  "avatarUrl": "string",
  "branchId": "uuid"
}
```

### Attendance

```json
{
  "id": "uuid",
  "memberId": "number",
  "trainerId": "number",
  "branchId": "uuid",
  "attendanceType": "member|trainer",
  "checkInTime": "datetime",
  "checkOutTime": "datetime",
  "date": "date",
  "notes": "string"
}
```

### Invoice

```json
{
  "id": "uuid",
  "memberId": "number",
  "subscriptionId": "number",
  "amount": "decimal",
  "description": "string",
  "dueDate": "date",
  "status": "pending|paid|cancelled",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Payment

```json
{
  "id": "uuid",
  "invoiceId": "uuid",
  "amount": "decimal",
  "paymentMethod": "cash|card|online|bank_transfer",
  "paymentReference": "string",
  "status": "pending|completed|failed",
  "createdAt": "datetime"
}
```

### Inquiry

```json
{
  "id": "number",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "date",
  "addressLine1": "string",
  "addressLine2": "string",
  "city": "string",
  "state": "string",
  "postalCode": "string",
  "occupation": "string",
  "fitnessGoals": "string",
  "leadStatus": "new|contacted|qualified|converted|closed",
  "leadSource": "walk_in|referral|social_media|website|ads|other",
  "preferredMembershipType": "basic|premium|vip|family|couple|student|corporate",
  "preferredContactMethod": "email|phone|sms|whatsapp",
  "preferredContactTime": "morning|afternoon|evening|anytime",
  "gymExperience": "beginner|intermediate|advanced",
  "personalTrainingInterest": "boolean",
  "referralCode": "string",
  "branchId": "uuid",
  "statusReason": "string",
  "contactedAt": "datetime",
  "convertedAt": "datetime",
  "closedAt": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **File upload endpoints**: 20 requests per minute

## CORS

Cross-Origin Resource Sharing (CORS) is configured to allow requests from trusted domains only.

## Versioning

The API uses URL versioning:

```
https://your-domain.com/api/v1/endpoint
```

## SDKs and Client Libraries

Official SDKs are available for:

- JavaScript/TypeScript
- Python
- Java
- PHP

## Support

For API support and questions:

- Documentation: [https://your-domain.com/docs](https://your-domain.com/docs)
- Support Email: api-support@example.com
- Developer Forum: [https://community.example.com](https://community.example.com)

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Complete gym management functionality
- Member and trainer management
- Attendance tracking
- Financial management
- Lead management system
- Analytics and reporting

---

**Last Updated**: November 2025
**API Version**: v1.0.0
