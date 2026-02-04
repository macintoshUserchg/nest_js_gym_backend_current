# Postman Collection Auto-Populator

## Related Documentation
- **Main Project Documentation**: See root `CLAUDE.md` for complete project architecture and development guidelines

## What This Is
A Claude Code subagent pipeline that takes your raw exported Postman collection (endpoints + schema only, no body data),
generates realistic fake request bodies using Faker.js, hits your live NestJS server one endpoint at a time,
captures real responses, and writes everything back into the collection — so you can re-import a fully populated collection into Postman Desktop.

## How To Use

### Pipeline Commands
- Run a single endpoint (with silent dependency resolution): `/run-single <endpoint name>`
- Run ALL endpoints in order: `/populate-all`

### Info Commands
- Check server status: `/status`
- List available commands: `/endpoints`
- Get fresh JWT token: `/token`

### For API Testing
Use the **api-tester** skill for:
- Testing CRUD endpoints
- Validating response schemas
- Generating test fixtures
- Checking authentication/authorization

---

## Auth Flow
- **Type**: Login only
- **Endpoint**: POST /auth/login
- **Seeded credentials**: Use any of these test accounts

| Role | Email | Password |
|------|-------|----------|
| **SUPERADMIN** | `superadmin@fitnessfirstelite.com` | `SuperAdmin123!` |
| **ADMIN** | `admin@fitnessfirstelite.com` | `Admin123!` |
| **TRAINER** | `mike.johnson-smith0@email.com` (first seeded) | `Trainer123!` |
| **MEMBER** | `sophia.johnson-smith0@email.com` (first seeded) | `Member123!` |

- **Token location in response**: `access_token`
- **How token is used**: `Authorization: Bearer <token>` header on all protected endpoints

**Login Response Example:**
```json
{
  "userid": "usr_1234567890abcdef",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Public vs Protected
- **Public (no token needed)**:
  - `POST /auth/login`
  - `POST /auth/logout`
  - `POST /inquiries`
  - `GET /`
  - `GET /health`
  - `GET /info`

- **Protected (needs Bearer token)**:
  - Everything else (~135+ endpoints)

---

## Database Schema & Constraints

### Auto-Generated Fields (DO NOT include in request bodies)
- All UUID primary keys (e.g., `userId`, `gymId`, `branchId`, `classId`, etc.)
- All auto-increment IDs (e.g., Member `id`, Trainer `id`, etc.)
- `createdAt`, `updatedAt` timestamps
- `created_at`, `updated_at` timestamps

### UNIQUE Constraints (Faker must not duplicate)
- **User**: email
- **Role**: name
- **Gym**: email
- **Member**: email, subscriptionId
- **Trainer**: email
- **Inquiry**: email

### Core Business Entities

#### User
- **PK**: UUID (`userId`)
- **Fields**:
  - email: string (UNIQUE)
  - passwordHash: string (use `faker:internet.password()` for testing)
  - memberId: string (UUID, nullable, FK to members.id)
  - trainerId: string (UUID, nullable, FK to trainers.id)
  - gymId: string (UUID, nullable, FK to gyms.gymId)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)
  - roleId: string (UUID, FK to roles.id)

#### Role
- **PK**: UUID (`id`)
- **Fields**:
  - name: string (UNIQUE) - ENUM: "SUPERADMIN", "ADMIN", "TRAINER", "MEMBER"
  - description: string (nullable)

#### Gym
- **PK**: UUID (`gymId`)
- **Fields**:
  - name: string (max 100 chars)
  - email: string (max 100 chars, nullable, UNIQUE)
  - phone: string (max 15 chars, nullable)
  - logoUrl: string (nullable)
  - address: string (text, nullable)
  - location: string (nullable)
  - state: string (nullable)
  - latitude: decimal (10,8, nullable)
  - longitude: decimal (11,8, nullable)

#### Branch
- **PK**: UUID (`branchId`)
- **Fields**:
  - name: string (max 100 chars)
  - email: string (nullable)
  - phone: string (nullable)
  - address: string (text, nullable)
  - location: string (nullable)
  - state: string (nullable)
  - mainBranch: boolean (default: false)
  - latitude: decimal (10,8, nullable)
  - longitude: decimal (11,8, nullable)
  - gymGymId: string (UUID, FK to gyms.gymId) - CASCADE DELETE

### People Entities

#### Member
- **PK**: Auto-increment (`id`)
- **Fields**:
  - fullName: string
  - email: string (UNIQUE)
  - phone: string (nullable)
  - gender: ENUM ('male', 'female', 'other', 'prefer_not_to_say', nullable)
  - dateOfBirth: date (nullable)
  - addressLine1, addressLine2: string (nullable)
  - city, state, postalCode: string (nullable)
  - avatarUrl, attachmentUrl: string (nullable)
  - emergencyContactName, emergencyContactPhone: string (nullable)
  - isActive: boolean (default: true)
  - freezeMember: boolean (default: false)
  - subscriptionId: number (nullable, UNIQUE, FK to member_subscriptions.id)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)
  - is_managed_by_member: boolean (default: true)

#### Trainer
- **PK**: Auto-increment (`id`)
- **Fields**:
  - fullName: string
  - email: string (UNIQUE)
  - phone: string (nullable)
  - specialization: string (nullable)
  - avatarUrl: string (nullable)
  - branchBranchId: string (UUID, FK to branches.branchId)

#### Inquiry
- **PK**: Auto-increment (`id`)
- **Fields**:
  - fullName: string
  - email: string (UNIQUE)
  - phone, alternatePhone: string (nullable)
  - status: ENUM ('new', 'contacted', 'qualified', 'converted', 'closed')
  - source: ENUM ('walk_in', 'referral', 'social_media', 'website', 'google_ads', 'facebook_ads', 'print_ad', 'billboard', 'radio', 'television', 'other')
  - preferredMembershipType: ENUM ('basic', 'premium', 'vip', 'family', 'corporate', 'student', 'senior', nullable)
  - preferredContactMethod: string (nullable)
  - notes: string (nullable)
  - addressLine1, addressLine2, city, state, postalCode: string (nullable)
  - dateOfBirth: date (nullable)
  - occupation: string (nullable)
  - fitnessGoals: string (nullable)
  - hasPreviousGymExperience: boolean (default: false)
  - preferredContactTime: string (nullable)
  - wantsPersonalTraining: boolean (default: false)
  - referralCode: string (nullable)
  - branchId: string (UUID, nullable, FK to branches.branchId)

### Scheduling Entities

#### Class
- **PK**: UUID (`class_id`)
- **Fields**:
  - name: string (max 100 chars)
  - description: string (text, nullable)
  - timings: ENUM ('morning', 'evening', 'both', 'either', nullable)
  - recurrence_type: ENUM ('daily', 'weekly', 'monthly', nullable)
  - days_of_week: number array (nullable)
  - branchBranchId: string (UUID, FK to branches.branchId)

#### Attendance
- **PK**: UUID (`id`)
- **Fields**:
  - attendanceType: ENUM ('member', 'trainer')
  - checkInTime: timestamp
  - checkOutTime: timestamp (nullable)
  - date: date
  - notes: string (text, nullable)
  - memberId: number (nullable, FK to members.id) - CASCADE DELETE
  - trainerId: number (nullable, FK to trainers.id)
  - branchBranchId: string (UUID, FK to branches.branchId)
- **Polymorphic**: Can be linked to EITHER member OR trainer (check attendanceType)

### Subscription Entities

#### MembershipPlan
- **PK**: Auto-increment (`id`)
- **Fields**:
  - name: string
  - price: integer
  - durationInDays: integer
  - description: string (nullable)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)

#### MemberSubscription
- **PK**: Auto-increment (`id`)
- **Fields**:
  - startDate: timestamp
  - endDate: timestamp
  - isActive: boolean (default: true)
  - selectedClassIds: UUID array (nullable)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - planId: number (FK to membership_plans.id)

### Financial Entities

#### Invoice
- **PK**: UUID (`invoice_id`)
- **Fields**:
  - total_amount: decimal (10,2)
  - description: string (text, nullable)
  - due_date: date (nullable)
  - status: ENUM ('pending', 'paid', 'cancelled')
  - memberId: number (FK to members.id) - CASCADE DELETE
  - subscriptionId: number (nullable, FK to member_subscriptions.id)

#### PaymentTransaction
- **PK**: UUID (`transaction_id`)
- **Fields**:
  - amount: decimal (10,2)
  - method: ENUM ('cash', 'card', 'online', 'bank_transfer')
  - reference_number: string (nullable)
  - notes: string (text, nullable)
  - status: ENUM ('pending', 'completed', 'failed', 'refund')
  - invoiceId: string (UUID, FK to invoices.invoice_id) - CASCADE DELETE

### Fitness Tracking Entities

#### DietPlan
- **PK**: UUID (`plan_id`)
- **Fields**:
  - title: string (max 100 chars)
  - description: string (text, nullable)
  - goal_type: ENUM ('weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking')
  - target_calories: integer
  - target_protein, target_carbs, target_fat: integer (nullable)
  - start_date, end_date: date
  - is_active: boolean (default: true)
  - is_completed: boolean (default: false)
  - notes: string (text, nullable)
  - template_id: UUID (nullable)
  - is_template: boolean (default: false)
  - usage_count: integer (default: 0)
  - parent_template_id: UUID (nullable)
  - version: integer (default: 0)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - assigned_by_trainerId: number (nullable, FK to trainers.id)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)

#### DietPlanMeal
- **PK**: UUID (`meal_id`)
- **Fields**:
  - meal_type: ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')
  - meal_name: string (max 100 chars)
  - description, ingredients, preparation: string (text, nullable)
  - calories: integer (nullable)
  - protein_g, carbs_g, fat_g: decimal (5,2, nullable)
  - day_of_week: integer (default: 1)
  - notes: string (text, nullable)
  - is_active: boolean (default: true)
  - dietPlanPlanId: string (UUID, FK to diet_plans.plan_id) - CASCADE DELETE

#### WorkoutPlan
- **PK**: UUID (`plan_id`)
- **Fields**:
  - title: string (max 100 chars)
  - description: string (text, nullable)
  - difficulty_level: ENUM ('beginner', 'intermediate', 'advanced')
  - plan_type: ENUM ('strength', 'cardio', 'flexibility', 'endurance', 'general')
  - duration_days: integer (default: 0)
  - start_date, end_date: date
  - is_active: boolean (default: true)
  - is_completed: boolean (default: false)
  - notes: string (text, nullable)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - assigned_by_trainerId: number (nullable, FK to trainers.id)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)

#### WorkoutPlanExercise
- **PK**: UUID (`exercise_id`)
- **Fields**:
  - exercise_name: string (max 100 chars)
  - description: string (text, nullable)
  - exercise_type: ENUM ('sets_reps', 'time', 'distance')
  - sets, reps, weight_kg, duration_minutes: integer (nullable)
  - distance_km: decimal (5,2, nullable)
  - day_of_week: integer (default: 1)
  - instructions: string (text, nullable)
  - is_active: boolean (default: true)
  - workoutPlanPlanId: string (UUID, FK to workout_plans.plan_id) - CASCADE DELETE

#### WorkoutTemplate
- **PK**: UUID (`template_id`)
- **Fields**:
  - title: string (max 100 chars)
  - description: string (text, nullable)
  - visibility: ENUM ('PRIVATE', 'GYM_PUBLIC')
  - chart_type: ENUM ('STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'COMPOUND')
  - difficulty_level: ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
  - plan_type: ENUM ('strength', 'cardio', 'flexibility', 'endurance', 'general')
  - duration_days: integer
  - is_shared_gym: boolean (default: false)
  - is_active: boolean (default: true)
  - version: integer (default: 0)
  - parent_template_id: UUID (nullable)
  - usage_count: integer (default: 0)
  - avg_rating: decimal (3,2, nullable)
  - rating_count: integer (default: 0)
  - notes: string (text, nullable)
  - tags: JSONB (nullable)
  - trainerId: number (nullable, FK to trainers.id)
  - branchBranchId: string (UUID, nullable, FK to branches.branchId)

#### WorkoutTemplateExercise
- **PK**: UUID (`exercise_id`)
- **Fields**:
  - exercise_name: string (max 100 chars)
  - description: string (text, nullable)
  - exercise_type: ENUM ('sets_reps', 'time', 'distance')
  - equipment_required: ENUM ('BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'KETTLEBELL', 'MEDICINE_BALL', 'RESISTANCE_BAND', 'OTHER', nullable)
  - sets, reps, weight_kg, duration_minutes: integer (nullable)
  - distance_km: decimal (5,2, nullable)
  - day_of_week: integer (default: 1)
  - order_index: integer (nullable)
  - instructions, alternatives: string (text, nullable)
  - is_active: boolean (default: true)
  - member_can_skip: boolean (default: false)
  - templateTemplateId: string (UUID, FK to workout_templates.template_id) - CASCADE DELETE

#### BodyProgress
- **PK**: Auto-increment (`id`)
- **Fields**:
  - weight, body_fat, bmi: decimal (nullable)
  - measurements: JSONB (nullable)
  - progress_photos: JSONB (nullable)
  - date: date
  - memberId: number (FK to members.id) - CASCADE DELETE
  - trainerId: number (nullable, FK to trainers.id)

#### ProgressTracking
- **PK**: UUID (`progress_id`)
- **Fields**:
  - record_date: date
  - weight_kg, height_cm, body_fat_percentage, muscle_mass_kg, bmi: decimal (nullable)
  - chest_cm, waist_cm, arms_cm, thighs_cm: decimal (nullable)
  - notes, achievements: string (text, nullable)
  - photo_url: string (text, nullable)
  - is_active: boolean (default: true)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - recorded_by_trainerId: number (nullable, FK to trainers.id)

#### Goal
- **PK**: Auto-increment (`id`)
- **Fields**:
  - goal_type: string (max 100 chars)
  - target_value: decimal (nullable)
  - target_timeline: date (nullable)
  - milestone: JSONB (nullable)
  - status: string (max 50, default: 'active')
  - completion_percent: decimal (5,2, default: 0)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - trainerId: number (nullable, FK to trainers.id)

#### ExerciseLibrary
- **PK**: UUID (`exercise_id`)
- **Fields**:
  - exercise_name: string (max 100 chars)
  - body_part: ENUM ('upper_body', 'lower_body', 'core', 'cardio', 'full_body')
  - exercise_type: ENUM ('strength', 'cardio', 'flexibility', 'endurance', 'general')
  - difficulty_level: ENUM ('beginner', 'intermediate', 'advanced')
  - description, instructions, benefits, precautions: string (text, nullable)
  - video_url, image_url: string (text, nullable)
  - is_active: boolean (default: true)

#### GoalSchedule
- **PK**: UUID (`schedule_id`)
- **Fields**:
  - title: string (max 100 chars)
  - description: string (text, nullable)
  - schedule_type: ENUM ('weekly', 'monthly', 'quarterly')
  - start_date, end_date: date
  - current_period: integer (default: 1)
  - target_goals: JSONB
  - period_progress: JSONB (nullable)
  - status: ENUM ('active', 'completed', 'cancelled', 'paused')
  - is_active: boolean (default: true)
  - last_activity_date: date (nullable)
  - assigned_trainerId: number (nullable, FK to trainers.id)
  - memberId: number (FK to members.id) - CASCADE DELETE

#### GoalScheduleMilestone
- **PK**: UUID (`milestone_id`)
- **Fields**:
  - period_label: string (max 50 chars) - "Week 1", "Month 1"
  - sequence_order: integer (default: 1)
  - target_value: decimal (10,2)
  - unit: string (max 50 chars) - kg, reps, sessions, etc.
  - description: string (text, nullable)
  - priority: ENUM ('high', 'medium', 'low', default: 'medium')
  - status: ENUM ('pending', 'in_progress', 'completed', 'missed')
  - current_value: decimal (10,2, nullable)
  - completed_at, due_date: date (nullable)
  - scheduleScheduleId: string (UUID, FK to goal_schedules.schedule_id) - CASCADE DELETE

### System Entities

#### AuditLog
- **PK**: UUID (`log_id`)
- **Fields**:
  - action: string
  - entity_type: string
  - entity_id: string
  - previous_values: JSONB (nullable)
  - new_values: JSONB (nullable)
  - userId: string (UUID, FK to users.userId)

#### Notification
- **PK**: UUID (`notification_id`)
- **Fields**:
  - userId: string (UUID, FK to users.userId)
  - type: ENUM ('GOAL_PROGRESS', 'GOAL_COMPLETED', 'GOAL_MISSED', 'MILESTONE_COMPLETE', 'MILESTONE_MISSED', 'CHART_ASSIGNED', 'CHART_SHARED', 'DIET_ASSIGNED', 'TEMPLATE_FEEDBACK_REQUEST', 'SYSTEM', 'REMINDER')
  - title: string (max 200 chars)
  - message: string (text)
  - metadata: JSONB (nullable)
  - is_read: boolean (default: false)

### Relationship Entities

#### MemberTrainerAssignment
- **PK**: UUID (`assignment_id`)
- **Fields**:
  - start_date, end_date: date
  - status: ENUM ('active', 'ended')
  - assigned_workout_template_id, assigned_diet_template_id: UUID (nullable)
  - workout_start_date, workout_end_date, diet_start_date, diet_end_date: date (nullable)
  - auto_apply_templates: boolean (default: true)
  - allow_member_substitutions: boolean (default: true)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - trainerId: number (FK to trainers.id)

#### WorkoutPlanChartAssignment
- **PK**: UUID (`assignment_id`)
- **Fields**:
  - chart_id: UUID (FK to workout_templates.template_id)
  - memberId: number (FK to members.id) - CASCADE DELETE
  - trainer_assignment_id: UUID (nullable, FK to member_trainer_assignments.assignment_id)
  - assigned_by_user_id: UUID (FK to users.userId)
  - start_date, end_date: date
  - status: ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED')
  - completion_percent: integer (default: 0)
  - customizations: JSONB (nullable)
  - member_substitutions: JSONB (nullable)
  - last_activity_at: timestamp (nullable)

#### TemplateAssignment
- **PK**: UUID (`assignment_id`)
- **Fields**:
  - template_id: UUID
  - template_type: ('workout' or 'diet')
  - memberId: number (FK to members.id) - CASCADE DELETE
  - trainer_assignmentId: UUID (nullable, FK to member_trainer_assignments.assignment_id)
  - start_date, end_date: date
  - status: ENUM ('active', 'completed', 'cancelled', 'paused')
  - completion_percent: integer (default: 0)
  - member_substitutions: JSONB (nullable)
  - progress_log: JSONB (nullable)
  - last_activity_at: timestamp (nullable)

#### TemplateShare
- **PK**: UUID (`share_id`)
- **Fields**:
  - template_id: UUID
  - template_type: ('workout', 'diet', or 'goal')
  - shared_with_trainerId: number (FK to trainers.id)
  - admin_note: string (text, nullable)
  - is_accepted: boolean (default: false)
  - accepted_at: timestamp (nullable)
  - shared_by_admin_userId: string (UUID, FK to users.userId)

---

## dep-graph.json Rules

You manually maintain `postman/dep-graph.json`.
Each key = endpoint name (must match EXACTLY the name in your Postman collection).
Each value = array of endpoint names it depends on (must run before it).

Example:
```json
{
  "Login": [],
  "Create Gym": ["Login"],
  "Create Branch": ["Login", "Create Gym"],
  "Create Member": ["Login", "Create Branch"],
  "Create Trainer": ["Login", "Create Branch"],
  "Create Subscription": ["Login", "Create Member", "Create Membership Plan"]
}
```

---

## Runtime State Files (auto-managed, do NOT edit manually)
- `postman/captured-responses.json` — stores live responses from each endpoint run (used to pull IDs/tokens for dependent endpoints)
- `postman/resolved-run-order.json` — the ordered list of endpoints to run for a given target
- `postman/current-body.json` — the generated request body for the endpoint currently being hit
- `postman/current-response.json` — the raw response from the endpoint currently being hit
