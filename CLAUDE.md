# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **production-ready multi-tenant gym management system** built with NestJS 11, TypeScript 5.7, and PostgreSQL (TypeORM). The system supports multiple gym chains with branch-level operations, comprehensive member/trainer management, subscriptions, classes, attendance tracking, financial management (invoices/payments), lead management, analytics, and advanced fitness tracking (diet plans, workout plans, progress monitoring).

## Development Guidelines

1. **Understand Before Acting**: First think through the problem, read the codebase for relevant files. Never speculate about code you have not opened.

2. **Verify Before Changes**: Before making major changes, present the plan to the user for verification.

3. **Explain Changes**: Every step of the way, provide a high-level explanation of what changes were made.

4. **Keep It Simple**: Make every task and code change as simple as possible. Avoid massive or complex changes. Impact as little code as possible. Simplicity is key.

5. **Document Architecture**: Maintain documentation that describes how the architecture of the app works inside and out.

6. **No Speculation**: Never speculate about code you have not opened. If the user references a specific file, read it first. Investigate and read relevant files BEFORE answering questions. Give grounded, hallucination-free answers.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run start:dev

# Access Swagger API docs
open http://localhost:3000/api
```

**First-time setup:**
1. Copy `.env.example` to `.env` and configure DATABASE_URL, JWT_SECRET
2. Run `npm run start:dev` - TypeORM will auto-create tables (synchronize: true)
3. Login at `/auth/login` (seed admin account or create via API)

## Common Development Commands

```bash
# Development
npm run start:dev          # Start dev server with hot reload
npm run start:debug        # Start in debug mode
npm run build              # Build for production
npm run start:prod         # Run production build

# Code Quality
npm run lint               # Lint and auto-fix code
npm run format             # Format code with Prettier

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Database (TypeORM)
# Note: synchronize: true is enabled in development (dbConfig.ts:8)
# For production, disable sync and use migrations:
# npm run typeorm migration:create -- -n MigrationName
# npm run typeorm migration:run
```

## Architecture Overview

### Module Structure (23 Feature Modules)

```
src/
├── main.ts                    # Entry point with global config (ValidationPipe, Swagger)
├── app.module.ts              # Root module importing all feature modules
├── auth/                      # JWT authentication (Passport + bcrypt)
├── users/                     # User management & profiles
├── roles/                     # Role definitions (SUPERADMIN, ADMIN, TRAINER, MEMBER)
├── gyms/                      # Gym & branch management (multi-tenant core)
├── members/                   # Member profiles & management
├── trainers/                  # Trainer profiles & management
├── classes/                   # Class scheduling with recurrence (daily/weekly/monthly)
├── membership-plans/          # Subscription plan definitions
├── subscriptions/             # Member subscription tracking
├── assignments/               # Member-trainer assignment (many-to-many)
├── attendance/                # Check-in/check-out tracking
├── inquiries/                 # Lead management & conversion workflow
├── invoices/                  # Invoice generation & management
├── payments/                  # Payment transaction processing
├── analytics/                 # Business dashboards & reporting
├── audit-logs/                # Complete system activity tracking
├── diet-plans/                # Structured diet plans & meals
├── workouts/                  # Workout plans & exercise library
├── workout-logs/              # Workout history tracking
├── body-progress/             # Body measurements & photos
├── progress-tracking/         # Comprehensive progress monitoring
├── goals/                     # Fitness goal tracking
├── exercise-library/          # Exercise database (standalone)
├── entities/                  # 27 TypeORM entity definitions
├── common/                    # Shared utilities & enums
└── database/                  # Database configuration & seeds
```

---

## Entity Architecture (27 Entities)

### Entity Groups

**Core Business:** User, Role, Gym, Branch
**People:** Member, Trainer (auto-increment PK)
**Scheduling:** Class (UUID PK), Attendance (polymorphic: member/trainer)
**Subscriptions:** MembershipPlan, MemberSubscription
**Financial:** Invoice, PaymentTransaction
**Fitness Tracking:** DietPlan, DietPlanMeal, WorkoutPlan, WorkoutPlanExercise, WorkoutLog, BodyProgress, ProgressTracking, Goal, AttendanceGoal, Diet, ExerciseLibrary
**System:** AuditLog, Notification
**Relationships:** MemberTrainerAssignment

| # | Entity | Table | PK Type | Key |
|---|--------|-------|---------|-----|
| 1 | User | users | UUID | email, passwordHash, memberId |
| 2 | Role | roles | UUID | name, description |
| 3 | Gym | gyms | UUID | name, email, phone |
| 4 | Branch | branches | UUID | name, email, mainBranch |
| 5 | Member | members | Auto | fullName, email, isActive |
| 6 | MembershipPlan | membership_plans | Auto | name, price, durationInDays |
| 7 | MemberSubscription | member_subscriptions | Auto | startDate, endDate, selectedClassIds[] |
| 8 | Trainer | trainers | Auto | fullName, email, specialization |
| 9 | Class | classes | UUID | name, description, recurrence_type |
| 10 | MemberTrainerAssignment | member_trainer_assignments | UUID | start_date, end_date, status |
| 11 | Attendance | attendance | UUID | attendanceType, checkInTime, checkOutTime |
| 12 | Inquiry | inquiries | Auto | fullName, email, status |
| 13 | Invoice | invoices | UUID | total_amount, status |
| 14 | PaymentTransaction | payment_transactions | UUID | amount, method, status |
| 15 | AuditLog | audit_logs | UUID | action, entity_type |
| 16 | DietPlan | diet_plans | UUID | title, goal_type, target_calories |
| 17 | DietPlanMeal | diet_plan_meals | UUID | meal_type, calories |
| 18 | ExerciseLibrary | exercise_library | UUID | exercise_name, body_part |
| 19 | WorkoutPlan | workout_plans | UUID | title, difficulty_level |
| 20 | WorkoutPlanExercise | workout_plan_exercises | UUID | exercise_name, sets, reps |
| 21 | WorkoutLog | workout_logs | Auto | exercise_name, sets, reps |
| 22 | BodyProgress | body_progress | Auto | weight, body_fat, measurements |
| 23 | ProgressTracking | progress_tracking | UUID | weight_kg, bmi, body_fat_percentage |
| 24 | AttendanceGoal | attendance_goals | UUID | goal_type, target_count, current_streak |
| 25 | Goal | goals | Auto | goal_type, target_value, status |
| 26 | Notification | notifications | UUID | title, message, is_read |
| 27 | Diet | diets | Auto | calories, protein, carbs, fat |

### Primary Key Distribution

- **UUID (15 entities):** User, Role, Gym, Branch, Class, MemberTrainerAssignment, Attendance, Invoice, PaymentTransaction, AuditLog, DietPlan, DietPlanMeal, ExerciseLibrary, WorkoutPlan, WorkoutPlanExercise, ProgressTracking, AttendanceGoal, Notification

- **Auto-increment (12 entities):** Member, MembershipPlan, MemberSubscription, Trainer, Inquiry, WorkoutLog, BodyProgress, Goal, Diet

### Cascade Delete Relationships

- Branch → Gym
- MemberTrainerAssignment → Member
- Attendance → Member
- Invoice → Member
- PaymentTransaction → Invoice
- DietPlan → Member
- DietPlanMeal → DietPlan
- WorkoutPlan → Member
- WorkoutPlanExercise → WorkoutPlan
- WorkoutLog → Member
- BodyProgress → Member
- ProgressTracking → Member
- AttendanceGoal → Member
- Goal → Member
- Diet → Member

### JSONB Columns

- AuditLog: `previous_values`, `new_values`
- BodyProgress: `measurements`, `progress_photos`
- Goal: `milestone`
- Diet: `meals`

### Unique Constraints

- User: `email`
- Role: `name`
- Gym: `email`
- Member: `email`, `subscriptionId`
- Trainer: `email`
- Inquiry: `email`

---

## Service Architecture

### Core Services

| Service | Key Feature | Dependencies |
|---------|-------------|--------------|
| **AuthService** | JWT generation, bcrypt validation | UsersService, JwtService |
| **UsersService** | User management with linked member/trainer data | User, Member, Trainer |
| **MembersService** | **TRANSACTIONAL** - atomic member+user+subscription creation | 9 entities |
| **TrainersService** | Trainer profile with auto user account creation | Trainer, User, Role |
| **AttendanceService** | Dual-polymorphic (Member OR Trainer), streak calculation | Attendance, Member, Trainer |
| **PaymentsService** | Auto-invoice settlement | PaymentTransaction, Invoice |
| **InquiriesService** | Lead conversion workflow | Inquiry |
| **AnalyticsService** | Promise.all() parallelization for dashboards | 10+ entities |

### Key Service Patterns

1. **Transaction Handling**: Only `MembersService.create()` uses explicit transactions with row-level locking
2. **Role-Based Access**: ADMIN → TRAINER → MEMBER hierarchy in fitness services
3. **Auto-Settlement**: PaymentsService marks invoices paid when amount threshold met
4. **Streak Calculation**: AttendanceService tracks check-in streaks

---

## Controller Architecture (23 Controllers, ~140 Endpoints)

### Authentication Pattern

| Pattern | Controllers Using |
|---------|-------------------|
| `@UseGuards(JwtAuthGuard)` on ALL endpoints | Most controllers (21/23) |
| `@UseGuards(JwtAuthGuard)` on SOME endpoints | `auth` (login/logout public), `inquiries` (POST public) |
| NO authentication | `app.controller` (root, health, info) |

### Public Endpoints

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /`, `/health`, `/info` - API info
- `POST /inquiries` - Lead capture (public)

### Key Controllers

| Controller | Endpoints | Special Features |
|------------|-----------|------------------|
| **AuthController** | POST /login, POST /logout | Public endpoints |
| **MembersController** | POST/GET /members, PATCH /members/admin/:id, GET /members/:id/dashboard | Transactional create, Admin-only updates |
| **AttendanceController** | POST /attendance, PATCH /attendance/:id/checkout | Polymorphic (member/trainer) |
| **InquiriesController** | POST /inquiries, POST /inquiries/:id/convert | Lead conversion |
| **PaymentsController** | POST /payments | Auto-invoice settlement |
| **AnalyticsController** | GET /analytics/gym/:gymId/dashboard | Parallel queries |
| **DietPlansController** | POST/GET /diet-plans | Uses `@CurrentUser()` |
| **WorkoutsController** | POST/GET /workouts | Composite pattern (plans+exercises) |

### Common Patterns

- **Numeric IDs**: `@Param('id', ParseIntPipe) id: number` (Member, Trainer, etc.)
- **UUID IDs**: `@Param('id') id: string` (Branch, Class, Invoice, etc.)
- **Nested Resources**: Classes, Members, Trainers have branch/gym variants
- **Custom Decorator**: `@CurrentUser() user: UserEntity` extracts authenticated user

---

## Authentication & Security

### JWT Authentication Flow

1. Login: `POST /auth/login` → Returns `{ userid, access_token }`
2. Token stored in Authorization header: `Bearer <token>`
3. Protected routes use `@UseGuards(JwtAuthGuard)`
4. Passwords hashed with bcrypt (10 rounds)

### Role-Based Access Control

```typescript
enum UserRole {
  SUPERADMIN = 'SUPERADMIN',  // System level
  ADMIN = 'ADMIN',            // Gym owner level
  TRAINER = 'TRAINER',        // Trainer level
  MEMBER = 'MEMBER'           // Member level
}
```

---

## API Structure

### Swagger Documentation

- **URL**: `http://localhost:3000/api`
- **Auth**: Bearer token support with persistence
- **Tags**: 23 organized API groups

### Key API Endpoints

| Category | Endpoints |
|----------|-----------|
| **Auth** | POST /auth/login, POST /auth/logout |
| **Gym/Branch** | POST /gyms, POST /gyms/:gymId/branches, GET /branches |
| **Members** | POST /members, GET /members, PATCH /members/admin/:id, GET /branches/:branchId/members |
| **Subscriptions** | POST /membership-plans, POST /subscriptions, POST /subscriptions/:id/cancel |
| **Classes** | POST /classes, GET /classes, GET /branches/:branchId/classes |
| **Attendance** | POST /attendance, PATCH /attendance/:id/checkout |
| **Financial** | POST /invoices, POST /payments, GET /members/:memberId/invoices |
| **Leads** | POST /inquiries, POST /inquiries/:id/convert, GET /inquiries/stats |
| **Analytics** | GET /analytics/gym/:gymId/dashboard, GET /analytics/branch/:branchId/attendance |
| **Fitness** | POST /diet-plans, POST /workouts, POST /progress-tracking, POST /goals |

---

## Configuration

### Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

### Database Configuration

```typescript
export const pgConfig: PostgresConnectionOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',
  port: 5432,
  synchronize: true,  // ⚠️ Set to false in production
  logging: ['error', 'warn'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  ssl: { rejectUnauthorized: false }
};
```

### Global Configuration

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  })
);
```

---

## Gotchas & Warnings

- **Transaction scope**: Only `MembersService.create()` uses explicit transactions. Other services use auto-commit. Don't assume transactions elsewhere.
- **Polymorphic attendance**: `Attendance` entity tracks BOTH members AND trainers. Check `attendanceType` column to distinguish.
- **UUID vs auto-increment**: Some entities use UUID (Class, Invoice, AuditLog) while others use auto-increment (Member, Trainer). Always check the entity before using params.
- **Cascade deletes**: Deleting a Member cascades to subscriptions, attendance, invoices, diet plans, workouts, progress tracking. This is intentional but can cause data loss if mistaken.
- **synchronize:true**: Never use in production. Creates auto-migrations but can corrupt data on restarts.
- **Member+User sync**: Creating a Member via `MembersService.create()` also creates a User account. Don't create Member records manually.
- **Role names are strings**: `UserRole.SUPERADMIN`, `UserRole.ADMIN`, etc. are literal strings, not enums in the database.

---

## DTO Pattern

```typescript
// dto/create-member.dto.ts
import { IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

**Always include:** `@ApiProperty` with example for Swagger documentation.

---

## Development Workflow

### Standard Module Pattern

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModuleModule {}
```

### Standard Service Pattern

```typescript
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
  ) {}
}
```

### Standard Controller Pattern

```typescript
@Controller('module')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  async create(@Body() createDto: CreateModuleDto) {
    return this.moduleService.create(createDto);
  }
}
```

---

## Entity Naming Conventions

- **Tables**: snake_case (e.g., `member_subscriptions`)
- **Columns**: camelCase (e.g., `memberId`, `createdAt`)
- **Primary Keys**: `uuid` or `auto-increment`
- **Foreign Keys**: `<entity>Id` (e.g., `gymId`, `memberId`)
- **Timestamps**: `createdAt`, `updatedAt`

---

## Important Notes

- **Development Only**: `synchronize: true` in dbConfig.ts - never use in production
- **Type Safety**: All entities use UUID or auto-increment primary keys
- **Validation**: All inputs validated via DTOs with class-validator
- **Authentication**: All sensitive endpoints require JWT bearer token
- **Multi-Tenant**: Gym/branch hierarchy ensures data isolation
- **Audit Trail**: All changes logged in audit_logs table
- **JSONB Fields**: Used for flexible data (measurements, milestones, meals)
- **Transactions**: Only MembersService uses database transactions

---

## File Structure Pattern

```
src/<module>/
├── <module>.module.ts      # Module definition
├── <module>.controller.ts  # HTTP endpoints
├── <module>.service.ts     # Business logic
├── dto/
│   ├── create-<module>.dto.ts
│   └── update-<module>.dto.ts
└── types/                  # Optional type definitions
```

---

## Recently Implemented Features (Jan 2026)

### Role-Based Access Control
- **Permissions Enum** (`src/common/enums/permissions.enum.ts`): GYM_*, BRANCH_*, MEMBER_*, TRAINER_*, CHART_*, DIET_*, GOAL_* permissions
- **@Roles Decorator** (`src/auth/decorators/roles.decorator.ts`): Role-based route protection
- **RolesGuard** (`src/auth/guards/roles.guard.ts`): Validates user roles against required roles
- **BranchAccessGuard** (`src/auth/guards/branch-access.guard.ts`): Validates gym/branch ownership

### Goal System
- **GoalSchedule** (`src/entities/goal_schedules.entity.ts`): Weekly/monthly/quarterly goals with milestones
- **GoalScheduleMilestone** (`src/entities/goal_schedule_milestones.entity.ts`): Per-period milestone tracking
- **GoalTemplate** (`src/entities/goal_templates.entity.ts`): Reusable goal templates

### Training Charts (Workout Templates)
- **WorkoutTemplate** (`src/entities/workout_templates.entity.ts`):
  - ChartVisibility: PRIVATE, GYM_PUBLIC
  - ChartType: STRENGTH, CARDIO, HIIT, FLEXIBILITY, COMPOUND
  - DifficultyLevel: BEGINNER, INTERMEDIATE, ADVANCED
  - Template versioning (version, parent_template_id, usage_count)
- **WorkoutTemplateExercise** (`src/entities/workout_template_exercises.entity.ts`):
  - EquipmentRequired: BARBELL, DUMBBELL, CABLE, MACHINE, BODYWEIGHT, etc.
- **WorkoutPlanChartAssignment** (`src/entities/workout_plan_chart_assignments.entity.ts`): Chart-to-member assignments with customizations

### Diet Integration
- **DietTemplate** (`src/entities/diet_templates.entity.ts`): Template fields (is_template, usage_count, version)
- **DietTemplateMeal** (`src/entities/diet_template_meals.entity.ts`): Template meals
- **DietPlanAssignment** (`src/entities/diet_plan_assignments.entity.ts`): Diet-to-member assignments

### Template Sharing
- **TemplateShare** (`src/entities/template_shares.entity.ts`): Admin-to-trainer template sharing

### Notifications
- **NotificationType Enum**: GOAL_PROGRESS, GOAL_COMPLETED, GOAL_MISSED, MILESTONE_COMPLETE, MILESTONE_MISSED, CHART_ASSIGNED, CHART_SHARED, DIET_ASSIGNED, TEMPLATE_FEEDBACK_REQUEST, SYSTEM, REMINDER

### New Controllers Added
- `src/goals/goal-schedules.controller.ts` - Goal schedule CRUD
- `src/goals/goal-templates.controller.ts` - Goal template management
- `src/workouts/workout-templates.controller.ts` - Workout template management
- `src/workouts/workout-plan-chart-assignments.controller.ts` - Chart assignments
- `src/diet-plans/diet-templates.controller.ts` - Diet template management
- `src/diet-plans/diet-assignments.controller.ts` - Diet assignments

---

## Database Seeding

Check `src/database/` for:
- `seed-working.ts` - Working seed data
- `add-comprehensive-data.ts` - Full test data
- `verify-data.ts` - Data verification script
