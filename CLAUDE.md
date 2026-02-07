# Gym Management System - Complete Project Documentation

## Project Overview

This is a **multi-tenant gym management SaaS platform** built with **NestJS 11**, **TypeScript 5.7**, and **PostgreSQL** with **TypeORM 0.3.24**.

**Project Maturity:** 70% Complete 🟡

**Status:** Strong foundational architecture but missing critical production features (payments, emails, file uploads, security hardening).

### Key Statistics

- **38 TypeORM entities** with 15 cascade delete relationships
- **32 feature modules** organized by domain
- **48 controllers**, **32 services**, **57+ DTOs**
- **~32,715 lines of code** (150+ TypeScript files)
- **4 user roles** with role-based access control (RBAC)
- **Multi-tenant hierarchy**: Gym → Branch → Members/Trainers

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | NestJS | 11.0.1 | Node.js backend framework |
| **Language** | TypeScript | 5.7.3 | Type-safe JavaScript |
| **Database** | PostgreSQL | - | Relational database |
| **ORM** | TypeORM | 0.3.24 | Database ORM |
| **Authentication** | JWT + Passport | 11.0.0 / 4.0.1 | Token-based auth |
| **Validation** | class-validator | 0.14.2 | Request validation |
| **API Docs** | Swagger | 11.2.0 | Interactive documentation |
| **Password Hashing** | bcrypt | 6.0.0 | Secure password storage |

---

## Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── config/jwt.config.ts      # JWT configuration
│   ├── decorators/               # @CurrentUser decorator
│   ├── dto/                      # Login DTOs
│   ├── guards/jwt-auth.guard.ts  # JWT authentication guard
│   ├── strategies/jwt.strategy.ts # Passport JWT strategy
│   ├── types/                    # TypeScript types
│   ├── auth.controller.ts        # Login/logout endpoints
│   ├── auth.service.ts           # Auth business logic
│   └── auth.module.ts            # Auth module
│
├── entities/                     # TypeORM entities (27 total)
│   ├── users.entity.ts           # User accounts
│   ├── roles.entity.ts           # RBAC roles
│   ├── gym.entity.ts             # Gym chains
│   ├── branch.entity.ts          # Gym locations
│   ├── members.entity.ts         # Member profiles
│   ├── trainers.entity.ts        # Trainer profiles
│   ├── membership_plans.entity.ts # Pricing tiers
│   ├── member_subscriptions.entity.ts # Active subscriptions
│   ├── classes.entity.ts         # Group fitness classes
│   ├── attendance.entity.ts      # Check-in records
│   ├── attendance_goals.entity.ts # Attendance targets
│   ├── workout_plans.entity.ts   # Individual workouts
│   ├── workout_plan_exercises.entity.ts # Workout exercises
│   ├── workout_templates.entity.ts # Reusable workouts
│   ├── workout_template_exercises.entity.ts # Template exercises
│   ├── workout_logs.entity.ts    # Completed exercises
│   ├── diet_plans.entity.ts      # Individual diets
│   ├── diet_plan_meals.entity.ts # Diet meals
│   ├── diet_templates.entity.ts  # Reusable diets
│   ├── diet_template_meals.entity.ts # Template meals
│   ├── diet_plan_assignments.entity.ts # Diet assignments
│   ├── goals.entity.ts           # Fitness goals
│   ├── goal_templates.entity.ts  # Goal templates
│   ├── goal_schedules.entity.ts  # Goal schedules
│   ├── goal_schedule_milestones.entity.ts # Goal milestones
│   ├── progress_tracking.entity.ts # Body measurements
│   ├── body_progress.entity.ts   # Weight/body fat tracking
│   ├── invoices.entity.ts        # Billing invoices
│   ├── payment_transactions.entity.ts # Payment records
│   ├── member_trainer_assignments.entity.ts # Trainer assignments
│   ├── template_assignments.entity.ts # Generic template assignments
│   ├── workout_plan_chart_assignments.entity.ts # Workout assignments
│   ├── template_shares.entity.ts # Template sharing
│   ├── inquiry.entity.ts         # Lead management
│   ├── audit_logs.entity.ts      # Audit trail
│   ├── notifications.entity.ts   # User notifications
│   └── exercise_library.entity.ts # Exercise reference
│
├── [feature-modules]/            # 23 feature modules
│   ├── dto/                      # Data Transfer Objects
│   ├── [feature].controller.ts   # Route handlers
│   ├── [feature].service.ts      # Business logic
│   └── [feature].module.ts       # Module definition
│
├── common/                       # Shared code
│   ├── dto/                      # Shared DTOs
│   └── enums/                    # Shared enums
│
├── app.module.ts                 # Root module
└── main.ts                       # Application bootstrap
```

---

## Entity Architecture

### Primary Key Strategies

**UUID Primary Keys (17 entities)** - Used for distributed systems compatibility:

- User (`userId`)
- Gym (`gymId`)
- Branch (`branchId`)
- Class (`class_id`)
- Attendance (`id`)
- AuditLog (`log_id`)
- Notification (`notification_id`)
- WorkoutPlan (`plan_id`)
- DietPlan (`plan_id`)
- WorkoutTemplate (`template_id`)
- DietTemplate (`template_id`)
- GoalTemplate (`template_id`)
- GoalSchedule (`schedule_id`)
- GoalScheduleMilestone (`milestone_id`)
- TemplateShare (`share_id`)
- TemplateAssignment (`assignment_id`)
- DietPlanAssignment (`assignment_id`)
- WorkoutPlanChartAssignment (`assignment_id`)

**Auto-Increment Primary Keys (10 entities)** - Used for internal business entities:

- Member (`id`)
- Trainer (`id`)
- MembershipPlan (`id`)
- MemberSubscription (`id`)
- Invoice (`invoice_id` - note: mixed convention, actually UUID)
- PaymentTransaction (`transaction_id` - note: mixed convention, actually UUID)
- Inquiry (`id`)
- Goal (`id`)
- BodyProgress (`id`)
- WorkoutLog (`id`)

### Cascade Delete Relationships (15 total)

1. **Branch → Gym**: Deleting gym cascades to all branches
2. **Member → WorkoutPlan**: Deleting member cascades to workout plans
3. **Member → DietPlan**: Deleting member cascades to diet plans
4. **Member → ProgressTracking**: Deleting member cascades to progress records
5. **Member → BodyProgress**: Deleting member cascades to body progress
6. **Member → Attendance**: Deleting member cascades to attendance records
7. **Member → MemberTrainerAssignment**: Deleting member cascades to assignments
8. **Member → Goal**: Deleting member cascades to goals
9. **Invoice → Member**: Deleting member cascades to invoices
10. **Invoice → PaymentTransaction**: Deleting invoice cascades to payments
11. **Invoice → WorkoutPlanChartAssignment**: Deleting invoice cascades to chart assignments
12. **WorkoutPlan → WorkoutPlanExercise**: Deleting plan cascades to exercises
13. **DietPlan → DietPlanMeal**: Deleting plan cascades to meals
14. **GoalSchedule → GoalScheduleMilestone**: Deleting schedule cascades to milestones
15. **WorkoutTemplate → WorkoutTemplateExercise**: Deleting template cascades to exercises

---

## Multi-Tenant Architecture

### Hierarchy

```
Gym (Chain/Business)
  └── Branch (Physical Location)
      ├── Members (People with subscriptions)
      ├── Trainers (Staff)
      ├── Classes (Group fitness)
      ├── Inquiries (Leads)
      └── Membership Plans (Pricing)
```

### Role-Based Access Control (RBAC)

| Role | Permissions | Typical Operations |
|------|-------------|-------------------|
| **SUPERADMIN** | Full system access | Manage all gyms, branches, users |
| **ADMIN** | Gym-level access | Manage gym, branches, members, trainers, subscriptions |
| **TRAINER** | Assigned members | View/manage assigned members, create templates |
| **MEMBER** | Self-only | View profile, progress, assignments |

---

## Authentication & Security

### Authentication Flow

1. **Login Only** - No public registration endpoint
2. **JWT Token** - Stateless authentication with Bearer header
3. **Default Password** - `pass@123` for all new users
4. **Token Payload**: `{ sub: userId, email: string, role: string }`

### Protected Routes

All routes except `/auth/login` and `/auth/logout` require JWT authentication via the `@UseGuards(JwtAuthGuard)` decorator.

### Role-Based Access

Admin-specific endpoints check role in controllers:

```typescript
@Patch('admin/:id')
async adminUpdate(@CurrentUser() user: User) {
  if (!['ADMIN', 'SUPERADMIN'].includes(user.role.name)) {
    throw new ForbiddenException('Admin access required');
  }
  return this.service.adminUpdate(id, dto);
}
```

---

## API Endpoint Summary

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users (`/users`)
- `POST /users` - Create user
- `GET /users` - List users
- `GET /users/:id` - Get user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Gyms (`/gyms`)
- `POST /gyms` - Create gym (with main branch)
- `GET /gyms` - List gyms
- `GET /gyms/:id` - Get gym
- `PATCH /gyms/:id` - Update gym
- `DELETE /gyms/:id` - Delete gym
- `POST /gyms/:gymId/branches` - Create branch
- `GET /gyms/:gymId/branches` - List gym branches
- `GET /gyms/:gymId/members` - List all gym members
- `GET /gyms/:gymId/trainers` - List all gym trainers

### Branches (`/branches`)
- `GET /branches` - List all branches
- `GET /branches/:id` - Get branch
- `PATCH /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch
- `GET /branches/:branchId/members` - List branch members
- `GET /branches/:branchId/trainers` - List branch trainers

### Members (`/members`)
- `POST /members` - Create member (with user + subscription)
- `GET /members` - List members (filter by branch, status, search)
- `GET /members/:id` - Get member
- `PATCH /members/:id` - Update member
- `PATCH /members/admin/:id` - Admin update (sensitive fields)
- `DELETE /members/:id` - Delete member (cascade)
- `GET /members/:memberId/dashboard` - Get member dashboard

### Trainers (`/trainers`)
- `POST /trainers` - Create trainer (with user)
- `GET /trainers` - List trainers (filter by branch, specialization)
- `GET /trainers/:id` - Get trainer
- `PATCH /trainers/:id` - Update trainer
- `DELETE /trainers/:id` - Delete trainer

### Classes (`/classes`)
- `POST /classes` - Create class
- `GET /classes` - List classes
- `GET /classes/:id` - Get class
- `PATCH /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

### Attendance (`/attendance`)
- `POST /attendance/mark` - Mark attendance
- `GET /attendance` - List attendance records
- `GET /attendance/monthly` - Monthly report
- `POST /attendance/goals` - Create attendance goal

### Fitness Tracking
- **Workouts (`/workouts`)**: CRUD for workout plans
- **Diet Plans (`/diet-plans`)**: CRUD for diet plans
- **Goals (`/goals`)**: CRUD for fitness goals
- **Progress (`/progress-tracking`)**: Body measurements
- **Body Progress (`/body-progress`)**: Weight/body fat/BMI
- **Workout Logs (`/workout-logs`)**: Exercise completion logs

### Templates
- **Workout Templates (`/workouts/templates`)**: Reusable workout charts
- **Diet Templates (`/diet-plans/templates`)**: Reusable nutrition plans
- **Goal Templates (`/goals/templates`)**: Reusable goal schedules

### Assignments
- **Member-Trainer (`/assignments`)**: Assign trainers to members
- **Template Assignments (`/templates/assignments`)**: Assign templates
- **Diet Assignments (`/diet-plans/assignments`)**: Assign diet plans
- **Workout Chart Assignments (`/workouts/chart-assignments`)**: Assign workouts

### Financial
- **Invoices (`/invoices`)**: Manage billing
- **Payments (`/payments`)**: Process payments

### Lead Management
- **Inquiries (`/inquiries`)**: Manage prospective member leads

### System
- **Audit Logs (`/audit-logs`)**: System audit trail
- **Analytics (`/analytics`)**: Dashboard analytics
- **Notifications (`/notifications`)**: User notifications

---

## Coding Conventions

### File Naming
- Controllers: `[name].controller.ts`
- Services: `[name].service.ts`
- Modules: `[name].module.ts`
- DTOs: `[action]-[entity].dto.ts`
- Entities: `[name].entity.ts`

### Class Naming
- Controllers: PascalCase + `Controller` suffix
- Services: PascalCase + `Service` suffix
- DTOs: PascalCase + `Dto` suffix
- Entities: PascalCase matching table name

### Method Naming (Service)
- `findAll()` - List all records
- `findOne(id)` - Get single record
- `create(dto)` - Create new record
- `update(id, dto)` - Update record
- `remove(id)` - Delete record
- `findByX(value)` - Filter by relationship

### Database Conventions
- Tables: `snake_case`
- Columns: `snake_case`
- Primary keys: UUID or auto-increment based on entity type
- Foreign keys: `{entity}{referencedKey}` (e.g., `branchBranchId`)

---

## Validation

### Global Validation Pipe (main.ts)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip non-whitelisted properties
    transform: true,              // Auto-transform types
    forbidNonWhitelisted: true,   // Error on non-whitelisted
  }),
);
```

### Common Validators
- `@IsString()` - String validation
- `@IsEmail()` - Email format
- `@IsEnum(EnumType)` - Enum validation
- `@IsOptional()` - Optional field
- `@IsUUID()` - UUID format
- `@IsInt()` - Integer validation
- `@IsArray()` - Array validation

---

## Database Configuration

```typescript
{
  type: 'postgres',
  url: 'postgresql://chandangaur@localhost:5432/gym_db',
  synchronize: true,  // Development mode
  entities: ['src/**/*.entity{.ts,.js}']
}
```

---

## Swagger Documentation

Interactive API documentation available at: `http://localhost:3000/api`

Features:
- Bearer token authentication
- Request/response examples
- Schema definitions
- Try-it-out functionality

---

## Postman Integration

The project includes a Postman auto-populator system that:
1. Takes raw exported collections (endpoints only)
2. Generates realistic fake data using Faker.js
3. Hits the live server one endpoint at a time
4. Captures real responses
5. Writes populated collections back

### Seeded Test Accounts
| Role | Email | Password |
|------|-------|----------|
| SUPERADMIN | `superadmin@fitnessfirstelite.com` | `SuperAdmin123!` |
| ADMIN | `admin@fitnessfirstelite.com` | `Admin123!` |
| TRAINER | `mike.johnson-smith0@email.com` | `Trainer123!` |
| MEMBER | `sophia.johnson-smith0@email.com` | `Member123!` |

---

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

1. **Payment Gateway Integration** - Stripe/Razorpay not implemented
2. **Email Notification System** - SendGrid/AWS SES not integrated
3. **Password Reset/Change** - Forgot password flow missing
4. **File Upload & Storage** - AWS S3/Cloudinary not integrated
5. **Security Hardening** - No rate limiting, CORS open, no Helmet.js
6. **Database Migrations** - Using synchronize=true (dangerous for production)

### Risk Assessment

See `project_risk.md` or Serena memory `project_risk_assessment` for complete risk analysis and mitigation timeline.

**Estimated Time to Production:** 2-3 months (dedicated team) or 4-6 months (single developer)

## Key Features

1. **Multi-Gym Chain Support** - Manage multiple gym locations
---

## Serena MCP Integration

**Status:** ✅ Active (February 7, 2026)

Serena coding agent toolkit is configured for semantic code operations:
- **MCP Config:** `.claude/mcp.json`
- **Project Config:** `.serena/project.yml`
- **Web Dashboard:** http://127.0.0.1:24282/dashboard/index.html
- **Tools:** 29 semantic code tools (find_symbol, replace_symbol_body, rename_symbol, etc.)
- **Languages:** TypeScript (LSP backend)

### Available Serena Tools

**Symbolic Operations:**
- `find_symbol` - Find classes/methods by name (semantic, not grep)
- `find_referencing_symbols` - Find all usages of a symbol
- `replace_symbol_body` - Replace entire method/function body
- `rename_symbol` - Rename across entire codebase
- `insert_after_symbol` / `insert_before_symbol` - Insert code at symbol boundaries

**File Operations:**
- `read_file` - Read file contents
- `create_text_file` - Create/overwrite file
- `list_dir` - List directory contents
- `find_file` - Find files by mask
- `replace_content` - Regex-based content replacement

**Memory Operations:**
- `read_memory` - Read project memory
- `list_memories` - List all memories
- `write_memory` - Write new memory

**Search & Analysis:**
- `search_for_pattern` - Pattern search across project
- `get_symbols_overview` - Get structure of any file

---

## Related Documentation

### Serena Memories (Project Context)
- **Project Info**: `.serena/memories/project_info.md` - Complete architecture, 38 entities, 32 modules
- **Risk Assessment**: `.serena/memories/project_risk_assessment.md` - Risks and 4-phase action plan
- **API Reference**: `.serena/memories/api_reference.md` - Complete API documentation with all endpoints
- **Coding Style**: `.serena/memories/style_and_conventions.md` - Naming patterns and conventions
- **Commands**: `.serena/memories/suggested_commands.md` - Development and testing commands
- **Postman Setup**: `.serena/memories/postman-collection-populator-setup.md` - Postman automation
- **Serena MCP**: `.serena/memories/serena_mcp_setup.md` - Serena MCP configuration

### Analysis Documents
- **Project Analysis**: `project_analysis.md` - Comprehensive agent team analysis (Feb 6, 2026)
  - 38 entities detailed breakdown
  - 32 feature modules documented
  - Missing features categorized
  - Recommendations prioritized
- **Risk Tracking**: `project_risk.md` - Development phase risk tracking

### Documentation Updates (February 7, 2026)

**Corrections Made:**
- Entity count: 27 → **38 entities**
- Module count: 23 → **32 modules**
- Added code statistics: 150+ TS files, 48 controllers, 32 services, ~32,715 LOC
- Project status: "production-ready" → **70% complete**
- Documented critical missing features (payments, emails, file uploads, security)
- Added Serena MCP integration section

---

## Recent Updates

### February 7, 2026
- **Serena MCP Activated** - Semantic code tools now available via MCP
- **Memories Updated** - All 9 Serena memories updated with comprehensive analysis data
- **Risk Assessment Created** - Detailed risk analysis with 4-phase mitigation plan

### February 6, 2026
- **Comprehensive Analysis** - Agent team analysis completed (project_analysis.md)
- **Risk Documentation** - Development phase risks identified and documented

### Previous Days (Feb 1-5, 2026)
- Features #13-15 verified (gym CRUD operations)
- JWT authentication and gym creation verified
- Swagger documentation verified
- Infrastructure tests completed

---

## Serena MCP Integration

**Status:** ✅ Active (February 7, 2026)

Serena coding agent toolkit is configured for semantic code operations:
- **MCP Config:** `.claude/mcp.json`
- **Project Config:** `.serena/project.yml`
- **Web Dashboard:** http://127.0.0.1:24282/dashboard/index.html
- **Tools:** 29 semantic code tools (find_symbol, replace_symbol_body, rename_symbol, etc.)
- **Languages:** TypeScript (LSP backend)

### Available Serena Tools

**Symbolic Operations:**
- `find_symbol` - Find classes/methods by name (semantic, not grep)
- `find_referencing_symbols` - Find all usages of a symbol
- `replace_symbol_body` - Replace entire method/function body
- `rename_symbol` - Rename across entire codebase
- `insert_after_symbol` / `insert_before_symbol` - Insert code at symbol boundaries

**File Operations:**
- `read_file` - Read file contents
- `create_text_file` - Create/overwrite file
- `list_dir` - List directory contents
- `find_file` - Find files by mask
- `replace_content` - Regex-based content replacement

**Memory Operations:**
- `read_memory` - Read project memory
- `list_memories` - List all memories
- `write_memory` - Write new memory

**Search & Analysis:**
- `search_for_pattern` - Pattern search across project
- `get_symbols_overview` - Get structure of any file

---

## Related Documentation

### Serena Memories (Project Context)
- **Project Info**: `.serena/memories/project_info.md` - Complete architecture, 38 entities, 32 modules
- **Risk Assessment**: `.serena/memories/project_risk_assessment.md` - Risks and 4-phase action plan
- **API Reference**: `.serena/memories/api_reference.md` - Complete API documentation with all endpoints
- **Coding Style**: `.serena/memories/style_and_conventions.md` - Naming patterns and conventions
- **Commands**: `.serena/memories/suggested_commands.md` - Development and testing commands
- **Postman Setup**: `.serena/memories/postman-collection-populator-setup.md` - Postman automation
- **Serena MCP**: `.serena/memories/serena_mcp_setup.md` - Serena MCP configuration

### Analysis Documents
- **Project Analysis**: `project_analysis.md` - Comprehensive agent team analysis (Feb 6, 2026)
  - 38 entities detailed breakdown
  - 32 feature modules documented
  - Missing features categorized
  - Recommendations prioritized
- **Risk Tracking**: `project_risk.md` - Development phase risk tracking

### Documentation Updates (February 7, 2026)

**Corrections Made:**
- Entity count: 27 → **38 entities**
- Module count: 23 → **32 modules**
- Added code statistics: 150+ TS files, 48 controllers, 32 services, ~32,715 LOC
- Project status: "production-ready" → **70% complete**
- Documented critical missing features (payments, emails, file uploads, security)
- Added Serena MCP integration section

---

## Recent Updates

### February 7, 2026
- **Serena MCP Activated** - Semantic code tools now available via MCP
- **Memories Updated** - All 9 Serena memories updated with comprehensive analysis data
- **Risk Assessment Created** - Detailed risk analysis with 4-phase mitigation plan
- **CLAUDE.md Updated** - Project documentation now reflects 70% complete status

### February 6, 2026
- **Comprehensive Analysis** - Agent team analysis completed (project_analysis.md)
- **Risk Documentation** - Development phase risks identified and documented
