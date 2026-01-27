# Flutter URL Constants vs Backend API Comparison

This document provides a detailed comparison between Flutter's `Urlconstants.dart` and the backend API endpoints.

## Flutter URL Constants File
**Location:** `/Users/chandangaur/development/Flutter Development/gym_mgmt/lib/core/constants/urlconstants.dart`

**Base URL:** `http://192.168.1.10:3001` (local) or `https://gyymthreads.zeabur.app` (production)

---

## Module Coverage

| Category | Flutter Modules | Backend Modules | Coverage |
|----------|-----------------|-----------------|----------|
| **Total Modules** | 17 | 23 | 74% |
| **Fitness Modules Missing** | 0 | 6 | 0% |

### Modules Present in Both
Auth, Users, Gyms, Branches, Members, Analytics, Attendance, Classes, Invoices, Roles, AuditLogs, Assignments, MembershipPlans, Payments, Subscriptions, Trainers, Inquiries

### Modules Missing in Flutter (Fitness Modules)
1. Diet Plans
2. Workouts
3. Workout Logs
4. Body Progress
5. Progress Tracking
6. Goals

---

## Discrepancy Summary

### 1. AuthUrls - NON-EXISTENT ENDPOINT

| Flutter URL | Backend Status | Action Required |
|-------------|----------------|-----------------|
| `/auth/register` | **DOES NOT EXIST** | Remove from Flutter |
| `/auth/login` | POST /auth/login | OK |
| `/auth/logout` | POST /auth/logout | OK |

### 2. UsersUrls - COMPLETE MATCH

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/users` (POST) | POST /users | OK |
| `/users` (GET) | GET /users | OK |
| `/users/profile` | GET /users/profile | OK |
| `/users/:id` | GET /users/:id | OK |
| `/users/:id` (PATCH) | PATCH /users/:id | OK |
| `/users/:id` (DELETE) | DELETE /users/:id | OK |

### 3. MembersUrls - MISSING ENDPOINT

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

### 4. AnalyticsUrls - MISSING + NON-EXISTENT ENDPOINTS

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
| `/analytics/gym/:gymId/financial` | **DOES NOT EXIST** | Remove |
| `/analytics/branch/:branchId/financial` | **DOES NOT EXIST** | Remove |
| `/analytics/trainer/:trainerId/dashboard` | GET /analytics/trainer/:trainerId/dashboard | **MISSING** |

### 5. TrainersUrls - COMPLETE MATCH

| Flutter URL | Backend Endpoint | Status |
|-------------|------------------|--------|
| `/trainers` (POST) | POST /trainers | OK |
| `/trainers` (GET) | GET /trainers | OK |
| `/trainers/:id` | GET /trainers/:id | OK |
| `/trainers/:id` (PATCH) | PATCH /trainers/:id | OK |
| `/trainers/:id` (DELETE) | DELETE /trainers/:id | OK |
| `/trainers/:trainerId/attendance` | GET /trainers/:trainerId/attendance | OK |
| `/trainers/:trainerId/members` | GET /trainers/:trainerId/members | OK |

### 6. Other Modules - COMPLETE MATCH

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

## Fitness Modules - COMPLETELY MISSING

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

## Action Items for Flutter Developers

### Critical Fixes Required (3 items)

1. **Remove `/auth/register`** - This endpoint does not exist in the backend
   ```dart
   // Remove this line from AuthUrls class
   final String register = "${Urlconstants.baseUrl}/auth/register";
   ```

2. **Remove `/analytics/gym/:gymId/financial`** - Does not exist in backend
   ```dart
   // Remove this method from AnalyticsUrls class
   String gymFinancial(String gymId) =>
       "${Urlconstants.baseUrl}/analytics/gym/$gymId/financial";
   ```

3. **Remove `/analytics/branch/:branchId/financial`** - Does not exist in backend
   ```dart
   // Remove this method from AnalyticsUrls class
   String branchFinancial(String branchId) =>
       "${Urlconstants.baseUrl}/analytics/branch/$branchId/financial";
   ```

### Missing Endpoints to Add (2 items)

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

### Optional: Add Fitness URL Classes (6 new classes)

If the Flutter app needs to support fitness features, add these classes:

```dart
class DietPlansUrls {
  const DietPlansUrls();
  final String base = "${Urlconstants.baseUrl}/diet-plans";
  String getById(String id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyPlans() => "$base/user/my-diet-plans";
}

class WorkoutsUrls {
  const WorkoutsUrls();
  final String base = "${Urlconstants.baseUrl}/workouts";
  String getById(String id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyPlans() => "$base/user/my-workout-plans";
}

class WorkoutLogsUrls {
  const WorkoutLogsUrls();
  final String base = "${Urlconstants.baseUrl}/workout-logs";
  String getById(int id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyLogs() => "$base/user/my-workout-logs";
}

class BodyProgressUrls {
  const BodyProgressUrls();
  final String base = "${Urlconstants.baseUrl}/body-progress";
  String getById(int id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyProgress() => "$base/user/my-body-progress";
}

class ProgressTrackingUrls {
  const ProgressTrackingUrls();
  final String base = "${Urlconstants.baseUrl}/progress-tracking";
  String getById(String id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyProgress() => "$base/user/my-progress-records";
}

class GoalsUrls {
  const GoalsUrls();
  final String base = "${Urlconstants.baseUrl}/goals";
  String getById(int id) => "$base/$id";
  String getByMember(String memberId) => "$base/member/$memberId";
  String getMyGoals() => "$base/user/my-goals";
}
```

Then add them to the main class:
```dart
class Urlconstants {
  // ... existing URLs ...
  static const DietPlansUrls dietPlans = DietPlansUrls();
  static const WorkoutsUrls workouts = WorkoutsUrls();
  static const WorkoutLogsUrls workoutLogs = WorkoutLogsUrls();
  static const BodyProgressUrls bodyProgress = BodyProgressUrls();
  static const ProgressTrackingUrls progressTracking = ProgressTrackingUrls();
  static const GoalsUrls goals = GoalsUrls();
}
```

---

## ID Types Reference for Flutter

This is critical for proper API integration. Use the correct Dart type based on the entity.

### UUID (String) - Use in URL Path

| Entity | Example | Flutter Type |
|--------|---------|--------------|
| Branch | `a4a43bf7-e997-4716-839b-9f05a45f42be` | `String` |
| Gym | `123e4567-e89b-12d3-a456-426614174000` | `String` |
| Class | `388d0fbf-76f4-486c-ae11-bd1878196911` | `String` |
| Invoice | `550e8400-e29b-41d4-a716-446655440000` | `String` |
| Payment | `6ba7b810-9dad-11d1-80b4-00c04fd430c8` | `String` |
| Attendance | `9f25d7a1-8b4f-4a5c-9e3a-123456789abc` | `String` |
| Assignment | `d4e5f6a7-b8c9-d0e1-f2a3-123456789def` | `String` |
| Diet Plan | `uuid-string` | `String` |
| Workout Plan | `uuid-string` | `String` |
| Progress Tracking | `uuid-string` | `String` |
| Attendance Goal | `uuid-string` | `String` |
| Notification | `uuid-string` | `String` |

### Auto-Increment (Integer) - Use in URL Path

| Entity | Example | Flutter Type |
|--------|---------|--------------|
| Member | `1`, `106`, `999` | `int` |
| Trainer | `1`, `2`, `50` | `int` |
| Membership Plan | `1`, `2`, `10` | `int` |
| Subscription | `1`, `2`, `100` | `int` |
| Inquiry | `1`, `2`, `50` | `int` |
| Goal | `1`, `5`, `25` | `int` |
| Workout Log | `1`, `10`, `100` | `int` |
| Body Progress | `1`, `20`, `50` | `int` |
| Diet | `1`, `15`, `30` | `int` |

### Example: Handling Different ID Types

```dart
// For UUID entities (use String)
class BranchService {
  Future<Branch> getBranch(String id) async {
    final response = await dio.get('/branches/$id');
    return Branch.fromJson(response.data);
  }
}

// For auto-increment entities (use int)
class MemberService {
  Future<Member> getMember(int id) async {
    final response = await dio.get('/members/$id');
    return Member.fromJson(response.data);
  }
}
```

---

## Quick Reference: Backend Endpoints Summary

### Core Modules (17 in Flutter)

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| Auth | `/auth` | login, logout (register does NOT exist) |
| Users | `/users` | CRUD + profile |
| Gyms | `/gyms` | CRUD + branches/members/trainers |
| Branches | `/branches` | CRUD + members/trainers/attendance/classes/plans |
| Members | `/members` | CRUD + dashboard/attendance/assignments/invoices/subscription/payments |
| Trainers | `/trainers` | CRUD + attendance/members |
| Classes | `/classes` | CRUD |
| Membership Plans | `/membership-plans` | CRUD |
| Subscriptions | `/subscriptions` | CRUD + cancel |
| Attendance | `/attendance` | CRUD + checkout |
| Assignments | `/assignments` | CRUD |
| Inquiries | `/inquiries` | CRUD + pending/stats/convert |
| Invoices | `/invoices` | CRUD + cancel + payments |
| Payments | `/payments` | CRUD |
| Analytics | `/analytics` | gym/branch dashboards + members/attendance/payments + trainer dashboard |
| Roles | `/roles` | CRUD + by-name |
| Audit Logs | `/audit-logs` | CRUD + user/entity/action queries |

### Fitness Modules (NOT in Flutter - 6 modules)

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Diet Plans | `/diet-plans` | CRUD + member/:id + user/my-diet-plans |
| Workouts | `/workouts` | CRUD + member/:id + user/my-workout-plans |
| Workout Logs | `/workout-logs` | CRUD + member/:id + user/my-workout-logs |
| Body Progress | `/body-progress` | CRUD + member/:id + user/my-body-progress |
| Progress Tracking | `/progress-tracking` | CRUD + member/:id + user/my-progress-records |
| Goals | `/goals` | CRUD + member/:id + user/my-goals |



*Last Updated: 2026-01-26*
*Comparison between Flutter Urlconstants.dart and NestJS Gym Management Backend API*
