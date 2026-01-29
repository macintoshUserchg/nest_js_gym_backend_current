# Optim Gym Management System

## Combinedized Implementation Plan: Best Features from Both Plans

**Sources:**
- `/project_mdfiles/proposed_plan.md` - Focus on permissions, milestones, equipment, chart types
- `/project_mdfiles/trainer_features_plan.md` - Focus on templates, versioning, substitutions, analytics

**Date:** 2026-01-28
**Project:** new-nestjs-gym-app (NestJS 11, TypeScript 5.7, PostgreSQL)

---

## Core Features (5 Areas)

### 1. Role-Based Access Control (Foundation)
- RolesGuard with permission enum
- BranchAccessGuard for multi-tenant enforcement
- Platform enforcement (SUPERADMIN web-only)

### 2. Goal Schedule System
- Weekly/monthly/quarterly goal schedules
- Milestones with status tracking (PENDING/IN_PROGRESS/COMPLETED/MISSED)
- Role-based update permissions
- Progress tracking with notifications

### 3. Training Charts (Workout Templates)
- Reusable workout templates (charts)
- Visibility: PRIVATE (creator only) / GYM_PUBLIC (all trainers in gym)
- Chart types: STRENGTH, CARDIO, HIIT, FLEXIBILITY, COMPOUND
- Difficulty levels: BEGINNER, INTERMEDIATE, ADVANCED
- Equipment tracking (BARBELL, DUMBBELL, CABLE, etc.)
- Versioning and copying support

### 4. Diet Plan Integration
- Diet templates linked to training charts
- Macro tracking (calories, protein, carbs, fat)
- Meal types: breakfast, lunch, dinner, snack, pre_workout, post_workout
- Member substitutions (where allowed)

### 5. Assignment System
- Trainer-member assignment with optional chart/diet binding
- Admin can assign to any member in gym
- Trainer can only assign to assigned members
- Chart customization per member

---

## Entities (10 New Entities)

### 1. GoalSchedule
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
  @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled', 'paused'], default: 'active' }) status: string;
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'date', nullable: true }) last_activity_date: Date;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

### 2. GoalScheduleMilestone
**File:** `src/entities/goal_schedule_milestones.entity.ts`
```typescript
@Entity('goal_schedule_milestones')
export class GoalScheduleMilestone {
  @PrimaryGeneratedColumn('uuid') milestone_id: string;
  @ManyToOne(() => GoalSchedule, { onDelete: 'CASCADE' }) schedule: GoalSchedule;
  @Column({ length: 50 }) period_label: string;  // "Week 1", "Month 1"
  @Column({ type: 'int', default: 1 }) sequence_order: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) target_value: number;
  @Column({ length: 50 }) unit: string;  // kg, reps, sessions, etc.
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

### 3. TrainingChart (WorkoutTemplate)
**File:** `src/entities/training_charts.entity.ts`
```typescript
@Entity('training_charts')
export class TrainingChart {
  @PrimaryGeneratedColumn('uuid') chart_id: string;
  @ManyToOne(() => Trainer) created_by: Trainer;
  @ManyToOne(() => Branch, { nullable: true }) branch?: Branch;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['PRIVATE', 'GYM_PUBLIC'] }) visibility: string;
  @Column({ type: 'enum', enum: ['STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'COMPOUND'] }) chart_type: string;
  @Column({ type: 'enum', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] }) difficulty_level: string;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @Column({ default: true }) is_active: boolean;
  @Column({ default: 0 }) version: number;
  @Column({ type: 'uuid', nullable: true }) parent_chart_id?: string;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) avg_rating?: number;
  @Column({ type: 'int', default: 0 }) rating_count: number;
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @OneToMany(() => TrainingChartExercise, e => e.chart) exercises: TrainingChartExercise[];
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

### 4. TrainingChartExercise
**File:** `src/entities/training_chart_exercises.entity.ts`
```typescript
@Entity('training_chart_exercises')
export class TrainingChartExercise {
  @PrimaryGeneratedColumn('uuid') exercise_id: string;
  @ManyToOne(() => TrainingChart, c => c.exercises, { onDelete: 'CASCADE' }) chart: TrainingChart;
  @Column({ type: 'int', default: 1 }) sequence_order: number;
  @Column({ length: 100 }) exercise_name: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'int', nullable: true }) sets?: number;
  @Column({ type: 'varchar', length: 20, nullable: true }) reps_range?: string;  // "8-12"
  @Column({ type: 'int', nullable: true }) duration_seconds?: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) rest_seconds?: number;
  @Column({ type: 'int', default: 1 }) day_of_week: number;
  @Column({ type: 'enum', enum: ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'KETTLEBELL', 'MEDICINE_BALL', 'RESISTANCE_BAND', 'OTHER'], nullable: true }) equipment_required?: string;
  @Column({ type: 'varchar', nullable: true }) video_url?: string;
  @Column({ type: 'text', nullable: true }) instructions?: string;
  @Column({ type: 'text', nullable: true }) alternatives?: string;
  @Column({ default: true }) is_active: boolean;
  @Column({ default: false }) member_can_skip: boolean;
}
```

### 5. WorkoutPlanChartAssignment
**File:** `src/entities/workout_plan_chart_assignments.entity.ts`
```typescript
@Entity('workout_plan_chart_assignments')
export class WorkoutPlanChartAssignment {
  @PrimaryGeneratedColumn('uuid') assignment_id: string;
  @ManyToOne(() => TrainingChart) chart: TrainingChart;
  @ManyToOne(() => Member) member: Member;
  @ManyToOne(() => MemberTrainerAssignment, { nullable: true }) trainer_assignment?: MemberTrainerAssignment;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date', nullable: true }) end_date?: Date;
  @Column({ type: 'enum', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'], default: 'ACTIVE' }) status: string;
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

### 6. DietPlanAssignment
**File:** `src/entities/diet_plan_assignments.entity.ts`
```typescript
@Entity('diet_plan_assignments')
export class DietPlanAssignment {
  @PrimaryGeneratedColumn('uuid') assignment_id: string;
  @ManyToOne(() => DietPlan) diet_plan: DietPlan;
  @ManyToOne(() => Member) member: Member;
  @ManyToOne(() => WorkoutPlanChartAssignment, { nullable: true }) linked_chart_assignment?: WorkoutPlanChartAssignment;
  @ManyToOne(() => User) assigned_by: User;
  @Column({ type: 'date' }) start_date: Date;
  @Column({ type: 'date', nullable: true }) end_date?: Date;
  @Column({ type: 'enum', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'], default: 'ACTIVE' }) status: string;
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

### 7. GoalTemplate
**File:** `src/entities/goal_templates.entity.ts`
```typescript
@Entity('goal_templates')
export class GoalTemplate {
  @PrimaryGeneratedColumn('uuid') template_id: string;
  @ManyToOne(() => Trainer, { nullable: true }) trainer?: Trainer;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'enum', enum: ['weekly', 'monthly', 'quarterly'] }) default_schedule_type: string;
  @Column({ type: 'jsonb' }) default_milestones: {
    period_label: string;
    sequence_order: number;
    target_value: number;
    unit: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    due_days_from_start: number;
  }[];
  @Column({ type: 'jsonb', nullable: true }) tags?: string[];
  @Column({ default: true }) is_active: boolean;
  @Column({ type: 'int', default: 0 }) usage_count: number;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

### 8. DietTemplate (Simplified - reference existing DietPlan)
**File:** `src/entities/diet_templates.entity.ts`
- Reuse existing DietPlan entity with optional `template_id` and `is_template` flag
- Add columns: `template_id` (nullable), `is_template` (boolean), `usage_count`, `parent_template_id`, `version`

### 9. TemplateShare
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
  @Column({ type: 'timestamp', nullable: true }) accepted_at: Date;
  @CreateDateColumn() shared_at: Date;
}
```

### 10. Notification Types Enhancement
**File:** `src/entities/notifications.entity.ts`
Add new types:
- `GOAL_PROGRESS`, `GOAL_COMPLETED`, `GOAL_MISSED`
- `CHART_ASSIGNED`, `CHART_SHARED`
- `DIET_ASSIGNED`
- `MILESTONE_COMPLETE`, `MILESTONE_MISSED`
- `TEMPLATE_FEEDBACK_REQUEST`

---

## Modified Entities

### 1. MemberTrainerAssignment
Add columns:
- `auto_apply_templates` (boolean, default: true)
- `allow_member_substitutions` (boolean, default: true)

### 2. DietPlan
Add columns:
- `template_id` (UUID, nullable)
- `is_template` (boolean, default: false)
- `usage_count` (int, default: 0)
- `parent_template_id` (UUID, nullable)
- `version` (int, default: 0)

---

## New Enums

### permissions.enum.ts
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

  // Chart permissions
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

### RolePermissions mapping:
| Role | Permissions |
|------|-------------|
| SUPERADMIN | All permissions |
| ADMIN | gym:read, gym:update, branch:*, member:manage, trainer:manage, chart:*, diet:*, goal:* |
| TRAINER | chart:create, chart:view_assigned, chart:assign_assigned, diet:assign_assigned, goal:assign_assigned |
| MEMBER | Self-access only |

---

## New Guards

### 1. RolesGuard
**File:** `src/auth/guards/roles.guard.ts`
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role?.name);
  }
}
```

### 2. BranchAccessGuard
**File:** `src/auth/guards/branch-access.guard.ts`
Validates admin owns the gym/branch they're trying to access.

### 3. PlatformGuard (Optional)
**File:** `src/auth/guards/platform.guard.ts`
Enforces SUPERADMIN only on web platform.

---

## New Decorators

### @Roles
**File:** `src/auth/decorators/roles.decorator.ts`
```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

## Services

### 1. GoalSchedulesService
**File:** `src/goal-schedules/goal-schedules.service.ts`
Methods:
- `create(dto, userId)` - Create schedule + auto-generate milestones
- `createFromTemplate(templateId, memberId, dates, userId)` - From goal template
- `findAll(user, filters?)` - List schedules
- `findOne(id)` - Get with milestones
- `findByMember(memberId)` - Member's schedules
- `findByTrainer(trainerId)` - Trainer assigned member schedules
- `updateMilestone(scheduleId, milestoneId, dto, userId)` - Update milestone
- `updateProgress(scheduleId, period, dto, userId)` - Update period
- `pauseSchedule(id)` - Pause
- `resumeSchedule(id)` - Resume
- `completeSchedule(id)` - Complete
- `recordLastActivity(id)` - Track activity
- `remove(id, userId)` - Delete

### 2. TrainingChartsService
**File:** `src/training-charts/training-charts.service.ts`
Methods:
- `create(dto, userId)` - Create chart with exercises
- `findAll(user, filters?)` - List (PRIVATE + gym public)
- `findOne(id)` - Get with exercises
- `findByTrainer(trainerId)` - Trainer's charts
- `findByGym(gymId)` - All gym charts (admin)
- `copyChart(id, userId)` - Create new version
- `shareToTrainer(chartId, trainerId, adminUserId, note?)` - Admin shares
- `acceptSharedChart(shareId, trainerId)` - Trainer accepts
- `assignToMember(chartId, memberId, dates?, customizations?)` - Assign
- `recordSubstitution(assignmentId, substitution, userId)` - Member swap
- `incrementUsage(id)` - Analytics
- `remove(id, userId)` - Delete

### 3. GoalTemplatesService
**File:** `src/goal-schedules/goal-templates.service.ts`
- create, findAll, findOne, findByTrainer, remove, getAnalytics

### 4. WorkoutPlanChartAssignmentsService
**File:** `src/training-charts/chart-assignments.service.ts`
- create, findByMember, findByChart, updateProgress, addSubstitution, cancel

### 5. DietPlanAssignmentsService
**File:** `src/diet-plans/diet-assignments.service.ts`
- create, findByMember, findByDietPlan, updateProgress, addSubstitution, cancel, linkToChart

### 6. NotificationService Enhancements
Add methods for:
- `sendGoalProgressNotification`, `sendGoalCompletedNotification`, `sendGoalMissedNotification`
- `sendMilestoneCompleteNotification`, `sendMilestoneMissedNotification`
- `sendChartAssignedNotification`, `sendChartSharedNotification`
- `sendDietAssignedNotification`
- `sendFeedbackRequestNotification`

---

## Controllers

### 1. GoalSchedulesController
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/goal-schedules` | Create schedule | Trainer/Admin |
| POST | `/goal-schedules/from-template` | From goal template | Trainer/Admin |
| GET | `/goal-schedules` | List schedules | All |
| GET | `/goal-schedules/member/:memberId` | Member's schedules | Owner/Trainer/Admin |
| GET | `/goal-schedules/:id` | Get with milestones | Owner/Trainer/Admin |
| PATCH | `/goal-schedules/:id/milestone/:milestoneId` | Update milestone | Trainer/Admin |
| PATCH | `/goal-schedules/:id/period` | Update period progress | Trainer/Member |
| POST | `/goal-schedules/:id/pause` | Pause | Trainer/Admin |
| POST | `/goal-schedules/:id/resume` | Resume | Trainer/Admin |
| POST | `/goal-schedules/:id/complete` | Complete | Trainer/Admin |
| DELETE | `/goal-schedules/:id` | Delete | Creator/Admin |

### 2. GoalTemplatesController
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/goal-templates` | Create template |
| GET | `/goal-templates` | List templates |
| GET | `/goal-templates/:id` | Get template |
| DELETE | `/goal-templates/:id` | Delete template |

### 3. TrainingChartsController
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/training-charts` | Create chart | Trainer/Admin |
| GET | `/training-charts` | List (filterable) | Trainer/Admin |
| GET | `/training-charts/gym` | All gym charts | Admin |
| GET | `/training-charts/shared` | Shared to me | Trainer |
| GET | `/training-charts/:id` | Get chart | Auth |
| POST | `/training-charts/:id/copy` | Copy chart | Owner |
| POST | `/training-charts/:id/share` | Share to trainer | Admin |
| POST | `/training-charts/:id/accept` | Accept shared | Trainer |
| POST | `/training-charts/:id/assign` | Assign to member | Trainer/Admin |
| POST | `/training-charts/:id/substitute` | Record substitution | Member |
| GET | `/training-charts/analytics/gym` | Analytics | Admin |
| DELETE | `/training-charts/:id` | Delete | Owner/Admin |

### 4. WorkoutPlanChartAssignmentsController
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chart-assignments/member/:memberId` | Member's assignments |
| GET | `/chart-assignments/:id` | Get assignment |
| PATCH | `/chart-assignments/:id/progress` | Update progress |
| POST | `/chart-assignments/:id/substitute` | Add substitution |
| POST | `/chart-assignments/:id/cancel` | Cancel |
| GET | `/chart-assignments/analytics` | Analytics |

### 5. DietPlanAssignmentsController
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/diet-plan-assignments` | Assign diet (admin) |
| POST | `/diet-plan-assignments/from-template` | From diet template |
| GET | `/diet-plan-assignments/member/:memberId` | Member's diets |
| GET | `/diet-plan-assignments/:id` | Get assignment |
| PATCH | `/diet-plan-assignments/:id/progress` | Update progress |
| POST | `/diet-plan-assignments/:id/substitute` | Add substitution |
| POST | `/diet-plan-assignments/:id/link-chart` | Link to chart |
| POST | `/diet-plan-assignments/:id/cancel` | Cancel |

### 6. NotificationsController
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| GET | `/notifications/unread` | Get unread |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all read |

---

## DTOs Required

### Goal Schedules (7 DTOs)
- create-goal-schedule.dto.ts
- create-goal-schedule-from-template.dto.ts
- update-milestone.dto.ts
- update-period-progress.dto.ts
- filter-goals.dto.ts
- pause-resume-schedule.dto.ts

### Goal Templates (2 DTOs)
- create-goal-template.dto.ts
- update-goal-template.dto.ts

### Training Charts (7 DTOs)
- create-training-chart.dto.ts
- create-chart-exercise.dto.ts
- update-training-chart.dto.ts
- copy-chart.dto.ts
- assign-chart.dto.ts
- chart-customization.dto.ts
- substitute-exercise.dto.ts

### Chart Assignments (3 DTOs)
- create-chart-assignment.dto.ts
- update-assignment-progress.dto.ts
- add-substitution.dto.ts

### Diet Assignments (4 DTOs)
- create-diet-assignment.dto.ts
- link-chart.dto.ts
- update-diet-progress.dto.ts
- diet-substitution.dto.ts

### Template Sharing (2 DTOs)
- share-template.dto.ts
- accept-shared-template.dto.ts

### Permissions (1 DTO)
- assign-role-permissions.dto.ts

**Total: 26 DTOs**

---

## Modules

### New Modules to Create
1. `src/goal-schedules/goal-schedules.module.ts`
2. `src/goal-schedules/goal-templates.module.ts`
3. `src/training-charts/training-charts.module.ts`
4. `src/diet-plans/diet-assignments.module.ts`

### Update Modules
- `src/auth/auth.module.ts` - Import new guards
- `src/app.module.ts` - Import new modules

---

## Permission Summary

### Goal Schedule Access
| Role | Create | View | Update Progress | Pause/Complete | Delete |
|------|--------|------|-----------------|----------------|--------|
| TRAINER (assigned) | Yes | Assigned | Yes | Yes | Own |
| TRAINER (not assigned) | No | No | No | No | No |
| ADMIN | Any | Any | Any | Any | Any |
| MEMBER (no trainer) | Own | Own | Own | Own | Own |
| MEMBER (has trainer) | No | Own | No | No | No |

### Chart/Training Access
| Role | Create | View Own | View Gym | View Shared | Assign | Delete |
|------|--------|----------|----------|-------------|--------|--------|
| TRAINER | Yes | Yes | No | Yes | Assigned | Own |
| ADMIN | Yes | N/A | Yes | N/A | Any | Any |
| SUPERADMIN | Yes | N/A | Yes | N/A | Any | Any |
| MEMBER | No | N/A | N/A | N/A | Assigned only | No |

---

## Implementation Phases (Priority Order)

### Phase 1: Foundation (Permissions & Guards)
1. Create `permissions.enum.ts`
2. Create `roles.decorator.ts`
3. Create `roles.guard.ts`
4. Create `branch-access.guard.ts`
5. Update existing services/controllers to use new guards

### Phase 2: Goal System
1. GoalSchedule entity + milestones entity
2. GoalTemplate entity
3. GoalSchedulesService + Controller
4. GoalTemplatesService + Controller
5. Notification integration for goals

### Phase 3: Training Charts
1. TrainingChart entity
2. TrainingChartExercise entity
3. TrainingChartsService + Controller
4. Chart assignment entity + service
5. Chart sharing (admin-to-trainer)

### Phase 4: Diet Integration
1. Update DietPlan entity (add template fields)
2. DietPlanAssignment entity
3. DietPlanAssignmentsService + Controller
4. Link diet to chart assignment

### Phase 5: Advanced Features
1. Template copying & versioning
2. Member substitutions
3. Analytics endpoints
4. Calendar integration (future)

---

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Entities | 9 | 2 (MemberTrainerAssignment, DietPlan) |
| Enums | 1 (permissions) | - |
| Guards | 3 (Roles, BranchAccess, Platform) | - |
| Decorators | 1 (@Roles) | - |
| Services | 6 | 2 (Notifications, Assignments) |
| Controllers | 6 | 2 (Assignments, Notifications) |
| DTOs | 26 | - |
| Modules | 4 | 2 (Auth, App) |
| **Total** | **56** | **8** |

---

## Verification Checklist

### Phase 1
- [ ] RolesGuard correctly checks roles
- [ ] BranchAccessGuard validates gym ownership
- [ ] Admin endpoints protected

### Phase 2
- [ ] Create goal schedule with milestones
- [ ] Create goal from template
- [ ] Trainer updates milestone status
- [ ] Member updates own progress (no trainer)
- [ ] Notifications sent on milestone complete/missed

### Phase 3
- [ ] Create training chart
- [ ] Chart visibility (PRIVATE/GYM_PUBLIC)
- [ ] Copy chart (new version)
- [ ] Admin shares chart to trainer
- [ ] Trainer accepts shared chart
- [ ] Assign chart to member
- [ ] Member substitution recorded
- [ ] Usage count incremented

### Phase 4
- [ ] Assign diet to member
- [ ] Link diet to chart assignment
- [ ] Member substitution in diet
- [ ] Progress tracking

### Phase 5
- [ ] Analytics data populated
- [ ] Substitution permissions working

---

## Notes

- Reuse existing entities where possible (DietPlan → add template fields)
- Follow existing code patterns from CLAUDE.md
- Use JSONB for flexible data (customizations, substitutions, progress)
- Auto-generate milestones when creating goal schedule
- Increment usage_count on chart/diet assignment
- Send notifications on key events (milestone complete/missed, assignment, etc.)
