# Optim Gym Management System

## Complete Project Description

**Date:** 2026-02-03
**Version:** 2.0 (Enhanced with Templates, Goals & Role-Based Access)
**Framework:** NestJS 11.0.1 + TypeScript 5.7.3
**Database:** PostgreSQL (Neon Cloud) + TypeORM 0.3.24

---

## Executive Summary

A comprehensive, production-ready multi-tenant gym management system built with NestJS and TypeScript. This enhanced version includes advanced features for **workout/diet template management**, **goal scheduling with milestones**, **template sharing between trainers**, and **fine-grained role-based access control**.

### Key Enhancements (v2.0)

- **Template System** - Create, share, and reuse workout and diet templates
- **Goal Scheduling** - Weekly/monthly/quarterly goal plans with milestone tracking
- **Role-Based Permissions** - Fine-grained access control with Permissions enum
- **Trainer Features** - Template creation, member assignment, progress tracking
- **Notification System** - Goal progress, chart assignments, diet notifications

---

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
- **Custom Guards** - RolesGuard, BranchAccessGuard for RBAC

### API Documentation

- **@nestjs/swagger 11.2.0** - OpenAPI/Swagger integration
- **swagger-ui-express 5.0.1** - Interactive API documentation UI

---

## Architecture Overview

### Modular Structure (31 Feature Modules)

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module with all imports
├── auth/                        # Authentication & JWT strategy
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts       # Role-based access
│   │   └── branch-access.guard.ts # Multi-tenant access
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts   # @Roles() decorator
├── users/                       # User management
├── roles/                       # Role definitions
├── gyms/                        # Gym organization management
├── branches/                    # Branch management
├── members/                     # Member management
├── trainers/                    # Trainer management
├── membership-plans/            # Subscription plans
├── subscriptions/               # Member subscriptions
├── classes/                     # Class scheduling
├── assignments/                 # Member-trainer assignments
├── attendance/                  # Check-in/check-out
├── inquiries/                   # Lead management
├── invoices/                    # Billing
├── payments/                    # Payments
├── analytics/                   # Dashboards
├── audit-logs/                  # Audit logging
├── goals/                       # Goals management
│   ├── goals.module.ts
│   ├── goals.service.ts
│   ├── goals.controller.ts
│   ├── goal-schedules.module.ts
│   ├── goal-schedules.service.ts
│   ├── goal-schedules.controller.ts
│   ├── goal-templates.module.ts
│   ├── goal-templates.service.ts
│   └── goal-templates.controller.ts
├── workouts/                    # Workout templates & assignments
│   ├── workouts.module.ts
│   ├── workouts.service.ts
│   ├── workouts.controller.ts
│   ├── workout-templates.module.ts
│   ├── workout-templates.service.ts
│   ├── workout-templates.controller.ts
│   ├── workout-plan-chart-assignments.module.ts
│   ├── workout-plan-chart-assignments.service.ts
│   └── workout-plan-chart-assignments.controller.ts
├── diet-plans/                  # Diet plans & templates
│   ├── diet-plans.module.ts
│   ├── diet-plans.service.ts
│   ├── diet-plans.controller.ts
│   ├── diet-templates.module.ts
│   ├── diet-templates.service.ts
│   ├── diet-templates.controller.ts
│   ├── diet-assignments.module.ts
│   ├── diet-assignments.service.ts
│   └── diet-assignments.controller.ts
├── workout-logs/                # Workout history
├── body-progress/               # Body measurements
├── progress-tracking/           # Progress monitoring
├── exercise-library/            # Exercise database
├── notifications/               # User notifications
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   └── notifications.controller.ts
├── templates/                   # Template assignments & shares
│   ├── template-assignments.module.ts
│   ├── template-assignments.service.ts
│   ├── template-assignments.controller.ts
│   ├── template-shares.module.ts
│   ├── template-shares.service.ts
│   └── template-shares.controller.ts
├── common/
│   └── enums/
│       ├── permissions.enum.ts  # Permissions & UserRole
│       └── gender.enum.ts
├── entities/                    # TypeORM entities (35 entities)
└── database/                    # Database configuration
```

---

## Entity Architecture (35 Entities)

### Core Entities (Inherited from v1)

| Entity | Table | PK Type | Description |
|--------|-------|---------|-------------|
| User | users | UUID | System users with role-based access |
| Role | roles | UUID | Role definitions (SUPERADMIN, ADMIN, TRAINER, MEMBER) |
| Gym | gyms | UUID | Multi-gym organizations |
| Branch | branches | UUID | Gym locations/branches |
| Member | members | Auto | Gym members |
| Trainer | trainers | Auto | Fitness trainers |
| MembershipPlan | membership_plans | Auto | Subscription plans |
| MemberSubscription | member_subscriptions | Auto | Active subscriptions |
| Class | classes | UUID | Class schedules |
| MemberTrainerAssignment | member_trainer_assignments | UUID | Trainer-member relationships |
| Attendance | attendance | UUID | Check-in/check-out records |
| Inquiry | inquiries | Auto | Lead management |
| Invoice | invoices | UUID | Billing records |
| PaymentTransaction | payment_transactions | UUID | Payment tracking |
| AuditLog | audit_logs | UUID | Activity logging |
| DietPlan | diet_plans | UUID | Structured diet plans |
| DietPlanMeal | diet_plan_meals | UUID | Meal components |
| WorkoutPlan | workout_plans | UUID | Workout plans |
| WorkoutPlanExercise | workout_plan_exercises | UUID | Exercise components |
| ExerciseLibrary | exercise_library | UUID | Exercise database |
| WorkoutLog | workout_logs | Auto | Workout history |
| BodyProgress | body_progress | Auto | Body measurements |
| ProgressTracking | progress_tracking | UUID | Progress records |
| Goal | goals | Auto | Fitness goals |
| AttendanceGoal | attendance_goals | UUID | Attendance targets |
| Notification | notifications | UUID | User notifications |
| Diet | diets | Auto | Simple diets (legacy) |

### NEW Entities (v2.0)

#### 1. GoalSchedule Entity
**File:** `src/entities/goal_schedules.entity.ts`

```typescript
@Entity('goal_schedules')
export class GoalSchedule {
  @PrimaryGeneratedColumn('uuid') schedule_id: string;
  @ManyToOne(() => Trainer, { nullable: true }) assigned_trainer?: Trainer;
  @ManyToOne(() => Member, { onDelete: 'CASCADE' }) member: Member;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['weekly', 'monthly', 'quarterly'] }) schedule_type: string;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date' }) end_date: Date;
  @Column({ type: 'int', default: 1 }) current_period: number;
  @Column({ type: 'jsonb' }) target_goals: {
    id?: string;
    goal_type: string;
    target_value: number;
    unit: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    is_completed?: boolean;
    completed_value?: number;
    completed_at?: Date;
  }[];
  @Column({ type: 'jsonb', nullable: true }) period_progress?: {
    period_number: number;
    completed_goals: { goal_id: string; achieved_value: number; completion_date: Date }[];
    member_notes?: string;
    trainer_notes?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'missed';
  }[];
  @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled', 'paused'], default: 'active' }) status: string;
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'date', nullable: true }) last_activity_date?: Date;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 2. GoalTemplate Entity
**File:** `src/entities/goal_templates.entity.ts`

```typescript
@Entity('goal_templates')
export class GoalTemplate {
  @PrimaryGeneratedColumn('uuid') template_id: string;
  @ManyToOne(() => Trainer, { nullable: true }) trainer?: Trainer;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['weekly', 'monthly', 'quarterly'] }) default_schedule_type: string;
  @Column({ type: 'jsonb' }) default_goals: {
    goal_type: string;
    target_value: number;
    unit: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 3. GoalScheduleMilestone Entity
**File:** `src/entities/goal_schedule_milestones.entity.ts`

```typescript
@Entity('goal_schedule_milestones')
export class GoalScheduleMilestone {
  @PrimaryGeneratedColumn('uuid') milestone_id: string;
  @ManyToOne(() => GoalSchedule, { onDelete: 'CASCADE' }) schedule: GoalSchedule;
  @Column({ length: 50 }) period_label: string;
  @Column({ type: 'int', default: 1 }) sequence_order: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) target_value: number;
  @Column({ length: 50 }) unit: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['high', 'medium', 'low'], default: 'medium' }) priority: string;
  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'missed'], default: 'pending' }) status: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) current_value?: number;
  @Column({ type: 'date', nullable: true }) completed_at?: Date;
  @Column({ type: 'date', nullable: true }) due_date?: Date;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 4. WorkoutTemplate Entity
**File:** `src/entities/workout_templates.entity.ts`

```typescript
export enum ChartVisibility {
  PRIVATE = 'PRIVATE',
  GYM_PUBLIC = 'GYM_PUBLIC',
}

export enum ChartType {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  HIIT = 'HIIT',
  FLEXIBILITY = 'FLEXIBILITY',
  COMPOUND = 'COMPOUND',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum PlanType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  ENDURANCE = 'endurance',
  GENERAL = 'general',
}

@Entity('workout_templates')
export class WorkoutTemplate {
  @PrimaryGeneratedColumn('uuid') template_id: string;
  @Column({ type: 'int', nullable: true }) trainerId?: number;
  @ManyToOne(() => Trainer, { nullable: true }) trainer?: Trainer;
  @ManyToOne(() => Branch, { nullable: true }) branch?: Branch;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ChartVisibility, default: ChartVisibility.PRIVATE }) visibility: string;
  @Column({ type: 'enum', enum: ChartType }) chart_type: string;
  @Column({ type: 'enum', enum: DifficultyLevel }) difficulty_level: string;
  @Column({ type: 'enum', enum: PlanType, default: PlanType.GENERAL }) plan_type: string;
  @Column({ type: 'int', default: 0 }) duration_days: number;
  @Column({ default: false }) is_shared_gym: boolean;
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'int', default: 0 }) version: number;
  @Column({ type: 'uuid', nullable: true }) parent_template_id?: string;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) avg_rating?: number;
  @Column({ type: 'int', default: 0 }) rating_count: number;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @OneToMany(() => WorkoutTemplateExercise, (exercise) => exercise.template) exercises: WorkoutTemplateExercise[];
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 5. WorkoutTemplateExercise Entity
**File:** `src/entities/workout_template_exercises.entity.ts`

```typescript
export enum EquipmentRequired {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  CABLE = 'CABLE',
  MACHINE = 'MACHINE',
  BODYWEIGHT = 'BODYWEIGHT',
  KETTLEBELL = 'KETTLEBELL',
  MEDICINE_BALL = 'MEDICINE_BALL',
  RESISTANCE_BAND = 'RESISTANCE_BAND',
  OTHER = 'OTHER',
}

@Entity('workout_template_exercises')
export class WorkoutTemplateExercise {
  @PrimaryGeneratedColumn('uuid') exercise_id: string;
  @ManyToOne(() => WorkoutTemplate, (template) => template.exercises, { onDelete: 'CASCADE' }) template: WorkoutTemplate;
  @Column({ length: 100 }) exercise_name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['sets_reps', 'time', 'distance'] }) exercise_type: string;
  @Column({ type: 'enum', enum: EquipmentRequired, nullable: true }) equipment_required?: string;
  @Column({ type: 'int', nullable: true }) sets?: number;
  @Column({ type: 'int', nullable: true }) reps?: number;
  @Column({ type: 'int', nullable: true }) weight_kg?: number;
  @Column({ type: 'int', nullable: true }) duration_minutes?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) distance_km?: number;
  @Column({ type: 'int', default: 1 }) day_of_week: number;
  @Column({ type: 'int', nullable: true }) order_index?: number;
  @Column({ type: 'text', nullable: true }) instructions?: string;
  @Column({ type: 'text', nullable: true }) alternatives?: string;
  @Column({ default: true }) is_active: boolean;
  @Column({ default: false }) member_can_skip: boolean;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 6. DietTemplate Entity
**File:** `src/entities/diet_templates.entity.ts`

```typescript
@Entity('diet_templates')
export class DietTemplate {
  @PrimaryGeneratedColumn('uuid') template_id: string;
  @Column({ type: 'int', nullable: true }) trainerId?: number;
  @ManyToOne(() => Trainer, { nullable: true }) trainer?: Trainer;
  @ManyToOne(() => Branch, { nullable: true }) branch?: Branch;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'] }) goal_type: string;
  @Column({ type: 'int', default: 0 }) target_calories: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) protein_g?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) carbs_g?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) fat_g?: number;
  @Column({ default: false }) is_shared_gym: boolean;
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'int', default: 0 }) version: number;
  @Column({ type: 'uuid', nullable: true }) parent_template_id?: string;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) avg_rating?: number;
  @Column({ type: 'int', default: 0 }) rating_count: number;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @OneToMany(() => DietTemplateMeal, (meal) => meal.template) meals: DietTemplateMeal[];
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 7. DietTemplateMeal Entity
**File:** `src/entities/diet_template_meals.entity.ts`

```typescript
@Entity('diet_template_meals')
export class DietTemplateMeal {
  @PrimaryGeneratedColumn('uuid') meal_id: string;
  @ManyToOne(() => DietTemplate, (template) => template.meals, { onDelete: 'CASCADE' }) template: DietTemplate;
  @Column({ type: 'enum', enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'] }) meal_type: string;
  @Column({ length: 100 }) meal_name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'text', nullable: true }) ingredients?: string;
  @Column({ type: 'text', nullable: true }) preparation?: string;
  @Column({ type: 'int', nullable: true }) calories?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) protein_g?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) carbs_g?: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) fat_g?: number;
  @Column({ type: 'int', default: 1 }) day_of_week: number;
  @Column({ type: 'int', nullable: true }) order_index?: number;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ type: 'text', nullable: true }) alternatives?: string;
  @Column({ default: true }) is_active: boolean;
  @Column({ default: false }) member_can_skip: boolean;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 8. TemplateShare Entity
**File:** `src/entities/template_shares.entity.ts`

```typescript
@Entity('template_shares')
export class TemplateShare {
  @PrimaryGeneratedColumn('uuid') share_id: string;
  @Column({ type: 'uuid' }) template_id: string;
  @Column({ type: 'varchar', length: 50 }) template_type: 'workout' | 'diet' | 'goal';
  @ManyToOne(() => Trainer) shared_with_trainer: Trainer;
  @ManyToOne(() => User) shared_by_admin: User;
  @Column({ type: 'text', nullable: true }) admin_note?: string;
  @Column({ default: false }) is_accepted: boolean;
  @Column({ type: 'timestamp', nullable: true }) accepted_at?: Date;
  @CreateDateColumn() shared_at: Date;
}
```

#### 9. TemplateAssignment Entity
**File:** `src/entities/template_assignments.entity.ts`

```typescript
@Entity('template_assignments')
export class TemplateAssignment {
  @PrimaryGeneratedColumn('uuid') assignment_id: string;
  @Column({ type: 'uuid' }) template_id: string;
  @Column({ type: 'varchar', length: 50 }) template_type: 'workout' | 'diet';
  @Column({ type: 'int' }) memberId: number;
  @ManyToOne(() => Member, { onDelete: 'CASCADE' }) member: Member;
  @Column({ type: 'uuid', nullable: true }) trainer_assignmentId?: string;
  @ManyToOne(() => MemberTrainerAssignment, { nullable: true }) trainer_assignment?: MemberTrainerAssignment;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date', nullable: true }) end_date?: Date;
  @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled', 'paused'], default: 'active' }) status: string;
  @Column({ type: 'int', default: 0 }) completion_percent: number;
  @Column({ type: 'jsonb', nullable: true }) member_substitutions?: {
    original_item: string;
    substituted_item: string;
    reason?: string;
    date: Date;
  }[];
  @Column({ type: 'jsonb', nullable: true }) progress_log?: {
    date: Date;
    action: string;
    details: any;
  }[];
  @Column({ type: 'timestamp', nullable: true }) last_activity_at?: Date;
  @CreateDateColumn() assigned_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 10. WorkoutPlanChartAssignment Entity
**File:** `src/entities/workout_plan_chart_assignments.entity.ts`

```typescript
export enum ChartAssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

@Entity('workout_plan_chart_assignments')
export class WorkoutPlanChartAssignment {
  @PrimaryGeneratedColumn('uuid') assignment_id: string;
  @ManyToOne(() => WorkoutTemplate, { onDelete: 'CASCADE' }) chart: WorkoutTemplate;
  @Column({ type: 'uuid' }) chart_id: string;
  @ManyToOne(() => Member, { onDelete: 'CASCADE' }) member: Member;
  @Column({ type: 'int' }) memberId: number;
  @ManyToOne(() => MemberTrainerAssignment, { nullable: true }) trainer_assignment?: MemberTrainerAssignment;
  @Column({ type: 'uuid', nullable: true }) trainer_assignment_id?: string;
  @ManyToOne(() => User) assigned_by: User;
  @Column({ type: 'int' }) assigned_by_user_id: string;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date', nullable: true }) end_date?: Date;
  @Column({ type: 'enum', enum: ChartAssignmentStatus, default: ChartAssignmentStatus.ACTIVE }) status: string;
  @Column({ type: 'int', default: 0 }) completion_percent: number;
  @Column({ type: 'jsonb', nullable: true }) customizations?: {
    skipped_exercises: string[];
    modified_sets: { exercise_name: string; sets: number }[];
    modified_reps: { exercise_name: string; reps: string }[];
    notes: string;
  };
  @Column({ type: 'jsonb', nullable: true }) member_substitutions?: {
    original_exercise: string;
    substituted_exercise: string;
    reason?: string;
    date: Date;
  }[];
  @Column({ type: 'timestamp', nullable: true }) last_activity_at: Date;
  @CreateDateColumn() assigned_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 11. DietPlanAssignment Entity
**File:** `src/entities/diet_plan_assignments.entity.ts`

```typescript
export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

@Entity('diet_plan_assignments')
export class DietPlanAssignment {
  @PrimaryGeneratedColumn('uuid') assignment_id: string;
  @ManyToOne(() => DietPlan, { onDelete: 'CASCADE' }) diet_plan: DietPlan;
  @Column({ type: 'uuid' }) diet_plan_id: string;
  @ManyToOne(() => Member, { onDelete: 'CASCADE' }) member: Member;
  @Column({ type: 'int' }) memberId: number;
  @ManyToOne(() => User) assigned_by: User;
  @Column({ type: 'int' }) assigned_by_user_id: string;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date', nullable: true }) end_date?: Date;
  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE }) status: string;
  @Column({ type: 'int', default: 0 }) completion_percent: number;
  @Column({ type: 'jsonb', nullable: true }) member_substitutions?: {
    original_meal: string;
    substituted_meal: string;
    reason?: string;
    date: Date;
  }[];
  @Column({ type: 'jsonb', nullable: true }) progress_log?: {
    date: Date;
    action: string;
    details: any;
  }[];
  @Column({ type: 'timestamp', nullable: true }) last_activity_at: Date;
  @CreateDateColumn() assigned_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

#### 12. NotificationType Enum Enhancement
**File:** `src/entities/notifications.entity.ts`

```typescript
export enum NotificationType {
  // Goal notifications
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  GOAL_COMPLETED = 'GOAL_COMPLETED',
  GOAL_MISSED = 'GOAL_MISSED',
  MILESTONE_COMPLETE = 'MILESTONE_COMPLETE',
  MILESTONE_MISSED = 'MILESTONE_MISSED',

  // Chart/Training notifications
  CHART_ASSIGNED = 'CHART_ASSIGNED',
  CHART_SHARED = 'CHART_SHARED',

  // Diet notifications
  DIET_ASSIGNED = 'DIET_ASSIGNED',

  // Template notifications
  TEMPLATE_FEEDBACK_REQUEST = 'TEMPLATE_FEEDBACK_REQUEST',

  // System notifications
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
}
```

---

## Role-Based Access Control

### UserRole Enum
**File:** `src/common/enums/permissions.enum.ts`

```typescript
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',  // System-wide access
  ADMIN = 'ADMIN',            // gym_owner
  TRAINER = 'TRAINER',        // Fitness trainer
  MEMBER = 'MEMBER',          // Gym member
}
```

### Permissions Enum

```typescript
export enum Permissions {
  // Gym permissions
  GYM_CREATE = 'gym:create',
  GYM_READ = 'gym:read',
  GYM_UPDATE = 'gym:update',
  GYM_DELETE = 'gym:delete',

  // Branch permissions
  BRANCH_MANAGE = 'branch:manage',
  BRANCH_READ = 'branch:read',

  // Member permissions
  MEMBER_MANAGE = 'member:manage',
  MEMBER_READ = 'member:read',

  // Trainer permissions
  TRAINER_MANAGE = 'trainer:manage',
  TRAINER_READ = 'trainer:read',

  // Chart/Workout permissions
  CHART_CREATE = 'chart:create',
  CHART_VIEW_ALL = 'chart:view_all',
  CHART_VIEW_ASSIGNED = 'chart:view_assigned',
  CHART_ASSIGN_ANY = 'chart:assign_any',
  CHART_ASSIGN_ASSIGNED = 'chart:assign_assigned',

  // Diet permissions
  DIET_CREATE = 'diet:create',
  DIET_VIEW_ALL = 'diet:view_all',
  DIET_ASSIGN_ANY = 'diet:assign_any',
  DIET_ASSIGN_ASSIGNED = 'diet:assign_assigned',

  // Goal permissions
  GOAL_CREATE = 'goal:create',
  GOAL_VIEW_ALL = 'goal:view_all',
  GOAL_ASSIGN_ASSIGNED = 'goal:assign_assigned',

  // Admin permissions
  ADMIN_ALL = 'admin:all',
  SUPERADMIN_ALL = 'superadmin:all',
}
```

### Role Permissions Mapping

| Role | Permissions |
|------|-------------|
| **SUPERADMIN** | All permissions |
| **ADMIN** | gym:read/update, branch:*, member:*, trainer:*, chart:*, diet:*, goal:*, admin:all |
| **TRAINER** | chart:create, chart:view_assigned, chart:assign_assigned, diet:assign_assigned, goal:assign_assigned, member:read |
| **MEMBER** | Self-access only |

---

## Security Guards

### 1. RolesGuard
**File:** `src/auth/guards/roles.guard.ts`

Implements role-based access control using the `@Roles()` decorator:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role.name;
    const hasRole = requiredRoles.some((role) => userRole === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

### 2. BranchAccessGuard
**File:** `src/auth/guards/branch-access.guard.ts`

Validates multi-tenant access - admins can only access their own gym/branch:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Gym } from '../../entities/gym.entity';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Gym)
    private gymRepository: Repository<Gym>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireBranchOwner = this.reflector.getAllAndOverride<boolean>('requireBranchOwner', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireBranchOwner) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!user) {
      return true;
    }

    const userRole = user.role?.name;
    const isSuperAdmin = userRole === 'SUPERADMIN';
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    // Admins can only access their own gym/branch
    if (isAdmin && !isSuperAdmin) {
      const branchId = params.branchId || params.id;
      const gymId = params.gymId || params.id;

      if (branchId) {
        const branch = await this.branchRepository.findOne({
          where: { branchId },
          relations: ['gym'],
        });

        if (!branch) {
          throw new NotFoundException('Branch not found');
        }

        // Check if user belongs to the same gym as the branch
        if (branch.gym && user.gymId !== branch.gym.gymId) {
          throw new ForbiddenException('You do not have access to this branch');
        }
      } else if (gymId) {
        if (user.gymId !== gymId) {
          throw new ForbiddenException('You do not have access to this gym');
        }
      }
    }

    return true;
  }
}
```

### 3. @Roles Decorator
**File:** `src/auth/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage:**
```typescript
@Post()
@Roles(UserRole.TRAINER, UserRole.ADMIN)
@ApiOperation({ summary: 'Create workout template (trainer/admin only)' })
create(@Body() dto: CreateWorkoutTemplateDto, @CurrentUser() user: User) {
  // ...
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | JWT |

### Goal Schedules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goal-schedules` | Create goal schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/from-template` | Create from template | TRAINER, ADMIN |
| GET | `/goal-schedules` | List all schedules | All |
| GET | `/goal-schedules/member/:memberId` | Member's schedules | All |
| GET | `/goal-schedules/:id` | Get schedule details | All |
| PATCH | `/goal-schedules/:id/period` | Update period progress | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/pause` | Pause schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/resume` | Resume schedule | TRAINER, ADMIN |
| POST | `/goal-schedules/:id/complete` | Mark complete | TRAINER, ADMIN |
| DELETE | `/goal-schedules/:id` | Delete schedule | TRAINER, ADMIN |

### Goal Templates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goal-templates` | Create template | TRAINER, ADMIN |
| GET | `/goal-templates` | List templates | All |
| GET | `/goal-templates/:id` | Get template | All |
| PATCH | `/goal-templates/:id` | Update template | Owner, ADMIN |
| POST | `/goal-templates/:id/copy` | Copy template | TRAINER, ADMIN |
| DELETE | `/goal-templates/:id` | Delete template | Owner, ADMIN |

### Workout Templates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/workout-templates` | Create template | TRAINER, ADMIN |
| GET | `/workout-templates` | List templates | TRAINER, ADMIN |
| GET | `/workout-templates/trainer/my-templates` | My templates | TRAINER |
| GET | `/workout-templates/:id` | Get template | All |
| POST | `/workout-templates/:id/copy` | Copy template | TRAINER, ADMIN |
| POST | `/workout-templates/:id/share` | Share to trainer | ADMIN |
| POST | `/workout-templates/:id/accept` | Accept shared | TRAINER |
| POST | `/workout-templates/:id/rate` | Rate template | All |
| POST | `/workout-templates/:id/assign` | Assign to member | TRAINER, ADMIN |
| POST | `/workout-templates/:id/substitute` | Record substitution | MEMBER |
| DELETE | `/workout-templates/:id` | Delete template | Owner, ADMIN |

### Chart Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chart-assignments` | Assign chart to member | ADMIN, TRAINER |
| GET | `/chart-assignments` | List assignments | All |
| GET | `/chart-assignments/member/:memberId` | Member's charts | All |
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
| GET | `/diet-templates/trainer/my-templates` | My templates | TRAINER |
| GET | `/diet-templates/:id` | Get template | All |
| POST | `/diet-templates/:id/copy` | Copy template | TRAINER, ADMIN |
| POST | `/diet-templates/:id/share` | Share to trainer | ADMIN |
| POST | `/diet-templates/:id/accept` | Accept shared | TRAINER |
| POST | `/diet-templates/:id/rate` | Rate template | All |
| POST | `/diet-templates/:id/assign` | Assign to member | TRAINER, ADMIN |
| DELETE | `/diet-templates/:id` | Delete template | Owner, ADMIN |

### Diet Plan Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/diet-plan-assignments` | Assign diet plan | TRAINER, ADMIN |
| GET | `/diet-plan-assignments` | List assignments | All |
| GET | `/diet-plan-assignments/member/:memberId` | Member's diets | All |
| GET | `/diet-plan-assignments/:id` | Get assignment | All |
| PATCH | `/diet-plan-assignments/:id/progress` | Update progress | All |
| POST | `/diet-plan-assignments/:id/substitute` | Record substitution | All |
| POST | `/diet-plan-assignments/:id/link-chart` | Link to chart | TRAINER, ADMIN |
| POST | `/diet-plan-assignments/:id/cancel` | Cancel assignment | TRAINER, ADMIN |
| DELETE | `/diet-plan-assignments/:id` | Delete assignment | TRAINER, ADMIN |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get user notifications | JWT |
| GET | `/notifications/unread` | Get unread notifications | JWT |
| PATCH | `/notifications/:id/read` | Mark as read | JWT |
| PATCH | `/notifications/read-all` | Mark all as read | JWT |

---

## Services Overview

### GoalSchedulesService
**File:** `src/goals/goal-schedules.service.ts`

Key methods:
- `create(dto, user)` - Create goal schedule with target goals
- `createFromTemplate(dto, user)` - Create from goal template
- `findAll(user, filters)` - List schedules with role-based filtering
- `findOne(id, user)` - Get schedule with milestones
- `updatePeriodProgress(id, dto, user)` - Update progress
- `pauseSchedule(id, user)` - Pause active schedule
- `resumeSchedule(id, user)` - Resume paused schedule
- `completeSchedule(id, user)` - Mark as completed

### WorkoutTemplatesService
**File:** `src/workouts/workout-templates.service.ts`

Key methods:
- `create(dto, user)` - Create template with exercises
- `findAll(user, filters)` - List templates (role-based)
- `findOne(id, user)` - Get template with exercises
- `findByTrainer(trainerId, user)` - Get trainer's templates
- `copyTemplate(id, dto, user)` - Create copy with versioning
- `shareToTrainer(templateId, trainerId, admin, note)` - Share template
- `acceptSharedTemplate(shareId, trainerId)` - Accept shared template
- `assignToMember(templateId, memberId, ...)` - Assign to member
- `rateTemplate(id, dto, user)` - Rate template

### DietTemplatesService
**File:** `src/diet-plans/diet-templates.service.ts`

Key methods:
- `create(dto, user)` - Create template with meals
- `findAll(user, filters)` - List templates (role-based)
- `findOne(id, user)` - Get template with meals
- `copyTemplate(id, dto, user)` - Create copy with versioning
- `shareToTrainer(templateId, trainerId, admin, note)` - Share template
- `acceptSharedTemplate(shareId, trainerId)` - Accept shared template
- `assignToMember(templateId, memberId, ...)` - Assign to member
- `rateTemplate(id, dto, user)` - Rate template

### NotificationsService (Enhanced)
**File:** `src/notifications/notifications.service.ts`

New notification methods:
- `sendGoalProgressNotification(userId, goalTitle, progress)` - Goal progress update
- `sendGoalCompletedNotification(userId, goalTitle, memberName)` - Goal completed
- `sendGoalMissedNotification(userId, goalTitle)` - Goal missed
- `sendMilestoneCompleteNotification(userId, milestoneTitle, goalTitle)` - Milestone complete
- `sendMilestoneMissedNotification(userId, milestoneTitle, goalTitle)` - Milestone missed
- `sendChartAssignedNotification(userId, chartTitle, memberName)` - Chart assigned
- `sendChartSharedNotification(userId, chartTitle, sharedBy)` - Chart shared
- `sendDietAssignedNotification(userId, dietTitle, memberName)` - Diet assigned
- `sendTemplateFeedbackRequestNotification(userId, templateTitle)` - Feedback request

---

## Template System Features

### Workout Template Features

1. **Visibility Levels**
   - `PRIVATE` - Only creator can access
   - `GYM_PUBLIC` - All trainers in gym can access

2. **Chart Types**
   - STRENGTH, CARDIO, HIIT, FLEXIBILITY, COMPOUND

3. **Difficulty Levels**
   - BEGINNER, INTERMEDIATE, ADVANCED

4. **Exercise Configuration**
   - Sets/reps, time, or distance-based
   - Equipment requirements
   - Day of week assignment
   - Order within day
   - Member skip permissions
   - Alternatives for substitutions

5. **Versioning**
   - Automatic version increment on copy
   - Parent template tracking
   - Usage count tracking

6. **Rating System**
   - Average rating calculation
   - Rating count tracking

### Diet Template Features

1. **Goal Types**
   - weight_loss, muscle_gain, maintenance, cutting, bulking, custom

2. **Macro Tracking**
   - Target calories
   - Protein, carbs, fat in grams

3. **Meal Configuration**
   - 6 meal types: breakfast, lunch, dinner, snack, pre_workout, post_workout
   - Day of week assignment
   - Ingredients and preparation
   - Nutritional values per meal
   - Member skip permissions

4. **Sharing & Versioning**
   - Same features as workout templates

### Template Sharing Workflow

```
1. Trainer/Admin creates template
2. Admin shares template to trainer via POST /workout-templates/:id/share
3. Trainer receives notification
4. Trainer accepts via POST /workout-templates/:id/accept
5. Template becomes available to trainer
6. Trainer can assign to members or further customize
```

### Member Substitution System

```typescript
// Workout template substitutions
{
  original_exercise: "Bench Press",
  substituted_exercise: "Push-ups",
  reason: "Equipment unavailable",
  date: "2026-02-03T10:00:00Z"
}

// Diet template substitutions
{
  original_meal: "Chicken Breast",
  substituted_meal: "Turkey Slices",
  reason: "Dietary preference",
  date: "2026-02-03T12:00:00Z"
}
```

---

## Goal Schedule Features

### Schedule Types

1. **Weekly** - Short-term goals with weekly milestones
2. **Monthly** - Medium-term goals with monthly checkpoints
3. **Quarterly** - Long-term goals with quarterly reviews

### Goal Structure

```typescript
{
  id: "goal_1",
  goal_type: "weight_loss",
  target_value: 5,  // kg
  unit: "kg",
  description: "Lose 5kg this month",
  priority: "high",
  is_completed: false,
  completed_value: null,
  completed_at: null
}
```

### Progress Tracking

- Period-based progress updates
- Goal completion with achieved values
- Member and trainer notes
- Status tracking: pending, in_progress, completed, missed

### Milestone System

Each goal schedule can have:
- Period labels (Week 1, Week 2, etc.)
- Sequence ordering
- Target values with units
- Priority levels (high, medium, low)
- Due dates
- Status tracking (pending, in_progress, completed, missed)

---

## Multi-Tenancy

### BranchAccessGuard

Ensures that:
- SUPERADMIN can access all gyms/branches
- ADMIN can only access their own gym
- Trainers can only access their assigned members
- Members can only access their own data

### Data Isolation

- Gym-level data separation
- Branch-level resource scoping
- Trainer-member assignment filtering
- Role-based view permissions

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

### Role-Based Access in Services

```typescript
async create(dto: CreateDto, user: User) {
  const userRole = user.role?.name;
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
  const isTrainer = userRole === 'TRAINER';

  if (!isAdmin && !isTrainer) {
    throw new ForbiddenException('Only trainers and admins can create...');
  }

  // Create logic...
}
```

---

## Database Summary

### Total Entities: 35

| Category | Count | Examples |
|----------|-------|----------|
| Core Business | 8 | User, Role, Gym, Branch, Member, Trainer, Class, Inquiry |
| Subscriptions | 3 | MembershipPlan, MemberSubscription, MemberTrainerAssignment |
| Financial | 2 | Invoice, PaymentTransaction |
| Fitness - Legacy | 6 | DietPlan, DietPlanMeal, WorkoutPlan, WorkoutPlanExercise, Goal, ExerciseLibrary |
| Fitness - Templates | 8 | WorkoutTemplate, WorkoutTemplateExercise, DietTemplate, DietTemplateMeal, GoalTemplate, GoalSchedule, GoalScheduleMilestone |
| Assignments | 3 | TemplateAssignment, WorkoutPlanChartAssignment, DietPlanAssignment |
| Tracking | 5 | Attendance, WorkoutLog, BodyProgress, ProgressTracking, AttendanceGoal |
| System | 6 | AuditLog, Notification, TemplateShare, Diet, User (extended) |

### Cascade Delete Relationships

- Branch → Gym
- MemberTrainerAssignment → Member
- GoalSchedule → Member
- GoalScheduleMilestone → GoalSchedule
- WorkoutTemplateExercise → WorkoutTemplate
- DietTemplateMeal → DietTemplate
- TemplateAssignment → Member
- WorkoutPlanChartAssignment → Member
- DietPlanAssignment → Member

---

## File Structure Summary

| Category | Files | Status |
|----------|-------|--------|
| Entities | 35 | Implemented |
| Enums | 2 | Implemented (permissions, gender) |
| Guards | 3 | Implemented (JwtAuth, Roles, BranchAccess) |
| Decorators | 2 | Implemented (@Roles, @CurrentUser) |
| Services | 31 | Implemented |
| Controllers | 31 | Implemented |
| DTOs | 40+ | Implemented |
| Modules | 31 | Implemented |

---

## API Documentation

Access Swagger UI at: `http://localhost:3000/api`

Features:
- Bearer token authentication
- Request/response schemas
- API tags for each module
- Interactive endpoint testing

---

## Conclusion

This enhanced gym management system provides:

1. **Template Management** - Reusable workout and diet templates with versioning
2. **Goal Scheduling** - Structured goal plans with milestone tracking
3. **Role-Based Access** - Fine-grained permissions for each user role
4. **Multi-Tenant Security** - Gym/branch data isolation
5. **Trainer Workflows** - Template creation, sharing, and member assignment
6. **Member Engagement** - Substitution system and progress tracking
7. **Notification System** - Goal, chart, and diet notifications

The system is production-ready with comprehensive API coverage and follows NestJS best practices for modular architecture and type safety.
