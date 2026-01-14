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

### Module Structure (26 Feature Modules)

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

### Key Design Patterns

- **Module Pattern**: Each feature is self-contained with controller, service, and repository
- **Repository Pattern**: TypeORM repositories for data access abstraction
- **DTO Pattern**: Data Transfer Objects for validation and type safety
- **Guard Pattern**: JWT authentication guards (`@UseGuards(JwtAuthGuard)`)
- **Dependency Injection**: NestJS built-in DI for loose coupling
- **Global Pipes**: ValidationPipe with whitelist, transform, forbidNonWhitelisted

## Database Architecture

### Core Entities (27 entities)

**User Management:**
- `users` - System users with role-based access (UUID PK)
- `roles` - Predefined roles (SUPERADMIN, ADMIN, TRAINER, MEMBER)

**Gym Operations:**
- `gyms` - Multi-tenant gym organizations (UUID PK)
- `branches` - Gym locations with hierarchical structure (UUID PK)

**Member Management:**
- `members` - Member profiles (auto-increment PK)
- `membership_plans` - Subscription plans (auto-increment PK)
- `member_subscriptions` - Active subscriptions (auto-increment PK)

**Trainer & Classes:**
- `trainers` - Trainer profiles (auto-increment PK)
- `classes` - Class definitions with recurrence (UUID PK)
- `member_trainer_assignments` - Many-to-many join table (UUID PK)

**Lead Management:**
- `inquiries` - Leads with status tracking (auto-increment PK)

**Financial:**
- `invoices` - Billing records (UUID PK)
- `payment_transactions` - Payment tracking (UUID PK)

**Attendance & Audit:**
- `attendance` - Check-in/check-out records (UUID PK)
- `audit_logs` - Complete activity tracking (UUID PK)

**Advanced Fitness:**
- `diet_plans` - Structured diet plans (UUID PK)
- `diet_plan_meals` - Meal components (UUID PK)
- `exercise_library` - Exercise database (UUID PK)
- `workout_plans` - Workout plans (UUID PK)
- `workout_plan_exercises` - Exercise components (UUID PK)
- `workout_logs` - Workout history (auto-increment PK)
- `progress_tracking` - Body measurements & metrics (UUID PK)
- `body_progress` - Body measurements (auto-increment PK)
- `attendance_goals` - Attendance goal tracking (UUID PK)
- `goals` - Fitness goals (auto-increment PK)
- `notifications` - User notifications (UUID PK)

### Relationship Types

- **One-to-One**: Member ↔ MemberSubscription
- **One-to-Many**: Gym → Branches, Member → Attendance, etc.
- **Many-to-One**: Branch → Gym, Member → Branch, etc.
- **Many-to-Many**: Member ↔ Trainer (via MemberTrainerAssignment)

### Special Behaviors

- **CASCADE DELETE**: Branches deleted when Gym is deleted
- **EAGER LOADING**: User.role is always loaded automatically
- **Polymorphic Pattern**: Attendance can reference Member OR Trainer
- **JSONB Storage**: Flexible data for measurements, milestones, audit logs

## Authentication & Security

### JWT Authentication Flow

1. Login: `POST /auth/login` → Returns JWT token
2. Token stored in Authorization header: `Bearer <token>`
3. Protected routes use `@UseGuards(JwtAuthGuard)`
4. Passwords hashed with bcrypt (6 rounds)

### Role-Based Access Control

```typescript
// Roles enum
enum UserRole {
  SUPERADMIN = 'SUPERADMIN',  // System level
  ADMIN = 'ADMIN',            // Gym owner level
  TRAINER = 'TRAINER',        // Trainer level
  MEMBER = 'MEMBER'           // Member level
}
```

### Global Security Configuration

- **ValidationPipe**: Strips non-whitelisted properties, auto-transforms payloads
- **JWT Strategy**: Passport strategy validates tokens
- **bcrypt**: Password hashing with salt rounds

## API Structure

### Swagger Documentation

- **URL**: `http://localhost:3000/api`
- **Auth**: Bearer token support with persistence
- **Tags**: 23 organized API groups

### Key API Endpoints

#### Authentication
- `POST /auth/login` - User login

#### Gym & Branch Management
- `POST /gyms` - Create gym
- `POST /gyms/:gymId/branches` - Create branch
- `GET /branches` - List all branches

#### Member Management
- `POST /members` - Create member
- `GET /members` - List members with filtering
- `GET /branches/:branchId/members` - Branch members

#### Membership & Subscriptions
- `POST /membership-plans` - Create plan
- `POST /subscriptions` - Assign member to plan
- `POST /subscriptions/:id/cancel` - Cancel subscription

#### Classes & Attendance
- `POST /classes` - Create class with recurrence
- `POST /attendance` - Check-in/check-out
- `GET /attendance/:id/checkout` - Check out

#### Financial Management
- `POST /invoices` - Create invoice
- `POST /payments` - Record payment
- `GET /members/:memberId/invoices` - Member billing

#### Lead Management
- `POST /inquiries` - Create lead
- `POST /inquiries/:id/convert` - Convert to member
- `GET /inquiries/stats` - Lead analytics

#### Analytics & Reporting
- `GET /analytics/gym/:gymId/dashboard` - Gym dashboard
- `GET /analytics/branch/:branchId/members` - Member analytics
- `GET /analytics/gym/:gymId/attendance` - Attendance analytics

#### Advanced Fitness Tracking
- `POST /diet-plans` - Create diet plan
- `POST /workout-plans` - Create workout plan
- `POST /progress-tracking` - Record progress
- `POST /goals` - Set fitness goals

## Configuration

### Environment Variables (.env)

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

### Database Configuration (dbConfig.ts)

```typescript
export const pgConfig: PostgresConnectionOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',
  port: 5432,
  synchronize: true,  // ⚠️ Set to false in production
  logging: ['error', 'warn'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*.js'],
  ssl: { rejectUnauthorized: false }
};
```

### Global Configuration (main.ts)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip non-whitelisted properties
    transform: true,           // Auto-transform to DTO instances
    forbidNonWhitelisted: true // Throw error for non-whitelisted
  })
);
```

## Development Workflow

### Adding a New Feature Module

1. **Create entities** in `src/entities/`
2. **Create DTOs** in `src/<module>/dto/`
3. **Create service** in `src/<module>/<module>.service.ts`
4. **Create controller** in `src/<module>/<module>.controller.ts`
5. **Create module** in `src/<module>/<module>.module.ts`
6. **Import in app.module.ts**

### Standard Module Pattern

```typescript
// src/<module>/<module>.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // List entities used by this module
    ])
  ],
  controllers: [<Module>Controller],
  providers: [<Module>Service],
  exports: [<Module>Service],
})
export class <Module>Module {}
```

### Standard Service Pattern

```typescript
// src/<module>/<module>.service.ts
@Injectable()
export class <Module>Service {
  constructor(
    @InjectRepository(<Entity>)
    private readonly <entity>Repository: Repository<>,
  ) {}

  // CRUD methods with business logic
}
```

### Standard Controller Pattern

```typescript
// src/<module>/<module>.controller.ts
@Controller('<module>')
@UseGuards(JwtAuthGuard)
export class <Module>Controller {
  constructor(private readonly <module>Service: <Module>Service) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiTags('<module>')
  async create(@Body() createDto: Create<Module>Dto) {
    return this.<module>Service.create(createDto);
  }
}
```

## Testing

### Unit Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode for TDD
npm run test:cov          # With coverage report
```

### E2E Tests

```bash
npm run test:e2e          # End-to-end tests
```

## Production Deployment Checklist

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Disable `synchronize: true`, use migrations
3. **JWT Secret**: Use strong random secret (32+ characters)
4. **HTTPS**: Enable TLS/SSL for API endpoints
5. **CORS**: Configure allowed origins
6. **Logging**: Implement structured logging
7. **Monitoring**: Add error tracking (e.g., Sentry)
8. **Database**: Enable connection pooling
9. **Security**: Rate limiting on auth endpoints

## Common Tasks

### Fix TypeScript Errors
```bash
npm run lint              # Auto-fixes many issues
# Then manually fix remaining errors
```

### Format Code
```bash
npm run format            # Prettier formatting
```

### View API Documentation
```bash
npm run start:dev
# Navigate to http://localhost:3000/api
```

### Check Database Schema
```bash
# Schema auto-syncs in development (dbConfig.ts:8)
# View entities in src/entities/
```

## Important Notes

- **Development Only**: `synchronize: true` in dbConfig.ts - never use in production
- **Type Safety**: All entities use UUID or auto-increment primary keys
- **Validation**: All inputs validated via DTOs with class-validator
- **Authentication**: All sensitive endpoints require JWT bearer token
- **Multi-Tenant**: Gym/branch hierarchy ensures data isolation
- **Audit Trail**: All changes logged in audit_logs table
- **JSONB Fields**: Used for flexible data (measurements, milestones, meals)

## Entity Naming Conventions

- **Tables**: snake_case (e.g., `member_subscriptions`)
- **Columns**: camelCase (e.g., `memberId`, `createdAt`)
- **Primary Keys**: `uuid` or `auto-increment`
- **Foreign Keys**: `<entity>Id` (e.g., `gymId`, `memberId`)
- **Timestamps**: `createdAt`, `updatedAt`

## Module Dependencies

Core modules that other modules depend on:
- `auth` - Authentication (imports users)
- `users` - User management (imports roles)
- `gyms` - Multi-tenant structure (imports branches)
- `members` - Member management (imports branches, users)
- `trainers` - Trainer management (imports branches)

## File Structure Pattern

Each feature module follows this structure:
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

## Database Seeding

Check `src/database/` for:
- `seed-working.ts` - Working seed data
- `add-comprehensive-data.ts` - Full test data
- `verify-data.ts` - Data verification script
