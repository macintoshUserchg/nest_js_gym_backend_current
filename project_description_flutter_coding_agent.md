# Flutter Gym Management App - Complete API Documentation

**Date:** 2026-01-29
**Backend:** NestJS 11.0.1 + TypeORM + PostgreSQL
**API Version:** v1
**Base URL:** `http://localhost:3001`

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Authentication](#2-authentication)
3. [API Endpoints](#3-api-endpoints)
4. [DTO Examples](#4-dto-examples)
5. [Data Type Specifications](#5-data-type-specifications)
6. [Enum Values Reference](#6-enum-values-reference)
7. [Error Handling](#7-error-handling)
8. [Real-time Features](#8-real-time-features)
9. [Role-Based Access](#9-role-based-access)
10. [Sample API Calls](#10-sample-api-calls)

---

## 1. Quick Start

### Environment Variables

```env
# Required Environment Variables
JWT_SECRET="your-jwt-secret-key-min-32-chars"
JWT_EXPIRES_IN="1d"
PORT=3001
POSTGRES_URL="postgresql://user:password@host:5432/database"
```

### Base URL

```
Development: http://localhost:3001
Production:  https://api.yourgym.com
```

### API Versioning

All endpoints are prefixed with `/api` (implicit via route prefix). No explicit versioning in URL - backwards compatibility maintained.

### Common Headers

```http
Content-Type: application/json
Authorization: Bearer <access_token>
Accept: application/json
```

---

## 2. Authentication

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "userid": "123e4567-e89b-12d3-a456-426614174000",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW5Ad2l0aGymLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNjM0MTYwMCwiZXhwIjoxNzM2NDI0MDAwfQ.xXaH1sN6vPOQ"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

### Using the Token

Include the token in the `Authorization` header for all protected endpoints:

```dart
// Dart/Flutter Example
class ApiClient {
  final String baseUrl = 'http://localhost:3001';
  String? accessToken;

  Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
    );
    return response.body;
  }
}
```

---

## 3. API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | JWT |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/profile` | Get current user profile | JWT |
| PATCH | `/users/profile` | Update profile | JWT |
| POST | `/users/change-password` | Change password | JWT |

### Members

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/members` | Create new member | ADMIN |
| GET | `/members` | List all members | ADMIN |
| GET | `/members/:id` | Get member by ID | ADMIN |
| GET | `/members/:id/dashboard` | Member dashboard data | JWT |
| PATCH | `/members/admin/:id` | Update member (admin) | ADMIN |
| PATCH | `/members/:id` | Update own profile | JWT |
| DELETE | `/members/:id` | Delete member | ADMIN |
| GET | `/branches/:branchId/members` | Members by branch | ADMIN |

**Member Response Example:**
```json
{
  "id": 123,
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1-555-123-4567",
  "isActive": true,
  "freezeMember": false,
  "branch": {
    "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
    "name": "Main Branch"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Trainers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/trainers` | Create new trainer | ADMIN |
| GET | `/trainers` | List all trainers | ADMIN |
| GET | `/trainers/:id` | Get trainer by ID | ADMIN |
| PATCH | `/trainers/:id` | Update trainer | ADMIN |
| DELETE | `/trainers/:id` | Delete trainer | ADMIN |
| GET | `/branches/:branchId/trainers` | Trainers by branch | ADMIN |

### Gyms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/gyms` | Create new gym | ADMIN |
| GET | `/gyms` | List all gyms | ADMIN |
| GET | `/gyms/:id` | Get gym by ID | ADMIN |
| PATCH | `/gyms/:id` | Update gym | ADMIN |
| POST | `/gyms/:gymId/branches` | Create branch | ADMIN |

### Branches

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/branches` | List all branches | ADMIN |
| GET | `/branches/:id` | Get branch by ID | ADMIN |
| PATCH | `/branches/:id` | Update branch | ADMIN |
| GET | `/branches/:branchId/classes` | Classes in branch | ADMIN |
| GET | `/branches/:branchId/members` | Members in branch | ADMIN |
| GET | `/branches/:branchId/trainers` | Trainers in branch | ADMIN |

### Classes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/classes` | Create new class | ADMIN |
| GET | `/classes` | List all classes | ADMIN |
| GET | `/classes/:id` | Get class by ID | ADMIN |
| PATCH | `/classes/:id` | Update class | ADMIN |
| DELETE | `/classes/:id` | Delete class | ADMIN |
| GET | `/branches/:branchId/classes` | Classes by branch | ADMIN |
| GET | `/classes/upcoming` | Upcoming classes | JWT |

### Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/attendance` | Check in/out | JWT |
| PATCH | `/attendance/:id/checkout` | Check out | JWT |
| GET | `/attendance/member/:memberId` | Member attendance | ADMIN |
| GET | `/attendance/branch/:branchId/stats` | Branch stats | ADMIN |
| GET | `/attendance/monthly-report` | Monthly report | ADMIN |

### Membership Plans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/membership-plans` | Create plan | ADMIN |
| GET | `/membership-plans` | List all plans | ADMIN |
| GET | `/membership-plans/:id` | Get plan by ID | ADMIN |
| PATCH | `/membership-plans/:id` | Update plan | ADMIN |
| DELETE | `/membership-plans/:id` | Delete plan | ADMIN |

### Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/subscriptions` | Create subscription | ADMIN |
| GET | `/subscriptions` | List subscriptions | ADMIN |
| GET | `/subscriptions/:id` | Get subscription | ADMIN |
| GET | `/subscriptions/member/:memberId` | Member subscriptions | ADMIN |
| POST | `/subscriptions/:id/cancel` | Cancel subscription | ADMIN |

### Invoices

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/invoices` | Create invoice | ADMIN |
| GET | `/invoices` | List invoices | ADMIN |
| GET | `/invoices/:id` | Get invoice by ID | ADMIN |
| GET | `/invoices/member/:memberId` | Member invoices | ADMIN |
| PATCH | `/invoices/:id` | Update invoice | ADMIN |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments` | Process payment | ADMIN |
| GET | `/payments/member/:memberId` | Member payments | ADMIN |
| GET | `/payments/invoice/:invoiceId` | Invoice payments | ADMIN |

### Inquiries (Leads)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/inquiries` | Create inquiry | Public |
| GET | `/inquiries` | List inquiries | ADMIN |
| GET | `/inquiries/stats` | Inquiry statistics | ADMIN |
| POST | `/inquiries/:id/convert` | Convert to member | ADMIN |

### Goal Schedules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goal-schedules` | Create goal schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/from-template` | Create from template | TRAINER, ADMIN |
| GET | `/goal-schedules` | List schedules | All |
| GET | `/goal-schedules/:id` | Get schedule | All |
| PATCH | `/goal-schedules/:id/period` | Update progress | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/pause` | Pause schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/resume` | Resume schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/complete` | Complete schedule | TRAINER, ADMIN |
| DELETE | `/goal-schedules/:id` | Delete schedule | TRAINER, ADMIN |

### Goal Templates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goal-templates` | Create template | TRAINER, ADMIN |
| GET | `/goal-templates` | List templates | All |
| GET | `/goal-templates/:id` | Get template | All |
| PATCH | `/goal-templates/:id` | Update template | Owner, ADMIN |
| DELETE | `/goal-templates/:id` | Delete template | Owner, ADMIN |

### Workout Templates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/workout-templates` | Create template | TRAINER, ADMIN |
| GET | `/workout-templates` | List templates | TRAINER, ADMIN |
| GET | `/workout-templates/:id` | Get template | All |
| POST | `/workout-templates/:id/copy` | Copy template | TRAINER, ADMIN |
| POST | `/workout-templates/:id/share` | Share to trainer | ADMIN |
| POST | `/workout-templates/:id/accept` | Accept shared | TRAINER |
| POST | `/workout-templates/:id/rate` | Rate template | All |
| POST | `/workout-templates/:id/assign` | Assign to member | TRAINER, ADMIN |
| DELETE | `/workout-templates/:id` | Delete template | Owner, ADMIN |

### Chart Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chart-assignments` | Assign chart | ADMIN, TRAINER |
| GET | `/chart-assignments` | List assignments | All |
| GET | `/chart-assignments/:id` | Get assignment | All |
| PATCH | `/chart-assignments/:id` | Update assignment | ADMIN, TRAINER |
| POST | `/chart-assignments/:id/substitutions` | Add substitution | All |
| POST | `/chart-assignments/:id/exercise-completion` | Record completion | All |
| PATCH | `/chart-assignments/:id/cancel` | Cancel assignment | ADMIN, TRAINER |
| DELETE | `/chart-assignments/:id` | Delete assignment | ADMIN |

### Diet Templates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/diet-templates` | Create template | TRAINER, ADMIN |
| GET | `/diet-templates` | List templates | TRAINER, ADMIN |
| GET | `/diet-templates/:id` | Get template | All |
| POST | `/diet-templates/:id/copy` | Copy template | TRAINER, ADMIN |
| POST | `/diet-templates/:id/share` | Share to trainer | ADMIN |
| POST | `/diet-templates/:id/accept` | Accept shared | TRAINER |
| POST | `/diet-templates/:id/rate` | Rate template | All |
| POST | `/diet-templates/:id/assign` | Assign to member | TRAINER, ADMIN |
| DELETE | `/diet-templates/:id` | Delete template | Owner, ADMIN |

### Diet Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/diet-plan-assignments` | Assign diet plan | TRAINER, ADMIN |
| GET | `/diet-plan-assignments` | List assignments | All |
| GET | `/diet-plan-assignments/:id` | Get assignment | All |
| PATCH | `/diet-plan-assignments/:id/progress` | Update progress | All |
| POST | `/diet-plan-assignments/:id/substitute` | Record substitution | All |
| POST | `/diet-plan-assignments/:id/cancel` | Cancel assignment | TRAINER, ADMIN |
| DELETE | `/diet-plan-assignments/:id` | Delete assignment | TRAINER, ADMIN |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get user notifications | JWT |
| GET | `/notifications/unread` | Get unread notifications | JWT |
| PATCH | `/notifications/:id/read` | Mark as read | JWT |
| PATCH | `/notifications/read-all` | Mark all as read | JWT |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/gym/:gymId/dashboard` | Gym dashboard | ADMIN |
| GET | `/analytics/branch/:branchId/attendance` | Branch attendance | ADMIN |
| GET | `/analytics/member/:memberId/progress` | Member progress | ADMIN |

---

## 4. DTO Examples

### Create Member

**Endpoint:** `POST /members`

**Request:**
```json
{
  "fullName": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1-555-123-4567",
  "gender": "female",
  "dateOfBirth": "1992-05-20",
  "addressLine1": "456 Oak Avenue",
  "addressLine2": "Apt 4B",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90001",
  "avatarUrl": "https://example.com/avatars/alice.jpg",
  "emergencyContactName": "Bob Johnson",
  "emergencyContactPhone": "+1-555-987-6543",
  "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
  "membershipPlanId": 1,
  "isActive": true,
  "freezeMember": false,
  "is_managed_by_member": true,
  "selectedClassIds": [
    "8cd45646-061b-4730-a2a5-1f400226564b",
    "33ec8f27-0708-4808-958f-091301f8aa2c"
  ]
}
```

**Response (201 Created):**
```json
{
  "userid": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Member created successfully"
}
```

### Member Dashboard

**Endpoint:** `GET /members/:id/dashboard`

**Response:**
```json
{
  "member": {
    "id": 123,
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-123-4567",
    "isActive": true,
    "freezeMember": false,
    "branch": {
      "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
      "name": "Main Branch"
    }
  },
  "subscription": {
    "id": 456,
    "planName": "Premium Monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z",
    "status": "active"
  },
  "attendance": {
    "currentMonthCount": 8
  },
  "paymentHistory": [
    {
      "transactionId": "txn_123",
      "amount": 4999,
      "method": "card",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "invoiceId": "inv_456"
    }
  ],
  "currentMonthClasses": 8,
  "membershipStatus": "active"
}
```

### Create Workout Template

**Endpoint:** `POST /workout-templates`

**Request:**
```json
{
  "title": "Full Body Strength Template",
  "description": "A comprehensive strength training program",
  "visibility": "PRIVATE",
  "chart_type": "STRENGTH",
  "difficulty_level": "INTERMEDIATE",
  "plan_type": "strength",
  "duration_days": 30,
  "is_shared_gym": false,
  "notes": "Focus on compound movements",
  "tags": ["strength", "muscle", "compound"],
  "exercises": [
    {
      "exercise_name": "Bench Press",
      "description": "Standard barbell bench press",
      "exercise_type": "sets_reps",
      "equipment_required": "BARBELL",
      "sets": 4,
      "reps": 10,
      "weight_kg": 60,
      "day_of_week": 1,
      "order_index": 1,
      "instructions": "Keep back arched, lower to chest",
      "alternatives": "Push-ups, Dumbbell Press",
      "member_can_skip": false
    },
    {
      "exercise_name": "Running",
      "description": "Treadmill running",
      "exercise_type": "time",
      "equipment_required": "BODYWEIGHT",
      "duration_minutes": 30,
      "day_of_week": 2,
      "order_index": 1,
      "instructions": "Maintain steady pace",
      "member_can_skip": true
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "template_id": "b5c67f8a-d9e1-4c7b-9f3a-1d2e4b5c6d7f",
  "title": "Full Body Strength Template",
  "message": "Workout template created successfully"
}
```

### Create Diet Template

**Endpoint:** `POST /diet-templates`

**Request:**
```json
{
  "title": "Weight Loss Diet Template",
  "description": "Calorie-controlled diet for weight loss",
  "goal_type": "weight_loss",
  "target_calories": 1800,
  "protein_g": 150,
  "carbs_g": 200,
  "fat_g": 60,
  "is_shared_gym": false,
  "notes": "High protein, moderate carbs",
  "tags": ["weight_loss", "high_protein"],
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_name": "Oatmeal with Fruits",
      "description": "Rolled oats with mixed berries",
      "ingredients": "Oats, blueberries, strawberries, almond milk",
      "preparation": "Cook oats with almond milk, top with fruits",
      "calories": 350,
      "protein_g": 25,
      "carbs_g": 45,
      "fat_g": 10,
      "day_of_week": 1,
      "order_index": 1,
      "notes": "Use unsweetened almond milk",
      "alternatives": "Greek yogurt with fruits",
      "member_can_skip": false
    },
    {
      "meal_type": "lunch",
      "meal_name": "Grilled Chicken Salad",
      "description": "Mixed greens with grilled chicken breast",
      "ingredients": "Chicken breast, mixed greens, cherry tomatoes, olive oil",
      "calories": 450,
      "protein_g": 45,
      "carbs_g": 15,
      "fat_g": 20,
      "day_of_week": 1,
      "order_index": 2
    }
  ]
}
```

### Create Goal Schedule

**Endpoint:** `POST /goal-schedules`

**Request:**
```json
{
  "memberId": 123,
  "trainerId": 1,
  "title": "Monthly Fitness Goals - January",
  "description": "Weight loss and strength goals",
  "schedule_type": "monthly",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "target_goals": [
    {
      "goal_type": "weight_loss",
      "target_value": 5,
      "unit": "kg",
      "description": "Lose 5kg this month",
      "priority": "high"
    },
    {
      "goal_type": "workout_sessions",
      "target_value": 20,
      "unit": "sessions",
      "description": "Complete 20 workout sessions",
      "priority": "medium"
    }
  ]
}
```

### Paginated Response

**Endpoint:** `GET /members?page=1&limit=10`

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "fullName": "Alice Johnson",
      "email": "alice@example.com",
      "isActive": true,
      "branch": {
        "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
        "name": "Main Branch"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

---

## 5. Data Type Specifications

### DateTime

All timestamps use **ISO 8601** format with UTC timezone:

```
Format:  YYYY-MM-DDTHH:mm:ss.sssZ
Example: 2026-01-29T10:30:00.000Z
```

### Dates (without time)

For date-only fields (start_date, end_date, dateOfBirth):

```
Format:  YYYY-MM-DD
Example: 2026-01-29
```

### UUID

All UUIDs use **UUID v4** format:

```
Format:  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Example: a4a43bf7-e997-4716-839b-9f05a45f42be
```

### Numeric IDs

Some entities use auto-increment integers:

```
Examples: member.id = 123, trainer.id = 1
```

### Currency

All amounts are in **cents** (not decimal):

```json
// Example: $49.99
"amount": 4999
```

### Boolean

JSON booleans are standard:

```json
"isActive": true,
"freezeMember": false
```

### Array

JSON arrays of strings or objects:

```json
"selectedClassIds": ["uuid-1", "uuid-2"]
```

### JSON Objects

For flexible data structures:

```json
"customizations": {
  "skipped_exercises": ["Exercise 1"],
  "modified_sets": [{"exercise_name": "Push-ups", "sets": 4}],
  "notes": "Custom notes"
}
```

---

## 6. Enum Values Reference

### UserRole

| Value | Description |
|-------|-------------|
| `SUPERADMIN` | System-wide access |
| `ADMIN` | gym_owner |
| `TRAINER` | Fitness trainer |
| `MEMBER` | Gym member |

### Gender

| Value | Description |
|-------|-------------|
| `male` | Male |
| `female` | Female |
| `other` | Other |

### ChartVisibility

| Value | Description |
|-------|-------------|
| `PRIVATE` | Only creator can access |
| `GYM_PUBLIC` | All trainers in gym can access |

### ChartType

| Value | Description |
|-------|-------------|
| `STRENGTH` | Strength training |
| `CARDIO` | Cardiovascular |
| `HIIT` | High-intensity interval |
| `FLEXIBILITY` | Stretching/mobility |
| `COMPOUND` | Mixed compound exercises |

### DifficultyLevel

| Value | Description |
|-------|-------------|
| `BEGINNER` | Beginner level |
| `INTERMEDIATE` | Intermediate level |
| `ADVANCED` | Advanced level |

### PlanType

| Value | Description |
|-------|-------------|
| `strength` | Strength training |
| `cardio` | Cardiovascular |
| `flexibility` | Flexibility/mobility |
| `endurance` | Endurance training |
| `general` | General fitness |

### MealType

| Value | Description |
|-------|-------------|
| `breakfast` | Breakfast meal |
| `lunch` | Lunch meal |
| `dinner` | Dinner meal |
| `snack` | Snack |
| `pre_workout` | Pre-workout meal |
| `post_workout` | Post-workout meal |

### DietGoalType

| Value | Description |
|-------|-------------|
| `weight_loss` | Weight loss |
| `muscle_gain` | Muscle gain |
| `maintenance` | Maintenance |
| `cutting` | Cutting phase |
| `bulking` | Bulking phase |
| `custom` | Custom goals |

### GoalPriority

| Value | Description |
|-------|-------------|
| `high` | High priority |
| `medium` | Medium priority |
| `low` | Low priority |

### ScheduleType

| Value | Description |
|-------|-------------|
| `weekly` | Weekly schedule |
| `monthly` | Monthly schedule |
| `quarterly` | Quarterly schedule |

### ScheduleStatus

| Value | Description |
|-------|-------------|
| `active` | Currently active |
| `completed` | Completed |
| `cancelled` | Cancelled |
| `paused` | Temporarily paused |

### EquipmentRequired

| Value | Description |
|-------|-------------|
| `BARBELL` | Barbell |
| `DUMBBELL` | Dumbbell |
| `CABLE` | Cable machine |
| `MACHINE` | Weight machine |
| `BODYWEIGHT` | No equipment |
| `KETTLEBELL` | Kettlebell |
| `MEDICINE_BALL` | Medicine ball |
| `RESISTANCE_BAND` | Resistance band |
| `OTHER` | Other equipment |

### NotificationType

| Value | Description |
|-------|-------------|
| `GOAL_PROGRESS` | Goal progress update |
| `GOAL_COMPLETED` | Goal completed |
| `GOAL_MISSED` | Goal missed |
| `MILESTONE_COMPLETE` | Milestone completed |
| `MILESTONE_MISSED` | Milestone missed |
| `CHART_ASSIGNED` | Workout chart assigned |
| `CHART_SHARED` | Workout chart shared |
| `DIET_ASSIGNED` | Diet plan assigned |
| `TEMPLATE_FEEDBACK_REQUEST` | Feedback requested |
| `SYSTEM` | System notification |
| `REMINDER` | Reminder notification |

---

## 7. Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry or conflict |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Validation Errors

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Forbidden Access

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN, TRAINER",
  "error": "Forbidden"
}
```

---

## 8. Real-time Features

### Notification Polling

Currently, notifications are fetched via polling. WebSocket support is planned for future.

**Recommended Poll Interval:** 30-60 seconds

**Endpoint:** `GET /notifications/unread`

**Response:**
```json
[
  {
    "notification_id": "uuid-string",
    "type": "CHART_ASSIGNED",
    "title": "Workout Chart Assigned",
    "message": "A new workout chart has been assigned to you.",
    "is_read": false,
    "created_at": "2026-01-29T10:30:00.000Z",
    "metadata": {
      "entity_type": "chart",
      "action": "assigned"
    }
  }
]
```

### Flutter Polling Example

```dart
class NotificationService {
  Timer? _pollingTimer;

  void startPolling(String token) {
    _pollingTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => fetchNotifications(token),
    );
  }

  void stopPolling() {
    _pollingTimer?.cancel();
  }

  Future<void> fetchNotifications(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/notifications/unread'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      // Update UI with notifications
    }
  }
}
```

---

## 9. Role-Based Access

### Role Hierarchy

```
SUPERADMIN > ADMIN > TRAINER > MEMBER
```

### Permission Matrix

| Feature | SUPERADMIN | ADMIN | TRAINER | MEMBER |
|---------|------------|-------|---------|--------|
| View all gyms | Yes | Own gym | - | - |
| Manage members | Yes | Yes | Assigned | Own |
| Manage trainers | Yes | Yes | - | - |
| Create templates | Yes | Yes | Yes | - |
| Assign templates | Yes | Yes | Assigned | - |
| View analytics | Yes | Yes | - | - |
| Manage payments | Yes | Yes | - | - |
| View own profile | Yes | Yes | Yes | Yes |
| Update own profile | Yes | Yes | Yes | Yes |

### Checking User Role in Flutter

```dart
class User {
  final String userid;
  final String email;
  final String role; // 'SUPERADMIN', 'ADMIN', 'TRAINER', 'MEMBER'
  final int? trainerId;
  final int? memberId;
  final String? gymId;
}

bool isAdmin(User user) {
  return ['SUPERADMIN', 'ADMIN'].contains(user.role);
}

bool isTrainer(User user) {
  return user.role == 'TRAINER';
}

bool canManageMembers(User user) {
  return isAdmin(user) || isTrainer(user);
}
```

---

## 10. Sample API Calls

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

#### Get Members (with auth)
```bash
curl -X GET http://localhost:3001/members \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Create Member
```bash
curl -X POST http://localhost:3001/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
    "membershipPlanId": 1
  }'
```

#### Create Workout Template
```bash
curl -X POST http://localhost:3001/workout-templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Strength Template",
    "visibility": "PRIVATE",
    "chart_type": "STRENGTH",
    "difficulty_level": "INTERMEDIATE",
    "plan_type": "strength",
    "duration_days": 30,
    "exercises": [
      {
        "exercise_name": "Bench Press",
        "exercise_type": "sets_reps",
        "sets": 4,
        "reps": 10,
        "day_of_week": 1
      }
    ]
  }'
```

#### Get Notifications
```bash
curl -X GET http://localhost:3001/notifications/unread \
  -H "Authorization: Bearer <token>"
```

### Dart/Flutter Examples

#### API Client Setup

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  final String baseUrl = 'http://localhost:3001';
  String? accessToken;

  ApiClient({this.accessToken});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (accessToken != null) 'Authorization': 'Bearer $accessToken',
  };

  Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
    );
    return _handleResponse(response);
  }

  Future<dynamic> post(String endpoint, dynamic body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<dynamic> patch(String endpoint, dynamic body) async {
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'API Error');
    }
  }
}
```

#### Login Flow

```dart
class AuthService {
  final ApiClient apiClient;

  Future<String> login(String email, String password) async {
    final response = await apiClient.post('/auth/login', {
      'email': email,
      'password': password,
    });

    final token = response['access_token'];
    final userId = response['userid'];

    // Save to secure storage
    await SecureStorage.write(key: 'token', value: token);
    await SecureStorage.write(key: 'userId', value: userId);

    return token;
  }

  Future<void> logout() async {
    await apiClient.post('/auth/logout', {});
    await SecureStorage.delete(key: 'token');
    await SecureStorage.delete(key: 'userId');
  }
}
```

#### Fetch Member Dashboard

```dart
class MemberService {
  final ApiClient apiClient;

  Future<MemberDashboard> getDashboard(int memberId) async {
    final response = await apiClient.get('/members/$memberId/dashboard');
    return MemberDashboard.fromJson(response);
  }
}

class MemberDashboard {
  final MemberInfo member;
  final SubscriptionInfo? subscription;
  final AttendanceInfo attendance;
  final List<PaymentHistoryItem> paymentHistory;
  final int currentMonthClasses;
  final String membershipStatus;

  MemberDashboard.fromJson(Map<String, dynamic> json)
      : member = MemberInfo.fromJson(json['member']),
        subscription = json['subscription'] != null
            ? SubscriptionInfo.fromJson(json['subscription'])
            : null,
        attendance = AttendanceInfo.fromJson(json['attendance']),
        paymentHistory = (json['paymentHistory'] as List)
            .map((e) => PaymentHistoryItem.fromJson(e))
            .toList(),
        currentMonthClasses = json['currentMonthClasses'],
        membershipStatus = json['membershipStatus'];
}
```

#### Create Workout Template

```dart
class WorkoutService {
  final ApiClient apiClient;

  Future<String> createTemplate(CreateWorkoutTemplateRequest request) async {
    final response = await apiClient.post('/workout-templates', request.toJson());
    return response['template_id'];
  }

  Future<List<WorkoutTemplate>> getTemplates({
    int page = 1,
    int limit = 10,
    String? difficulty,
    String? planType,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (difficulty != null) 'difficulty_level': difficulty,
      if (planType != null) 'plan_type': planType,
    };

    final queryString = Uri(queryParameters: queryParams).query;
    final response = await apiClient.get('/workout-templates?$queryString');

    return (response['items'] as List)
        .map((e) => WorkoutTemplate.fromJson(e))
        .toList();
  }
}
```

#### Handle Notifications

```dart
class NotificationService {
  final ApiClient apiClient;

  Future<List<Notification>> getUnread() async {
    final response = await apiClient.get('/notifications/unread');
    return (response as List)
        .map((e) => Notification.fromJson(e))
        .toList();
  }

  Future<void> markAsRead(String notificationId) async {
    await apiClient.patch('/notifications/$notificationId/read', {});
  }

  Future<void> markAllAsRead() async {
    await apiClient.patch('/notifications/read-all', {});
  }
}
```
## Quick Reference
### Base URL
```
http://localhost:3001
```
### Auth Header Format
```
Authorization: Bearer <access_token>
```
### DateTime Format
```
2026-01-29T10:30:00.000Z
```
### UUID Format
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
### Amount Format (cents)
```
$49.99 → 4999
```
### Pagination Params
```
?page=1&limit=10
```
### Response Envelope (paginated)
```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
---
## Additional Resources
- **Swagger UI:** http://localhost:3001/api
- **API Version:** v1
- **Protocol:** REST over HTTP
- **Authentication:** JWT (Bearer token)
---
*Document generated: 2026-01-29*
*Backend: NestJS 11.0.1 + TypeORM + PostgreSQL*
