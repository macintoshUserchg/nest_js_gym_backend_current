# Gym Management System - Project Description

## Quick Reference

| Aspect             | Details                                  |
| ------------------ | ---------------------------------------- |
| **Status**         | Production-Ready ✅                      |
| **Framework**      | NestJS 11.0.1 + TypeScript 5.7.3         |
| **Database**       | PostgreSQL (Neon Cloud) + TypeORM 0.3.24 |
| **Modules**        | 26 feature modules                       |
| **Entities**       | 27 TypeORM entities                      |
| **API Endpoints**  | 100+ RESTful endpoints                   |
| **Documentation**  | Swagger UI at `/api`                     |
| **Authentication** | JWT with Passport                        |
| **Validation**     | class-validator + Global ValidationPipe  |
| **Testing**        | Jest 29.7.0                              |
| **Code Quality**   | ESLint 9.18.0 + Prettier 3.4.2           |

## Overview

A comprehensive, production-ready gym management system built with NestJS and TypeScript, designed to handle multi-gym operations with branch management, member subscriptions, trainer assignments, class scheduling, attendance tracking, audit logging, financial management, lead management, and advanced fitness tracking features including diet plans, workout plans, and comprehensive progress monitoring.

### Project Status

**Production-Ready** - Fully functional with 26 feature modules, 27 database entities, complete API documentation, and comprehensive business logic implementation.

### Key Capabilities

- **Multi-tenant Architecture** - Support for multiple gym chains with branch-level operations
- **Complete Member Lifecycle** - From lead inquiry to active member with subscription management
- **Advanced Fitness Tracking** - Diet plans, workout plans, progress tracking, and goal management
- **Financial Management** - Invoicing, payment processing, and revenue analytics
- **Analytics & Reporting** - Real-time dashboards for gyms and branches
- **Role-Based Access Control** - SUPERADMIN, ADMIN, TRAINER, MEMBER roles with JWT authentication
- **Cloud-Native** - Neon PostgreSQL cloud database with scalable architecture

## Technology Stack

### Backend Framework

- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type-safe development with strict type checking
- **Node.js** - Runtime environment

### Database & ORM

- **TypeORM 0.3.24** - Feature-rich ORM for database operations
- **PostgreSQL** - Primary database (Neon cloud database)
- **TypeORM Synchronize** - Auto-schema synchronization in development

### Authentication & Security

- **@nestjs/passport 11.0.5** - Authentication middleware
- **@nestjs/jwt 11.0.0** - JWT token generation and validation
- **passport-jwt 4.0.1** - JWT authentication strategy
- **bcrypt 6.0.0** - Password hashing and encryption
- **JWT Guards** - Route protection with bearer token authentication

### API Documentation

- **@nestjs/swagger 11.2.0** - OpenAPI/Swagger integration
- **swagger-ui-express 5.0.1** - Interactive API documentation UI
- Auto-generated API specs at `/api` endpoint with bearer authentication

### Validation & Transformation

- **class-validator 0.14.2** - Decorator-based DTO validation
- **class-transformer 0.5.1** - Object-to-plain and plain-to-object transformation
- **ValidationPipe** - Global validation pipeline with whitelist and transform options

### Development Tools

- **@nestjs/cli 11.0.0** - CLI for project scaffolding and development
- **ESLint 9.18.0** - Code linting with typescript-eslint
- **Prettier 3.4.2** - Code formatting
- **Jest 29.7.0** - Testing framework
- **ts-jest 29.2.5** - TypeScript preprocessor for Jest

### Configuration

- **@nestjs/config 4.0.2** - Environment-based configuration management
- **dotenv** - Environment variable loading

## Architecture

### Modular Structure

The application follows NestJS modular architecture with clear separation of concerns and 26 feature modules:

````
src/
├── main.ts              # Application entry point with global config
├── app.module.ts        # Root module with TypeORM and feature module imports
├── auth/                # Authentication & JWT strategy
├── users/               # User management and profiles
├── roles/               # Role management (SUPERADMIN, ADMIN, TRAINER, MEMBER)
├── gyms/                # Gym organization management
├── gyms/branches/       # Branch management (integrated in gyms module)
├── members/             # Member management and profiles
├── trainers/            # Trainer management and profiles
├── classes/             # Class scheduling with recurrence
├── membership-plans/    # Subscription plan management
├── subscriptions/       # Member subscription tracking
├── assignments/         # Member-trainer assignment management
├── attendance/          # Attendance tracking (check-in/check-out)
├── inquiries/           # Lead management and conversion
├── invoices/            # Invoice generation and management
├── payments/            # Payment transaction processing
├── analytics/           # Business analytics and dashboards
├── audit-logs/          # System audit logging
├── diet-plans/          # Structured diet plan management
│   ├── diet-plans/      # Diet plan CRUD
│   └── diet-plan-meals/ # Meal components (integrated)
├── workouts/            # Workout plan management
│   ├── exercise-library/# Exercise database (integrated)
│   ├── workout-plans/   # Workout plan CRUD
│   └── workout-plan-exercises/ # Exercise components (integrated)
├── workout-logs/        # Workout logging and history
├── body-progress/       # Body measurements and photos
├── progress-tracking/   # Comprehensive progress monitoring
├── goals/               # Fitness goal tracking
├── entities/            # TypeORM entity definitions (27 entities)
├── common/              # Shared utilities and enums
└── database/            # Database configuration


### Design Patterns

The project implements multiple proven design patterns for maintainability and scalability:

#### Core Patterns

- **Module Pattern** - Each feature is a self-contained module with its own controllers, services, and repositories
- **Repository Pattern** - TypeORM repositories for data access abstraction
- **DTO Pattern** - Data Transfer Objects for validation and type safety
- **Service Layer Pattern** - Business logic separation in dedicated service classes
- **Controller Pattern** - HTTP request handling with route decorators

#### Security Patterns

- **Guard Pattern** - JWT authentication guards (`@UseGuards(JwtAuthGuard)`)
- **Strategy Pattern** - Passport JWT authentication strategy
- **Decorator Pattern** - Custom decorators for authorization and validation

#### Advanced Patterns

- **Entity-Relationship Pattern** - Comprehensive ORM mapping with TypeORM
  - One-to-Many relationships (Gym → Branches, Member → AttendanceRecords)
  - Many-to-One relationships (Member → Branch, Invoice → Member)
  - One-to-One relationships (Member → Subscription)
  - Many-to-Many relationships (via assignment tables)

- **API Resource Pattern** - RESTful endpoints for all entities with consistent structure
  - CRUD operations (Create, Read, Update, Delete)
  - Nested resources (e.g., `/gyms/:gymId/branches`)
  - Query filtering and pagination support

- **Dependency Injection** - NestJS built-in DI container for loose coupling
- **Middleware Pattern** - Global validation pipe for request validation
- **Observer Pattern** - Audit logging for entity changes
- **Factory Pattern** - Entity creation through DTOs

#### Configuration Patterns

- **Environment-Based Configuration** - `.env` file with ConfigModule
- **Global Pipes** - ValidationPipe with whitelist, transform, and forbidNonWhitelisted options
- **Global Exception Filters** - Centralized error handling
- **Swagger Documentation** - Auto-generated API documentation with decorators

## Database Design

### Core Entities

#### User Management

- **users** - System users (UUID primary key)

  - Linked to gyms and branches
  - Role-based access control
  - Profile information
  - Links to member/trainer IDs for role associations

- **roles** - User role definitions (UUID primary key)
  - Predefined roles: SUPERADMIN, ADMIN, TRAINER, MEMBER
  - Eagerly loaded for authentication

#### Gym Operations

- **gyms** - Top-level gym organizations (UUID primary key)

  - Multi-gym support
  - Owner relationships
  - Contact information (email, phone, address, location)

- **branches** - Gym locations (UUID primary key)
  - Belongs to gym
  - Has managers, members, trainers, classes, inquiries
  - Contact information (email, phone, address, location, state)
  - Main branch designation

#### Member Management

- **members** - Gym members (auto-increment primary key)

  - Personal information (fullName, email, phone, gender, dateOfBirth)
  - Address details (addressLine1, addressLine2, city, state, postalCode)
  - Emergency contact information
  - Profile image (avatarUrl)
  - Active status tracking
  - Branch association
  - One-to-one subscription relationship

- **membership_plans** - Subscription plans (auto-increment primary key)

  - Pricing and duration
  - Branch-specific plans
  - Description field

- **member_subscriptions** - Active subscriptions (auto-increment primary key)
  - Start/end dates
  - Active status
  - Linked to member and plan

#### Trainer & Class Management

- **trainers** - Gym trainers (auto-increment primary key)

  - Personal information (fullName, email, phone)
  - Specialization
  - Profile image (avatarUrl)
  - Branch association

- **classes** - Class definitions (UUID primary key)

  - Branch-specific
  - Recurrence scheduling (daily/weekly/monthly)
  - Days of week configuration (array of integers)
  - Timings (morning/evening/both/either)

- **member_trainer_assignments** - Member-trainer relationships (UUID primary key)
  - Assignment periods (start_date, end_date)
  - Status tracking (active/ended)
  - Created timestamp

#### Lead Management

- **inquiries** - Potential member leads (auto-increment primary key)

  - Contact information (fullName, email, phone, alternatePhone)
  - Address details (addressLine1, addressLine2, city, state, postalCode)
  - Personal details (dateOfBirth, occupation, fitnessGoals)
  - Lead status tracking (new, contacted, qualified, converted, closed)
  - Lead source tracking (walk_in, referral, social_media, website, etc.)
  - Preferred membership type (basic, premium, vip, family, etc.)
  - Contact preferences (preferredContactMethod, preferredContactTime)
  - Gym experience tracking
  - Personal training interest
  - Referral code
  - Status timestamps (contactedAt, convertedAt, closedAt)

#### Attendance & Tracking

- **attendance** - Check-in/check-out records (UUID primary key)
  - Supports both members and trainers
  - Branch-specific
  - Timestamp tracking (checkInTime, checkOutTime, date)
  - Optional notes
  - Attendance type discriminator

#### Audit & Compliance

- **audit_logs** - System activity tracking (UUID primary key)
  - User actions
  - Entity changes (previous/new values as JSONB)
  - Timestamp tracking

#### Financial Management

- **invoices** - Billing records (UUID primary key)

  - Member and subscription associations
  - Amount and description
  - Due date tracking
  - Status (pending, paid, cancelled)

- **payment_transactions** - Payment tracking (UUID primary key)
  - Invoice association
  - Payment method (cash, card, online, bank_transfer)
  - Amount and reference
  - Status tracking (pending, completed, failed)
  - Timestamp

#### Notification System

- **notifications** - System notifications (UUID primary key)

  - User association
  - Title and message content
  - Read status tracking
  - Creation timestamp

#### Advanced Diet & Nutrition Management

- **diets** - Member diet plans (auto-increment primary key)

  - Member association
  - Assigned by user (gym owner or trainer)
  - Nutritional values (calories, protein, carbs, fat)
  - Meal plans (JSONB format)
  - Creation and update timestamps

- **diet_plans** - Structured diet plans (UUID primary key)

  - Member association
  - Assigned by trainer (optional)
  - Branch association (optional)
  - Plan title and description
  - Goal type (weight_loss, muscle_gain, maintenance, cutting, bulking)
  - Target calories and macronutrients
  - Start/end dates
  - Active/completed status
  - Notes field

- **diet_plan_meals** - Individual meal components (UUID primary key)
  - Diet plan association
  - Meal type (breakfast, lunch, dinner, snack, pre_workout, post_workout)
  - Meal name and description
  - Ingredients and preparation instructions
  - Nutritional values (calories, protein, carbs, fat)
  - Day of week assignment
  - Notes field

#### Advanced Workout & Exercise Management

- **exercise_library** - Exercise database (UUID primary key)

  - Exercise name and body part (upper_body, lower_body, core, cardio, full_body)
  - Exercise type (strength, cardio, flexibility, endurance, general)
  - Difficulty level (beginner, intermediate, advanced)
  - Detailed instructions, benefits, and precautions
  - Video and image URLs
  - Active status

- **workout_plans** - Structured workout plans (UUID primary key)

  - Member association
  - Assigned by trainer (optional)
  - Branch association (optional)
  - Plan title and description
  - Difficulty level and plan type
  - Duration in days
  - Start/end dates
  - Active/completed status
  - Notes field

- **workout_plan_exercises** - Individual exercises (UUID primary key)
  - Workout plan association
  - Exercise name and description
  - Exercise type (sets_reps, time, distance)
  - Sets, reps, weight, duration, or distance values
  - Day of week assignment
  - Instructions

#### Advanced Progress Tracking

- **progress_tracking** - Comprehensive progress records (UUID primary key)

  - Member association
  - Recorded by trainer (optional)
  - Record date
  - Weight, height, body fat percentage, muscle mass, BMI
  - Body measurements (chest, waist, arms, thighs)
  - Notes, achievements, and photo URLs
  - Active status

- **attendance_goals** - Attendance goal tracking (UUID primary key)
  - Member association
  - Branch association (optional)
  - Goal type (daily, weekly, monthly)
  - Target and current counts
  - Start/end dates
  - Current and longest streaks
  - Active status

#### Progress Tracking

- **workout_logs** - Member workout records (auto-increment primary key)

  - Member association
  - Optional trainer association
  - Exercise details (name, sets, reps, weight, duration)
  - Notes and date tracking

- **body_progress** - Member body measurements (auto-increment primary key)

  - Member association
  - Optional trainer association
  - Physical metrics (weight, body_fat, bmi)
  - Measurements (JSONB format)
  - Progress photos (JSONB format)
  - Date tracking

- **goals** - Member fitness goals (auto-increment primary key)
  - Member association
  - Optional trainer association
  - Goal type and target values
  - Timeline and milestones (JSONB format)
  - Status and completion percentage
  - Creation and update timestamps

### Relationships

This section provides a comprehensive mapping of all entity relationships in the system, including cardinality, constraints, and special behaviors.

#### Relationship Overview

The system implements **4 types of relationships**:
- **One-to-One (1:1)** - Member ↔ MemberSubscription
- **One-to-Many (1:N)** - Gym → Branches, Member → Attendance, etc.
- **Many-to-One (N:1)** - Branch → Gym, Member → Branch, etc.
- **Many-to-Many (N:N)** - Member ↔ Trainer (via MemberTrainerAssignment join table)

---

#### 1. Core Gym Structure Relationships

##### Gym Entity (UUID Primary Key)

**Outgoing Relationships (One-to-Many)**:
```typescript
Gym (1) ──→ (N) Branch     // @OneToMany - All branches under this gym
Gym (1) ──→ (N) User       // @OneToMany - All users associated with this gym
````

**Relationship Details**:

- **Branch**: Inverse side of `Branch.gym`, with **CASCADE DELETE** on Branch
- **User**: Optional relationship (`nullable: true` on User side)

##### Branch Entity (UUID Primary Key)

**Incoming Relationships (Many-to-One)**:

```typescript
Branch (N) ──→ (1) Gym     // @ManyToOne - Required, CASCADE DELETE
```

**Outgoing Relationships (One-to-Many)**:

```typescript
Branch (1) ──→ (N) User               // Users assigned to this branch
Branch (1) ──→ (N) Member             // Members registered at this branch
Branch (1) ──→ (N) Trainer            // Trainers working at this branch
Branch (1) ──→ (N) Class              // Classes scheduled at this branch
Branch (1) ──→ (N) Inquiry            // Lead inquiries for this branch
Branch (1) ──→ (N) MembershipPlan     // Membership plans offered (optional)
Branch (1) ──→ (N) DietPlan          // Diet plans related to branch (optional)
Branch (1) ──→ (N) WorkoutPlan        // Workout plans related to branch (optional)
Branch (1) ──→ (N) AttendanceGoal     // Attendance goals (optional)
```

**Special Behaviors**:

- **CASCADE DELETE**: When Gym is deleted, all Branches are deleted (`onDelete: 'CASCADE'`)
- All child relationships are optional except User, Member, Trainer, Class

##### User Entity (UUID Primary Key)

**Incoming Relationships (Many-to-One)**:

```typescript
User (N) ──→ (1) Role      // @ManyToOne - Required, EAGER LOADED
User (N) ──→ (1) Gym       // @ManyToOne - Optional (nullable: true)
User (N) ──→ (1) Branch    // @ManyToOne - Optional (nullable: true)
```

**Special Behaviors**:

- **EAGER LOADING**: Role is always loaded automatically (`eager: true`)
- **Nullable Constraints**: Both Gym and Branch are optional for flexibility
- **String Foreign Keys**: Contains `memberId` and `trainerId` as nullable strings (not FK relationships)

**Outgoing Relationships**:

```typescript
User (1) ──→ (N) AuditLog      // Actions performed by this user
User (1) ──→ (N) Notification  // Notifications sent to this user
User (1) ──→ (N) Diet          // Diets assigned by this user (gym owner/trainer)
```

##### Role Entity (UUID Primary Key)

**Outgoing Relationships (One-to-Many)**:

```typescript
Role (1) ──→ (N) User      // All users with this role
```

**Predefined Roles**: SUPERADMIN, ADMIN, TRAINER, MEMBER

---

#### 2. Member Management Relationships

##### Member Entity (Auto-Increment Primary Key)

**Incoming Relationships (Many-to-One)**:

```typescript
Member (N) ──→ (1) Branch  // @ManyToOne - Optional (nullable: true)
```

**Outgoing Relationships**:

**One-to-One**:

```typescript
Member (1) ──→ (1) MemberSubscription  // @OneToOne - Unique subscription
```

- **Special**: Uses `@JoinColumn()` on Member side, CASCADE enabled

**One-to-Many**:

```typescript
Member (1) ──→ (N) Attendance          // Check-in/check-out records
Member (1) ──→ (N) AttendanceGoal      // Attendance goals
Member (1) ──→ (N) DietPlan            // Assigned diet plans
Member (1) ──→ (N) WorkoutPlan         // Assigned workout plans
Member (1) ──→ (N) WorkoutLog          // Workout history
Member (1) ──→ (N) BodyProgress        // Body measurements
Member (1) ──→ (N) ProgressTracking    // Comprehensive progress records
Member (1) ──→ (N) Goal                // Fitness goals
Member (1) ──→ (N) Diet                // Simple diets (legacy)
Member (1) ──→ (N) Invoice             // Billing invoices
```

**Many-to-Many (via Join Table)**:

```typescript
Member (N) ──→ (N) Trainer  // Via MemberTrainerAssignment
```

##### MemberSubscription Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
MemberSubscription (1) ──→ (1) Member          // @OneToOne - Owner of subscription
MemberSubscription (N) ──→ (1) MembershipPlan  // @ManyToOne - Plan details
```

**Outgoing Relationships**:

```typescript
MemberSubscription (1) ──→ (N) Invoice  // Optional invoices for this subscription
```

##### MembershipPlan Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
MembershipPlan (N) ──→ (1) Branch  // @ManyToOne - Optional (nullable: true)
```

**Outgoing Relationships**:

```typescript
MembershipPlan (1) ──→ (N) MemberSubscription  // All subscriptions using this plan
```

---

#### 3. Trainer Management Relationships

##### Trainer Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
Trainer (N) ──→ (1) Branch  // @ManyToOne - Required
```

**Outgoing Relationships**:

```typescript
Trainer (1) ──→ (N) Attendance          // Trainer check-in/check-out records
Trainer (1) ──→ (N) DietPlan            // Diet plans assigned by trainer (optional)
Trainer (1) ──→ (N) WorkoutPlan         // Workout plans assigned by trainer (optional)
Trainer (1) ──→ (N) WorkoutLog          // Workout logs recorded by trainer (optional)
Trainer (1) ──→ (N) BodyProgress        // Body progress recorded by trainer (optional)
Trainer (1) ──→ (N) ProgressTracking    // Progress tracking recorded by trainer (optional)
Trainer (1) ──→ (N) Goal                // Goals set with trainer (optional)
```

**Many-to-Many (via Join Table)**:

```typescript
Trainer (N) ──→ (N) Member  // Via MemberTrainerAssignment
```

##### MemberTrainerAssignment (Join Table) - UUID Primary Key

**Purpose**: Implements Many-to-Many relationship between Members and Trainers

**Relationships**:

```typescript
MemberTrainerAssignment (N) ──→ (1) Member   // @ManyToOne with explicit FK
MemberTrainerAssignment (N) ──→ (1) Trainer  // @ManyToOne with explicit FK
```

**Additional Fields**:

- `start_date`, `end_date` - Assignment period
- `status` - enum: 'active' | 'ended'
- `created_at` - Timestamp

**Foreign Key Configuration**:

- Uses `@JoinColumn({ name: 'member_id' })` and `@JoinColumn({ name: 'trainer_id' })`

---

#### 4. Class & Attendance Relationships

##### Class Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
Class (N) ──→ (1) Branch  // @ManyToOne - Required
```

**Special Properties**:

- Recurrence patterns: `daily`, `weekly`, `monthly`
- Days of week: Array of integers (PostgreSQL array type)
- Timings: `morning`, `evening`, `both`, `either`

##### Attendance Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
Attendance (N) ──→ (1) Member   // @ManyToOne - Optional (nullable: true)
Attendance (N) ──→ (1) Trainer  // @ManyToOne - Optional (nullable: true)
Attendance (N) ──→ (1) Branch   // @ManyToOne - Required
```

**Special Behaviors**:

- **Polymorphic-like**: Either Member OR Trainer is set (never both)
- `attendanceType` enum determines which: 'member' | 'trainer'
- Records check-in time, optional check-out time, and date

##### AttendanceGoal Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
AttendanceGoal (N) ──→ (1) Member   // @ManyToOne - Required
AttendanceGoal (N) ──→ (1) Branch   // @ManyToOne - Optional (nullable: true)
```

**Special Properties**:

- Goal types: `daily`, `weekly`, `monthly`
- Tracks: `target_count`, `current_count`, `current_streak`, `longest_streak`

---

#### 5. Financial Management Relationships

##### Invoice Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
Invoice (N) ──→ (1) Member              // @ManyToOne - Required
Invoice (N) ──→ (1) MemberSubscription  // @ManyToOne - Optional (nullable: true)
```

**Outgoing Relationships**:

```typescript
Invoice (1) ──→ (N) PaymentTransaction  // All payments for this invoice
```

**Status Enum**: 'pending' | 'paid' | 'cancelled'

##### PaymentTransaction Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
PaymentTransaction (N) ──→ (1) Invoice  // @ManyToOne - Required
```

**Payment Methods**: 'cash' | 'card' | 'online' | 'bank_transfer'
**Status**: 'pending' | 'completed' | 'failed'

---

#### 6. Lead Management Relationships

##### Inquiry Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
Inquiry (N) ──→ (1) Branch  // @ManyToOne - Optional (nullable: true)
```

**Status Flow**: 'new' → 'contacted' → 'qualified' → 'converted' | 'closed'
**Source Types**: 11 types (walk_in, referral, social_media, website, google_ads, facebook_ads, print_ad, billboard, radio, television, other)

---

#### 7. Diet & Nutrition Relationships

##### DietPlan Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
DietPlan (N) ──→ (1) Member   // @ManyToOne - Required
DietPlan (N) ──→ (1) Trainer  // @ManyToOne - Optional (assigned_by_trainer, nullable: true)
DietPlan (N) ──→ (1) Branch   // @ManyToOne - Optional (nullable: true)
```

**Outgoing Relationships**:

```typescript
DietPlan (1) ──→ (N) DietPlanMeal  // All meals in this diet plan
```

**Goal Types**: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'cutting' | 'bulking'

##### DietPlanMeal Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
DietPlanMeal (N) ──→ (1) DietPlan  // @ManyToOne - Required
```

**Meal Types**: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'
**Nutritional Tracking**: calories, protein_g, carbs_g, fat_g

##### Diet Entity (Auto-Increment Primary Key) - Legacy

**Incoming Relationships**:

```typescript
Diet (N) ──→ (1) Member  // @ManyToOne - Required
Diet (N) ──→ (1) User    // @ManyToOne - Optional (assigned_by, nullable: true)
```

**Storage**: Uses JSONB for meals (flexible schema)

---

#### 8. Workout & Exercise Relationships

##### WorkoutPlan Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
WorkoutPlan (N) ──→ (1) Member   // @ManyToOne - Required
WorkoutPlan (N) ──→ (1) Trainer  // @ManyToOne - Optional (assigned_by_trainer, nullable: true)
WorkoutPlan (N) ──→ (1) Branch   // @ManyToOne - Optional (nullable: true)
```

**Outgoing Relationships**:

```typescript
WorkoutPlan (1) ──→ (N) WorkoutPlanExercise  // All exercises in this plan
```

**Difficulty**: 'beginner' | 'intermediate' | 'advanced'
**Plan Types**: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'general'

##### WorkoutPlanExercise Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
WorkoutPlanExercise (N) ──→ (1) WorkoutPlan  // @ManyToOne - Required
```

**Exercise Types**: 'sets_reps' | 'time' | 'distance'
**Conditional Fields**:

- sets_reps: `sets`, `reps`, `weight_kg`
- time: `duration_minutes`
- distance: `distance_km`

##### WorkoutLog Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
WorkoutLog (N) ──→ (1) Member   // @ManyToOne - Required
WorkoutLog (N) ──→ (1) Trainer  // @ManyToOne - Optional (nullable: true)
```

**Purpose**: Historical workout tracking independent of plans

##### ExerciseLibrary Entity (UUID Primary Key)

**No Relationships** - Standalone reference data

**Categories**:

- Body Parts: 'upper_body' | 'lower_body' | 'core' | 'cardio' | 'full_body'
- Exercise Types: 'strength' | 'cardio' | 'flexibility' | 'endurance' | 'general'
- Difficulty: 'beginner' | 'intermediate' | 'advanced'

---

#### 9. Progress Tracking Relationships

##### ProgressTracking Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
ProgressTracking (N) ──→ (1) Member   // @ManyToOne - Required
ProgressTracking (N) ──→ (1) Trainer  // @ManyToOne - Optional (recorded_by_trainer, nullable: true)
```

**Comprehensive Metrics**:

- Body composition: weight, height, body_fat_percentage, muscle_mass, BMI
- Measurements: chest, waist, arms, thighs (all in cm)
- Additional: notes, achievements, photo_url

##### BodyProgress Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
BodyProgress (N) ──→ (1) Member   // @ManyToOne - Required
BodyProgress (N) ──→ (1) Trainer  // @ManyToOne - Optional (nullable: true)
```

**Storage**:

- JSONB fields for flexible `measurements` and `progress_photos`

##### Goal Entity (Auto-Increment Primary Key)

**Incoming Relationships**:

```typescript
Goal (N) ──→ (1) Member   // @ManyToOne - Required
Goal (N) ──→ (1) Trainer  // @ManyToOne - Optional (nullable: true)
```

**Tracking**:

- JSONB `milestone` field for complex milestone data
- `completion_percent` (0-100)
- Status tracking

---

#### 10. System & Audit Relationships

##### AuditLog Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
AuditLog (N) ──→ (1) User  // @ManyToOne - Required
```

**Purpose**: Complete audit trail of all system changes
**JSONB Fields**: `previous_values`, `new_values` for change tracking

##### Notification Entity (UUID Primary Key)

**Incoming Relationships**:

```typescript
Notification (N) ──→ (1) User  // @ManyToOne - Required
```

**Purpose**: User notification system with read status

---

### Relationship Summary Statistics

| Relationship Type       | Count | Examples                                 |
| ----------------------- | ----- | ---------------------------------------- |
| **One-to-One**          | 1     | Member ↔ MemberSubscription             |
| **One-to-Many**         | 45+   | Gym → Branches, Member → DietPlans, etc. |
| **Many-to-One**         | 45+   | (Inverse of One-to-Many)                 |
| **Many-to-Many**        | 1     | Member ↔ Trainer (via join table)       |
| **Total Relationships** | 90+   | Across 27 entities                       |

### Special Relationship Behaviors

#### CASCADE Operations

- **Branch deletion**: Cascades from Gym (`onDelete: 'CASCADE'`)
- **Member subscription**: Cascade enabled on Member side

#### EAGER Loading

- **User.role**: Always loaded automatically (`eager: true`)
- All other relationships use LAZY loading by default

#### Optional vs Required

- **Optional (nullable: true)**: 30+ relationships
- **Required**: All primary business relationships (Member→Branch, Invoice→Member, etc.)

#### Polymorphic Patterns

- **Attendance**: Can reference either Member OR Trainer (discriminated by `attendanceType`)

#### JSONB Flexible Schemas

- **BodyProgress**: measurements, progress_photos
- **Goal**: milestone
- **Diet**: meals
- **AuditLog**: previous_values, new_values

---

`

## API Structure

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- JWT token-based authentication for all protected routes

### Gym & Branch Management

- `POST /gyms` - Create gym
- `GET /gyms` - List gyms
- `GET /gyms/:id` - Get gym details
- `PATCH /gyms/:id` - Update gym
- `DELETE /gyms/:id` - Delete gym
- `POST /gyms/:gymId/branches` - Create branch
- `GET /branches` - List all branches
- `GET /branches/:id` - Get branch details
- `PATCH /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch

### Member Management

- `POST /members` - Create member
- `GET /members` - List members
- `GET /members/:id` - Get member details
- `PATCH /members/:id` - Update member
- `DELETE /members/:id` - Delete member
- `GET /branches/:branchId/members` - Get branch members

### Trainer Management

- `POST /trainers` - Create trainer
- `GET /trainers` - List trainers
- `GET /trainers/:id` - Get trainer details
- `PATCH /trainers/:id` - Update trainer
- `DELETE /trainers/:id` - Delete trainer
- `GET /branches/:branchId/trainers` - Get branch trainers

### Membership Plans

- `POST /membership-plans` - Create plan
- `GET /membership-plans` - List plans
- `GET /membership-plans/:id` - Get plan details
- `PATCH /membership-plans/:id` - Update plan
- `DELETE /membership-plans/:id` - Delete plan
- `GET /branches/:branchId/membership-plans` - Get branch plans

### Subscriptions

- `POST /subscriptions` - Assign member to plan
- `GET /subscriptions` - List subscriptions
- `GET /subscriptions/:id` - Get subscription details
- `PATCH /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription
- `POST /subscriptions/:id/cancel` - Cancel subscription
- `GET /members/:memberId/subscription` - Get member's subscription

### Classes

- `POST /classes` - Create class
- `GET /classes` - List classes
- `GET /classes/:id` - Get class details
- `PATCH /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class
- `GET /branches/:branchId/classes` - Get branch classes

### Member-Trainer Assignments

- `POST /assignments` - Assign member to trainer
- `GET /assignments` - List assignments
- `GET /assignments/:id` - Get assignment details
- `DELETE /assignments/:id` - Delete assignment
- `GET /members/:memberId/assignments` - Get member's trainers
- `GET /trainers/:trainerId/members` - Get trainer's members

### Attendance

- `POST /attendance` - Mark attendance (check-in)
- `PATCH /attendance/:id/checkout` - Check out
- `GET /attendance` - List all attendance records
- `GET /attendance/:id` - Get attendance record
- `GET /members/:memberId/attendance` - Get member attendance
- `GET /trainers/:trainerId/attendance` - Get trainer attendance
- `GET /branches/:branchId/attendance` - Get branch attendance

### Audit Logs

- `POST /audit-logs` - Create audit log
- `GET /audit-logs` - List all logs
- `GET /audit-logs/:id` - Get log details
- `GET /audit-logs/user/:userId` - Get user logs
- `GET /audit-logs/entity/:entityType/:entityId` - Get entity logs
- `GET /audit-logs/action/:action` - Get logs by action

### User Management

- `POST /users` - Create user
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/profile` - Get current user profile

### Role Management

- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID
- `GET /roles/name/:name` - Get role by name

### Financial Management

#### Invoices

- `POST /invoices` - Create invoice
- `GET /invoices` - List all invoices
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice
- `POST /invoices/:id/cancel` - Cancel invoice
- `GET /members/:memberId/invoices` - Get member invoices

#### Payments

- `POST /payments` - Record payment
- `GET /payments` - List all payments
- `GET /payments/:id` - Get payment details
- `GET /invoices/:invoiceId/payments` - Get invoice payments
- `GET /members/:memberId/payments` - Get member payment history

### Lead Management

- `POST /inquiries` - Create inquiry
- `GET /inquiries` - List inquiries with filtering
- `GET /inquiries/:id` - Get inquiry details
- `PATCH /inquiries/:id` - Update inquiry
- `PATCH /inquiries/:id/status` - Update inquiry status
- `POST /inquiries/:id/convert` - Convert inquiry to member
- `DELETE /inquiries/:id` - Delete inquiry
- `GET /inquiries/pending` - Get pending inquiries
- `GET /inquiries/stats` - Get inquiry statistics
- `GET /inquiries/email/:email` - Get inquiry by email

### Analytics & Reporting

- `GET /analytics/gym/:gymId/dashboard` - Get gym dashboard
- `GET /analytics/branch/:branchId/dashboard` - Get branch dashboard
- `GET /analytics/gym/:gymId/members` - Get gym member analytics
- `GET /analytics/branch/:branchId/members` - Get branch member analytics
- `GET /analytics/gym/:gymId/attendance` - Get gym attendance analytics
- `GET /analytics/branch/:branchId/attendance` - Get branch attendance analytics
- `GET /analytics/gym/:gymId/payments/recent` - Get recent gym payments
- `GET /analytics/branch/:branchId/payments/recent` - Get recent branch payments

### Diet Plans

- `POST /diet-plans` - Create diet plan
- `GET /diet-plans` - List all diet plans
- `GET /diet-plans/:id` - Get diet plan details
- `PATCH /diet-plans/:id` - Update diet plan
- `DELETE /diet-plans/:id` - Delete diet plan
- `GET /diet-plans/member/:memberId` - Get member's diet plans
- `GET /diet-plans/user/my-diet-plans` - Get user's assigned diet plans

### Workout Plans

- `POST /workouts` - Create workout plan
- `GET /workouts` - List all workout plans
- `GET /workouts/:id` - Get workout plan details
- `PATCH /workouts/:id` - Update workout plan
- `DELETE /workouts/:id` - Delete workout plan
- `GET /workouts/member/:memberId` - Get member's workout plans
- `GET /workouts/user/my-workout-plans` - Get user's assigned workout plans

### Progress Tracking

- `POST /progress-tracking` - Create progress record
- `GET /progress-tracking` - List all progress records
- `GET /progress-tracking/:id` - Get progress record details
- `PATCH /progress-tracking/:id` - Update progress record
- `DELETE /progress-tracking/:id` - Delete progress record
- `GET /progress-tracking/member/:memberId` - Get member's progress records
- `GET /progress-tracking/user/my-progress-records` - Get user's assigned progress records

### Advanced Diet & Nutrition Management

#### Diet Plans

- `POST /diet-plans` - Create structured diet plan
- `GET /diet-plans` - List all diet plans
- `GET /diet-plans/:id` - Get diet plan details
- `PATCH /diet-plans/:id` - Update diet plan
- `DELETE /diet-plans/:id` - Delete diet plan
- `GET /diet-plans/member/:memberId` - Get member's diet plans
- `GET /diet-plans/user/my-diet-plans` - Get user's assigned diet plans

#### Diet Plan Meals

- `POST /diet-plan-meals` - Create meal component
- `GET /diet-plan-meals` - List all meal components
- `GET /diet-plan-meals/:id` - Get meal details
- `PATCH /diet-plan-meals/:id` - Update meal component
- `DELETE /diet-plan-meals/:id` - Delete meal component
- `GET /diet-plans/:planId/meals` - Get meals for a diet plan

### Advanced Workout & Exercise Management

#### Exercise Library

- `POST /exercise-library` - Add exercise to library
- `GET /exercise-library` - List all exercises
- `GET /exercise-library/:id` - Get exercise details
- `PATCH /exercise-library/:id` - Update exercise
- `DELETE /exercise-library/:id` - Delete exercise
- `GET /exercise-library/filter` - Filter exercises by body part/type/difficulty

#### Workout Plans

- `POST /workout-plans` - Create structured workout plan
- `GET /workout-plans` - List all workout plans
- `GET /workout-plans/:id` - Get workout plan details
- `PATCH /workout-plans/:id` - Update workout plan
- `DELETE /workout-plans/:id` - Delete workout plan
- `GET /workout-plans/member/:memberId` - Get member's workout plans
- `GET /workout-plans/user/my-workout-plans` - Get user's assigned workout plans

#### Workout Plan Exercises

- `POST /workout-plan-exercises` - Create exercise component
- `GET /workout-plan-exercises` - List all exercise components
- `GET /workout-plan-exercises/:id` - Get exercise details
- `PATCH /workout-plan-exercises/:id` - Update exercise component
- `DELETE /workout-plan-exercises/:id` - Delete exercise component
- `GET /workout-plans/:planId/exercises` - Get exercises for a workout plan

### Advanced Progress Tracking

#### Progress Records

- `POST /progress-tracking` - Create progress record
- `GET /progress-tracking` - List all progress records
- `GET /progress-tracking/:id` - Get progress record details
- `PATCH /progress-tracking/:id` - Update progress record
- `DELETE /progress-tracking/:id` - Delete progress record
- `GET /progress-tracking/member/:memberId` - Get member's progress records
- `GET /progress-tracking/user/my-progress-records` - Get user's assigned progress records

#### Attendance Goals

- `POST /attendance-goals` - Create attendance goal
- `GET /attendance-goals` - List all attendance goals
- `GET /attendance-goals/:id` - Get attendance goal details
- `PATCH /attendance-goals/:id` - Update attendance goal
- `DELETE /attendance-goals/:id` - Delete attendance goal
- `GET /attendance-goals/member/:memberId` - Get member's attendance goals
- `GET /attendance-goals/progress/:memberId` - Get member's goal progress

### Goals

- `POST /goals` - Create goal
- `GET /goals` - List all goals
- `GET /goals/:id` - Get goal details
- `PATCH /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal
- `GET /goals/member/:memberId` - Get member's goals
- `GET /goals/user/my-goals` - Get user's assigned goals

## Operational Flow

### Application Entry Point

The application starts in `main.ts` with comprehensive global configuration:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      transform: true, // Auto-transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
    }),
  );

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Gym Management System')
    .setDescription('API documentation for the Gym Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    // ... all 23 API tags configured
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
```

### 1. System Setup

1. Create gym organization
2. Add branches to gym
3. Create membership plans for branches
4. Register users with appropriate roles

### 2. Member Onboarding

1. Create member profile
2. Assign member to branch
3. Subscribe member to membership plan
4. Optionally assign member to trainer

### 3. Trainer Management

1. Create trainer profile
2. Assign trainer to branch
3. Assign members to trainer
4. Track trainer attendance

### 4. Class Operations

1. Create class schedules
2. Configure recurrence rules (daily/weekly/monthly)
3. Assign classes to branches
4. Track class attendance

### 5. Daily Operations

1. Members/trainers check in via attendance API
2. System tracks check-in/check-out times
3. Attendance records linked to branch
4. Audit logs track all system changes

### 6. Subscription Management

1. Create/update membership plans
2. Assign members to plans
3. Track subscription status (active/inactive)
4. Cancel subscriptions when needed
5. Auto-calculate end dates based on plan duration

### 7. Reporting & Auditing

1. Query attendance by member/trainer/branch
2. View audit logs for compliance
3. Track user actions and entity changes
4. Monitor subscription status

## Security Features

### Authentication

- JWT-based token authentication
- Secure password hashing with bcrypt
- Token expiration and refresh mechanisms

### Authorization

- Route-level guards using `@UseGuards(JwtAuthGuard)`
- All sensitive endpoints protected
- Role-based access control structure in place

### Data Validation

- DTO validation on all inputs
- Type safety with TypeScript
- Database constraints via TypeORM

### Audit Trail

- Complete audit logging system
- Tracks user actions
- Records entity changes (before/after values)
- Timestamp tracking

## API Documentation

### Swagger UI

- Interactive API documentation at `/api`
- Organized by tags (gyms, members, trainers, etc.)
- Request/response schemas
- Authentication testing support

### API Tags

- `auth` - Authentication endpoints
- `users` - User management
- `gyms` - Gym management
- `branches` - Branch management
- `members` - Member management
- `trainers` - Trainer management
- `membership-plans` - Plan management
- `subscriptions` - Subscription management
- `classes` - Class management
- `assignments` - Assignment management
- `attendance` - Attendance tracking
- `audit-logs` - Audit logging
- `invoices` - Financial billing
- `payments` - Payment processing
- `inquiries` - Lead management
- `roles` - Role management
- `analytics` - Business analytics and reporting
- `diet-plans` - Diet plan management
- `workout-logs` - Workout log tracking
- `body-progress` - Body progress monitoring
- `goals` - Goal management

## Development Features

### Hot Reload

- Development server with watch mode
- Automatic restart on file changes

### Type Safety

- Full TypeScript support
- Strict type checking
- Interface definitions for all entities

### Code Quality

- ESLint configuration
- Prettier formatting
- Jest testing framework

## Scalability Considerations

### Multi-Tenancy

- Support for multiple gyms
- Branch-level data isolation
- Hierarchical organization structure
- Role-based access control across organizations

### Database Optimization

- Indexed foreign keys for performance
- Efficient relationship queries with eager/lazy loading
- JSONB for flexible data storage (meal plans, measurements, milestones)
- Cloud PostgreSQL with Neon for scalability
- Auto-synchronization in development (synchronize: true)

### Modular Architecture

- Easy to add new modules
- Clear separation of concerns
- Reusable service patterns
- Comprehensive API coverage for all entities
- Consistent controller and service structure across modules

### Cloud-Native Design

- Cloud database integration (Neon PostgreSQL)
- Environment-based configuration
- Stateless authentication with JWT
- RESTful API design for mobile/web clients

## Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- PostgreSQL database (local or cloud)
- Git for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-nestjs-gym-app
   ```

````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRATION=1d
   ```

4. **Database Setup**

   The application uses TypeORM with `synchronize: true` in development, which automatically creates/updates database schema based on entities.

   For production, disable synchronize and use migrations:

   ```typescript
   // In dbConfig.ts
   synchronize: false,
   migrations: ['dist/migrations/**/*.js'],
   ```

5. **Run the application**

   Development mode with hot reload:

   ```bash
   npm run start:dev
   ```

   Production mode:

   ```bash
   npm run build
   npm run start:prod
   ```

   Debug mode:

   ```bash
   npm run start:debug
   ```

6. **Access API Documentation**

   Once the server is running, access the Swagger UI at:

   ```
   http://localhost:3000/api
   ```

### Development Scripts

- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start production build
- `npm run lint` - Lint and fix code with ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

### Project Configuration Files

- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `tsconfig.build.json` - Build-specific TypeScript config
- `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `dbConfig.ts` - Database connection configuration
- `.env` - Environment variables (not in version control)

## Deployment

### Environment Configuration

Required environment variables for production:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=24h

# Optional: Logging
LOG_LEVEL=info
```

### Database Configuration

The application uses Neon PostgreSQL cloud database. Current configuration in `dbConfig.ts`:

```typescript
export const pgConfig: PostgresConnectionOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',
  port: 5432,
  synchronize: false, // MUST be false in production
  logging: ['error', 'warn'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*.js'],
  ssl: {
    rejectUnauthorized: false,
  },
};
```

### Production Considerations

1. **Database Migrations**

   - Disable `synchronize: true` in production
   - Use TypeORM migrations for schema changes
   - Create migration: `npm run typeorm migration:create -- -n MigrationName`
   - Run migrations: `npm run typeorm migration:run`

2. **Security**

   - Use strong JWT secrets (minimum 32 characters)
   - Enable HTTPS/TLS for API endpoints
   - Implement rate limiting for authentication endpoints
   - Enable CORS with specific origins

3. **Performance**

   - Enable database connection pooling
   - Implement caching for frequently accessed data
   - Use CDN for static assets
   - Enable compression middleware

4. **Monitoring & Logging**

   - Implement structured logging
   - Set up error tracking (e.g., Sentry)
   - Monitor database performance
   - Track API response times

5. **Scalability**
   - Horizontal scaling with load balancer
   - Stateless architecture (JWT tokens)
   - Database read replicas for heavy read operations
   - Implement queuing for background tasks

## Current Features

### Lead Management (Inquiries)

- **Complete inquiry lifecycle management**
  - Lead capture with comprehensive contact information
  - Status tracking (new → contacted → qualified → converted → closed)
  - Source tracking (walk-in, referral, social media, website, ads, etc.)
  - Lead conversion to member functionality
  - Advanced filtering and search capabilities
  - Inquiry statistics and reporting

### Financial Management

- **Invoicing system**

  - Invoice creation linked to members and subscriptions
  - Due date tracking and management
  - Invoice status monitoring (pending/paid/cancelled)

- **Payment processing**
  - Multiple payment methods (cash, card, online, bank transfer)
  - Payment status tracking (pending/completed/failed)
  - Payment history and reference management
  - Integration with invoices for revenue tracking

### Analytics & Reporting

- **Dashboard analytics**
  - Gym-level and branch-level dashboards
  - Member analytics (growth, retention, demographics)
  - Attendance analytics (trends, patterns, utilization)
  - Financial analytics (recent payments, revenue tracking)

### Role-Based Access Control

- **Predefined roles**: SUPERADMIN, ADMIN, TRAINER, MEMBER
- **Role management API** for dynamic role assignment
- **JWT-based authentication** with secure token handling

### Advanced Features

- **Member dashboard** with personalized data
- **Inquiry conversion** to member workflow
- **Recent payment tracking** for financial oversight
- **Comprehensive audit logging** for compliance
- **Flexible class scheduling** with recurrence patterns

### Advanced Nutrition & Diet Management

- **Structured Diet Plans**

  - Goal-oriented diet plans (weight loss, muscle gain, maintenance, cutting, bulking)
  - Target calorie and macronutrient tracking
  - Duration-based planning with start/end dates
  - Trainer assignment and branch association
  - Progress tracking and completion status

- **Meal Planning System**

  - Comprehensive meal components with detailed nutrition facts
  - Flexible meal types (breakfast, lunch, dinner, snacks, pre/post-workout)
  - Recipe management with ingredients and preparation instructions
  - Weekly meal scheduling with day-of-week assignments
  - Customizable meal plans per diet plan

- **Diet Plan Management**
  - Create, update, and manage structured diet plans
  - Assign diet plans to specific members
  - Track diet plan progress and completion
  - Role-based access control (GYM_OWNER and TRAINER permissions)
  - Member-specific diet plan retrieval

### Advanced Workout & Exercise Management

- **Exercise Library**

  - Comprehensive exercise database with detailed instructions
  - Categorized by body part (upper_body, lower_body, core, cardio, full_body)
  - Exercise types (strength, cardio, flexibility, endurance, general)
  - Difficulty levels (beginner, intermediate, advanced)
  - Benefits, precautions, and multimedia support (videos, images)

- **Structured Workout Plans**

  - Customizable workout plans with duration tracking
  - Difficulty-based progression (beginner, intermediate, advanced)
  - Workout types (strength, cardio, flexibility, endurance, general)
  - Weekly scheduling with day-of-week assignments
  - Trainer assignment and branch association

- **Exercise Programming**
  - Sets, reps, weight, time, and distance tracking
  - Flexible exercise types (sets_reps, time, distance)
  - Detailed exercise instructions and form guidance
  - Progress tracking and workout history
  - Personalized exercise recommendations

### Advanced Progress Tracking & Analytics

- **Comprehensive Progress Monitoring**

  - Body composition tracking (weight, body fat, muscle mass, BMI)
  - Physical measurements (chest, waist, arms, thighs)
  - Progress photos and achievement logging
  - Trainer-assisted progress recording
  - Historical progress visualization

- **Attendance Goal System**

  - Customizable attendance goals (daily, weekly, monthly)
  - Streak tracking and progress monitoring
  - Branch-specific goal setting
  - Real-time goal progress updates
  - Motivational tracking for member engagement

- **Performance Analytics**
  - Workout performance tracking
  - Progress trend analysis
  - Goal achievement monitoring
  - Comparative progress reports
  - Personalized performance insights

## Future Enhancements

1. **Notification System**

   - Member notifications
   - Subscription reminders
   - Class schedule updates

2. **Advanced Reporting**

   - Revenue analytics
   - Attendance analytics
   - Member retention metrics

3. **Mobile App Integration**

   - RESTful API ready for mobile clients
   - JWT authentication compatible

4. **Additional Features**
   - Real-time notifications
   - Advanced payment gateway integration
   - Mobile check-in/check-out
   - Automated marketing campaigns

## Deployment

### Environment Configuration

- `.env` file for configuration
- Database connection settings
- JWT secret configuration
- Port configuration

### Production Considerations

- Database migrations
- Environment-specific configs
- Logging and monitoring
- Error handling and recovery

## Conclusion

This gym management system is a **production-ready, enterprise-grade** solution for managing multi-location gym operations. With 26 feature modules, 27 TypeORM entities, comprehensive business logic, and complete API documentation, it provides end-to-end functionality for modern fitness business management.

### Key Achievements

#### Technical Excellence

- **Type-Safe Codebase** - 100% TypeScript with strict type checking enabled
- **Zero Compilation Errors** - All TypeScript and linting errors resolved
- **Comprehensive API** - 100+ endpoints covering all business operations
- **Auto-Generated Documentation** - Interactive Swagger UI with bearer authentication
- **Global Validation** - DTOs validated at runtime with class-validator
- **Security First** - JWT authentication, bcrypt password hashing, route guards

#### Business Features

- **Complete Member Journey** - Lead capture → Inquiry → Conversion → Active member
- **Financial Management** - Invoicing, payment processing, revenue analytics
- **Advanced Fitness Tracking**
  - Structured diet plans with meal components and nutritional tracking
  - Workout plans with exercise library and progress logging
  - Body measurements, progress photos, and goal tracking
  - Attendance goals with streak monitoring
- **Multi-Tenant Support** - Multiple gyms with branch-level operations
- **Analytics & Reporting** - Real-time dashboards for data-driven decisions
- **Audit Compliance** - Complete activity logging for regulatory requirements

### Key Differentiators

1. **Complete Lead-to-Member Pipeline**

   - Inquiry capture with 11 source types
   - 5-stage status tracking (new → contacted → qualified → converted → closed)
   - Conversion workflow to active membership
   - Lead analytics and statistics

2. **Comprehensive Financial Management**

   - Full invoicing system with status tracking
   - Multiple payment methods (cash, card, online, bank transfer)
   - Payment history and reference management
   - Revenue analytics at gym and branch levels

3. **Advanced Analytics**

   - Gym-level and branch-level dashboards
   - Member analytics (growth, retention, demographics)
   - Attendance analytics (trends, patterns, utilization)
   - Financial analytics (recent payments, revenue tracking)

4. **Cloud-Native Architecture**

   - Neon PostgreSQL cloud database
   - Stateless JWT authentication
   - RESTful API design
   - Environment-based configuration

5. **Role-Based Security**

   - 4 predefined roles (SUPERADMIN, ADMIN, TRAINER, MEMBER)
   - JWT-based authentication with bearer tokens
   - Route-level guards protecting all sensitive endpoints
   - Role management API for dynamic assignments

6. **Flexible Scheduling**

   - Recurring class patterns (daily, weekly, monthly)
   - Days of week configuration
   - Multiple timing options (morning, evening, both)
   - Branch-specific class management

7. **Audit Compliance**
   - Complete activity tracking
   - Entity change logging (before/after values)
   - User action auditing
   - JSONB storage for flexible audit data

### Production-Ready Features

#### Development Experience

- **Hot Reload** - `npm run start:dev` with watch mode
- **TypeScript 5.7.3** - Latest TypeScript with full type safety
- **ESLint & Prettier** - Code quality and consistent formatting
- **Jest Testing** - Unit and E2E testing framework configured
- **NestJS CLI** - Scaffolding and code generation tools

#### API Documentation

- **Swagger UI** - Interactive API playground at `/api`
- **23 API Tags** - Organized by feature (auth, members, trainers, analytics, etc.)
- **Bearer Authentication** - JWT token testing in Swagger
- **Persistent Authorization** - Token persistence across Swagger sessions
- **Request/Response Schemas** - Auto-generated from DTOs and entities

#### Database Architecture

- **27 Entities** - Comprehensive data model
- **Complex Relationships** - One-to-Many, Many-to-One, One-to-One, Many-to-Many
- **JSONB Support** - Flexible data storage for complex objects
- **Auto-Synchronization** - Schema updates in development (synchronize: true)
- **Migration Ready** - TypeORM migration support for production

#### Code Quality

- **Error-Free Compilation** - All TypeScript errors resolved
- **Consistent Structure** - Standardized module/controller/service patterns
- **Comprehensive DTOs** - Input validation for all endpoints
- **Type Safety** - Strict null checks and type validation
- **Clean Architecture** - Clear separation of concerns

### Scalability & Performance

1. **Multi-Tenancy**

   - Support for unlimited gyms and branches
   - Branch-level data isolation
   - Hierarchical organization structure
   - Role-based access control across organizations

2. **Database Optimization**

   - Indexed foreign keys for query performance
   - Efficient eager/lazy loading strategies
   - JSONB for flexible schema evolution
   - Cloud database with built-in scaling (Neon)

3. **Stateless Architecture**

   - JWT tokens for authentication (no server-side sessions)
   - Horizontal scaling capability
   - Load balancer ready
   - Microservices migration path

4. **API Design**
   - RESTful endpoints for mobile/web clients
   - Consistent response structures
   - Query filtering and pagination support
   - Nested resource routes

### Feature Completeness

✅ **Core Operations** - Gyms, branches, members, trainers, classes
✅ **Membership Management** - Plans, subscriptions, assignments
✅ **Attendance Tracking** - Check-in/check-out for members and trainers
✅ **Lead Management** - Inquiry capture, conversion, analytics
✅ **Financial Management** - Invoices, payments, revenue tracking
✅ **Analytics & Reporting** - Dashboards, member stats, attendance trends
✅ **Audit Logging** - Complete activity tracking
✅ **User Management** - Roles, permissions, authentication
✅ **Diet Management** - Plans, meals, nutritional tracking
✅ **Workout Management** - Plans, exercises, workout logging
✅ **Progress Tracking** - Body measurements, photos, goals
✅ **API Documentation** - Swagger UI with authentication

### Technology Maturity

All dependencies are on stable, latest versions:

- NestJS 11.0.1 (latest stable)
- TypeScript 5.7.3 (latest)
- TypeORM 0.3.24 (latest stable)
- PostgreSQL (industry standard)
- Jest 29.7.0 (latest)
- ESLint 9.18.0 (latest)

### Deployment Ready

- ✅ Environment-based configuration
- ✅ Cloud database integration
- ✅ Production build scripts
- ✅ Error handling and validation
- ✅ Security best practices
- ✅ Logging and monitoring setup
- ✅ Docker-ready architecture
- ✅ Migration support for schema changes

This system is designed to **scale from single gyms to large multi-location chains**, providing the flexibility, reliability, and comprehensive features needed for modern fitness business operations. With a complete feature set, production-ready implementation, and cloud-native architecture, it's ready for immediate deployment and real-world usage.

```

```
````
