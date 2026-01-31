# Flutter Gym Management App - API Architecture Analysis

**Document Version:** 1.0  
**Date:** 2026-01-29  
**Analyzed API:** NestJS 11.0.1 + TypeORM + PostgreSQL  
**Base URL:** `http://localhost:3000`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [API Architecture Overview](#2-api-architecture-overview)
3. [Authentication & Authorization Design](#3-authentication--authorization-design)
4. [Resource Organization & Endpoint Structure](#4-resource-organization--endpoint-structure)
5. [Data Transfer Patterns](#5-data-transfer-patterns)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Real-time Features Analysis](#7-real-time-features-analysis)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Flutter Integration Architecture](#9-flutter-integration-architecture)
10. [Recommendations & Improvements](#10-recommendations--improvements)

---

## 1. Executive Summary

The Flutter Gym Management App API is a **RESTful architecture** built on **NestJS** with **TypeORM** for database interactions and **PostgreSQL** as the primary database. The API provides comprehensive functionality for managing gym operations including member management, trainer assignments, workout/diet planning, attendance tracking, and analytics.

### Key Strengths

- **Well-organized endpoint structure** following REST conventions
- **Clear role-based access control** with four distinct user roles
- **Comprehensive DTO examples** with detailed request/response schemas
- **Standardized error handling** following HTTP status code conventions
- **Currency handling in cents** prevents floating-point precision issues
- **ISO 8601 datetime formatting** ensures consistent date handling across timezones

### Areas for Consideration

- **No explicit API versioning** in URL paths (backwards compatibility maintained)
- **Polling-based notifications** instead of WebSocket connections
- **Mixed ID types** (UUID for entities, auto-increment integers for others)
- **Some endpoints lack pagination** in documentation examples

---

## 2. API Architecture Overview

### 2.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter Client                           │
│                  (Mobile Application)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS 11.0.1                             │
│              (Backend Framework)                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Controllers                      │    │
│  │  - AuthController    - MembersController            │    │
│  │  - TrainersController - GymsController              │    │
│  │  - ClassesController - AttendanceController         │    │
│  │  - ... (14+ controllers)                           │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Services                         │    │
│  │  (Business Logic Layer)                             │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   TypeORM                           │    │
│  │              (Data Access Layer)                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL                                │
│              (Primary Database)                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Communication Protocol

- **Protocol:** REST over HTTP/HTTPS
- **Data Format:** JSON
- **Authentication:** JWT (Bearer Token)
- **Base URL:** `http://localhost:3000`
- **No explicit versioning** - backwards compatibility through route prefix `/api`

### 2.3 Common Headers Pattern

```http
Content-Type: application/json
Authorization: Bearer <access_token>
Accept: application/json
```

---

## 3. Authentication & Authorization Design

### 3.1 JWT-Based Authentication Flow

```
┌──────────┐    POST /auth/login     ┌──────────────┐
│  Client  │ ─────────────────────▶  │   Backend    │
│          │                         │              │
│          │ ◀─────────────────────  │  Validates   │
│          │   { access_token,       │  credentials │
│          │     userid }            │              │
└──────────┘                         └──────────────┘
      │
      │ Store token securely
      ▼
┌──────────┐    API Requests        ┌──────────────┐
│  Client  │ ─────────────────────▶  │   Backend    │
│          │   Authorization:       │              │
│          │   Bearer <token>       │  Validates   │
│          │                         │  JWT token   │
│          │ ◀─────────────────────  │  Extracts    │
│          │   Response data        │  user info   │
└──────────┘                         └──────────────┘
```

### 3.2 Token Structure

The JWT token contains:
```json
{
  "user": "admin@example.com",
  "role": "ADMIN",
  "iat": 1736341600,
  "exp": 1736424000
}
```

- **Issuer:** NestJS Auth Service
- **Algorithm:** HS256
- **Expiration:** Configurable (default: 1 day)
- **Required Secret:** Minimum 32 characters

### 3.3 Environment Configuration

```env
JWT_SECRET="your-jwt-secret-key-min-32-chars"
JWT_EXPIRES_IN="1d"
PORT=3000
POSTGRES_URL="postgresql://user:password@host:5432/database"
```

---

## 4. Resource Organization & Endpoint Structure

### 4.1 API Endpoint Categories

#### Authentication Module
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | User authentication |
| POST | `/auth/logout` | JWT | Session termination |

#### User Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | JWT | Retrieve current user profile |
| PATCH | `/users/profile` | JWT | Update profile information |
| POST | `/users/change-password` | JWT | Password change |

#### Member Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/members` | ADMIN | Create new member |
| GET | `/members` | ADMIN | List all members (paginated) |
| GET | `/members/:id` | ADMIN | Get member details |
| GET | `/members/:id/dashboard` | JWT | Member dashboard data |
| PATCH | `/members/admin/:id` | ADMIN | Admin member update |
| PATCH | `/members/:id` | JWT | Self profile update |
| DELETE | `/members/:id` | ADMIN | Remove member |
| GET | `/branches/:branchId/members` | ADMIN | Filtered by branch |

#### Trainer Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/trainers` | ADMIN | Create trainer |
| GET | `/trainers` | ADMIN | List trainers |
| GET | `/trainers/:id` | ADMIN | Trainer details |
| PATCH | `/trainers/:id` | ADMIN | Update trainer |
| DELETE | `/trainers/:id` | ADMIN | Remove trainer |
| GET | `/branches/:branchId/trainers` | ADMIN | Filtered by branch |

#### Gym & Branch Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/gyms` | ADMIN | Create gym |
| GET | `/gyms` | ADMIN | List gyms |
| GET | `/gyms/:id` | ADMIN | Gym details |
| PATCH | `/gyms/:id` | ADMIN | Update gym |
| POST | `/gyms/:gymId/branches` | ADMIN | Create branch |
| GET | `/branches` | ADMIN | List branches |
| GET | `/branches/:id` | ADMIN | Branch details |
| PATCH | `/branches/:id` | ADMIN | Update branch |

#### Class Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/classes` | ADMIN | Create class |
| GET | `/classes` | ADMIN | List classes |
| GET | `/classes/:id` | ADMIN | Class details |
| PATCH | `/classes/:id` | ADMIN | Update class |
| DELETE | `/classes/:id` | ADMIN | Remove class |
| GET | `/branches/:branchId/classes` | ADMIN | Filtered by branch |
| GET | `/classes/upcoming` | JWT | Upcoming classes |

#### Attendance Tracking
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance` | JWT | Check in/out |
| PATCH | `/attendance/:id/checkout` | JWT | Check out |
| GET | `/attendance/member/:memberId` | ADMIN | Member attendance |
| GET | `/attendance/branch/:branchId/stats` | ADMIN | Branch statistics |
| GET | `/attendance/monthly-report` | ADMIN | Monthly report |

#### Subscription & Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/membership-plans` | ADMIN | Create plan |
| GET | `/membership-plans` | ADMIN | List plans |
| POST | `/subscriptions` | ADMIN | Create subscription |
| GET | `/subscriptions` | ADMIN | List subscriptions |
| GET | `/subscriptions/member/:memberId` | ADMIN | Member subscriptions |
| POST | `/subscriptions/:id/cancel` | ADMIN | Cancel subscription |
| POST | `/invoices` | ADMIN | Create invoice |
| GET | `/invoices` | ADMIN | List invoices |
| GET | `/invoices/member/:memberId` | ADMIN | Member invoices |
| POST | `/payments` | ADMIN | Process payment |
| GET | `/payments/member/:memberId` | ADMIN | Member payments |

#### Content Management (Workouts & Diets)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/workout-templates` | TRAINER, ADMIN | Create template |
| GET | `/workout-templates` | TRAINER, ADMIN | List templates |
| POST | `/workout-templates/:id/copy` | TRAINER, ADMIN | Duplicate template |
| POST | `/workout-templates/:id/share` | ADMIN | Share to trainer |
| POST | `/workout-templates/:id/accept` | TRAINER | Accept shared |
| POST | `/workout-templates/:id/rate` | ALL | Rate template |
| POST | `/workout-templates/:id/assign` | TRAINER, ADMIN | Assign to member |
| POST | `/diet-templates` | TRAINER, ADMIN | Create diet template |
| GET | `/diet-templates` | TRAINER, ADMIN | List diet templates |
| POST | `/diet-templates/:id/assign` | TRAINER, ADMIN | Assign diet |
| POST | `/diet-plan-assignments` | TRAINER, ADMIN | Assign diet plan |

#### Goals & Progress Tracking
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/goal-schedules` | TRAINER, ADMIN | Create goal schedule |
| POST | `/goal-schedules/from-template` | TRAINER, ADMIN | From template |
| GET | `/goal-schedules` | ALL | List schedules |
| POST | `/goal-schedules/:id/pause` | TRAINER, ADMIN | Pause progress |
| POST | `/goal-schedules/:id/resume` | TRAINER, ADMIN | Resume progress |
| POST | `/goal-schedules/:id/complete` | TRAINER, ADMIN | Mark complete |
| POST | `/goal-templates` | TRAINER, ADMIN | Create template |
| GET | `/goal-templates` | ALL | List templates |

#### Chart Assignments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chart-assignments` | ADMIN, TRAINER | Assign workout chart |
| GET | `/chart-assignments` | ALL | List assignments |
| POST | `/chart-assignments/:id/substitutions` | ALL | Record substitution |
| POST | `/chart-assignments/:id/exercise-completion` | ALL | Mark exercise complete |

#### Notifications & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | JWT | Get all notifications |
| GET | `/notifications/unread` | JWT | Get unread only |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| PATCH | `/notifications/read-all` | JWT | Mark all as read |
| GET | `/analytics/gym/:gymId/dashboard` | ADMIN | Gym analytics |
| GET | `/analytics/branch/:branchId/attendance` | ADMIN | Branch attendance |
| GET | `/analytics/member/:memberId/progress` | ADMIN | Member progress |

### 4.2 URL Structure Patterns

```
# Nested resource patterns
/branches/:branchId/members
/branches/:branchId/trainers
/branches/:branchId/classes
/gyms/:gymId/branches
/attendance/member/:memberId
/attendance/branch/:branchId
/subscriptions/member/:memberId
/invoices/member/:memberId
/payments/member/:memberId
/analytics/gym/:gymId/dashboard

# Sub-resource operations
/attendance/:id/checkout
/subscriptions/:id/cancel
/workout-templates/:id/copy
/workout-templates/:id/share
/workout-templates/:id/accept
/workout-templates/:id/rate
/workout-templates/:id/assign
/goal-schedules/:id/pause
/goal-schedules/:id/resume
/goal-schedules/:id/complete
/chart-assignments/:id/substitutions
/chart-assignments/:id/exercise-completion
/chart-assignments/:id/cancel
/diet-plan-assignments/:id/progress
/diet-plan-assignments/:id/substitute
/diet-plan-assignments/:id/cancel
```

---

## 5. Data Transfer Patterns

### 5.1 Pagination Strategy

The API uses a standardized pagination response envelope:

```json
{
  "items": [],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**Query Parameters:**
- `page` - Page number (1-based)
- `limit` - Items per page
- Additional filter parameters as needed

### 5.2 DateTime Handling

**ISO 8601 Format (UTC):**
```
Format:  YYYY-MM-DDTHH:mm:ss.sssZ
Example: 2026-01-29T10:30:00.000Z
```

**Date-only Fields:**
```
Format:  YYYY-MM-DD
Example: 2026-01-29
```

**Flutter Conversion:**
```dart
final DateTime dateTime = DateTime.parse('2026-01-29T10:30:00.000Z');
final String dateOnly = '2026-01-29';
final DateTime date = DateTime.parse(dateOnly);
```

### 5.3 Currency Handling

**All amounts stored in cents** to prevent floating-point precision issues:

```json
// ₹49.99
"amount": 4999

// Flutter conversion
final double rupees = cents / 100.0;
final int cents = (rupees * 100).round();
```

### 5.4 Identifier Types

| Entity Type | ID Format | Example |
|-------------|-----------|---------|
| Users, Gyms, Branches, Classes | UUID v4 | `a4a43bf7-e997-4716-839b-9f05a45f42be` |
| Members, Trainers, Subscriptions | Auto-increment Integer | `123`, `456` |
| Templates, Assignments | UUID v4 | `b5c67f8a-d9e1-4c7b-9f3a-1d2e4b5c6d7f` |

### 5.5 Enum Value Mapping

#### UserRole
| Value | Description | Flutter Enum |
|-------|-------------|--------------|
| `SUPERADMIN` | System-wide access | `UserRole.superadmin` |
| `ADMIN` | Gym owner/admin | `UserRole.admin` |
| `TRAINER` | Fitness trainer | `UserRole.trainer` |
| `MEMBER` | Gym member | `UserRole.member` |

#### Gender
| Value | Description |
|-------|-------------|
| `male` | Male |
| `female` | Female |
| `other` | Other |

#### ChartType
| Value | Description |
|-------|-------------|
| `STRENGTH` | Strength training |
| `CARDIO` | Cardiovascular |
| `HIIT` | High-intensity interval |
| `FLEXIBILITY` | Stretching/mobility |
| `COMPOUND` | Mixed compound exercises |

#### DifficultyLevel
| Value | Description |
|-------|-------------|
| `BEGINNER` | Beginner level |
| `INTERMEDIATE` | Intermediate level |
| `ADVANCED` | Advanced level |

#### PlanType
| Value | Description |
|-------|-------------|
| `strength` | Strength training |
| `cardio` | Cardiovascular |
| `flexibility` | Flexibility/mobility |
| `endurance` | Endurance training |
| `general` | General fitness |

#### MealType
| Value | Description |
|-------|-------------|
| `breakfast` | Breakfast meal |
| `lunch` | Lunch meal |
| `dinner` | Dinner meal |
| `snack` | Snack |
| `pre_workout` | Pre-workout meal |
| `post_workout` | Post-workout meal |

#### DietGoalType
| Value | Description |
|-------|-------------|
| `weight_loss` | Weight loss |
| `muscle_gain` | Muscle gain |
| `maintenance` | Maintenance |
| `cutting` | Cutting phase |
| `bulking` | Bulking phase |
| `custom` | Custom goals |

#### GoalPriority
| Value | Description |
|-------|-------------|
| `high` | High priority |
| `medium` | Medium priority |
| `low` | Low priority |

#### ScheduleType
| Value | Description |
|-------|-------------|
| `weekly` | Weekly schedule |
| `monthly` | Monthly schedule |
| `quarterly` | Quarterly schedule |

#### ScheduleStatus
| Value | Description |
|-------|-------------|
| `active` | Currently active |
| `completed` | Completed |
| `cancelled` | Cancelled |
| `paused` | Temporarily paused |

#### EquipmentRequired
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

#### NotificationType
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

## 6. Error Handling Strategy

### 6.1 Standard Error Response Format

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 6.2 HTTP Status Code Usage

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry or conflict |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### 6.3 Validation Error Details

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

### 6.4 Forbidden Access Response

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN, TRAINER",
  "error": "Forbidden"
}
```

### 6.5 Flutter Error Handling Pattern

```dart
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, dynamic>? details;

  ApiException(this.statusCode, this.message, {this.details});

  factory ApiException.fromResponse(Map<String, dynamic> response) {
    return ApiException(
      response['statusCode'],
      response['message'],
      details: response['details'],
    );
  }

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 400;
}

// Usage in API client
dynamic _handleResponse(http.Response response) {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  } else {
    final error = jsonDecode(response.body);
    throw ApiException.fromResponse(error);
  }
}
```

---

## 7. Real-time Features Analysis

### 7.1 Current Implementation: Polling

The API currently uses **polling-based notifications** instead of WebSocket connections.

**Recommended Poll Interval:** 30-60 seconds

### 7.2 Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get all notifications |
| GET | `/notifications/unread` | Get unread notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### 7.3 Notification Response Format

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

### 7.4 Flutter Polling Implementation

```dart
class NotificationService {
  Timer? _pollingTimer;
  final ApiClient apiClient;

  NotificationService({required this.apiClient});

  void startPolling({Duration interval = const Duration(seconds: 30)}) {
    _pollingTimer = Timer.periodic(
      interval,
      (_) => fetchNotifications(),
    );
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<List<Notification>> fetchNotifications() async {
    try {
      final response = await apiClient.get('/notifications/unread');
      return (response as List)
          .map((e) => Notification.fromJson(e))
          .toList();
    } catch (e) {
      print('Failed to fetch notifications: $e');
      return [];
    }
  }

  Future<void> markAsRead(String notificationId) async {
    await apiClient.patch('/notifications/$notificationId/read', {});
  }

  Future<void> markAllAsRead() async {
    await apiClient.patch('/notifications/read-all', {});
  }
}
```

### 7.5 Future Enhancement: WebSocket Support

The documentation notes that **WebSocket support is planned for future**. This would enable:
- Real-time notifications without polling
- Live attendance updates
- Instant workout/diet assignment alerts
- Reduced battery consumption on mobile devices

---

## 8. Role-Based Access Control

### 8.1 Role Hierarchy

```
SUPERADMIN (Level 4)
   │
   ├── ADMIN (Level 3) - Gym Owner
   │       │
   │       ├── TRAINER (Level 2)
   │       │       │
   │       │       └── MEMBER (Level 1)
   │       │
   │       └── TRAINER can manage assigned members
   │
   └── ADMIN manages all resources in gym
```

### 8.2 Permission Matrix

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

### 8.3 Flutter Role Checking Utilities

```dart
enum UserRole { superadmin, admin, trainer, member }

class User {
  final String userid;
  final String email;
  final String role;
  final int? trainerId;
  final int? memberId;
  final String? gymId;

  User({
    required this.userid,
    required this.email,
    required this.role,
    this.trainerId,
    this.memberId,
    this.gymId,
  });

  UserRole get roleEnum => UserRole.values.firstWhere(
        (e) => e.name.toUpperCase() == role.toUpperCase(),
      );

  bool get isSuperadmin => roleEnum == UserRole.superadmin;
  bool get isAdmin => roleEnum == UserRole.admin;
  bool get isTrainer => roleEnum == UserRole.trainer;
  bool get isMember => roleEnum == UserRole.member;

  bool get canManageAllGyms => isSuperadmin;
  bool get canManageMembers => isSuperadmin || isAdmin || isTrainer;
  bool get canCreateTemplates => isSuperadmin || isAdmin || isTrainer;
  bool get canAssignTemplates => isSuperadmin || isAdmin || isTrainer;
  bool get canViewAnalytics => isSuperadmin || isAdmin;
  bool get canManagePayments => isSuperadmin || isAdmin;
}

// Role hierarchy check
bool hasHigherOrEqualRole(UserRole required, UserRole actual) {
  const hierarchy = [
    UserRole.superadmin,
    UserRole.admin,
    UserRole.trainer,
    UserRole.member,
  ];
  return hierarchy.indexOf(actual) <= hierarchy.indexOf(required);
}
```

### 8.4 Protected Endpoint Examples

```dart
// Flutter interceptor for role-based access
class RoleGuardInterceptor extends Interceptor {
  final User currentUser;
  final Map<String, List<UserRole>> protectedEndpoints = {
    '/members': [UserRole.admin],
    '/members/:id': [UserRole.admin],
    '/members/:id/dashboard': [UserRole.admin, UserRole.member],
    '/trainers': [UserRole.admin],
    '/workout-templates': [UserRole.admin, UserRole.trainer],
    '/goal-schedules': [UserRole.superadmin, UserRole.admin, UserRole.trainer, UserRole.member],
    '/analytics/gym/:gymId/dashboard': [UserRole.admin],
  };

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final endpoint = options.path;
    final method = options.method.toUpperCase();

    // Check if endpoint is protected
    for (final entry in protectedEndpoints.entries) {
      if (matchesPattern(entry.key, endpoint)) {
        final allowedRoles = entry.value;
        if (!allowedRoles.any(currentUser.hasRole)) {
          throw ApiException(
            403,
            'Access denied. Required roles: ${allowedRoles.join(", ")}',
          );
        }
        break;
      }
    }

    super.onRequest(options, handler);
  }
}
```

---

## 9. Flutter Integration Architecture

### 9.1 Recommended Project Structure

```
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart
│   │   ├── api_config.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── error_interceptor.dart
│   ├── auth/
│   │   ├── auth_service.dart
│   │   ├── auth_provider.dart
│   │   └── auth_state.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── member.dart
│   │   └── ...
│   ├── utils/
│   │   ├── date_formatter.dart
│   │   ├── currency_formatter.dart
│   │   └── validators.dart
│   └── constants/
│       └── enums.dart
├── features/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── logout_screen.dart
│   │   └── auth_cubit.dart
│   ├── members/
│   │   ├── members_repository.dart
│   │   ├── members_cubit.dart
│   │   └── members_screen.dart
│   ├── workouts/
│   │   ├── workout_templates_repository.dart
│   │   ├── workout_service.dart
│   │   └── ...
│   ├── diet/
│   │   ├── diet_templates_repository.dart
│   │   └── ...
│   ├── attendance/
│   │   ├── attendance_repository.dart
│   │   └── ...
│   ├── analytics/
│   │   ├── analytics_repository.dart
│   │   └── ...
│   └── notifications/
│       ├── notification_service.dart
│       └── notification_cubit.dart
├── shared/
│   ├── components/
│   │   ├── loading_indicator.dart
│   │   └── error_display.dart
│   └── widgets/
│       └── ...
└── main.dart
```

### 9.2 API Client Implementation

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  final String baseUrl;
  String? accessToken;

  ApiClient({
    this.baseUrl = 'http://localhost:3000',
    this.accessToken,
  });

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      };

  Future<dynamic> get(String endpoint, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('$baseUrl$endpoint').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
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

  Future<dynamic> delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
    );
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw ApiException(
        response.statusCode,
        error['message'] ?? 'API Error',
        details: error['details'],
      );
    }
  }

  void setToken(String token) {
    accessToken = token;
  }

  void clearToken() {
    accessToken = null;
  }
}
```

### 9.3 Authentication Service

```dart
class AuthService {
  final ApiClient apiClient;

  AuthService({required this.apiClient});

  Future<LoginResponse> login(String email, String password) async {
    final response = await apiClient.post('/auth/login', {
      'email': email,
      'password': password,
    });

    return LoginResponse.fromJson(response);
  }

  Future<void> logout() async {
    await apiClient.post('/auth/logout', {});
  }

  Future<User> getCurrentUser() async {
    final response = await apiClient.get('/users/profile');
    return User.fromJson(response);
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    await apiClient.patch('/users/profile', updates);
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await apiClient.post('/users/change-password', {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }
}

class LoginResponse {
  final String userid;
  final String accessToken;

  LoginResponse({required this.userid, required this.accessToken});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      userid: json['userid'],
      accessToken: json['access_token'],
    );
  }
}
```

### 9.4 Repository Pattern for Members

```dart
abstract class MembersRepository {
  Future<PaginatedResponse<Member>> getMembers({
    int page = 1,
    int limit = 10,
    String? branchId,
  });

  Future<Member> getMember(int memberId);
  Future<MemberDashboard> getMemberDashboard(int memberId);
  Future<Member> createMember(CreateMemberRequest request);
  Future<Member> updateMember(int memberId, Map<String, dynamic> updates);
  Future<void> deleteMember(int memberId);
}

class MembersRepositoryImpl implements MembersRepository {
  final ApiClient apiClient;

  MembersRepositoryImpl({required this.apiClient});

  @override
  Future<PaginatedResponse<Member>> getMembers({
    int page = 1,
    int limit = 10,
    String? branchId,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (branchId != null) 'branchId': branchId,
    };

    final response = await apiClient.get('/members', queryParams: queryParams);
    return PaginatedResponse.fromJson(
      response,
      (item) => Member.fromJson(item),
    );
  }

  @override
  Future<Member> getMember(int memberId) async {
    final response = await apiClient.get('/members/$memberId');
    return Member.fromJson(response);
  }

  @override
  Future<MemberDashboard> getMemberDashboard(int memberId) async {
    final response = await apiClient.get('/members/$memberId/dashboard');
    return MemberDashboard.fromJson(response);
  }

  @override
  Future<Member> createMember(CreateMemberRequest request) async {
    final response = await apiClient.post('/members', request.toJson());
    // Handle creation response
    return Member.fromJson(response);
  }

  @override
  Future<Member> updateMember(int memberId, Map<String, dynamic> updates) async {
    final response = await apiClient.patch('/members/admin/$memberId', updates);
    return Member.fromJson(response);
  }

  @override
  Future<void> deleteMember(int memberId) async {
    await apiClient.delete('/members/$memberId');
  }
}

class PaginatedResponse<T> {
  final List<T> items;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginatedResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    return PaginatedResponse(
      items: (json['items'] as List)
          .map((item) => fromJson(item))
          .toList(),
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      totalPages: json['totalPages'],
    );
  }
}
```

### 9.5 Workout Templates Service

```dart
class WorkoutService {
  final ApiClient apiClient;

  WorkoutService({required this.apiClient});

  Future<WorkoutTemplate> createTemplate(CreateWorkoutTemplateRequest request) async {
    final response = await apiClient.post('/workout-templates', request.toJson());
    return WorkoutTemplate.fromJson(response);
  }

  Future<PaginatedResponse<WorkoutTemplate>> getTemplates({
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

    final response = await apiClient.get('/workout-templates', queryParams: queryParams);
    return PaginatedResponse.fromJson(
      response,
      (item) => WorkoutTemplate.fromJson(item),
    );
  }

  Future<WorkoutTemplate> getTemplate(String templateId) async {
    final response = await apiClient.get('/workout-templates/$templateId');
    return WorkoutTemplate.fromJson(response);
  }

  Future<String> copyTemplate(String templateId) async {
    final response = await apiClient.post('/workout-templates/$templateId/copy', {});
    return response['template_id'];
  }

  Future<void> shareTemplate(String templateId, int trainerId) async {
    await apiClient.post('/workout-templates/$templateId/share', {
      'trainerId': trainerId,
    });
  }

  Future<void> rateTemplate(String templateId, int rating) async {
    await apiClient.post('/workout-templates/$templateId/rate', {
      'rating': rating,
    });
  }

  Future<void> assignTemplate(String templateId, int memberId) async {
    await apiClient.post('/workout-templates/$templateId/assign', {
      'memberId': memberId,
    });
  }
}
```

### 9.6 Attendance Service

```dart
class AttendanceService {
  final ApiClient apiClient;

  AttendanceService({required this.apiClient});

  Future<AttendanceRecord> checkIn() async {
    final response = await apiClient.post('/attendance', {
      'action': 'check_in',
      'timestamp': DateTime.now().toIso8601String(),
    });
    return AttendanceRecord.fromJson(response);
  }

  Future<AttendanceRecord> checkOut(int attendanceId) async {
    final response = await apiClient.patch('/attendance/$attendanceId/checkout', {
      'timestamp': DateTime.now().toIso8601String(),
    });
    return AttendanceRecord.fromJson(response);
  }

  Future<List<AttendanceRecord>> getMemberAttendance(int memberId) async {
    final response = await apiClient.get('/attendance/member/$memberId');
    return (response as List)
        .map((item) => AttendanceRecord.fromJson(item))
        .toList();
  }

  Future<BranchAttendanceStats> getBranchStats(String branchId) async {
    final response = await apiClient.get('/attendance/branch/$branchId/stats');
    return BranchAttendanceStats.fromJson(response);
  }

  Future<MonthlyReport> getMonthlyReport(int year, int month) async {
    final response = await apiClient.get('/attendance/monthly-report', queryParams: {
      'year': year.toString(),
      'month': month.toString(),
    });
    return MonthlyReport.fromJson(response);
  }
}
```

### 9.7 Notification Service with Polling

```dart
class NotificationService {
  final ApiClient apiClient;
  Timer? _pollingTimer;
  final List<NotificationListener> _listeners = [];

  NotificationService({required this.apiClient});

  void addListener(NotificationListener listener) {
    _listeners.add(listener);
  }

  void removeListener(NotificationListener listener) {
    _listeners.remove(listener);
  }

  void startPolling({Duration interval = const Duration(seconds: 30)}) {
    stopPolling(); // Stop any existing timer
    _pollingTimer = Timer.periodic(
      interval,
      (_) => _fetchAndNotify(),
    );
    _fetchAndNotify(); // Immediate fetch
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> _fetchAndNotify() async {
    try {
      final notifications = await getUnread();
      for (final listener in _listeners) {
        listener.onNotificationsUpdated(notifications);
      }
    } catch (e) {
      print('Failed to fetch notifications: $e');
    }
  }

  Future<List<Notification>> getUnread() async {
    final response = await apiClient.get('/notifications/unread');
    return (response as List)
        .map((e) => Notification.fromJson(e))
        .toList();
  }

  Future<void> markAsRead(String notificationId) async {
    await apiClient.patch('/notifications/$notificationId/read', {});
    _fetchAndNotify();
  }

  Future<void> markAllAsRead() async {
    await apiClient.patch('/notifications/read-all', {});
    _fetchAndNotify();
  }
}

abstract class NotificationListener {
  void onNotificationsUpdated(List<Notification> notifications);
}
```

### 9.8 Data Model Examples

```dart
enum Gender { male, female, other }

class Member {
  final int id;
  final String fullName;
  final String email;
  final String phone;
  final bool isActive;
  final bool freezeMember;
  final Branch? branch;
  final DateTime createdAt;

  Member({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.isActive,
    required this.freezeMember,
    this.branch,
    required this.createdAt,
  });

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'],
      fullName: json['fullName'],
      email: json['email'],
      phone: json['phone'],
      isActive: json['isActive'],
      freezeMember: json['freezeMember'],
      branch: json['branch'] != null ? Branch.fromJson(json['branch']) : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class Branch {
  final String branchId;
  final String name;

  Branch({required this.branchId, required this.name});

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      branchId: json['branchId'],
      name: json['name'],
    );
  }
}

class WorkoutTemplate {
  final String templateId;
  final String title;
  final String description;
  final String visibility;
  final String chartType;
  final String difficultyLevel;
  final String planType;
  final int durationDays;
  final bool isSharedGym;
  final String? notes;
  final List<String> tags;
  final List<WorkoutExercise> exercises;

  WorkoutTemplate({
    required this.templateId,
    required this.title,
    required this.description,
    required this.visibility,
    required this.chartType,
    required this.difficultyLevel,
    required this.planType,
    required this.durationDays,
    required this.isSharedGym,
    this.notes,
    this.tags = const [],
    this.exercises = const [],
  });

  factory WorkoutTemplate.fromJson(Map<String, dynamic> json) {
    return WorkoutTemplate(
      templateId: json['template_id'] ?? json['id'],
      title: json['title'],
      description: json['description'],
      visibility: json['visibility'],
      chartType: json['chart_type'],
      difficultyLevel: json['difficulty_level'],
      planType: json['plan_type'],
      durationDays: json['duration_days'],
      isSharedGym: json['is_shared_gym'] ?? false,
      notes: json['notes'],
      tags: List<String>.from(json['tags'] ?? []),
      exercises: (json['exercises'] as List?)
              ?.map((e) => WorkoutExercise.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class WorkoutExercise {
  final String exerciseName;
  final String description;
  final String exerciseType;
  final String equipmentRequired;
  final int? sets;
  final int? reps;
  final double? weightKg;
  final int? durationMinutes;
  final int dayOfWeek;
  final int orderIndex;
  final String? instructions;
  final List<String> alternatives;
  final bool memberCanSkip;

  WorkoutExercise({
    required this.exerciseName,
    required this.description,
    required this.exerciseType,
    required this.equipmentRequired,
    this.sets,
    this.reps,
    this.weightKg,
    this.durationMinutes,
    required this.dayOfWeek,
    required this.orderIndex,
    this.instructions,
    this.alternatives = const [],
    this.memberCanSkip = false,
  });

  factory WorkoutExercise.fromJson(Map<String, dynamic> json) {
    return WorkoutExercise(
      exerciseName: json['exercise_name'],
      description: json['description'],
      exerciseType: json['exercise_type'],
      equipmentRequired: json['equipment_required'],
      sets: json['sets'],
      reps: json['reps'],
      weightKg: json['weight_kg']?.toDouble(),
      durationMinutes: json['duration_minutes'],
      dayOfWeek: json['day_of_week'],
      orderIndex: json['order_index'],
      instructions: json['instructions'],
      alternatives: List<String>.from(json['alternatives'] ?? []),
      memberCanSkip: json['member_can_skip'] ?? false,
    );
  }
}

class Notification {
  final String notificationId;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  Notification({
    required this.notificationId,
    required this.type,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
    this.metadata,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      notificationId: json['notification_id'],
      type: json['type'],
      title: json['title'],
      message: json['message'],
      isRead: json['is_read'],
      createdAt: DateTime.parse(json['created_at']),
      metadata: json['metadata'],
    );
  }
}
```

---

## 10. Recommendations & Improvements

### 10.1 API Versioning

**Current:** No explicit versioning (backwards compatibility maintained)  
**Recommendation:** Add explicit versioning for better long-term maintainability

```
Current:  http://localhost:3000/members
Proposed: http://localhost:3000/api/v1/members
```

### 10.2 Real-time Notifications

**Current:** Polling-based (30-60 second intervals)  
**Recommendation:** Implement WebSocket connections for:
- Instant notifications
- Reduced battery consumption
- Live attendance updates

```dart
// Future enhancement: WebSocket service
class WebSocketService {
  WebSocketChannel? _channel;
  final String baseUrl;

  WebSocketService({required this.baseUrl});

  void connect(String token) {
    _channel = WebSocketChannel.connect(
      Uri.parse('$baseUrl?token=$token'),
    );
    _channel!.stream.listen(
      (message) => _handleMessage(jsonDecode(message)),
      onError: (error) => _handleError(error),
      onDone: _handleDisconnect,
    );
  }

  void disconnect() {
    _channel?.sink.close();
  }
}
```

### 10.3 Consistent ID Types

**Current:** Mixed UUID and auto-increment integers  
**Recommendation:** Standardize on UUID v4 for all entity identifiers

### 10.4 HATEOAS Support

**Current:** Basic REST without hypermedia links  
**Recommendation:** Add hypermedia links for discoverability

```json
{
  "id": 123,
  "fullName": "Alice Johnson",
  "_links": {
    "self": "/members/123",
    "dashboard": "/members/123/dashboard",
    "attendance": "/attendance/member/123"
  }
}
```

### 10.5 Rate Limiting Documentation

**Current:** Not documented  
**Recommendation:** Document rate limits and retry-after headers

### 10.6 Bulk Operations

**Current:** Single-item operations only  
**Recommendation:** Add bulk endpoints for efficiency

```
POST /members/bulk
PATCH /members/bulk
DELETE /members/bulk
```

### 10.7 Query Parameter Standardization

**Current:** Inconsistent parameter names  
**Recommendation:** Standardize naming conventions

```dart
// Current inconsistent examples:
'difficulty_level'  // snake_case
'plan_type'         // snake_case
'chart_type'        // snake_code
'memberId'          // camelCase

// Recommended: Consistent snake_case
'difficulty_level'
'plan_type'
'chart_type'
'member_id'
```

### 10.8 Field Filtering

**Current:** Full object responses  
**Recommendation:** Add field selection and expansion

```
GET /members?fields=id,fullName,email
GET /members?expand=branch,subscription
```

### 10.9 GraphQL Consideration

For complex querying needs, consider adding GraphQL endpoint:

```
POST /graphql
```

This would allow:
- Flexible data fetching
- Reduced over-fetching
- Better mobile bandwidth usage

### 10.10 API Documentation Tools

**Current:** Markdown documentation  
**Recommendation:** Implement OpenAPI/Swagger for:
- Interactive API exploration
- Request/response validation
- Auto-generated client SDKs
- Automated testing

---

## Summary

This API provides a solid foundation for building a comprehensive Flutter Gym Management App. The architecture follows RESTful conventions with clear role-based access control, consistent error handling, and well-documented endpoints. Key areas for future enhancement include real-time WebSocket notifications, explicit API versioning, and standardized ID types.

The API is well-suited for:
- Multi-gym franchise management
- Trainer-member assignment workflows
- Workout and diet template management
- Attendance tracking and reporting
- Subscription and payment processing

For Flutter integration, the repository pattern with dependency injection provides a clean architecture that separates concerns and facilitates testing. The polling-based notification system should be sufficient for initial release, with WebSocket support planned for future enhancement.
