# Progress Tracking APIs Documentation

This document describes the API endpoints for managing workout logs, body progress, and goals for members in the gym management system.

## Overview

These entities can be managed by:

- **GYM_OWNER**: Can create, view, update, and delete any records
- **TRAINER**: Can create, view, update, and delete only their assigned records

## Workout Logs

### Database Schema

```sql
workout_logs(
  id,
  member_id,
  trainer_id,
  exercise_name,
  sets,
  reps,
  weight,
  duration,
  notes,
  date,
  created_at,
  updated_at
)
```

### Endpoints

#### 1. Create a Workout Log

**POST** `/workout-logs`

Creates a new workout log for a member.

**Request Body:**

```json
{
  "memberId": 1,
  "trainerId": 1,
  "exercise_name": "Bench Press",
  "sets": 4,
  "reps": 10,
  "weight": 60.5,
  "duration": 45,
  "notes": "Good form, last set to failure",
  "date": "2025-06-12"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "member": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "trainer": {
    "id": 1,
    "name": "Jane Smith",
    "specialization": "Strength Training"
  },
  "exercise_name": "Bench Press",
  "sets": 4,
  "reps": 10,
  "weight": 60.5,
  "duration": 45,
  "notes": "Good form, last set to failure",
  "date": "2025-06-12",
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

#### 2. Get All Workout Logs

**GET** `/workout-logs`

Returns all workout logs in the system.

#### 3. Get Workout Log by ID

**GET** `/workout-logs/:id`

Returns a specific workout log by its ID.

#### 4. Update Workout Log

**PATCH** `/workout-logs/:id`

Updates an existing workout log.

#### 5. Delete Workout Log

**DELETE** `/workout-logs/:id`

Deletes a workout log.

#### 6. Get Workout Logs for a Member

**GET** `/workout-logs/member/:memberId`

Returns all workout logs for a specific member.

#### 7. Get User's Assigned Workout Logs

**GET** `/workout-logs/user/my-workout-logs`

Returns all workout logs assigned by the current user (trainer or gym owner).

---

## Body Progress

### Database Schema

```sql
body_progress(
  id,
  member_id,
  trainer_id,
  weight,
  body_fat,
  bmi,
  measurements JSONB,
  progress_photos JSONB,
  date,
  created_at,
  updated_at
)
```

### Endpoints

#### 1. Create a Body Progress Record

**POST** `/body-progress`

Creates a new body progress record for a member.

**Request Body:**

```json
{
  "memberId": 1,
  "trainerId": 1,
  "weight": 75.5,
  "body_fat": 15.2,
  "bmi": 24.1,
  "measurements": {
    "chest": 100,
    "waist": 85,
    "hips": 95,
    "arms": 35,
    "thighs": 55
  },
  "progress_photos": {
    "front": "url/to/front-photo.jpg",
    "side": "url/to/side-photo.jpg",
    "back": "url/to/back-photo.jpg"
  },
  "date": "2025-06-12"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "member": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "trainer": {
    "id": 1,
    "name": "Jane Smith",
    "specialization": "Strength Training"
  },
  "weight": 75.5,
  "body_fat": 15.2,
  "bmi": 24.1,
  "measurements": {
    "chest": 100,
    "waist": 85,
    "hips": 95,
    "arms": 35,
    "thighs": 55
  },
  "progress_photos": {
    "front": "url/to/front-photo.jpg",
    "side": "url/to/side-photo.jpg",
    "back": "url/to/back-photo.jpg"
  },
  "date": "2025-06-12",
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

#### 2. Get All Body Progress Records

**GET** `/body-progress`

Returns all body progress records in the system.

#### 3. Get Body Progress Record by ID

**GET** `/body-progress/:id`

Returns a specific body progress record by its ID.

#### 4. Update Body Progress Record

**PATCH** `/body-progress/:id`

Updates an existing body progress record.

#### 5. Delete Body Progress Record

**DELETE** `/body-progress/:id`

Deletes a body progress record.

#### 6. Get Body Progress Records for a Member

**GET** `/body-progress/member/:memberId`

Returns all body progress records for a specific member.

#### 7. Get User's Assigned Body Progress Records

**GET** `/body-progress/user/my-body-progress`

Returns all body progress records assigned by the current user (trainer or gym owner).

---

## Goals

### Database Schema

```sql
goals(
  id,
  member_id,
  trainer_id,
  goal_type,
  target_value,
  target_timeline,
  milestone JSONB,
  status,
  completion_percent,
  created_at,
  updated_at
)
```

### Endpoints

#### 1. Create a Goal

**POST** `/goals`

Creates a new goal for a member.

**Request Body:**

```json
{
  "memberId": 1,
  "trainerId": 1,
  "goal_type": "weight_loss",
  "target_value": 70.0,
  "target_timeline": "2025-12-31",
  "milestone": {
    "month_1": 78.0,
    "month_2": 76.0,
    "month_3": 74.0,
    "month_4": 72.0,
    "month_5": 71.0,
    "month_6": 70.0
  },
  "status": "active",
  "completion_percent": 20
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "member": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "trainer": {
    "id": 1,
    "name": "Jane Smith",
    "specialization": "Strength Training"
  },
  "goal_type": "weight_loss",
  "target_value": 70.0,
  "target_timeline": "2025-12-31",
  "milestone": {
    "month_1": 78.0,
    "month_2": 76.0,
    "month_3": 74.0,
    "month_4": 72.0,
    "month_5": 71.0,
    "month_6": 70.0
  },
  "status": "active",
  "completion_percent": 20,
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

#### 2. Get All Goals

**GET** `/goals`

Returns all goals in the system.

#### 3. Get Goal by ID

**GET** `/goals/:id`

Returns a specific goal by its ID.

#### 4. Update Goal

**PATCH** `/goals/:id`

Updates an existing goal.

#### 5. Delete Goal

**DELETE** `/goals/:id`

Deletes a goal.

#### 6. Get Goals for a Member

**GET** `/goals/member/:memberId`

Returns all goals for a specific member.

#### 7. Get User's Assigned Goals

**GET** `/goals/user/my-goals`

Returns all goals assigned by the current user (trainer or gym owner).

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Authorization

- **GYM_OWNER**: Full access to all records
- **TRAINER**: Access only to records they created
- **MEMBER**: No direct access (must use member-specific endpoints through other services)

## Error Responses

### 401 Unauthorized

- Missing or invalid JWT token

### 403 Forbidden

- User doesn't have permission to perform the action
- Trainer trying to modify/delete another trainer's records

### 404 Not Found

- Record with specified ID not found
- Member with specified ID not found

### 400 Bad Request

- Invalid request body format
- Missing required fields

## Files Created

### New Entities:

- `src/entities/workout_logs.entity.ts` - Database entity for workout logs
- `src/entities/body_progress.entity.ts` - Database entity for body progress records
- `src/entities/goals.entity.ts` - Database entity for goals

### New DTOs:

- `src/workout-logs/dto/create-workout-log.dto.ts` - DTO for creating workout logs
- `src/workout-logs/dto/update-workout-log.dto.ts` - DTO for updating workout logs
- `src/body-progress/dto/create-body-progress.dto.ts` - DTO for creating body progress records
- `src/body-progress/dto/update-body-progress.dto.ts` - DTO for updating body progress records
- `src/goals/dto/create-goal.dto.ts` - DTO for creating goals
- `src/goals/dto/update-goal.dto.ts` - DTO for updating goals

### New Services:

- `src/workout-logs/workout-logs.service.ts` - Business logic for workout logs
- `src/body-progress/body-progress.service.ts` - Business logic for body progress records
- `src/goals/goals.service.ts` - Business logic for goals

### New Controllers:

- `src/workout-logs/workout-logs.controller.ts` - API endpoints for workout logs
- `src/body-progress/body-progress.controller.ts` - API endpoints for body progress records
- `src/goals/goals.controller.ts` - API endpoints for goals

### New Modules:

- `src/workout-logs/workout-logs.module.ts` - NestJS module for workout logs
- `src/body-progress/body-progress.module.ts` - NestJS module for body progress records
- `src/goals/goals.module.ts` - NestJS module for goals

### Modified Files:

- `src/app.module.ts` - Added all new modules to imports

## Key Features

- **Role-based Authorization**: Only GYM_OWNER and TRAINER roles can manage these entities
- **Permission Control**: Trainers can only modify their own records, gym owners have full access
- **Member Validation**: Ensures records are only created for existing members
- **Comprehensive Error Handling**: Proper HTTP status codes and error messages
- **Swagger Documentation**: Complete API documentation with request/response examples
- **Type Safety**: Full TypeScript support with proper type definitions
- **JSONB Fields**: Support for flexible data storage (measurements, progress_photos, milestones)

## Build Status

✅ Project builds successfully without errors
