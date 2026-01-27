# Architectural Design: Gym Management System Enhancements

## Overview

This document outlines the architecture for 5 key features:
1. SUPERADMIN web-only role enforcement
2. Trainer weekly/monthly goal schedules for members
3. Reusable training charts (hybrid public/private templates)
4. Diet plan assignment linked to charts
5. Gym admin/owner chart & diet plan assignment across gym/branches

---

## Scenario 1: SUPERADMIN Web-Only Role Enforcement

### Current State
- 4 roles: SUPERADMIN, ADMIN, TRAINER, MEMBER
- Manual role checking in controllers
- No dedicated RolesGuard

### Proposed Design

**Backend (Role-Based Permissions Only):**
```typescript
// No platform checks - same API for all
// Permissions determine access
const superAdminPermissions = [
  'gym:create', 'gym:read', 'gym:update', 'gym:delete',
  'superadmin:all'
];

const adminPermissions = [
  'gym:read', 'gym:update',
  'branch:create', 'branch:read', 'branch:update', 'branch:delete',
  'member:manage', 'trainer:manage', 'chart:manage', 'diet:manage'
];

// Decorator for SUPERADMIN-only endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
```

**Frontend (Platform Enforcement):**
- Android app: Hide SUPERADMIN login, redirect to web
- Web dashboard: Full access for SUPERADMIN

### Key Files to Modify
| File | Change |
|------|--------|
| `src/auth/guards/roles.guard.ts` | NEW - Role-based permission guard |
| `src/auth/decorators/roles.decorator.ts` | NEW - @Roles() decorator |
| `src/common/enums/permissions.enum.ts` | NEW - Permission enum |

### Validation
- Verify SUPERADMIN cannot access mobile app endpoints (enforced by UI, not API)
- Verify ADMIN cannot access SUPERADMIN-only endpoints

---

## Scenario 2: Trainer Weekly/Monthly Goal Schedules

### Current State
- Goal entity exists with `milestone` (JSONB)
- AttendanceGoal entity for attendance targets
- Goals are simple with optional trainer association

### Proposed Design

**New Entity: GoalSchedule**
```typescript
@Entity('goal_schedules')
export class GoalSchedule {
  @PrimaryGeneratedColumn('uuid')
  schedule_id: string;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer: Trainer;

  @Column()
  title: string; // "Weight Loss Program Q1"

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalScheduleType,
    default: GoalScheduleType.WEEKLY
  })
  schedule_type: GoalScheduleType; // WEEKLY, MONTHLY

  @Column('date')
  start_date: Date;

  @Column('date')
  end_date: Date;

  @OneToMany(() => GoalScheduleMilestone, milestone => milestone.schedule)
  milestones: GoalScheduleMilestone[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('goal_schedule_milestones')
export class GoalScheduleMilestone {
  @PrimaryGeneratedColumn('uuid')
  milestone_id: string;

  @ManyToOne(() => GoalSchedule, schedule => schedule.milestones)
  schedule: GoalSchedule;

  @Column()
  period_label: string; // "Week 1", "Month 1", "Jan Week 1"

  @Column('int')
  sequence_order: number; // 1, 2, 3...

  @Column('text', { nullable: true })
  target_description: string;

  @Column('decimal', { nullable: true })
  target_value: number;

  @Column('text', { nullable: true })
  unit: string; // "kg", "reps", "sessions"

  @Column('date')
  target_date: Date;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING
  })
  status: MilestoneStatus; // PENDING, IN_PROGRESS, COMPLETED, MISSED

  @Column('decimal', { nullable: true })
  actual_value: number;

  @Column('date', { nullable: true })
  completed_at: Date;

  @Column('text', { nullable: true })
  trainer_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

enum GoalScheduleType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed'
}
```

**Service Logic:**
- Trainer creates schedule for assigned member
- System auto-generates milestones based on schedule_type
- Trainer updates individual milestone status
- Analytics tracks completion rate, streak, missed milestones

### Key Files to Create
| File | Purpose |
|------|---------|
| `src/entities/goal_schedule.entity.ts` | Schedule container |
| `src/entities/goal_schedule_milestone.entity.ts` | Individual milestones |
| `src/goal-schedules/` | NEW module (controller, service, DTOs) |

### Validation
- Create schedule → verify milestones auto-generated
- Update milestone → verify status change + completion
- Member view → see only their schedules

---

## Scenario 3: Reusable Training Charts (Hybrid Public/Private)

### Current State
- WorkoutPlan entity exists but is member-specific
- No template/reuse mechanism
- No sharing capability

### Proposed Design

**New Entity: TrainingChart**
```typescript
@Entity('training_charts')
export class TrainingChart {
  @PrimaryGeneratedColumn('uuid')
  chart_id: string;

  @ManyToOne(() => Trainer, { nullable: false })
  created_by: Trainer;

  @Column()
  title: string; // "Push Day Strength - Hypertrophy"

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ChartVisibility,
    default: ChartVisibility.PRIVATE
  })
  visibility: ChartVisibility; // PRIVATE, GYM_PUBLIC

  @ManyToOne(() => Gym, { nullable: true })
  gym: Gym; // Required if GYM_PUBLIC

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.INTERMEDIATE
  })
  difficulty_level: DifficultyLevel;

  @Column({
    type: 'enum',
    enum: ChartType,
    default: ChartType.STRENGTH
  })
  chart_type: ChartType; // STRENGTH, CARDIO, HIIT, FLEXIBILITY, COMPOUND

  @Column('simple-array', { nullable: true })
  target_muscle_groups: string[]; // ["chest", "triceps", "shoulders"]

  @Column('int', { default: 4 })
  weeks_duration: number;

  @Column('jsonb', { nullable: true })
  default_settings: {
    rest_between_sets?: number;
    rest_between_exercises?: number;
    tempo?: string;
    notes?: string;
  };

  @OneToMany(() => TrainingChartExercise, exercise => exercise.chart)
  exercises: TrainingChartExercise[];

  @Column('int', { default: 0 })
  usage_count: number; // Times assigned to members

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('training_chart_exercises')
export class TrainingChartExercise {
  @PrimaryGeneratedColumn('uuid')
  exercise_id: string;

  @ManyToOne(() => TrainingChart, chart => chart.exercises)
  chart: TrainingChart;

  @Column('int')
  sequence_order: number;

  @Column()
  exercise_name: string;

  @Column('text', { nullable: true })
  exercise_description: string;

  @Column('simple-array', { nullable: true })
  muscle_groups: string[];

  @Column({
    type: 'enum',
    enum: EquipmentType,
    nullable: true
  })
  equipment_required: EquipmentType;

  @Column('int', { nullable: true })
  sets: number;

  @Column('simple-array', { nullable: true })
  reps_range: string[]; // ["8", "12"] or "8-12"

  @Column('simple-array', { nullable: true })
  rest_seconds: string[];

  @Column('text', { nullable: true })
  tempo: string; // "3-0-1-0"

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  video_url: string;

  @CreateDateColumn()
  created_at: Date;
}

enum ChartVisibility {
  PRIVATE = 'private',      // Only creator
  GYM_PUBLIC = 'gym_public' // All trainers in gym
}

enum ChartType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  FLEXIBILITY = 'flexibility',
  COMPOUND = 'compound'
}

enum EquipmentType {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  CABLE = 'cable',
  MACHINE = 'machine',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  OTHER = 'other'
}

enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
```

**Chart Assignment to Member:**
```typescript
// Existing WorkoutPlan can reference a TrainingChart
// Or create new WorkoutPlanChartAssignment entity
@Entity('workout_plan_chart_assignments')
export class WorkoutPlanChartAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => TrainingChart)
  chart: TrainingChart;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  assigned_by: Trainer;

  @Column('date')
  start_date: Date;

  @Column('date', { nullable: true })
  end_date: Date;

  @Column('jsonb', { nullable: true })
  customizations: {
    // Allow trainer to tweak chart for specific member
    skipped_exercises?: string[];
    modified_sets?: Record<string, number>;
    modified_reps?: Record<string, string>;
    notes?: string;
  };

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE
  })
  status: AssignmentStatus;

  @CreateDateColumn()
  assigned_at: Date;
}
```

**Service Logic:**
- Create chart → save with visibility (PRIVATE/GYM_PUBLIC)
- List my charts → creator's PRIVATE + gym's GYM_PUBLIC
- Assign chart → creates assignment + increments usage_count
- Copy chart → creates new PRIVATE chart for trainer

### Key Files to Create
| File | Purpose |
|------|---------|
| `src/entities/training_chart.entity.ts` | Chart template |
| `src/entities/training_chart_exercise.entity.ts` | Exercises in chart |
| `src/entities/workout_plan_chart_assignment.entity.ts` | Chart-to-member link |
| `src/training-charts/` | NEW module |

### Validation
- Trainer creates PRIVATE chart → only they see it
- Trainer creates GYM_PUBLIC chart → all trainers in gym see it
- Admin assigns chart to member → success
- Non-assigned trainer views gym → sees GYM_PUBLIC only

---

## Scenario 4: Diet Plan Assignment Linked to Charts

### Current State
- DietPlan entity exists (title, target_calories, goal_type)
- DietPlanMeal entity for meals
- No link between diet and workout

### Proposed Design

**DietPlan Enhancement:**
```typescript
// Extend existing DietPlan entity or create DietPlanAssignment
@Entity('diet_plan_assignments')
export class DietPlanAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => DietPlan)
  diet_plan: DietPlan;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => TrainingChart, { nullable: true })
  linked_chart: TrainingChart; // NEW: Link to workout chart

  @ManyToOne(() => Trainer, { nullable: true })
  assigned_by: Trainer;

  @Column('date')
  start_date: Date;

  @Column('date', { nullable: true })
  end_date: Date;

  @Column('jsonb', { nullable: true })
  customizations: {
    adjusted_calories?: number;
    modified_meals?: Record<string, any>;
    allergies_excluded?: string[];
    notes?: string;
  };

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE
  })
  status: AssignmentStatus;

  @CreateDateColumn()
  assigned_at: Date;
}
```

**Assignment Flow:**
1. Trainer assigns diet plan to member
2. Optionally links to a TrainingChart
3. System creates DietPlanAssignment with optional chart reference
4. Member sees diet plan with linked workout context

**Query Pattern:**
```typescript
// Get member's diet with linked workout
const dietWithWorkout = await dietPlanAssignmentRepo.find({
  where: { memberId, status: 'active' },
  relations: ['diet_plan', 'linked_chart']
});
```

### Key Files to Modify/Create
| File | Purpose |
|------|---------|
| `src/entities/diet_plan.entity.ts` | Add optional chart link field |
| `src/entities/diet_plan_assignment.entity.ts` | NEW - Assignment tracking |
| `src/diet-plans/diet-plans.service.ts` | Add assignment methods |

### Validation
- Assign diet plan with chart → both linked
- View member diet → shows linked chart info
- Unlink chart → diet remains, chart reference cleared

---

## Scenario 5: Gym Admin Chart & Diet Plan Assignment

### Current State
- ADMIN role exists but limited permission enforcement
- No admin-specific chart/diet assignment
- Branch-level access exists but inconsistent

### Proposed Design

**Admin Permissions Extension:**
```typescript
// In roles.service.ts or new permissions service
const adminPermissions = {
  // Existing
  'gym:read', 'gym:update',
  'branch:create', 'branch:read', 'branch:update', 'branch:delete',
  'member:manage', 'trainer:manage',
  // NEW for charts/diets
  'chart:assign_any',      // Assign chart to any member in gym
  'chart:create',          // Create charts (some gyms may want this)
  'chart:view_all',        // View all charts in gym
  'diet:assign_any',       // Assign diet plan to any member
  'diet:view_all',         // View all diet plans in gym
};

const trainerPermissions = {
  // Limited to assigned members
  'chart:assign_assigned',  // Only assign to assigned members
  'chart:create',           // Can create own templates
  'chart:view_assigned',    // View only assigned member data
  'diet:assign_assigned',   // Only assign to assigned members
};
```

**Admin Endpoints:**
```typescript
// In training-charts.controller.ts
@Post('admin/assign')
@ApiOperation({ summary: 'Admin: Assign chart to any member in gym' })
@Roles('ADMIN', 'SUPERADMIN')
@BranchAccess() // NEW: Verify admin owns the gym/branch
assignChartToMember(
  @Body() assignChartDto: AdminAssignChartDto,
  @CurrentUser() user: User
) {
  // Verify user is admin of the gym
  // Assign chart to specified member
}

// Similar for diet plans
@Post('admin/diet-assign')
@ApiOperation({ summary: 'Admin: Assign diet plan to any member' })
@Roles('ADMIN', 'SUPERADMIN')
assignDietToMember(
  @Body() assignDietDto: AdminAssignDietDto,
  @CurrentUser() user: User
)
```

**AdminAssignChartDto:**
```typescript
export class AdminAssignChartDto {
  @ApiProperty()
  @IsUUID()
  chart_id: string;

  @ApiProperty()
  @IsInt()
  member_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  end_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customizations?: Record<string, any>;
}
```

**Branch Access Guard:**
```typescript
@Injectable()
export class BranchAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    const gymId = context.switchToHttp().getRequest().body.gymId ||
                  context.switchToHttp().getRequest().params.gymId;

    // ADMIN can only manage their own gym
    if (user.role.name === 'ADMIN' && user.gym?.gymId !== gymId) {
      throw new ForbiddenException('You can only manage your own gym');
    }
    return true;
  }
}
```

### Key Files to Modify
| File | Purpose |
|------|--------|
| `src/auth/guards/branch-access.guard.ts` | NEW - Verify gym ownership |
| `src/training-charts/training-charts.controller.ts` | Add admin endpoints |
| `src/diet-plans/diet-plans.controller.ts` | Add admin diet endpoints |
| `src/common/enums/permissions.enum.ts` | NEW - Permission definitions |

### Validation
- ADMIN assigns chart → success (if member in their gym)
- ADMIN assigns chart to other gym's member → Forbidden
- TRAINER uses admin endpoint → Forbidden
- SUPERADMIN can assign anywhere → success

---

## Entity Relationship Summary

```
Gym
├── Branches
│   ├── Members
│   │   ├── GoalSchedule → GoalScheduleMilestones
│   │   ├── WorkoutPlanChartAssignment → TrainingChart → TrainingChartExercises
│   │   └── DietPlanAssignment → DietPlan → DietPlanMeals
│   └── Trainers
│       └── TrainingCharts (created_by)
```

---

## Priority Implementation Order

1. **Phase 1**: RolesGuard + Permissions (foundation)
2. **Phase 2**: TrainingChart + TrainingChartExercises (core template system)
3. **Phase 3**: WorkoutPlanChartAssignment (chart-to-member link)
4. **Phase 4**: GoalSchedule + GoalScheduleMilestones (goal scheduling)
5. **Phase 5**: DietPlanAssignment + chart linking
6. **Phase 6**: Admin endpoints + BranchAccessGuard

---

## Files to Create/Modify Summary

### New Entities (6 files)
| File | Description |
|------|-------------|
| `src/entities/goal_schedule.entity.ts` | Goal schedule container |
| `src/entities/goal_schedule_milestone.entity.ts` | Individual milestones |
| `src/entities/training_chart.entity.ts` | Chart template |
| `src/entities/training_chart_exercise.entity.ts` | Exercises in chart |
| `src/entities/workout_plan_chart_assignment.entity.ts` | Chart assignment link |
| `src/entities/diet_plan_assignment.entity.ts` | Diet plan assignment |

### New Modules (3 modules)
| Module | Components |
|--------|------------|
| `src/goal-schedules/` | controller, service, DTOs |
| `src/training-charts/` | controller, service, DTOs |
| `src/common/enums/` | permissions.enum.ts |

### Modified Files
| File | Change |
|------|--------|
| `src/entities/diet_plan.entity.ts` | Add chart link field |
| `src/auth/guards/roles.guard.ts` | NEW - Permission guard |
| `src/auth/guards/branch-access.guard.ts` | NEW - Gym ownership guard |
| `src/auth/decorators/roles.decorator.ts` | NEW - @Roles decorator |
| `src/training-charts/controller.ts` | Add admin endpoints |
| `src/diet-plans/controller.ts` | Add admin diet endpoints |
