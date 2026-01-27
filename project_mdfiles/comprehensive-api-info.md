# Gym Management API - Comprehensive Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Public Endpoints](#public-endpoints)
4. [API Endpoints by Module](#api-endpoints-by-module)
   - [Auth](#1-auth-module)
   - [Users](#2-users-module)
   - [Gyms](#3-gyms-module)
   - [Branches](#4-branches-module)
   - [Members](#5-members-module)
   - [Trainers](#6-trainers-module)
   - [Classes](#7-classes-module)
   - [Membership Plans](#8-membership-plans-module)
   - [Subscriptions](#9-subscriptions-module)
   - [Attendance](#10-attendance-module)
   - [Assignments](#11-assignments-module)
   - [Inquiries](#12-inquiries-module)
   - [Invoices](#13-invoices-module)
   - [Payments](#14-payments-module)
   - [Analytics](#15-analytics-module)
   - [Diet Plans](#16-diet-plans-module)
   - [Workouts](#17-workouts-module)
   - [Workout Logs](#18-workout-logs-module)
   - [Body Progress](#19-body-progress-module)
   - [Progress Tracking](#20-progress-tracking-module)
   - [Goals](#21-goals-module)
   - [Roles](#22-roles-module)
   - [Audit Logs](#23-audit-logs-module)
5. [Role-Based Access](#role-based-access)
6. [ID Types Reference](#id-types-reference)
7. [Common Response Formats](#common-response-formats)
8. [Flutter Integration Guide](#flutter-integration-guide)
9. [Flutter URL Constants Comparison](#flutter-url-constants-comparison)

---

## Introduction

This API powers a multi-tenant gym management system with role-based access control for:
- **Superadmin**: System-wide access (web panel)
- **Admin/Gym Owner**: Gym and branch management
- **Trainer**: Member training and fitness tracking
- **Member**: Personal fitness and subscription management

### Base URL

```
http://localhost:3001
```

### Content Type

All requests and responses use JSON:
```
Content-Type: application/json
```

---

## Authentication

All protected endpoints require JWT Bearer token authentication.

### Authorization Header

```
Authorization: Bearer <access_token>
```

### User Roles

| Role | Description |
|------|-------------|
| `SUPERADMIN` | System-wide access (web panel) |
| `ADMIN` | Gym/branch level administration |
| `TRAINER` | Trainer access to assigned members |
| `MEMBER` | Personal fitness and subscription access |

---

## Public Endpoints

These endpoints do NOT require authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/inquiries` | Submit lead/inquiry (public) |

---

## API Endpoints by Module

### 1. Auth Module

**Base Path:** `/auth`

#### POST /auth/login
```json
// Request Body
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "userid": 1,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
```json
// Request Body (empty)

// Response (200 OK)
{
  "message": "User logged out successfully"
}
```

---

### 2. Users Module

**Base Path:** `/users`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users` | Get all users |
| GET | `/users/profile` | Get current user profile |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

#### POST /users
```json
// Request Body
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "roleId": "uuid-of-role"
}
```

---

### 3. Gyms Module

**Base Path:** `/gyms`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/gyms` | Create a new gym |
| GET | `/gyms` | Get all gyms |
| GET | `/gyms/:id` | Get gym by ID with branches |
| PATCH | `/gyms/:id` | Update gym |
| DELETE | `/gyms/:id` | Delete gym |
| POST | `/gyms/:gymId/branches` | Create branch for gym |
| GET | `/gyms/:gymId/branches` | Get all branches for gym |
| GET | `/gyms/:gymId/members` | Get all members for gym |
| GET | `/gyms/:gymId/trainers` | Get all trainers for gym |

#### POST /gyms
```json
// Request Body
{
  "name": "Fitness First Elite",
  "email": "contact@fitnessfirst.com",
  "phone": "+1-555-0100",
  "address": "123 Main Street",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90001",
  "country": "USA",
  "location": {
    "type": "Point",
    "coordinates": [-118.2437, 34.0522]
  }
}
```

#### POST /gyms/:gymId/branches
```json
// Request Body
{
  "name": "Santa Monica Branch",
  "email": "santa-monica@fitnessfirst.com",
  "phone": "+1-555-0200",
  "address": "456 Ocean Ave",
  "city": "Santa Monica",
  "state": "CA",
  "postalCode": "90401"
}
```

---

### 4. Branches Module

**Base Path:** `/branches`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/branches` | Get all branches |
| GET | `/branches/:id` | Get branch by ID |
| PATCH | `/branches/:id` | Update branch |
| DELETE | `/branches/:id` | Delete branch |
| GET | `/branches/:branchId/trainers` | Get trainers for branch |

**Note:** Branch IDs are UUIDs (e.g., `a4a43bf7-e997-4716-839b-9f05a45f42be`)

---

### 5. Members Module

**Base Path:** `/members`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/members` | Create member with subscription & classes |
| GET | `/members` | Get all members (filter: branchId, status, search) |
| GET | `/members/:id` | Get member by ID |
| PATCH | `/members/:id` | Update member |
| PATCH | `/members/admin/:id` | Admin update (sensitive fields) |
| DELETE | `/members/:id` | Delete member |
| GET | `/members/:memberId/dashboard` | Get member dashboard |
| GET | `/branches/:branchId/members` | Get members for branch |

**Note:** Member IDs are auto-increment integers (e.g., `1`, `106`)

#### POST /members
```json
// Request Body
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

#### GET /members/:id Response Example
```json
{
  "id": 106,
  "fullName": "James Scott-Green",
  "email": "james.scott-green@example.com",
  "phone": "+1-555-987-6543",
  "isActive": true,
  "branch": {
    "id": "a4a43bf7-e997-4716-839b-9f05a45f42be",
    "name": "Santa Monica"
  },
  "subscription": {
    "id": 106,
    "membershipPlanId": 1,
    "startDate": "2025-01-15",
    "endDate": "2025-04-15",
    "isActive": true,
    "selectedClassIds": [
      "388d0fbf-76f4-486c-ae11-bd1878196911",
      "1620a486-a9a2-47e1-bee9-f782923d154d"
    ]
  },
  "classes": [
    {
      "classId": "388d0fbf-76f4-486c-ae11-bd1878196911",
      "name": "Elite Morning Yoga",
      "description": "Premium yoga session",
      "timings": "morning",
      "recurrenceType": "weekly",
      "daysOfWeek": [1, 3, 5]
    }
  ]
}
```

---

### 6. Trainers Module

**Base Path:** `/trainers`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trainers` | Create a new trainer |
| GET | `/trainers` | Get all trainers |
| GET | `/trainers/:id` | Get trainer by ID |
| PATCH | `/trainers/:id` | Update trainer |
| DELETE | `/trainers/:id` | Delete trainer |
| GET | `/branches/:branchId/trainers` | Get trainers for branch |

**Note:** Trainer IDs are auto-increment integers.

#### POST /trainers
```json
// Request Body
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1-555-111-2222",
  "specialization": "HIIT",
  "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be"
}
```

---

### 7. Classes Module

**Base Path:** `/classes`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classes` | Create class with scheduling |
| GET | `/classes` | Get all classes |
| GET | `/classes/:id` | Get class by ID |
| PATCH | `/classes/:id` | Update class |
| DELETE | `/classes/:id` | Delete class |
| GET | `/branches/:branchId/classes` | Get classes for branch |
| GET | `/gyms/:gymId/classes` | Get classes for gym |

**Note:** Class IDs are UUIDs.

#### POST /classes
```json
// Request Body
{
  "name": "HIIT Elite Performance",
  "description": "High-intensity interval training",
  "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
  "trainerId": 1,
  "timings": "evening",
  "recurrenceType": "weekly",
  "daysOfWeek": [2, 4],
  "startTime": "18:00",
  "durationMinutes": 60,
  "maxParticipants": 20,
  "isActive": true
}
```

---

### 8. Membership Plans Module

**Base Path:** `/membership-plans`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/membership-plans` | Create membership plan |
| GET | `/membership-plans` | Get all plans |
| GET | `/membership-plans/:id` | Get plan by ID |
| PATCH | `/membership-plans/:id` | Update plan |
| DELETE | `/membership-plans/:id` | Delete plan |
| GET | `/branches/:branchId/membership-plans` | Get plans for branch |
| GET | `/gyms/:gymId/membership-plans` | Get plans for gym |

**Note:** Membership Plan IDs are auto-increment integers.

#### POST /membership-plans
```json
// Request Body
{
  "name": "Premium Monthly",
  "description": "Full access membership",
  "price": 99.99,
  "durationInDays": 30,
  "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
  "isActive": true
}
```

---

### 9. Subscriptions Module

**Base Path:** `/subscriptions`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscriptions` | Create membership subscription |
| GET | `/subscriptions` | Get all subscriptions |
| GET | `/subscriptions/:id` | Get subscription by ID |
| PATCH | `/subscriptions/:id` | Update subscription |
| DELETE | `/subscriptions/:id` | Delete subscription |
| POST | `/subscriptions/:id/cancel` | Cancel subscription |
| GET | `/members/:memberId/subscription` | Get member's subscription |

**Note:** Subscription IDs are auto-increment integers.

#### PATCH /subscriptions/:id
```json
// Request Body
{
  "isActive": true,
  "selectedClassIds": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

---

### 10. Attendance Module

**Base Path:** `/attendance`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attendance` | Mark attendance (check-in) |
| PATCH | `/attendance/:id/checkout` | Check out |
| GET | `/attendance` | Get all attendance records |
| GET | `/attendance/:id` | Get attendance record by ID |
| GET | `/members/:memberId/attendance` | Get member attendance |
| GET | `/trainers/:trainerId/attendance` | Get trainer attendance |
| GET | `/branches/:branchId/attendance` | Get branch attendance |

**Note:** Attendance IDs are UUIDs.

#### POST /attendance
```json
// Request Body
{
  "attendanceType": "member",
  "memberId": 106,
  "checkInTime": "2025-01-26T09:00:00Z"
}
```

---

### 11. Assignments Module

**Base Path:** `/assignments`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assignments` | Assign member to trainer |
| GET | `/assignments` | Get all assignments |
| GET | `/assignments/:id` | Get assignment by ID |
| DELETE | `/assignments/:id` | Delete assignment |
| GET | `/members/:memberId/assignments` | Get member assignments |
| GET | `/trainers/:trainerId/members` | Get trainer's members |

**Note:** Assignment IDs are UUIDs.

#### POST /assignments
```json
// Request Body
{
  "memberId": 106,
  "trainerId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "status": "active"
}
```

---

### 12. Inquiries Module (Leads)

**Base Path:** `/inquiries`
**Auth Required:** Mixed (see below)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/inquiries` | Create inquiry | **Public** |
| GET | `/inquiries` | Get all inquiries | Required |
| GET | `/inquiries/pending` | Get pending inquiries | Required |
| GET | `/inquiries/stats` | Get inquiry statistics | Required |
| GET | `/inquiries/:id` | Get inquiry by ID | Required |
| GET | `/inquiries/email/:email` | Find by email | Required |
| PATCH | `/inquiries/:id` | Update inquiry | Required |
| PATCH | `/inquiries/:id/status` | Update status | Required |
| POST | `/inquiries/:id/convert` | Convert to member | Required |
| DELETE | `/inquiries/:id` | Delete inquiry | Required |

#### POST /inquiries (Public)
```json
// Request Body
{
  "fullName": "Potential Member",
  "email": "potential@example.com",
  "phone": "+1-555-000-1111",
  "interestedPlanId": 1,
  "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
  "message": "I'm interested in joining"
}
```

---

### 13. Invoices Module

**Base Path:** `/invoices`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invoices` | Create invoice |
| GET | `/invoices` | Get all invoices |
| GET | `/invoices/:id` | Get invoice by ID |
| PATCH | `/invoices/:id` | Update invoice |
| POST | `/invoices/:id/cancel` | Cancel invoice |
| GET | `/members/:memberId/invoices` | Get member invoices |

**Note:** Invoice IDs are UUIDs.

#### POST /invoices
```json
// Request Body
{
  "memberId": 106,
  "invoiceDate": "2025-01-26",
  "dueDate": "2025-02-26",
  "items": [
    {
      "description": "Monthly Membership",
      "quantity": 1,
      "unitPrice": 99.99
    }
  ]
}
```

---

### 14. Payments Module

**Base Path:** `/payments`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Record payment |
| GET | `/payments` | Get all payments |
| GET | `/payments/:id` | Get payment by ID |
| GET | `/invoices/:invoiceId/payments` | Get invoice payments |
| GET | `/members/:memberId/payments` | Get member payment history |

**Note:** Payment IDs are UUIDs.

#### POST /payments
```json
// Request Body
{
  "invoiceId": "uuid-of-invoice",
  "amount": 99.99,
  "paymentMethod": "credit_card",
  "paymentDate": "2025-01-26T10:00:00Z",
  "notes": "Online payment"
}
```

---

### 15. Analytics Module

**Base Path:** `/analytics`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/gym/:gymId/dashboard` | Gym dashboard |
| GET | `/analytics/branch/:branchId/dashboard` | Branch dashboard |
| GET | `/analytics/gym/:gymId/members` | Member analytics |
| GET | `/analytics/branch/:branchId/members` | Branch member analytics |
| GET | `/analytics/gym/:gymId/attendance` | Attendance analytics |
| GET | `/analytics/branch/:branchId/attendance` | Branch attendance |
| GET | `/analytics/gym/:gymId/payments/recent` | Recent payments |
| GET | `/analytics/branch/:branchId/payments/recent` | Branch payments |
| GET | `/analytics/trainer/:trainerId/dashboard` | Trainer dashboard |

---

### 16. Diet Plans Module

**Base Path:** `/diet-plans`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/diet-plans` | Create diet plan |
| GET | `/diet-plans` | Get all diet plans |
| GET | `/diet-plans/:id` | Get diet plan by ID |
| PATCH | `/diet-plans/:id` | Update diet plan |
| DELETE | `/diet-plans/:id` | Delete diet plan |
| GET | `/diet-plans/member/:memberId` | Get member diet plans |
| GET | `/diet-plans/user/my-diet-plans` | Current user's plans |

---

### 17. Workouts Module

**Base Path:** `/workouts`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workouts` | Create workout plan |
| GET | `/workouts` | Get all workout plans |
| GET | `/workouts/:id` | Get workout plan by ID |
| PATCH | `/workouts/:id` | Update workout plan |
| DELETE | `/workouts/:id` | Delete workout plan |
| GET | `/workouts/member/:memberId` | Get member workout plans |
| GET | `/workouts/user/my-workout-plans` | Current user's plans |

---

### 18. Workout Logs Module

**Base Path:** `/workout-logs`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workout-logs` | Log workout session |
| GET | `/workout-logs` | Get all workout logs |
| GET | `/workout-logs/:id` | Get workout log by ID |
| PATCH | `/workout-logs/:id` | Update workout log |
| DELETE | `/workout-logs/:id` | Delete workout log |
| GET | `/workout-logs/member/:memberId` | Get member logs |
| GET | `/workout-logs/user/my-workout-logs` | Current user's logs |

---

### 19. Body Progress Module

**Base Path:** `/body-progress`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/body-progress` | Record body measurements |
| GET | `/body-progress` | Get all body progress records |
| GET | `/body-progress/:id` | Get by ID |
| PATCH | `/body-progress/:id` | Update record |
| DELETE | `/body-progress/:id` | Delete record |
| GET | `/body-progress/member/:memberId` | Get member records |
| GET | `/body-progress/user/my-body-progress` | Current user's records |

---

### 20. Progress Tracking Module

**Base Path:** `/progress-tracking`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/progress-tracking` | Create progress record |
| GET | `/progress-tracking` | Get all records |
| GET | `/progress-tracking/:id` | Get by ID |
| PATCH | `/progress-tracking/:id` | Update record |
| DELETE | `/progress-tracking/:id` | Delete record |
| GET | `/progress-tracking/member/:memberId` | Get member records |
| GET | `/progress-tracking/user/my-progress-records` | Current user's records |

---

### 21. Goals Module

**Base Path:** `/goals`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/goals` | Create goal |
| GET | `/goals` | Get all goals |
| GET | `/goals/:id` | Get goal by ID |
| PATCH | `/goals/:id` | Update goal |
| DELETE | `/goals/:id` | Delete goal |
| GET | `/goals/member/:memberId` | Get member goals |
| GET | `/goals/user/my-goals` | Current user's goals |

---

### 22. Roles Module

**Base Path:** `/roles`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | Get all roles |
| GET | `/roles/:id` | Get role by ID |
| GET | `/roles/name/:name` | Get role by name |

---

### 23. Audit Logs Module

**Base Path:** `/audit-logs`
**Auth Required:** Yes (JWT Bearer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/audit-logs` | Create audit log entry |
| GET | `/audit-logs` | Get all audit logs |
| GET | `/audit-logs/:id` | Get by ID |
| GET | `/audit-logs/user/:userId` | Get logs by user |
| GET | `/audit-logs/entity/:entityType/:entityId` | Get logs by entity |
| GET | `/audit-logs/action/:action` | Get logs by action |

**Entity Types:** `member`, `trainer`, `class`, `membership_plan`, `gym`, `branch`, `user`, `assignment`, `attendance`

**Action Types:** `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `VIEW`, `APPROVE`, `REJECT`, `SUSPEND`, `ACTIVATE`, `PAYMENT`, `REFUND`

---

## Role-Based Access

### Admin Endpoints (Gym Owner/Admin)

| Module | Endpoints |
|--------|-----------|
| Gyms | All CRUD + branches, members, trainers |
| Branches | All CRUD + trainers |
| Members | All CRUD + admin update, dashboard |
| Trainers | All CRUD |
| Classes | All CRUD |
| Membership Plans | All CRUD |
| Subscriptions | All CRUD + cancel |
| Inquiries | All (except public POST) |
| Invoices | All CRUD + cancel |
| Payments | All |
| Analytics | Gym, Branch, Trainer dashboards |

### Member Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | Login, Logout |
| Members | Get own profile, Update own profile |
| Subscriptions | Get own subscription |
| Attendance | Get own attendance |
| Diet Plans | Get own diet plans |
| Workouts | Get own workout plans |
| Workout Logs | All CRUD for own logs |
| Body Progress | All CRUD for own records |
| Progress Tracking | All CRUD for own records |
| Goals | All CRUD for own goals |

### Trainer Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | Login, Logout |
| Trainers | Get own profile, Update own profile |
| Assignments | Get assigned members |
| Attendance | Get own attendance, Check-in/out |
| Analytics | Trainer dashboard |
| Workout Logs | All CRUD for member logs |
| Diet Plans | Create for members, Get all |
| Workouts | Create for members, Get all |

---

## ID Types Reference

### UUID (String) - Use in URL Path

| Entity | Example |
|--------|---------|
| Branch | `a4a43bf7-e997-4716-839b-9f05a45f42be` |
| Gym | `123e4567-e89b-12d3-a456-426614174000` |
| Class | `388d0fbf-76f4-486c-ae11-bd1878196911` |
| Invoice | `550e8400-e29b-41d4-a716-446655440000` |
| Payment | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` |
| Attendance | `9f25d7a1-8b4f-4a5c-9e3a-123456789abc` |
| Assignment | `d4e5f6a7-b8c9-d0e1-f2a3-123456789def` |

### Auto-Increment (Integer) - Use in URL Path

| Entity | Example |
|--------|---------|
| Member | `1`, `106`, `999` |
| Trainer | `1`, `2`, `50` |
| Membership Plan | `1`, `2`, `10` |
| Subscription | `1`, `2`, `100` |
| Inquiry | `1`, `2`, `50` |
| Goal | `1`, `5`, `25` |
| Workout Log | `1`, `10`, `100` |

---

## Common Response Formats

### Success Response (200 OK)
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Array Response (200 OK)
```json
[
  { ...item1... },
  { ...item2... }
]
```

### Error Response (4xx/5xx)
```json
{
  "message": "Error description",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

---

## Flutter Integration Guide

### Dio Client Setup

```dart
import 'package:dio/dio.dart';

class ApiClient {
  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3000',
      contentType: 'application/json',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  )..interceptors.add(LogInterceptor());

  static String? _accessToken;

  static void setToken(String token) {
    _accessToken = token;
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  static void clearToken() {
    _accessToken = null;
    dio.options.headers.remove('Authorization');
  }
}
```

### Token Storage (Flutter Secure Storage)

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = const FlutterSecureStorage();

Future<void> saveToken(String token) async {
  await storage.write(key: 'access_token', value: token);
  ApiClient.setToken(token);
}

Future<String?> getToken() async {
  final token = await storage.read(key: 'access_token');
  if (token != null) {
    ApiClient.setToken(token);
  }
  return token;
}

Future<void> logout() async {
  await storage.delete(key: 'access_token');
  ApiClient.clearToken();
}
```

### Login Example

```dart
Future<AuthResponse> login(String email, String password) async {
  try {
    final response = await ApiClient.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(response.data);
  } catch (e) {
    throw Exception('Login failed: $e');
  }
}
```

### Auth Response Model

```dart
class AuthResponse {
  final int userid;
  final String accessToken;

  AuthResponse({required this.userid, required this.accessToken});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      userid: json['userid'],
      accessToken: json['access_token'],
    );
  }
}
```

### API Call with Error Handling

```dart
Future<List<Member>> getMembers() async {
  try {
    final response = await ApiClient.dio.get('/members');
    return (response.data as List)
        .map((json) => Member.fromJson(json))
        .toList();
  } on DioException catch (e) {
    if (e.response?.statusCode == 401) {
      throw UnauthorizedException('Please login again');
    }
    throw Exception('Failed to fetch members: $e');
  }
}
```

### UUID vs Int ID Handling

```dart
// For UUID (Branch, Gym, Class, etc.)
class Branch {
  final String id; // Use String for UUID
  final String name;

  Branch({required this.id, required this.name});

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

// For Auto-Increment (Member, Trainer, etc.)
class Member {
  final int id; // Use int for auto-increment
  final String fullName;

  Member({required this.id, required this.fullName});

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'] as int,
      fullName: json['fullName'] as String,
    );
  }
}
```

### DateTime Handling

```dart
// API returns: "2025-01-26T09:00:00Z" (ISO 8601)
DateTime.parse(json['createdAt'])

// To send to API:
DateTime.now().toIso8601String() // "2025-01-26T10:30:00.000Z"
jsonEncode({'checkInTime': DateTime.now().toIso8601String()})
```

---

## Flutter URL Constants Comparison

This section documents the comparison between Flutter's `Urlconstants.dart` and the backend API endpoints.

### Flutter URL Constants File
**Location:** `/Users/chandangaur/development/Flutter Development/gym_mgmt/lib/core/constants/urlconstants.dart`

**Base URL:** `http://192.168.1.10:3001` (local) or `https://gyymthreads.zeabur.app` (production)

---

### Module Coverage

| Category | Flutter Modules | Backend Modules | Coverage |
|----------|-----------------|-----------------|----------|
| **Total Modules** | 17 | 23 | 74% |
| **Fitness Modules Missing** | 0 | 6 | 0% |

---

### Discrepancy Summary

#### 1. AuthUrls - NON-EXISTENT ENDPOINT

| Flutter URL | Backend Status | Action Required |
|-------------|----------------|-----------------|
| `/auth/register` | **DOES NOT EXIST** | Remove from Flutter |

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/auth/login` | POST /auth/login | OK |
| `/auth/logout` | POST /auth/logout | OK |

#### 2. UsersUrls - COMPLETE MATCH

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/users` (POST) | POST /users | OK |
| `/users` (GET) | GET /users | OK |
| `/users/profile` | GET /users/profile | OK |
| `/users/:id` | GET /users/:id | OK |
| `/users/:id` (PATCH) | PATCH /users/:id | OK |
| `/users/:id` (DELETE) | DELETE /users/:id | OK |

#### 3. MembersUrls - MISSING DASHBOARD ENDPOINT

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/members` (POST) | POST /members | OK |
| `/members` (GET) | GET /members | OK |
| `/members/:id` | GET /members/:id | OK |
| `/members/:id` (PATCH) | PATCH /members/:id | OK |
| `/members/admin/:id` | PATCH /members/admin/:id | OK |
| `/members/:id` (DELETE) | DELETE /members/:id | OK |
| `/members/:memberId/attendance` | GET /members/:memberId/attendance | OK |
| `/members/:memberId/assignments` | GET /members/:memberId/assignments | OK |
| `/members/:memberId/invoices` | GET /members/:memberId/invoices | OK |
| `/members/:memberId/subscription` | GET /members/:memberId/subscription | OK |
| `/members/:memberId/payments` | GET /members/:memberId/payments | OK |
| `/members/:memberId/dashboard` | GET /members/:memberId/dashboard | **MISSING** |

#### 4. AnalyticsUrls - MISSING + NON-EXISTENT ENDPOINTS

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/analytics/gym/:gymId/dashboard` | GET /analytics/gym/:gymId/dashboard | OK |
| `/analytics/branch/:branchId/dashboard` | GET /analytics/branch/:branchId/dashboard | OK |
| `/analytics/gym/:gymId/members` | GET /analytics/gym/:gymId/members | OK |
| `/analytics/branch/:branchId/members` | GET /analytics/branch/:branchId/members | OK |
| `/analytics/gym/:gymId/attendance` | GET /analytics/gym/:gymId/attendance | OK |
| `/analytics/branch/:branchId/attendance` | GET /analytics/branch/:branchId/attendance | OK |
| `/analytics/gym/:gymId/payments/recent` | GET /analytics/gym/:gymId/payments/recent | OK |
| `/analytics/branch/:branchId/payments/recent` | GET /analytics/branch/:branchId/payments/recent | OK |
| `/analytics/trainer/:trainerId/dashboard` | GET /analytics/trainer/:trainerId/dashboard | **MISSING** |
| `/analytics/gym/:gymId/financial` | **DOES NOT EXIST** | Remove |
| `/analytics/branch/:branchId/financial` | **DOES NOT EXIST** | Remove |

#### 5. TrainersUrls - COMPLETE MATCH

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/trainers` (POST) | POST /trainers | OK |
| `/trainers` (GET) | GET /trainers | OK |
| `/trainers/:id` | GET /trainers/:id | OK |
| `/trainers/:id` (PATCH) | PATCH /trainers/:id | OK |
| `/trainers/:id` (DELETE) | DELETE /trainers/:id | OK |
| `/trainers/:trainerId/attendance` | GET /trainers/:trainerId/attendance | OK |
| `/trainers/:trainerId/members` | GET /trainers/:trainerId/members | OK |

#### 6. Other Modules - COMPLETE MATCH

| Module | Status |
|--------|--------|
| GymsUrls | All endpoints match |
| BranchesUrls | All endpoints match |
| AttendanceUrls | All endpoints match |
| ClassesUrls | All endpoints match |
| InvoicesUrls | All endpoints match |
| RolesUrls | All endpoints match |
| AuditLogsUrls | All endpoints match |
| AssignmentsUrls | All endpoints match |
| MembershipPlansUrls | All endpoints match |
| PaymentsUrls | All endpoints match |
| SubscriptionsUrls | All endpoints match |
| InquiriesUrls | All endpoints match |

---

### Fitness Modules - COMPLETELY MISSING

The following 6 fitness modules exist in the backend but have NO corresponding URL constants in Flutter:

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| **Diet Plans** | `/diet-plans` | 7 endpoints (CRUD + member/user queries) |
| **Workouts** | `/workouts` | 7 endpoints (CRUD + member/user queries) |
| **Workout Logs** | `/workout-logs` | 7 endpoints (CRUD + member/user queries) |
| **Body Progress** | `/body-progress` | 7 endpoints (CRUD + member/user queries) |
| **Progress Tracking** | `/progress-tracking` | 7 endpoints (CRUD + member/user queries) |
| **Goals** | `/goals` | 7 endpoints (CRUD + member/user queries) |

---

### Action Items for Flutter Developers

#### Critical Fixes Required

1. **Remove `/auth/register`** - This endpoint does not exist in the backend
2. **Remove `/analytics/gym/:gymId/financial`** - Does not exist in backend
3. **Remove `/analytics/branch/:branchId/financial`** - Does not exist in backend

#### Missing Endpoints to Add

1. **MembersUrls** - Add `getDashboard` method:
   ```dart
   String getDashboard(String memberId) =>
       "${Urlconstants.baseUrl}/members/$memberId/dashboard";
   ```

2. **AnalyticsUrls** - Add trainer dashboard:
   ```dart
   String trainerDashboard(String trainerId) =>
       "${Urlconstants.baseUrl}/analytics/trainer/$trainerId/dashboard";
   ```

3. **Add Fitness URL Classes** (6 new classes):
   - `DietPlansUrls`
   - `WorkoutsUrls`
   - `WorkoutLogsUrls`
   - `BodyProgressUrls`
   - `ProgressTrackingUrls`
   - `GoalsUrls`

---

### ID Types Reference for Flutter

| Entity | ID Type | Example | Flutter Type |
|--------|---------|---------|--------------|
| Branch | UUID | `a4a43bf7-e997-4716-839b-9f05a45f42be` | `String` |
| Gym | UUID | `123e4567-e89b-12d3-a456-426614174000` | `String` |
| Class | UUID | `388d0fbf-76f4-486c-ae11-bd1878196911` | `String` |
| Invoice | UUID | `550e8400-e29b-41d4-a716-446655440000` | `String` |
| Payment | UUID | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` | `String` |
| Attendance | UUID | `9f25d7a1-8b4f-4a5c-9e3a-123456789abc` | `String` |
| Assignment | UUID | `d4e5f6a7-b8c9-d0e1-f2a3-123456789def` | `String` |
| Member | Auto-increment | `1`, `106`, `999` | `int` |
| Trainer | Auto-increment | `1`, `2`, `50` | `int` |
| Membership Plan | Auto-increment | `1`, `2`, `10` | `int` |
| Subscription | Auto-increment | `1`, `2`, `100` | `int` |
| Inquiry | Auto-increment | `1`, `2`, `50` | `int` |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Modules | 23 |
| Public Endpoints | 3 |
| Protected Endpoints | 140+ |
| UUID-based IDs | 15 entities |
| Auto-increment IDs | 12 entities |

---

*Last Updated: 2026-01-26*
*Generated from NestJS Gym Management Backend API*
