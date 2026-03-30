# Workout Plans

<cite>
**Referenced Files in This Document**
- [workout_plans.entity.ts](file://src/entities/workout_plans.entity.ts)
- [workout_plan_exercises.entity.ts](file://src/entities/workout_plan_exercises.entity.ts)
- [exercise_library.entity.ts](file://src/entities/exercise_library.entity.ts)
- [workout_templates.entity.ts](file://src/entities/workout_templates.entity.ts)
- [workout_template_exercises.entity.ts](file://src/entities/workout_template_exercises.entity.ts)
- [create-workout-plan.dto.ts](file://src/workouts/dto/create-workout-plan.dto.ts)
- [update-workout-plan.dto.ts](file://src/workouts/dto/update-workout-plan.dto.ts)
- [workouts.controller.ts](file://src/workouts/workouts.controller.ts)
- [workouts.service.ts](file://src/workouts/workouts.service.ts)
- [workout-templates.controller.ts](file://src/workouts/workout-templates.controller.ts)
- [workout-templates.service.ts](file://src/workouts/workout-templates.service.ts)
- [workout-plan-chart-assignments.controller.ts](file://src/workouts/workout-plan-chart-assignments.controller.ts)
- [workout-plan-chart-assignments.service.ts](file://src/workouts/workout-plan-chart-assignments.service.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the complete workout plans functionality, covering plan creation, management, and modification. It documents the entity model for workout plans and exercises, CRUD operations, validation via DTOs, integration with the exercise library, member and trainer assignments, permissions, scheduling, duration calculations, and compatibility with member fitness levels. Practical examples illustrate creating custom routines, assigning exercises with sets/reps/time/distance specifications, ordering exercises, and managing plan versions.

## Project Structure
The workout plans feature spans entities, DTOs, controllers, and services under the workouts module, plus template and chart assignment capabilities.

```mermaid
graph TB
subgraph "Workout Plans Module"
WC["WorkoutsController"]
WS["WorkoutsService"]
EWP["WorkoutPlan Entity"]
EWPE["WorkoutPlanExercise Entity"]
end
subgraph "Templates Module"
TC["WorkoutTemplatesController"]
TS["WorkoutTemplatesService"]
WT["WorkoutTemplate Entity"]
WTE["WorkoutTemplateExercise Entity"]
end
subgraph "Chart Assignments Module"
CAC["WorkoutPlanChartAssignmentsController"]
CAS["WorkoutPlanChartAssignmentsService"]
end
subgraph "Exercise Library"
EL["ExerciseLibrary Entity"]
end
WC --> WS
WS --> EWP
WS --> EWPE
TC --> TS
TS --> WT
TS --> WTE
CAS --> WT
CAS --> EWP
WS --> EL
```

**Diagram sources**
- [workouts.controller.ts:1-1156](file://src/workouts/workouts.controller.ts#L1-L1156)
- [workouts.service.ts:1-281](file://src/workouts/workouts.service.ts#L1-L281)
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)
- [workout_templates.entity.ts:1-126](file://src/entities/workout_templates.entity.ts#L1-L126)
- [workout_template_exercises.entity.ts:1-91](file://src/entities/workout_template_exercises.entity.ts#L1-L91)
- [workout-plan-chart-assignments.controller.ts:1-110](file://src/workouts/workout-plan-chart-assignments.controller.ts#L1-L110)
- [workout-plan-chart-assignments.service.ts:1-219](file://src/workouts/workout-plan-chart-assignments.service.ts#L1-L219)
- [exercise_library.entity.ts:1-59](file://src/entities/exercise_library.entity.ts#L1-L59)

**Section sources**
- [workouts.controller.ts:1-1156](file://src/workouts/workouts.controller.ts#L1-L1156)
- [workouts.service.ts:1-281](file://src/workouts/workouts.service.ts#L1-L281)
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)
- [workout_templates.entity.ts:1-126](file://src/entities/workout_templates.entity.ts#L1-L126)
- [workout_template_exercises.entity.ts:1-91](file://src/entities/workout_template_exercises.entity.ts#L1-L91)
- [workout-plan-chart-assignments.controller.ts:1-110](file://src/workouts/workout-plan-chart-assignments.controller.ts#L1-L110)
- [workout-plan-chart-assignments.service.ts:1-219](file://src/workouts/workout-plan-chart-assignments.service.ts#L1-L219)
- [exercise_library.entity.ts:1-59](file://src/entities/exercise_library.entity.ts#L1-L59)

## Core Components
- WorkoutPlan entity: stores plan metadata, scheduling, difficulty, type, and associations to member, trainer, branch, and exercises.
- WorkoutPlanExercise entity: defines individual exercises within a plan with sets/reps/time/distance specifications, day-of-week, and instructions.
- DTOs: CreateWorkoutPlanDto and UpdateWorkoutPlanDto validate and shape plan creation and updates.
- WorkoutsService: orchestrates creation, retrieval, updates, deletions, and permission checks; integrates with members, trainers, and users.
- WorkoutsController: exposes REST endpoints for CRUD and filtering; includes extensive Swagger documentation and examples.
- Template and Chart Assignment modules: support plan versioning, sharing, assignment to members, substitutions, and progress tracking.

**Section sources**
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)
- [create-workout-plan.dto.ts:1-145](file://src/workouts/dto/create-workout-plan.dto.ts#L1-L145)
- [update-workout-plan.dto.ts:1-5](file://src/workouts/dto/update-workout-plan.dto.ts#L1-L5)
- [workouts.service.ts:1-281](file://src/workouts/workouts.service.ts#L1-L281)
- [workouts.controller.ts:1-1156](file://src/workouts/workouts.controller.ts#L1-L1156)

## Architecture Overview
The system separates concerns across controllers, services, and entities. Controllers handle HTTP requests and responses, services encapsulate business logic and permissions, and entities define persistence and relationships. Templates and chart assignments complement plans by enabling sharing, versioning, and member-specific assignments.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "WorkoutsController"
participant Service as "WorkoutsService"
participant RepoPlan as "WorkoutPlan Repository"
participant RepoEx as "WorkoutPlanExercise Repository"
participant RepoMember as "Member Repository"
participant RepoTrainer as "Trainer Repository"
participant RepoUser as "User Repository"
Client->>Controller : POST /workouts
Controller->>Service : create(dto, userId)
Service->>RepoMember : findOne(memberId)
RepoMember-->>Service : Member
Service->>RepoUser : findOne(userId)
RepoUser-->>Service : User
Service->>RepoTrainer : findOne(trainerId?) if applicable
RepoTrainer-->>Service : Trainer?
Service->>RepoPlan : create(workoutPlanData)
RepoPlan-->>Service : Saved Plan
Service->>RepoEx : create(exercises)
RepoEx-->>Service : Saved Exercises
Service->>RepoPlan : findOne(plan_id, relations)
RepoPlan-->>Service : Plan with relations
Service-->>Controller : WorkoutPlan
Controller-->>Client : 201 Created
```

**Diagram sources**
- [workouts.controller.ts:455-460](file://src/workouts/workouts.controller.ts#L455-L460)
- [workouts.service.ts:31-125](file://src/workouts/workouts.service.ts#L31-L125)
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)

## Detailed Component Analysis

### Workout Plan Entity Model
The plan model captures plan-level attributes, scheduling, and associations. Exercises are embedded as a one-to-many relationship.

```mermaid
erDiagram
WORKOUT_PLAN {
uuid plan_id PK
uuid member_id FK
int assigned_by_trainer_id
uuid branch_id
string title
text description
enum difficulty_level
enum plan_type
int duration_days
date start_date
date end_date
boolean is_active
boolean is_completed
text notes
timestamp created_at
timestamp updated_at
}
MEMBER {
int id PK
}
TRAINER {
int id PK
}
BRANCH {
uuid id PK
}
WORKOUT_PLAN_EXERCISE {
uuid exercise_id PK
uuid workout_plan_id FK
string exercise_name
text description
enum exercise_type
int sets
int reps
decimal weight_kg
int duration_minutes
decimal distance_km
int day_of_week
text instructions
boolean is_active
timestamp created_at
timestamp updated_at
}
WORKOUT_PLAN ||--o{ WORKOUT_PLAN_EXERCISE : "has"
WORKOUT_PLAN }o--|| MEMBER : "assigned to"
WORKOUT_PLAN }o--|| TRAINER : "assigned by"
WORKOUT_PLAN }o--|| BRANCH : "scoped to"
```

**Diagram sources**
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)

**Section sources**
- [workout_plans.entity.ts:1-73](file://src/entities/workout_plans.entity.ts#L1-L73)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)

### Exercise Library Integration
The exercise library provides reusable exercise definitions with body part, type, difficulty, and media links. While workout plans reference exercises by name and specification, libraries can inform selection and ensure consistency.

```mermaid
erDiagram
EXERCISE_LIBRARY {
uuid exercise_id PK
string exercise_name
enum body_part
enum exercise_type
enum difficulty_level
text description
text instructions
text benefits
text precautions
text video_url
text image_url
boolean is_active
timestamp created_at
timestamp updated_at
}
WORKOUT_PLAN_EXERCISE ||--o{ EXERCISE_LIBRARY : "mirrors definition"
```

**Diagram sources**
- [exercise_library.entity.ts:1-59](file://src/entities/exercise_library.entity.ts#L1-L59)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)

**Section sources**
- [exercise_library.entity.ts:1-59](file://src/entities/exercise_library.entity.ts#L1-L59)
- [workout_plan_exercises.entity.ts:1-60](file://src/entities/workout_plan_exercises.entity.ts#L1-L60)

### Template and Versioning Support
Templates enable plan reuse and versioning. They include metadata like chart type, difficulty, plan type, duration, visibility, and a version number. Templates can be shared and assigned to members, and plans can be derived from templates.

```mermaid
erDiagram
WORKOUT_TEMPLATE {
uuid template_id PK
int trainerId
uuid branch_id
string title
text description
enum visibility
enum chart_type
enum difficulty_level
enum plan_type
int duration_days
boolean is_shared_gym
boolean is_active
int version
uuid parent_template_id
int usage_count
decimal avg_rating
int rating_count
text notes
jsonb tags
timestamp created_at
timestamp updated_at
}
WORKOUT_TEMPLATE_EXERCISE {
uuid exercise_id PK
uuid template_id FK
string exercise_name
text description
enum exercise_type
enum equipment_required
int sets
int reps
decimal weight_kg
int duration_minutes
decimal distance_km
int day_of_week
int order_index
text instructions
text alternatives
boolean is_active
boolean member_can_skip
timestamp created_at
timestamp updated_at
}
WORKOUT_TEMPLATE ||--o{ WORKOUT_TEMPLATE_EXERCISE : "contains"
```

**Diagram sources**
- [workout_templates.entity.ts:1-126](file://src/entities/workout_templates.entity.ts#L1-L126)
- [workout_template_exercises.entity.ts:1-91](file://src/entities/workout_template_exercises.entity.ts#L1-L91)

**Section sources**
- [workout_templates.entity.ts:1-126](file://src/entities/workout_templates.entity.ts#L1-L126)
- [workout_template_exercises.entity.ts:1-91](file://src/entities/workout_template_exercises.entity.ts#L1-L91)

### Chart Assignments to Members
Chart assignments connect templates or plans to members with status, dates, completion tracking, and substitutions. This enables member-specific progress and adjustments.

```mermaid
sequenceDiagram
participant Admin as "Admin/Trainer"
participant Controller as "WorkoutPlanChartAssignmentsController"
participant Service as "WorkoutPlanChartAssignmentsService"
participant RepoAssign as "Assignment Repository"
participant RepoChart as "WorkoutTemplate Repository"
participant RepoMember as "Member Repository"
participant RepoUser as "User Repository"
Admin->>Controller : POST /chart-assignments
Controller->>Service : create(dto, currentUser)
Service->>RepoChart : findOne(chart_id)
RepoChart-->>Service : Chart
Service->>RepoMember : findOne(memberId)
RepoMember-->>Service : Member
Service->>RepoAssign : create(assignmentData)
RepoAssign-->>Service : Saved Assignment
Service->>RepoChart : increment usage_count
Service-->>Controller : Assignment
Controller-->>Admin : 201 Created
```

**Diagram sources**
- [workout-plan-chart-assignments.controller.ts:32-37](file://src/workouts/workout-plan-chart-assignments.controller.ts#L32-L37)
- [workout-plan-chart-assignments.service.ts:26-92](file://src/workouts/workout-plan-chart-assignments.service.ts#L26-L92)

**Section sources**
- [workout-plan-chart-assignments.controller.ts:1-110](file://src/workouts/workout-plan-chart-assignments.controller.ts#L1-L110)
- [workout-plan-chart-assignments.service.ts:1-219](file://src/workouts/workout-plan-chart-assignments.service.ts#L1-L219)

### CRUD Operations for Workout Plans
- Create: Validates DTO, checks member existence, verifies user permissions (ADMIN/TRAINER), optionally associates a trainer, persists plan and exercises, and returns the hydrated plan.
- Retrieve: Find all plans with relations, find by ID, find by member, and find by user with role-based scoping.
- Update: Validates permissions (owner or assigned trainer), updates plan fields and dates, and saves.
- Delete: Validates permissions and removes the plan.

```mermaid
flowchart TD
Start(["Create Workout Plan"]) --> Validate["Validate DTO<br/>Check Member exists<br/>Check User exists"]
Validate --> RoleCheck{"User is ADMIN or TRAINER?"}
RoleCheck --> |No| Forbidden["Throw ForbiddenException"]
RoleCheck --> |Yes| TrainerCheck["Resolve Trainer (optional)"]
TrainerCheck --> PersistPlan["Persist WorkoutPlan"]
PersistPlan --> PersistExercises["Persist WorkoutPlanExercise entries"]
PersistExercises --> LoadPlan["Load with relations"]
LoadPlan --> Done(["Return Plan"])
```

**Diagram sources**
- [workouts.service.ts:31-125](file://src/workouts/workouts.service.ts#L31-L125)
- [create-workout-plan.dto.ts:77-145](file://src/workouts/dto/create-workout-plan.dto.ts#L77-L145)

**Section sources**
- [workouts.controller.ts:455-460](file://src/workouts/workouts.controller.ts#L455-L460)
- [workouts.service.ts:31-125](file://src/workouts/workouts.service.ts#L31-L125)
- [create-workout-plan.dto.ts:1-145](file://src/workouts/dto/create-workout-plan.dto.ts#L1-L145)

### Permissions and Access Control
- Creation and updates require ADMIN or TRAINER roles.
- Updates restrict to plan owner (ADMIN) or the assigned trainer.
- Retrieval by user scopes results to either all plans (ADMIN) or only those assigned by the trainer.

```mermaid
flowchart TD
Req(["Request"]) --> GetUser["Find User by userId"]
GetUser --> HasRole{"Role is ADMIN or TRAINER?"}
HasRole --> |No| Deny["Throw ForbiddenException"]
HasRole --> |Yes| Scope["Scope by role and trainerId"]
Scope --> Next["Proceed with operation"]
```

**Diagram sources**
- [workouts.service.ts:50-56](file://src/workouts/workouts.service.ts#L50-L56)
- [workouts.service.ts:151-173](file://src/workouts/workouts.service.ts#L151-L173)
- [workouts.service.ts:261-278](file://src/workouts/workouts.service.ts#L261-L278)

**Section sources**
- [workouts.service.ts:50-56](file://src/workouts/workouts.service.ts#L50-L56)
- [workouts.service.ts:151-173](file://src/workouts/workouts.service.ts#L151-L173)
- [workouts.service.ts:261-278](file://src/workouts/workouts.service.ts#L261-L278)

### Scheduling, Duration, and Fitness Levels
- Scheduling: Each exercise specifies a day_of_week, enabling weekly sequencing.
- Duration: Plan duration_days and explicit start/end dates define the timeframe.
- Compatibility: Plan difficulty_level and plan_type align with member fitness levels and goals.

```mermaid
flowchart TD
PlanStart["Plan start_date"] --> CalcEnd["Compute end_date = start_date + duration_days"]
CalcEnd --> Weekly["Map exercises to day_of_week"]
Weekly --> Schedule["Weekly schedule generated"]
Schedule --> Levels["Match difficulty_level and plan_type to member profile"]
```

**Diagram sources**
- [workout_plans.entity.ts:46-53](file://src/entities/workout_plans.entity.ts#L46-L53)
- [workout_plan_exercises.entity.ts:46-46](file://src/entities/workout_plan_exercises.entity.ts#L46-L46)

**Section sources**
- [workout_plans.entity.ts:37-53](file://src/entities/workout_plans.entity.ts#L37-L53)
- [workout_plan_exercises.entity.ts:27-46](file://src/entities/workout_plan_exercises.entity.ts#L27-L46)

### Practical Examples
- Creating a custom routine:
  - Use CreateWorkoutPlanDto with memberId, title, description, difficulty_level, plan_type, duration_days, start_date, end_date, and an exercises array containing exercise_name, exercise_type, sets, reps, weight_kg, duration_minutes, distance_km, day_of_week, and instructions.
- Adding exercises with sets/reps/time/distance:
  - Choose exercise_type accordingly and provide numeric fields as applicable; leave others null.
- Organizing exercise order:
  - Use day_of_week to schedule exercises across the week; combine with plan duration_days to span the plan period.
- Managing plan versions:
  - Templates support version increments and parent_template_id for lineage; plans are derived from templates and can be updated independently.

**Section sources**
- [create-workout-plan.dto.ts:14-145](file://src/workouts/dto/create-workout-plan.dto.ts#L14-L145)
- [workout_plan_exercises.entity.ts:27-46](file://src/entities/workout_plan_exercises.entity.ts#L27-L46)
- [workout_templates.entity.ts:96-100](file://src/entities/workout_templates.entity.ts#L96-L100)

## Dependency Analysis
The modules depend on each other as follows:
- WorkoutsService depends on repositories for WorkoutPlan, WorkoutPlanExercise, Member, Trainer, and User.
- WorkoutTemplatesService depends on repositories for WorkoutTemplate, WorkoutTemplateExercise, TemplateShare, and TemplateAssignment.
- Chart Assignments Service depends on repositories for assignments, templates, members, and users, and integrates with NotificationsService.

```mermaid
graph LR
WS["WorkoutsService"] --> WP["WorkoutPlan Repository"]
WS --> WPE["WorkoutPlanExercise Repository"]
WS --> M["Member Repository"]
WS --> T["Trainer Repository"]
WS --> U["User Repository"]
TS["WorkoutTemplatesService"] --> WT["WorkoutTemplate Repository"]
TS --> WTE["WorkoutTemplateExercise Repository"]
TS --> SH["TemplateShare Repository"]
TS --> TA["TemplateAssignment Repository"]
CAS["WorkoutPlanChartAssignmentsService"] --> WA["Assignment Repository"]
CAS --> WT
CAS --> M
CAS --> U
CAS --> N["NotificationsService"]
```

**Diagram sources**
- [workouts.service.ts:16-29](file://src/workouts/workouts.service.ts#L16-L29)
- [workout-templates.service.ts:23-34](file://src/workouts/workout-templates.service.ts#L23-L34)
- [workout-plan-chart-assignments.service.ts:12-24](file://src/workouts/workout-plan-chart-assignments.service.ts#L12-L24)

**Section sources**
- [workouts.service.ts:16-29](file://src/workouts/workouts.service.ts#L16-L29)
- [workout-templates.service.ts:23-34](file://src/workouts/workout-templates.service.ts#L23-L34)
- [workout-plan-chart-assignments.service.ts:12-24](file://src/workouts/workout-plan-chart-assignments.service.ts#L12-L24)

## Performance Considerations
- Prefer batch operations for exercises during plan creation to minimize round trips.
- Use relations judiciously; load only required relations to reduce payload sizes.
- Pagination and filtering in controllers help manage large datasets.
- Indexes on frequently queried columns (memberId, trainerId, plan_id, assignment_id) improve query performance.

## Troubleshooting Guide
- Validation failures: DTO validation errors surface as Bad Request responses; ensure all required fields are present and formatted correctly.
- Permission errors: Requests from unauthorized users receive Forbidden responses; verify user role and trainer association.
- Not found errors: Missing members, trainers, or plans trigger NotFound responses; confirm identifiers exist.
- Duplicate assignments: Attempting to assign an active chart to a member twice raises a Bad Request; cancel or modify existing assignment first.

**Section sources**
- [workouts.controller.ts:294-307](file://src/workouts/workouts.controller.ts#L294-L307)
- [workouts.service.ts:36-56](file://src/workouts/workouts.service.ts#L36-L56)
- [workout-plan-chart-assignments.service.ts:43-53](file://src/workouts/workout-plan-chart-assignments.service.ts#L43-L53)

## Conclusion
The workout plans feature provides a robust foundation for creating, managing, and modifying personalized training programs. It supports detailed exercise specifications, scheduling, permissions, and integration with templates and chart assignments. By leveraging DTO validation, role-based access control, and structured entities, the system ensures consistency and scalability for diverse fitness goals and member profiles.