# Gym Management System API Documentation

This document provides a comprehensive list of all API endpoints in the Gym Management System.

## Base URL

`http://localhost:3001`

## Modules

### Auth

#### POST /auth/login

User login.

- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "userid": "123e4567-e89b-12d3-a456-426614174000",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### POST /auth/logout

User logout.

- **Response**:
  ```json
  {
    "message": "Logged out successfully. Please discard your token."
  }
  ```

### Users

#### POST /users

Create a new user.

- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "roleId": "123e4567-e89b-12d3-a456-426614174000",
    "gymId": "123e4567-e89b-12d3-a456-426614174000" (optional),
    "branchId": "123e4567-e89b-12d3-a456-426614174000" (optional)
  }
  ```
- **Response**:
  - `201`: User created successfully.
  - `409`: User with this email already exists.

#### GET /users

Get all users. (Protected)

- **Response**: List of users.

#### GET /users/profile

Get current user profile. (Protected)

- **Response**: Current user profile with populated member and trainer data (if memberId or trainerId is present).

#### GET /users/:id

Get a user by ID. (Protected)

- **Parameters**:
  - `id`: User ID.
- **Response**: User object.

#### PATCH /users/:id

Update a user. (Protected)

- **Parameters**:
  - `id`: User ID.
- **Request Body**:
  ```json
  {
    "email": "user@example.com" (optional),
    "password": "newpassword123" (optional)
  }
  ```
- **Response**: Updated user object.

#### DELETE /users/:id

Delete a user. (Protected)

- **Parameters**:
  - `id`: User ID.
- **Response**: Success message.

### Gyms

#### POST /gyms

Create a new gym. (Protected)

- **Request Body**:
  ```json
  {
    "name": "FitZone Fitness",
    "email": "contact@fitzone.com" (optional),
    "phone": "+1234567890" (optional),
    "address": "123 Main St, City, State" (optional),
    "location": "Los Angeles" (optional),
    "state": "CA" (optional)
  }
  ```
- **Response**:
  - `201`: Gym created successfully.

#### GET /gyms

Get all gyms. (Protected)

- **Response**: List of gyms.

#### GET /gyms/:id

Get a gym by ID. (Protected)

- **Parameters**:
  - `id`: Gym ID.
- **Response**: Gym object.

#### PATCH /gyms/:id

Update a gym. (Protected)

- **Parameters**:
  - `id`: Gym ID.
- **Request Body**:
  ```json
  {
    "name": "FitZone Fitness" (optional),
    "email": "contact@fitzone.com" (optional),
    ...
  }
  ```
- **Response**: Updated gym object.

#### DELETE /gyms/:id

Delete a gym. (Protected)

- **Parameters**:
  - `id`: Gym ID.
- **Response**: Success message.

#### POST /gyms/:gymId/branches

Create a branch for a gym. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Request Body**:
  ```json
  {
    "name": "Downtown Branch",
    "email": "downtown@fitzone.com" (optional),
    "phone": "+1234567891" (optional),
    "address": "456 Downtown Ave, City, State" (optional),
    "location": "New York" (optional),
    "state": "NY" (optional)
  }
  ```
- **Response**:
  - `201`: Branch created successfully.

#### GET /gyms/:gymId/branches

Get all branches for a gym. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Response**: List of branches.

### Branches

#### GET /branches

Get all branches. (Protected)

- **Response**: List of branches.

#### GET /branches/:id

Get a branch by ID. (Protected)

- **Parameters**:
  - `id`: Branch ID.
- **Response**: Branch object.

#### PATCH /branches/:id

Update a branch. (Protected)

- **Parameters**:
  - `id`: Branch ID.
- **Request Body**:
  ```json
  {
    "name": "Downtown Branch" (optional),
    ...
  }
  ```
- **Response**: Updated branch object.

#### DELETE /branches/:id

Delete a branch. (Protected)

- **Parameters**:
  - `id`: Branch ID.
- **Response**: Success message.

### Members

#### POST /members

Create a new member. (Protected)

- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890" (optional),
    "gender": "MALE" (optional),
    "dateOfBirth": "1990-01-01" (optional),
    "addressLine1": "123 Main St" (optional),
    "addressLine2": "Apt 4B" (optional),
    "city": "New York" (optional),
    "state": "NY" (optional),
    "postalCode": "10001" (optional),
    "avatarUrl": "https://example.com/avatar.jpg" (optional),
    "emergencyContactName": "Jane Doe" (optional),
    "emergencyContactPhone": "0987654321" (optional),
    "branchId": "123e4567-e89b-12d3-a456-426614174000" (optional),
    "isActive": true (optional)
  }
  ```
- **Response**:
  - `201`: Member created successfully.
  - `409`: Member with this email already exists.

#### GET /members

Get all members. (Protected)

- **Response**: List of members.

#### GET /members/:id

Get a member by ID. (Protected)

- **Parameters**:
  - `id`: Member ID.
- **Response**: Member object.

#### PATCH /members/:id

Update a member. (Protected)

- **Parameters**:
  - `id`: Member ID.
- **Request Body**:
  ```json
  {
    "fullName": "John Doe" (optional),
    ...
  }
  ```
- **Response**: Updated member object.

#### DELETE /members/:id

Delete a member. (Protected)

- **Parameters**:
  - `id`: Member ID.
- **Response**: Success message.

#### GET /branches/:branchId/members

Get all members for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of members.

### Analytics

#### GET /analytics/gym/:gymId/dashboard

Get gym dashboard analytics. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Response**: Dashboard analytics object.

#### GET /analytics/branch/:branchId/dashboard

Get branch dashboard analytics. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: Dashboard analytics object.

#### GET /analytics/gym/:gymId/members

Get gym member analytics. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Response**: Member analytics object.

#### GET /analytics/branch/:branchId/members

Get branch member analytics. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: Member analytics object.

#### GET /analytics/gym/:gymId/attendance

Get gym attendance analytics. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Response**: Attendance analytics object.

#### GET /analytics/branch/:branchId/attendance

Get branch attendance analytics. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: Attendance analytics object.

#### GET /analytics/gym/:gymId/payments/recent

Get 10 most recent payment transactions for a gym. (Protected)

- **Parameters**:
  - `gymId`: Gym ID.
- **Response**: List of recent payments.

#### GET /analytics/branch/:branchId/payments/recent

Get 10 most recent payment transactions for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of recent payments.

### Attendance

#### POST /attendance

Mark attendance (check-in). (Protected)

- **Request Body**:
  ```json
  {
    "memberId": 1 (optional, if trainerId not provided),
    "trainerId": 1 (optional, if memberId not provided),
    "branchId": "123e4567-e89b-12d3-a456-426614174000",
    "notes": "Regular check-in" (optional)
  }
  ```
- **Response**:
  - `201`: Attendance marked successfully.

#### PATCH /attendance/:id/checkout

Check out. (Protected)

- **Parameters**:
  - `id`: Attendance ID.
- **Response**:
  - `200`: Checked out successfully.

#### GET /attendance

Get all attendance records. (Protected)

- **Response**: List of attendance records.

#### GET /attendance/:id

Get attendance record by ID. (Protected)

- **Parameters**:
  - `id`: Attendance ID.
- **Response**: Attendance record.

#### GET /members/:memberId/attendance

Get attendance records for a member. (Protected)

- **Parameters**:
  - `memberId`: Member ID.
- **Response**: List of attendance records.

#### GET /trainers/:trainerId/attendance

Get attendance records for a trainer. (Protected)

- **Parameters**:
  - `trainerId`: Trainer ID.
- **Response**: List of attendance records.

#### GET /branches/:branchId/attendance

Get attendance records for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of attendance records.

### Classes

#### POST /classes

Create a new class. (Protected)

- **Request Body**:
  ```json
  {
    "name": "Yoga Basics",
    "description": "Beginner-friendly yoga class" (optional),
    "branchId": "123e4567-e89b-12d3-a456-426614174000",
    "timings": "morning" (optional, enum: morning, evening, both, either),
    "recurrenceType": "weekly" (optional, enum: daily, weekly, monthly),
    "daysOfWeek": [1, 3, 5] (optional, array of numbers 0-6)
  }
  ```
- **Response**:
  - `201`: Class created successfully.

#### GET /classes

Get all classes. (Protected)

- **Response**: List of classes.

#### GET /classes/:id

Get a class by ID. (Protected)

- **Parameters**:
  - `id`: Class ID.
- **Response**: Class object.

#### PATCH /classes/:id

Update a class. (Protected)

- **Parameters**:
  - `id`: Class ID.
- **Request Body**:
  ```json
  {
    "name": "Yoga Basics" (optional),
    ...
  }
  ```
- **Response**: Updated class object.

#### DELETE /classes/:id

Delete a class. (Protected)

- **Parameters**:
  - `id`: Class ID.
- **Response**: Success message.

#### GET /branches/:branchId/classes

Get all classes for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of classes.

### Invoices

#### POST /invoices

Create invoice. (Protected)

- **Request Body**:
  ```json
  {
    "memberId": 1,
    "subscriptionId": 1 (optional),
    "totalAmount": 99.99,
    "description": "Monthly membership fee" (optional),
    "dueDate": "2024-12-31" (optional)
  }
  ```
- **Response**:
  - `201`: Invoice created successfully.

#### GET /invoices

Get all invoices. (Protected)

- **Response**: List of invoices.

#### GET /invoices/:id

Get invoice by ID. (Protected)

- **Parameters**:
  - `id`: Invoice ID.
- **Response**: Invoice object.

#### PATCH /invoices/:id

Update invoice. (Protected)

- **Parameters**:
  - `id`: Invoice ID.
- **Request Body**:
  ```json
  {
    "totalAmount": 99.99 (optional),
    ...
  }
  ```
- **Response**: Updated invoice object.

#### POST /invoices/:id/cancel

Cancel invoice. (Protected)

- **Parameters**:
  - `id`: Invoice ID.
- **Response**:
  - `200`: Invoice cancelled successfully.

#### GET /members/:memberId/invoices

Get member invoices. (Protected)

- **Parameters**:
  - `memberId`: Member ID.
- **Response**: List of invoices.

### Roles

#### GET /roles

Get all roles. (Protected)

- **Response**: List of roles.

#### GET /roles/:id

Get role by ID. (Protected)

- **Parameters**:
  - `id`: Role ID.
- **Response**: Role object.

#### GET /roles/name/:name

Get role by name. (Protected)

- **Parameters**:
  - `name`: Role name (e.g., SUPERADMIN, ADMIN, TRAINER, MEMBER).
- **Response**: Role object.

### Audit Logs

#### POST /audit-logs

Create an audit log entry. (Protected)

- **Request Body**:
  ```json
  {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "action": "CREATE",
    "entityType": "Member",
    "entityId": "123",
    "previousValues": { ... } (optional),
    "newValues": { ... } (optional)
  }
  ```
- **Response**:
  - `201`: Audit log created successfully.

#### GET /audit-logs

Get all audit logs. (Protected)

- **Response**: List of audit logs.

#### GET /audit-logs/:id

Get audit log by ID. (Protected)

- **Parameters**:
  - `id`: Audit log ID.
- **Response**: Audit log object.

#### GET /audit-logs/user/:userId

Get audit logs by user. (Protected)

- **Parameters**:
  - `userId`: User ID.
- **Response**: List of audit logs.

#### GET /audit-logs/entity/:entityType/:entityId

Get audit logs by entity. (Protected)

- **Parameters**:
  - `entityType`: Entity type.
  - `entityId`: Entity ID.
- **Response**: List of audit logs.

#### GET /audit-logs/action/:action

Get audit logs by action. (Protected)

- **Parameters**:
  - `action`: Action type.
- **Response**: List of audit logs.

### Assignments

#### POST /assignments

Assign a member to a trainer. (Protected)

- **Request Body**:
  ```json
  {
    "memberId": 1,
    "trainerId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31" (optional),
    "status": "active" (optional, enum: active, ended)
  }
  ```
- **Response**:
  - `201`: Assignment created successfully.

#### GET /assignments

Get all assignments. (Protected)

- **Response**: List of assignments.

#### GET /assignments/:id

Get an assignment by ID. (Protected)

- **Parameters**:
  - `id`: Assignment ID.
- **Response**: Assignment object.

#### DELETE /assignments/:id

Delete an assignment. (Protected)

- **Parameters**:
  - `id`: Assignment ID.
- **Response**: Success message.

#### GET /members/:memberId/assignments

Get all trainer assignments for a member. (Protected)

- **Parameters**:
  - `memberId`: Member ID.
- **Response**: List of assignments.

#### GET /trainers/:trainerId/members

Get all members assigned to a trainer. (Protected)

- **Parameters**:
  - `trainerId`: Trainer ID.
- **Response**: List of assignments.

### Membership Plans

#### POST /membership-plans

Create a new membership plan. (Protected)

- **Request Body**:
  ```json
  {
    "name": "Premium Monthly",
    "price": 4999,
    "durationInDays": 30,
    "description": "Full access to all gym facilities" (optional),
    "branchId": "123e4567-e89b-12d3-a456-426614174000" (optional)
  }
  ```
- **Response**:
  - `201`: Plan created successfully.

#### GET /membership-plans

Get all membership plans. (Protected)

- **Response**: List of plans.

#### GET /membership-plans/:id

Get a membership plan by ID. (Protected)

- **Parameters**:
  - `id`: Plan ID.
- **Response**: Plan object.

#### PATCH /membership-plans/:id

Update a membership plan. (Protected)

- **Parameters**:
  - `id`: Plan ID.
- **Request Body**:
  ```json
  {
    "name": "Premium Monthly" (optional),
    ...
  }
  ```
- **Response**: Updated plan object.

#### DELETE /membership-plans/:id

Delete a membership plan. (Protected)

- **Parameters**:
  - `id`: Plan ID.
- **Response**: Success message.

#### GET /branches/:branchId/membership-plans

Get all membership plans for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of plans.

### Payments

#### POST /payments

Record payment. (Protected)

- **Request Body**:
  ```json
  {
    "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 99.99,
    "method": "card" (enum: cash, card, online, bank_transfer),
    "referenceNumber": "TXN123456" (optional),
    "notes": "Paid via credit card" (optional)
  }
  ```
- **Response**:
  - `201`: Payment recorded successfully.

#### GET /payments

Get all payments. (Protected)

- **Response**: List of payments.

#### GET /payments/:id

Get payment by ID. (Protected)

- **Parameters**:
  - `id`: Payment ID.
- **Response**: Payment object.

#### GET /invoices/:invoiceId/payments

Get invoice payments. (Protected)

- **Parameters**:
  - `invoiceId`: Invoice ID.
- **Response**: List of payments.

### Subscriptions

#### POST /subscriptions

Assign a member to a membership plan. (Protected)

- **Request Body**:
  ```json
  {
    "memberId": 1,
    "planId": 1,
    "startDate": "2024-01-01T00:00:00Z"
  }
  ```
- **Response**:
  - `201`: Subscription created successfully.
  - `409`: Member already has an active subscription.

#### GET /subscriptions

Get all subscriptions. (Protected)

- **Response**: List of subscriptions.

#### GET /subscriptions/:id

Get a subscription by ID. (Protected)

- **Parameters**:
  - `id`: Subscription ID.
- **Response**: Subscription object.

#### PATCH /subscriptions/:id

Update a subscription. (Protected)

- **Parameters**:
  - `id`: Subscription ID.
- **Request Body**:
  ```json
  {
    "isActive": true (optional)
  }
  ```
- **Response**: Updated subscription object.

#### DELETE /subscriptions/:id

Delete a subscription. (Protected)

- **Parameters**:
  - `id`: Subscription ID.
- **Response**: Success message.

#### POST /subscriptions/:id/cancel

Cancel a subscription. (Protected)

- **Parameters**:
  - `id`: Subscription ID.
- **Response**:
  - `200`: Subscription cancelled successfully.

#### GET /members/:memberId/subscription

Get a member's subscription. (Protected)

- **Parameters**:
  - `memberId`: Member ID.
- **Response**: Subscription object.

### Trainers

#### POST /trainers

Create a new trainer. (Protected)

- **Request Body**:
  ```json
  {
    "fullName": "John Smith",
    "email": "john.smith@gym.com",
    "phone": "+1234567890" (optional),
    "specialization": "Yoga, Pilates" (optional),
    "avatarUrl": "https://example.com/avatar.jpg" (optional),
    "branchId": "123e4567-e89b-12d3-a456-426614174000" (optional)
  }
  ```
- **Response**:
  - `201`: Trainer created successfully.
  - `409`: Trainer with this email already exists.

#### GET /trainers

Get all trainers. (Protected)

- **Response**: List of trainers.

#### GET /trainers/:id

Get a trainer by ID. (Protected)

- **Parameters**:
  - `id`: Trainer ID.
- **Response**: Trainer object.

#### PATCH /trainers/:id

Update a trainer. (Protected)

- **Parameters**:
  - `id`: Trainer ID.
- **Request Body**:
  ```json
  {
    "fullName": "John Smith" (optional),
    ...
  }
  ```
- **Response**: Updated trainer object.

#### DELETE /trainers/:id

Delete a trainer. (Protected)

- **Parameters**:
  - `id`: Trainer ID.
- **Response**: Success message.

#### GET /branches/:branchId/trainers

Get all trainers for a branch. (Protected)

- **Parameters**:
  - `branchId`: Branch ID.
- **Response**: List of trainers.
