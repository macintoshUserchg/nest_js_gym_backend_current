# Gym Management System - Complete API Reference

## Base URL

```
http://localhost:3000
```

## Authentication

### Authentication Method: Bearer Token (JWT)

```
Authorization: Bearer <access_token>
```

### Token Payload

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "MEMBER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Seeded Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SUPERADMIN | `superadmin@fitnessfirstelite.com` | `SuperAdmin123!` |
| ADMIN | `admin@fitnessfirstelite.com` | `Admin123!` |
| TRAINER | `mike.johnson-smith0@email.com` | `Trainer123!` |
| MEMBER | `sophia.johnson-smith0@email.com` | `Member123!` |

---

## Endpoints by Module

### Authentication (`/auth`)

#### POST `/auth/login`
Login with email and password.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "userid": "usr_1234567890abcdef",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### POST `/auth/logout`
Logout endpoint (client should discard token).

**Auth Required:** Yes

**Response (200):**
```json
{
  "message": "Logged out successfully. Please discard your token."
}
```

---

### Users (`/users`)

#### POST `/users`
Create a new user account.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "roleId": "role_uuid",
  "gymId": "gym_uuid",
  "branchId": "branch_uuid"
}
```

#### GET `/users`
Get all users.

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "userId": "uuid",
    "email": "user@example.com",
    "role": {
      "id": "uuid",
      "name": "MEMBER"
    },
    "gym": { "gymId": "uuid", "name": "Gym Name" },
    "branch": { "branchId": "uuid", "name": "Branch Name" }
  }
]
```

#### GET `/users/:id`
Get user by ID.

**Auth Required:** Yes

#### PATCH `/users/:id`
Update user.

**Auth Required:** Yes

#### DELETE `/users/:id`
Delete user.

**Auth Required:** Yes (Admin)

---

### Gyms (`/gyms`)

#### POST `/gyms`
Create a new gym (automatically creates main branch).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Fitness World Elite",
  "email": "contact@fitnessworld.com",
  "phone": "+1234567890",
  "address": "123 Main Street",
  "location": "Downtown",
  "state": "California",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Response (201):**
```json
{
  "gymId": "uuid",
  "name": "Fitness World Elite",
  "email": "contact@fitnessworld.com",
  "phone": "+1234567890",
  "address": "123 Main Street",
  "location": "Downtown",
  "state": "California",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "branches": [...]
}
```

#### GET `/gyms`
Get all gyms with optional filters.

**Auth Required:** Yes

**Query Parameters:**
- `location` (string, optional): Filter by location
- `search` (string, optional): Search by name

#### GET `/gyms/:id`
Get gym by ID with branches.

**Auth Required:** Yes

#### PATCH `/gyms/:id`
Update gym.

**Auth Required:** Yes (Admin)

#### DELETE `/gyms/:id`
Delete gym (cascades to branches).

**Auth Required:** Yes (Superadmin)

#### POST `/gyms/:gymId/branches`
Create a branch for a gym.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Fitness World Elite - Downtown",
  "email": "downtown@fitnessworld.com",
  "phone": "+1234567892",
  "address": "789 Downtown Ave",
  "location": "Downtown",
  "state": "California",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "mainBranch": false
}
```

#### GET `/gyms/:gymId/branches`
Get all branches for a gym.

**Auth Required:** Yes

#### GET `/gyms/:gymId/members`
Get all members across all branches of a gym.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `branchId` (string, optional): Filter by branch

**Response (200):**
```json
[
  {
    "id": 101,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "gender": "male",
    "isActive": true,
    "subscription": {
      "id": 101,
      "plan": {
        "id": 1,
        "name": "Elite Basic",
        "price": 8999,
        "durationInDays": 30
      },
      "classes": [...],
      "startDate": "2026-01-16T17:13:21.315Z",
      "endDate": "2026-02-15T17:13:21.315Z",
      "isActive": true
    },
    "branch": {
      "branchId": "uuid",
      "name": "Fitness First Elite - Downtown"
    }
  }
]
```

#### GET `/gyms/:gymId/trainers`
Get all trainers across all branches of a gym.

**Auth Required:** Yes

---

### Branches (`/branches`)

#### GET `/branches`
Get all branches across all gyms.

**Auth Required:** Yes (Admin)

#### GET `/branches/:id`
Get branch by ID.

**Auth Required:** Yes

**Response (200):**
```json
{
  "branchId": "uuid",
  "name": "Fitness World Elite - Downtown",
  "email": "downtown@fitnessworld.com",
  "phone": "+1234567892",
  "address": "789 Downtown Ave",
  "location": "Downtown",
  "state": "California",
  "mainBranch": false,
  "latitude": 34.0522,
  "longitude": -118.2437,
  "gym": {
    "gymId": "uuid",
    "name": "Fitness World Elite"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PATCH `/branches/:id`
Update branch.

**Auth Required:** Yes (Admin)

#### DELETE `/branches/:id`
Delete branch.

**Auth Required:** Yes (Admin)

#### GET `/branches/:branchId/members`
Get all members for a specific branch.

**Auth Required:** Yes

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `search` (string, optional): Search by name or email

#### GET `/branches/:branchId/trainers`
Get all trainers for a specific branch.

**Auth Required:** Yes

---

### Members (`/members`)

#### POST `/members`
Create a new member with user account and subscription.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "fullName": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1555123456",
  "gender": "female",
  "dateOfBirth": "1992-05-20",
  "addressLine1": "456 Oak Avenue",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90001",
  "emergencyContactName": "Bob Johnson",
  "emergencyContactPhone": "+1555987654",
  "branchId": "branch_uuid",
  "membershipPlanId": 1,
  "selectedClassIds": ["class_uuid1", "class_uuid2"]
}
```

**Response (201):**
```json
{
  "id": 111,
  "fullName": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "isActive": true,
  "freezeMember": false,
  "subscription": {
    "id": 113,
    "plan": { "id": 1, "name": "Elite Basic", "price": 8999 },
    "classes": [...],
    "startDate": "2026-01-11T05:34:36.139Z",
    "endDate": "2026-02-10T05:34:36.139Z",
    "isActive": true
  },
  "branch": {
    "branchId": "uuid",
    "name": "Fitness First Elite - Downtown"
  }
}
```

#### GET `/members`
Get all members with optional filters.

**Auth Required:** Yes

**Query Parameters:**
- `branchId` (string, optional): Filter by branch
- `status` (string, optional): Filter by status (active/inactive)
- `search` (string, optional): Search by name or email

#### GET `/members/:id`
Get member by ID.

**Auth Required:** Yes

#### PATCH `/members/:id`
Update member (non-sensitive fields).

**Auth Required:** Yes

**Request Body:**
```json
{
  "phone": "+1234567891",
  "addressLine1": "456 New St",
  "city": "New York"
}
```

#### PATCH `/members/admin/:id`
Admin update member (sensitive fields).

**Auth Required:** Yes (Admin/Superadmin)

**Request Body:**
```json
{
  "isActive": false,
  "branchId": "new_branch_uuid",
  "selectedClassIds": ["class_uuid1"]
}
```

#### DELETE `/members/:id`
Delete member (cascades to subscriptions, plans, attendance, progress).

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "id": 7,
  "fullName": "Deleted Member",
  "email": "deleted@example.com"
}
```

#### GET `/members/:memberId/dashboard`
Get member dashboard with subscription, attendance, payment history.

**Auth Required:** Yes

**Response (200):**
```json
{
  "member": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "isActive": true
  },
  "subscription": {
    "id": 1,
    "planName": "Elite Basic",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "status": "active"
  },
  "attendance": {
    "currentMonthCount": 15
  },
  "paymentHistory": [...]
}
```

---

### Trainers (`/trainers`)

#### POST `/trainers`
Create a new trainer with user account.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "fullName": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "+1-555-0123",
  "specialization": "Yoga, Pilates",
  "avatarUrl": "https://example.com/avatar.jpg",
  "branchId": "branch_uuid"
}
```

**Response (201):**
```json
{
  "id": 1,
  "fullName": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "+1-555-0123",
  "specialization": "Yoga, Pilates",
  "avatarUrl": "https://example.com/avatar.jpg",
  "branch": {
    "branchId": "uuid",
    "name": "Fitness First Elite - Downtown"
  }
}
```

#### GET `/trainers`
Get all trainers with optional filters.

**Auth Required:** Yes

**Query Parameters:**
- `branchId` (string, optional): Filter by branch
- `specialization` (string, optional): Filter by specialization

#### GET `/trainers/:id`
Get trainer by ID.

**Auth Required:** Yes

#### PATCH `/trainers/:id`
Update trainer.

**Auth Required:** Yes

#### DELETE `/trainers/:id`
Delete trainer.

**Auth Required:** Yes (Admin)

---

### Membership Plans (`/membership-plans`)

#### POST `/membership-plans`
Create a membership plan.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Elite Basic",
  "price": 8999,
  "durationInDays": 30,
  "description": "Access to premium gym facilities",
  "branchId": "branch_uuid"
}
```

#### GET `/membership-plans`
Get all membership plans.

**Auth Required:** Yes

#### GET `/membership-plans/:id`
Get plan by ID.

**Auth Required:** Yes

#### PATCH `/membership-plans/:id`
Update plan.

**Auth Required:** Yes (Admin)

#### DELETE `/membership-plans/:id`
Delete plan.

**Auth Required:** Yes (Admin)

---

### Subscriptions (`/subscriptions`)

#### POST `/subscriptions`
Create a member subscription.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "memberId": 123,
  "planId": 1,
  "startDate": "2024-01-01",
  "selectedClassIds": ["class_uuid1", "class_uuid2"]
}
```

#### GET `/subscriptions`
Get all subscriptions.

**Auth Required:** Yes

#### GET `/subscriptions/:id`
Get subscription by ID.

**Auth Required:** Yes

#### PATCH `/subscriptions/:id`
Update subscription.

**Auth Required:** Yes (Admin)

#### DELETE `/subscriptions/:id`
Delete subscription.

**Auth Required:** Yes (Admin)

---

### Classes (`/classes`)

#### POST `/classes`
Create a class.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Morning Yoga",
  "description": "Premium yoga session",
  "timings": "morning",
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5],
  "branchId": "branch_uuid"
}
```

**Response (201):**
```json
{
  "class_id": "uuid",
  "name": "Morning Yoga",
  "description": "Premium yoga session",
  "timings": "morning",
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5],
  "branch": { "branchId": "uuid", "name": "Branch Name" }
}
```

#### GET `/classes`
Get all classes.

**Auth Required:** Yes

#### GET `/classes/:id`
Get class by ID.

**Auth Required:** Yes

#### PATCH `/classes/:id`
Update class.

**Auth Required:** Yes (Admin)

#### DELETE `/classes/:id`
Delete class.

**Auth Required:** Yes (Admin)

---

### Attendance (`/attendance`)

#### POST `/attendance/mark`
Mark attendance for member or trainer.

**Auth Required:** Yes

**Request Body:**
```json
{
  "attendanceType": "member",
  "memberId": 123,
  "branchId": "branch_uuid",
  "date": "2024-01-15",
  "notes": "Regular check-in"
}
```

#### GET `/attendance`
Get attendance records.

**Auth Required:** Yes

**Query Parameters:**
- `memberId` (number, optional): Filter by member
- `trainerId` (number, optional): Filter by trainer
- `branchId` (string, optional): Filter by branch
- `startDate` (date, optional): Filter from date
- `endDate` (date, optional): Filter to date

#### GET `/attendance/monthly`
Get monthly attendance report.

**Auth Required:** Yes

**Query Parameters:**
- `memberId` (number, required): Member ID
- `year` (number, required): Year
- `month` (number, required): Month (1-12)

#### POST `/attendance/goals`
Create attendance goal.

**Auth Required:** Yes

**Request Body:**
```json
{
  "memberId": 123,
  "branchId": "branch_uuid",
  "goalType": "weekly",
  "targetCount": 5,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

---

### Fitness Tracking

#### Workouts (`/workouts`)

##### POST `/workouts`
Create workout plan for member.

**Auth Required:** Yes (Trainer/Admin)

##### GET `/workouts`
Get all workout plans.

**Auth Required:** Yes

##### GET `/workouts/:id`
Get workout plan by ID.

**Auth Required:** Yes

##### PATCH `/workouts/:id`
Update workout plan.

**Auth Required:** Yes

##### DELETE `/workouts/:id`
Delete workout plan.

**Auth Required:** Yes

#### Workout Templates (`/workouts/templates`)

##### POST `/workouts/templates`
Create reusable workout template.

**Auth Required:** Yes (Trainer)

**Request Body:**
```json
{
  "title": "Strength Training Program",
  "description": "12-week strength program",
  "chartType": "STRENGTH",
  "difficultyLevel": "BEGINNER",
  "planType": "strength",
  "durationDays": 84,
  "visibility": "GYM_PUBLIC",
  "exercises": [
    {
      "exerciseName": "Bench Press",
      "exerciseType": "sets_reps",
      "sets": 4,
      "reps": 10,
      "weightKg": 60,
      "dayOfWeek": 1,
      "equipmentRequired": "BARBELL"
    }
  ]
}
```

##### GET `/workouts/templates`
Get all workout templates.

**Auth Required:** Yes

##### GET `/workouts/templates/:id`
Get template by ID.

**Auth Required:** Yes

##### PATCH `/workouts/templates/:id`
Update template.

**Auth Required:** Yes (Owner)

#### Diet Plans (`/diet-plans`)

##### POST `/diet-plans`
Create diet plan for member.

**Auth Required:** Yes (Trainer/Admin)

##### GET `/diet-plans`
Get all diet plans.

**Auth Required:** Yes

##### GET `/diet-plans/:id`
Get diet plan by ID.

**Auth Required:** Yes

#### Diet Templates (`/diet-plans/templates`)

##### POST `/diet-plans/templates`
Create reusable diet template.

**Auth Required:** Yes (Trainer)

**Request Body:**
```json
{
  "title": "Weight Loss Plan",
  "description": "1200 calorie weight loss plan",
  "goalType": "weight_loss",
  "targetCalories": 1200,
  "proteinG": 120,
  "carbsG": 100,
  "fatG": 40,
  "meals": [
    {
      "mealType": "breakfast",
      "mealName": "Oatmeal with Berries",
      "calories": 300,
      "proteinG": 15,
      "carbsG": 45,
      "fatG": 8,
      "dayOfWeek": 1
    }
  ]
}
```

#### Goals (`/goals`)

##### POST `/goals`
Create fitness goal for member.

**Auth Required:** Yes (Trainer/Admin)

**Request Body:**
```json
{
  "memberId": 123,
  "goalType": "Weight Loss",
  "targetValue": 70.5,
  "targetTimeline": "2024-06-30",
  "trainerId": 1
}
```

##### GET `/goals`
Get all goals.

**Auth Required:** Yes

##### GET `/goals/:id`
Get goal by ID.

**Auth Required:** Yes

##### PATCH `/goals/:id`
Update goal.

**Auth Required:** Yes

#### Goal Schedules (`/goals/schedules`)

##### POST `/goals/schedules`
Create goal schedule with milestones.

**Auth Required:** Yes (Trainer)

**Request Body:**
```json
{
  "memberId": 123,
  "title": "12-Week Transformation",
  "description": "Complete body transformation",
  "scheduleType": "weekly",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "targetGoals": [
    {
      "goalType": "weight_loss",
      "targetValue": 10,
      "unit": "kg",
      "description": "Lose 10kg",
      "priority": "high"
    }
  ]
}
```

#### Progress Tracking (`/progress-tracking`)

##### POST `/progress-tracking`
Record progress measurements.

**Auth Required:** Yes (Trainer/Admin)

**Request Body:**
```json
{
  "memberId": 123,
  "recordDate": "2024-01-15",
  "weightKg": 75.5,
  "bodyFatPercentage": 18.5,
  "muscleMassKg": 35.2,
  "chestCm": 102,
  "waistCm": 85,
  "armsCm": 38,
  "thighsCm": 58
}
```

##### GET `/progress-tracking`
Get progress records.

**Auth Required:** Yes

#### Body Progress (`/body-progress`)

##### POST `/body-progress`
Record body progress.

**Auth Required:** Yes

##### GET `/body-progress/:memberId`
Get body progress history.

**Auth Required:** Yes

#### Workout Logs (`/workout-logs`)

##### POST `/workout-logs`
Log completed workout.

**Auth Required:** Yes (Member)

**Request Body:**
```json
{
  "memberId": 123,
  "exerciseName": "Bench Press",
  "sets": 4,
  "reps": 10,
  "weight": 80,
  "date": "2024-01-15",
  "notes": "Felt strong today"
}
```

---

### Assignments

#### Member-Trainer Assignments (`/assignments`)

##### POST `/assignments`
Assign trainer to member.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "memberId": 123,
  "trainerId": 1,
  "startDate": "2024-01-01",
  "workoutTemplateId": "template_uuid",
  "dietTemplateId": "template_uuid",
  "autoApplyTemplates": true
}
```

##### GET `/assignments`
Get all assignments.

**Auth Required:** Yes

##### GET `/assignments/:id`
Get assignment by ID.

**Auth Required:** Yes

##### PATCH `/assignments/:id`
Update assignment.

**Auth Required:** Yes

#### Workout Chart Assignments (`/workouts/chart-assignments`)

##### POST `/workouts/chart-assignments`
Assign workout template to member.

**Auth Required:** Yes (Admin/Trainer)

**Request Body:**
```json
{
  "chartId": "template_uuid",
  "memberId": 123,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

##### GET `/workouts/chart-assignments`
Get all chart assignments.

**Auth Required:** Yes

#### Diet Assignments (`/diet-plans/assignments`)

##### POST `/diet-plans/assignments`
Assign diet template to member.

**Auth Required:** Yes (Admin/Trainer)

**Request Body:**
```json
{
  "dietPlanId": "plan_uuid",
  "memberId": 123,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

---

### Financial

#### Invoices (`/invoices`)

##### POST `/invoices`
Create invoice.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "memberId": 123,
  "subscriptionId": 1,
  "totalAmount": 8999,
  "description": "Monthly membership",
  "dueDate": "2024-01-31"
}
```

##### GET `/invoices`
Get all invoices.

**Auth Required:** Yes

##### GET `/invoices/:id`
Get invoice by ID.

**Auth Required:** Yes

##### PATCH `/invoices/:id`
Update invoice status.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "paid"
}
```

#### Payments (`/payments`)

##### POST `/payments`
Process payment.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "invoiceId": "invoice_uuid",
  "amount": 8999,
  "method": "card",
  "referenceNumber": "TXN123456",
  "notes": "Payment via card"
}
```

##### GET `/payments`
Get all payments.

**Auth Required:** Yes

---

### Lead Management

#### Inquiries (`/inquiries`)

##### POST `/inquiries`
Create new inquiry (public endpoint).

**Auth Required:** No

**Request Body:**
```json
{
  "fullName": "Prospective Member",
  "email": "prospect@example.com",
  "phone": "+1234567890",
  "source": "website",
  "preferredMembershipType": "premium",
  "fitnessGoals": "Weight loss and strength training",
  "branchId": "branch_uuid"
}
```

##### GET `/inquiries`
Get all inquiries.

**Auth Required:** Yes

**Query Parameters:**
- `status` (string, optional): new, contacted, qualified, converted, closed

##### GET `/inquiries/:id`
Get inquiry by ID.

**Auth Required:** Yes

##### PATCH `/inquiries/:id`
Update inquiry status.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "contacted",
  "notes": "Called and interested"
}
```

---

### System

#### Audit Logs (`/audit-logs`)

##### GET `/audit-logs`
Get audit trail.

**Auth Required:** Yes (Superadmin)

**Query Parameters:**
- `userId` (string, optional): Filter by user
- `entityType` (string, optional): Filter by entity type
- `action` (string, optional): Filter by action
- `startDate` (date, optional): Filter from date
- `endDate` (date, optional): Filter to date

**Response (200):**
```json
[
  {
    "log_id": "uuid",
    "user": {
      "userId": "uuid",
      "email": "admin@example.com"
    },
    "action": "UPDATE",
    "entityType": "Member",
    "entityId": "123",
    "previousValues": { "isActive": true },
    "newValues": { "isActive": false },
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

#### Analytics (`/analytics`)

##### GET `/analytics/dashboard`
Get dashboard analytics.

**Auth Required:** Yes (Admin)

##### GET `/analytics/revenue`
Get revenue analytics.

**Auth Required:** Yes (Admin)

#### Notifications (`/notifications`)

##### GET `/notifications`
Get user notifications.

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "notification_id": "uuid",
    "type": "GOAL_COMPLETED",
    "title": "Goal Achieved!",
    "message": "You've reached your weight loss goal",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

##### PATCH `/notifications/:id/read`
Mark notification as read.

**Auth Required:** Yes

---

## Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Common Error Response Format

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is required"],
  "error": "Bad Request"
}
```

---

## Pagination

Most list endpoints support pagination via query parameters:

- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Example:**
```
GET /members?page=2&limit=20
```

---

## Date Format

All dates should be in **ISO 8601** format:

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

For date-only fields:
```
YYYY-MM-DD
```

---

## UUID Format

All UUIDs follow **UUID v4** format:

```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

Example: `3c1f3add-0783-460b-ab77-df3f29aeb7ea`
