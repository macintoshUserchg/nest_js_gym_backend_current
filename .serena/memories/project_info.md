# Gym Management System - Project Information

## Project Overview

This is a **multi-tenant gym management SaaS platform** built with **NestJS 11**, **TypeScript 5.7**, and **PostgreSQL** with **TypeORM 0.3.24**.

**Project Maturity:** 70% Complete 🟡

**Status:** Strong foundational architecture but missing critical production features (payments, emails, file uploads, security hardening).

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | NestJS | 11.0.1 |
| **Language** | TypeScript | 5.7.3 |
| **Database** | PostgreSQL | - |
| **ORM** | TypeORM | 0.3.24 |
| **Authentication** | JWT + Passport | 11.0.0 / 4.0.1 |
| **Validation** | class-validator | 0.14.2 |
| **API Documentation** | Swagger | 11.2.0 |
| **Password Hashing** | bcrypt | 6.0.0 |

## System Architecture

### Multi-Tenant Structure

The system implements a hierarchical multi-tenant architecture:

```
Gym (chain)
  └── Branch (location)
      ├── Members
      ├── Trainers
      ├── Classes
      ├── Inquiries
      └── Membership Plans
```

### Module Structure (32 Feature Modules)

The application is organized into 32 feature modules:

1. **Auth Module** - JWT authentication, guards, strategies
2. **Users Module** - User management
3. **Roles Module** - RBAC with 38 permissions
4. **Gyms Module** - Multi-tenant gym management
5. **Branches Module** - Location management
6. **Members Module** - Member profiles and subscriptions
7. **Trainers Module** - Trainer profiles
8. **Assignments Module** - Member-trainer relationships
9. **Membership Plans Module** - Subscription tiers
10. **Subscriptions Module** - Active subscriptions
11. **Payments Module** - Payment transactions
12. **Invoices Module** - Billing records
13. **Classes Module** - Group fitness classes
14. **Attendance Module** - Check-in/check-out tracking
15. **Workouts Module** - Workout plans and exercises
16. **Workout Templates Module** - Reusable workouts
17. **Workout Plan Chart Assignments** - Workout assignments
18. **Exercise Library Module** - Exercise database
19. **Workout Logs Module** - Workout history
20. **Diet Plans Module** - Nutrition plans
21. **Diet Templates Module** - Reusable diets
22. **Diet Plan Assignments** - Diet assignments
23. **Goals Module** - Fitness goals
24. **Goal Templates Module** - Reusable goals
25. **Goal Schedules Module** - Periodic goals
26. **Attendance Goals Module** - Attendance targets
27. **Progress Tracking Module** - General progress
28. **Body Progress Module** - Measurements
29. **Template Assignments Module** - Generic template assignments
30. **Template Shares Module** - Template sharing
31. **Analytics Module** - Dashboard analytics
32. **Audit Logs Module** - System audit trail
33. **Notifications Module** - User notifications
34. **Inquiries Module** - Lead management

### Role-Based Access Control (RBAC)

Four primary roles control access throughout the system:

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **SUPERADMIN** | Platform administrator | Full system access, manage all gyms |
| **ADMIN** | Gym administrator | Manage gym, branches, members, trainers |
| **TRAINER** | Fitness trainer | Manage assigned members, create templates |
| **MEMBER** | Gym member | View profile, track progress, view assignments |

### Authentication Flow

1. **Login Only** - No registration endpoint (users created by admin)
2. **JWT Token** - Stateless authentication with Bearer tokens
3. **Default Password** - `pass@123` for all new users (changed on first login recommended)
4. **Token Payload**: `{ sub: userId, email: string, role: string }`

## Entity Architecture

### Entity Count: 38

**Code Statistics:**
- Total TypeScript Files: 150+
- Controllers: 48
- Services: 32
- Modules: 32
- DTOs: 57+
- Entities: 38
- Total Lines of Code: ~32,715

The system uses a mix of **UUID** and **auto-increment** primary keys strategically:

**UUID Keys (17 entities):**
- User (userId), Role (id), Gym (gymId), Branch (branchId), Class (class_id)
- Attendance (id), AuditLog (log_id), Notification (notification_id)
- WorkoutPlan (plan_id), DietPlan (plan_id), WorkoutTemplate (template_id)
- DietTemplate (template_id), GoalTemplate (template_id), GoalSchedule (schedule_id)
- GoalScheduleMilestone (milestone_id), TemplateShare (share_id)
- TemplateAssignment (assignment_id), DietPlanAssignment (assignment_id)
- WorkoutPlanChartAssignment (assignment_id)
- ProgressTracking (progress_id)

**Auto-Increment Keys (21 entities):**
- Member (id), Trainer (id), MembershipPlan (id), MemberSubscription (id)
- Invoice (invoice_id), PaymentTransaction (transaction_id)
- Inquiry (id), Goal (id), BodyProgress (id), WorkoutLog (log_id)
- DietPlanMeal (meal_id), DietTemplateMeal (meal_id)
- WorkoutPlanExercise (exercise_id), WorkoutTemplateExercise (exercise_id)
- ExerciseLibrary (exercise_id), AttendanceGoal (goal_id)
- Plus additional tracking entities

### Cascade Delete Relationships (15)

Data integrity is maintained through carefully designed cascade deletes:

1. **Branch → Gym** - Deleting a gym cascades to all branches
2. **Member → WorkoutPlan** - Deleting member cascades to workout plans
3. **Member → DietPlan** - Deleting member cascades to diet plans
4. **Member → ProgressTracking** - Deleting member cascades to progress records
5. **Member → BodyProgress** - Deleting member cascades to body progress
6. **Member → Attendance** - Deleting member cascades to attendance records
7. **Member → MemberTrainerAssignment** - Deleting member cascades to assignments
8. **Member → Goal** - Deleting member cascades to goals
9. **Member → Invoice** - Deleting member cascades to invoices
10. **Invoice → PaymentTransaction** - Deleting invoice cascades to payments
11. **Invoice → WorkoutPlanChartAssignment** - Deleting invoice cascades to chart assignments
12. **WorkoutPlan → WorkoutPlanExercise** - Deleting plan cascades to exercises
13. **DietPlan → DietPlanMeal** - Deleting plan cascades to meals
14. **GoalSchedule → GoalScheduleMilestone** - Deleting schedule cascades to milestones
15. **WorkoutTemplate → WorkoutTemplateExercise** - Deleting template cascades to exercises

## Core Business Entities

### Member Management

- **Member**: Core member profile with personal details, emergency contacts
- **MemberSubscription**: Active subscription with plan and class selections
- **MembershipPlan**: Pricing tiers (Basic, Premium, VIP, etc.)

### Staff Management

- **Trainer**: Trainer profiles with specializations and branch assignments
- **User**: Authentication accounts linked to members or trainers
- **Role**: RBAC roles (SUPERADMIN, ADMIN, TRAINER, MEMBER)

### Facility Management

- **Gym**: Gym chain/brand with contact information
- **Branch**: Physical locations with main branch designation
- **Class**: Group fitness classes with timing and recurrence patterns

### Fitness Tracking

- **WorkoutPlan**: Individual workout routines for members
- **DietPlan**: Individual nutrition plans for members
- **Goal**: Member fitness goals with target values
- **ProgressTracking**: Body measurements and progress photos
- **BodyProgress**: Weight, body fat, BMI tracking
- **WorkoutLog**: Exercise completion logs
- **Attendance**: Check-in/check-out records for members and trainers

### Template System

- **WorkoutTemplate**: Reusable workout charts (PRIVATE or GYM_PUBLIC)
- **WorkoutTemplateExercise**: Template exercises with equipment and substitutions
- **DietTemplate**: Reusable nutrition plans
- **DietTemplateMeal**: Template meals with alternatives
- **GoalTemplate**: Reusable goal schedules
- **GoalSchedule**: Time-based goal tracking with milestones
- **GoalScheduleMilestone**: Period-based targets

### Assignment System

- **MemberTrainerAssignment**: Links members to trainers with date ranges
- **TemplateAssignment**: Generic template assignments to members
- **WorkoutPlanChartAssignment**: Workout template assignments
- **DietPlanAssignment**: Diet template assignments
- **TemplateShare**: Template sharing between trainers

### Financial Management

- **Invoice**: Billing for memberships with status tracking
- **PaymentTransaction**: Payment records with method and status

### Lead Management

- **Inquiry**: Prospective member leads with status workflow
  - Status flow: new → contacted → qualified → converted/closed

### System & Audit

- **AuditLog**: Complete audit trail of all data changes
- **Notification**: User notifications for goals, assignments, reminders

## API Endpoint Structure

### Authentication Module (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login, returns JWT | No |
| POST | `/auth/logout` | Client-side token discard | Yes |

### User Management (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create new user | Yes |
| GET | `/users` | Get all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| PATCH | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes |

### Gym Management (`/gyms`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/gyms` | Create new gym | Yes |
| GET | `/gyms` | Get all gyms (with filters) | Yes |
| GET | `/gyms/:id` | Get gym by ID | Yes |
| PATCH | `/gyms/:id` | Update gym | Yes |
| DELETE | `/gyms/:id` | Delete gym | Yes |
| POST | `/gyms/:gymId/branches` | Create branch for gym | Yes |
| GET | `/gyms/:gymId/branches` | Get all gym branches | Yes |
| GET | `/gyms/:gymId/members` | Get all gym members | Yes |
| GET | `/gyms/:gymId/trainers` | Get all gym trainers | Yes |

### Branch Management (`/branches`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/branches` | Get all branches | Yes |
| GET | `/branches/:id` | Get branch by ID | Yes |
| PATCH | `/branches/:id` | Update branch | Yes |
| DELETE | `/branches/:id` | Delete branch | Yes |
| GET | `/branches/:branchId/members` | Get branch members | Yes |
| GET | `/branches/:branchId/trainers` | Get branch trainers | Yes |

### Member Management (`/members`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/members` | Create member (with user) | Yes |
| GET | `/members` | Get all members (with filters) | Yes |
| GET | `/members/:id` | Get member by ID | Yes |
| PATCH | `/members/:id` | Update member | Yes |
| PATCH | `/members/admin/:id` | Admin update (sensitive fields) | Yes (Admin) |
| DELETE | `/members/:id` | Delete member | Yes |
| GET | `/members/:memberId/dashboard` | Get member dashboard | Yes |

### Trainer Management (`/trainers`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/trainers` | Create trainer (with user) | Yes |
| GET | `/trainers` | Get all trainers (with filters) | Yes |
| GET | `/trainers/:id` | Get trainer by ID | Yes |
| PATCH | `/trainers/:id` | Update trainer | Yes |
| DELETE | `/trainers/:id` | Delete trainer | Yes |

### Membership Plans (`/membership-plans`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/membership-plans` | Create plan | Yes |
| GET | `/membership-plans` | Get all plans | Yes |
| GET | `/membership-plans/:id` | Get plan by ID | Yes |
| PATCH | `/membership-plans/:id` | Update plan | Yes |
| DELETE | `/membership-plans/:id` | Delete plan | Yes |

### Subscriptions (`/subscriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/subscriptions` | Create subscription | Yes |
| GET | `/subscriptions` | Get all subscriptions | Yes |
| GET | `/subscriptions/:id` | Get subscription by ID | Yes |
| PATCH | `/subscriptions/:id` | Update subscription | Yes |
| DELETE | `/subscriptions/:id` | Delete subscription | Yes |

### Classes (`/classes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/classes` | Create class | Yes |
| GET | `/classes` | Get all classes | Yes |
| GET | `/classes/:id` | Get class by ID | Yes |
| PATCH | `/classes/:id` | Update class | Yes |
| DELETE | `/classes/:id` | Delete class | Yes |

### Attendance (`/attendance`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/mark` | Mark attendance | Yes |
| GET | `/attendance` | Get attendance records | Yes |
| GET | `/attendance/monthly` | Get monthly attendance | Yes |
| POST | `/attendance/goals` | Create attendance goal | Yes |

### Fitness Tracking

**Workouts (`/workouts`)**: CRUD for workout plans
**Diet Plans (`/diet-plans`)**: CRUD for diet plans
**Goals (`/goals`)**: CRUD for goals
**Body Progress (`/body-progress`)**: Track measurements
**Workout Logs (`/workout-logs`)**: Log completed exercises
**Progress Tracking (`/progress-tracking`)**: Comprehensive progress

### Templates

**Workout Templates (`/workouts/templates`)**: Create reusable workout charts
**Diet Templates (`/diet-plans/templates`)**: Create reusable diet plans
**Goal Templates (`/goals/templates`)**: Create reusable goal schedules

### Assignments

**Member-Trainer (`/assignments`)**: Assign trainers to members
**Template Assignments (`/templates/assignments`)**: Assign templates to members
**Diet Assignments (`/diet-plans/assignments`)**: Assign diet plans
**Workout Chart Assignments (`/workouts/chart-assignments`)**: Assign workout charts

### Financial

**Invoices (`/invoices`)**: Manage billing
**Payments (`/payments`)**: Process payments

### Lead Management

**Inquiries (`/inquiries`)**: Manage prospective member leads

### System

**Audit Logs (`/audit-logs`)**: View system audit trail
**Analytics (`/analytics`)**: Dashboard analytics
**Notifications (`/notifications`)**: User notifications

## Database Configuration

- **Host**: localhost:5432
- **Database**: gym_db
- **Synchronization**: Enabled (development mode)
- **Entity Auto-Loading**: All entities from `src/**/*.entity{.ts,.js}`

## Project Maturity Assessment

| Component | Status | Completion |
|-----------|--------|-----------|
| Core Architecture | ✅ Complete | 95% |
| Authentication & Authorization | ✅ Complete | 90% |
| Database Schema & Models | ✅ Complete | 85% |
| API Endpoints | ✅ Complete | 90% |
| Business Logic | ✅ Complete | 85% |
| **Testing** | ⚠️ Minimal | **30%** |
| Documentation | ✅ Good | 80% |
| **Security Hardening** | ⚠️ Needs Work | **60%** |
| **Frontend** | ❌ Not Started | **0%** |
| **Deployment** | ⚠️ Local Only | **40%** |

**Overall: 70% Complete** 🟡

### Critical Missing Features 🔴
- Payment gateway integration (Stripe/Razorpay)
- Email notification system (SendGrid/AWS SES)
- Password reset/change flow
- File upload & storage (AWS S3/Cloudinary)
- Security hardening (rate limiting, CORS, Helmet.js)
- Database migrations (currently using synchronize=true)

### Key Features

1. **Multi-Gym Chain Support**: Manage multiple gym locations under one system
2. **Member Self-Service**: Dashboard for members to view subscriptions, attendance, payments
3. **Trainer Tools**: Create templates, assign workouts/diets, track member progress
4. **Comprehensive Fitness Tracking**: Workouts, diet plans, goals, progress photos, measurements
5. **Template System**: Reusable workout, diet, and goal templates with sharing capabilities
6. **Class Management**: Group fitness classes with timing and recurrence
7. **Financial Management**: Invoicing and payment tracking
8. **Lead Management**: Inquiry-to-conversion pipeline
9. **Complete Audit Trail**: All data changes logged
10. **Role-Based Access**: Four-tier access control

## Serena MCP Integration

**Status**: ✅ Active (February 7, 2026)

Serena coding agent toolkit is configured and running:
- **MCP Config**: `.claude/mcp.json`
- **Project Config**: `.serena/project.yml`
- **Web Dashboard**: http://127.0.0.1:24282/dashboard/index.html
- **Tools Available**: 29 semantic code tools
- **Languages**: TypeScript (LSP backend)

See memory: `serena_mcp_setup` for complete setup details.

## API Documentation

Swagger documentation is available at `/api` when the server is running, with Bearer authentication configured.

## Security Notes

- All endpoints except `/auth/login` and `/auth/logout` require JWT authentication
- Password hashing uses bcrypt with 10 salt rounds
- Default password for new users: `pass@123`
- Role checks are implemented at controller level for admin operations
- Cascade deletes ensure referential integrity
