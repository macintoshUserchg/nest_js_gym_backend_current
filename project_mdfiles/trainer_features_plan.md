# Implementation Plan: Flexible Gym Management System

## Overview
Implement a comprehensive, flexible gym management system with trainer features, reusable templates, goal tracking, and administrative controls.

---

## Core Features (4 Main Areas)

### 1. Goal Schedule System
- Weekly/monthly goal schedules for members
- Role-based update permissions (trainer/member/admin)
- Goal templates for quick assignment
- Progress tracking with notifications

### 2. Workout/Diet Templates
- Reusable workout/diet templates
- Template categories (weight loss, muscle gain, etc.)
- Template sharing (trainer-only, gym-wide, admin-to-trainer)
- Template versioning and copying
- Template analytics (usage tracking)

### 3. Enhanced Assignments
- Trainer-member assignment with optional template binding
- Both inline and separate endpoint assignment approaches
- Scheduled template application
- Template substitution allowances (member can swap exercises/meals)

### 4. Gym Admin Controls
- Admin can see all gym templates
- Admin can share templates to specific trainers
- Admin can assign templates to any member
- Template analytics dashboard

---

## Core Entities (8 new entities)

### 1.1 WorkoutTemplate Entity
**File:** `src/entities/workout_templates.entity.ts`
```typescript
@Entity('workout_templates')
export class WorkoutTemplate {
  @PrimaryGeneratedColumn('uuid') template_id: string;
  @ManyToOne(() => Trainer, { nullable: true }) trainer?: Trainer;
  @ManyToOne(() => Branch, { nullable: true }) branch?: Branch;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] }) difficulty_level: string;
  @Column({ type: 'enum', enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'] }) plan_type: string;
  @Column({ type: 'int', default: 0 }) duration_days: number;
  @Column({ default: false }) is_shared_gym: boolean;
  @Column({ default: true }) is_active: boolean;
  @Column({ default: 0 }) version: number;
  @Column({ type: 'uuid', nullable: true }) parent_template_id?: string;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) avg_rating?: number;
  @Column({ type: 'int', default: 0 }) rating_count: number;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @OneToMany(() => WorkoutTemplateExercise, e => e.template) exercises: WorkoutTemplateExercise[];
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

### 1.2 WorkoutTemplateExercise Entity
**File:** `src/entities/workout_template_exercises.entity.ts`
- exercise_name, description, exercise_type, sets, reps, weight_kg, duration_minutes, distance_km
- day_of_week, order_index, instructions, alternatives, is_active, member_can_skip

### 1.3 DietTemplate Entity
**File:** `src/entities/diet_templates.entity.ts`
- title, description, goal_type, target_calories, protein_g, carbs_g, fat_g
- is_shared_gym, is_active, version, parent_template_id, usage_count, avg_rating, rating_count, tags, notes

### 1.4 DietTemplateMeal Entity
**File:** `src/entities/diet_template_meals.entity.ts`
- meal_type, meal_name, description, ingredients, preparation, calories, protein_g, carbs_g, fat_g
- day_of_week, order_index, notes, alternatives, is_active, member_can_skip

### 1.5 GoalSchedule Entity
**File:** `src/entities/goal_schedules.entity.ts`
- assigned_trainer (nullable), member FK
- title, description, schedule_type (weekly/monthly/quarterly)
- start_date, end_date, current_period
- target_goals (JSONB with id, goal_type, target_value, unit, description, priority, is_completed, completed_value, completed_at)
- period_progress (JSONB)
- status (active/completed/cancelled/paused), is_active, last_activity_date

### 1.6 GoalTemplate Entity
**File:** `src/entities/goal_templates.entity.ts`
- trainer (nullable), title, description
- default_schedule_type, default_goals (JSONB), tags, is_active, usage_count

### 1.7 TemplateShare Entity
**File:** `src/entities/template_shares.entity.ts`
- template_id, template_type (workout/diet/goal)
- shared_with_trainer FK, shared_by_admin FK
- admin_note, is_accepted, accepted_at

### 1.8 TemplateAssignment Entity
**File:** `src/entities/template_assignments.entity.ts`
- template_id, template_type, member FK, trainer_assignment FK
- start_date, end_date, status, completion_percent
- member_substitutions (JSONB), progress_log (JSONB), last_activity_at

---

## Modified Entities

### 2.1 MemberTrainerAssignment
Add columns:
- auto_apply_templates (boolean, default: true)
- allow_member_substitutions (boolean, default: true)

### 2.2 Notification Entity
Add types: GOAL_PROGRESS, GOAL_COMPLETED, GOAL_MISSED, TEMPLATE_ASSIGNED, TEMPLATE_SHARED, TEMPLATE_FEEDBACK_REQUEST

---

## New DTOs (15+ DTOs)

### Workout Template DTOs
- create-workout-template.dto.ts
- update-workout-template.dto.ts
- copy-workout-template.dto.ts
- rate-workout-template.dto.ts
- substitute-exercise.dto.ts
- filter-templates.dto.ts

### Diet Template DTOs
- create-diet-template.dto.ts
- update-diet-template.dto.ts
- copy-diet-template.dto.ts
- rate-diet-template.dto.ts
- substitute-meal.dto.ts

### Goal Schedule DTOs
- create-goal-schedule.dto.ts
- create-goal-schedule-from-template.dto.ts
- update-period-progress.dto.ts
- update-goal-status.dto.ts
- filter-goals.dto.ts

### Goal Template DTOs
- create-goal-template.dto.ts
- update-goal-template.dto.ts

### Template Share DTOs
- share-template.dto.ts
- accept-shared-template.dto.ts

### Enhanced Assignment DTOs
- create-assignment.dto.ts (with template fields)
- update-assignment-templates.dto.ts
- apply-template-to-member.dto.ts

---

## New Services

### WorkoutTemplatesService
- create, findAll, findOne, findByTrainer, findByGym, findSharedWithTrainer
- copyTemplate, shareToTrainer, acceptSharedTemplate, rateTemplate
- assignToMember, recordSubstitution, incrementUsage, remove, getAnalytics

### DietTemplatesService
Same pattern as WorkoutTemplatesService

### GoalSchedulesService
- create, createFromTemplate, findAll, findOne, findByMember, findByTrainer
- updatePeriodProgress, updateGoalStatus, pauseSchedule, resumeSchedule
- completeSchedule, recordLastActivity, remove

### GoalTemplatesService
- create, findAll, findOne, findByTrainer, remove, getAnalytics

### TemplateAssignmentsService
- createFromAssignment, createManual, findByMember, updateProgress
- addSubstitution, cancel, getAnalytics

### NotificationService Enhancements
- sendGoalProgressNotification, sendGoalCompletedNotification, sendGoalMissedNotification
- sendTemplateAssignedNotification, sendTemplateSharedNotification, sendFeedbackRequestNotification
- getUserNotifications, markAsRead

---

## New Controllers

### WorkoutTemplatesController Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workout-templates` | Create template |
| GET | `/workout-templates` | List (with filters) |
| GET | `/workout-templates/gym` | All gym templates (admin) |
| GET | `/workout-templates/shared` | Templates shared to me |
| GET | `/workout-templates/:id` | Get one |
| POST | `/workout-templates/:id/copy` | Copy template |
| POST | `/workout-templates/:id/share` | Share to trainer (admin) |
| POST | `/workout-templates/:id/accept` | Accept shared template |
| POST | `/workout-templates/:id/rate` | Rate template |
| POST | `/workout-templates/:id/assign` | Assign to member |
| POST | `/workout-templates/:id/substitute` | Record substitution |
| GET | `/workout-templates/analytics/gym` | Analytics (admin) |
| DELETE | `/workout-templates/:id` | Delete template |

### DietTemplatesController
Same pattern as workout templates

### GoalSchedulesController Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/goal-schedules` | Create schedule |
| POST | `/goal-schedules/from-template` | Create from goal template |
| GET | `/goal-schedules` | List schedules |
| GET | `/goal-schedules/member/:memberId` | Member's schedules |
| GET | `/goal-schedules/:id` | Get one |
| PATCH | `/goal-schedules/:id/period` | Update period progress |
| PATCH | `/goal-schedules/:id/goal/:goalId` | Update goal status |
| POST | `/goal-schedules/:id/pause` | Pause schedule |
| POST | `/goal-schedules/:id/resume` | Resume schedule |
| POST | `/goal-schedules/:id/complete` | Complete schedule |
| DELETE | `/goal-schedules/:id` | Delete schedule |

### GoalTemplatesController
- POST /goal-templates, GET /goal-templates, GET /goal-templates/:id, DELETE /goal-templates/:id

### TemplateAssignmentsController
- POST /template-assignments, GET /template-assignments/member/:memberId
- GET /template-assignments/:id, PATCH /template-assignments/:id/progress
- POST /template-assignments/:id/substitute, POST /template-assignments/:id/cancel
- GET /template-assignments/analytics

### NotificationsController
- GET /notifications, GET /notifications/unread
- PATCH /notifications/:id/read, PATCH /notifications/read-all

---

## Permission Logic

### Goal Schedule Access Matrix
| Role | Create | View | Update Progress | Pause/Complete |
|------|--------|------|-----------------|----------------|
| TRAINER (assigned) | Own schedules | Assigned members | Yes | Yes |
| TRAINER (not assigned) | No | No | No | No |
| ADMIN | Any member | Any member | Any member | Any member |
| MEMBER (no trainer) | Own | Own | Own | Own |
| MEMBER (has trainer) | No | Own | No | No |

### Template Access Matrix
| Role | Create | View Own | View All Gym | View Shared | Use Any | Share |
|------|--------|----------|--------------|-------------|---------|-------|
| TRAINER | Yes | Yes | No | Yes | Own + shared | No |
| ADMIN | Yes | N/A | Yes | N/A | Yes | To trainers |
| SUPERADMIN | Yes | N/A | Yes | N/A | Yes | To trainers |
| MEMBER | No | N/A | N/A | N/A | Assigned only | No |

### Substitution Permissions
| Role | Can Substitute | Needs Approval |
|------|----------------|----------------|
| TRAINER | Any exercise/meal | No |
| MEMBER | Only marked as `member_can_skip` | Optional |
| ADMIN | Any | No |

---

## Implementation Priority

### Phase 1 (Must Have)
1. Workout/Diet Template entities + basic CRUD
2. Goal Schedule entity + CRUD
3. Template assignment to members
4. Basic notifications

### Phase 2 (Should Have)
5. Template sharing (admin-to-trainer)
6. Template copying & versioning
7. Goal templates (reusable)
8. Permission logic

### Phase 3 (Nice to Have)
9. Template analytics
10. Member substitutions
11. Calendar integration
12. Template feedback system

---

## Estimated Files

**New files:** 35+
- 6 entities
- 15+ DTOs
- 5 services
- 5 controllers
- 5 modules

**Modified files:** 8
- 2 existing entities
- 2 existing services
- 2 existing controllers
- 1 app.module.ts
- 1 notifications service

---

## Created By
Claude Code with Serena Plugin
Date: 2026-01-28

## Session Notes
- Project: new-nestjs-gym-app
- Framework: NestJS 11, TypeScript 5.7, PostgreSQL (TypeORM)
- Multi-tenant gym management system
- Super admin has web-based role, other roles login via Android app
