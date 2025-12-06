# Diet Plans API Documentation

This document describes the API endpoints for managing diet plans for members in the gym management system.

## Overview

Diet plans can be created by:

- **GYM_OWNER**: Can create, view, update, and delete any diet plan
- **TRAINER**: Can create, view, update, and delete only their assigned diet plans

## Endpoints

### 1. Create a Diet Plan

**POST** `/diet-plans`

Creates a new diet plan for a member.

**Request Body:**

```json
{
  "memberId": 1,
  "calories": 2500,
  "protein": 150,
  "carbs": 300,
  "fat": 70,
  "meals": [
    {
      "mealType": "Breakfast",
      "items": ["Oatmeal", "Eggs", "Banana"],
      "calories": 600
    }
  ]
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
  "assigned_by": {
    "userId": "uuid",
    "email": "trainer@example.com"
  },
  "calories": 2500,
  "protein": 150,
  "carbs": 300,
  "fat": 70,
  "meals": [...],
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

### 2. Get All Diet Plans

**GET** `/diet-plans`

Returns all diet plans in the system.

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "member": { ... },
    "assigned_by": { ... },
    "calories": 2500,
    "protein": 150,
    "carbs": 300,
    "fat": 70,
    "meals": [...],
    "created_at": "2025-06-12T10:30:00.000Z",
    "updated_at": "2025-06-12T10:30:00.000Z"
  }
]
```

### 3. Get Diet Plan by ID

**GET** `/diet-plans/:id`

Returns a specific diet plan by its ID.

**Response (200 OK):**

```json
{
  "id": 1,
  "member": { ... },
  "assigned_by": { ... },
  "calories": 2500,
  "protein": 150,
  "carbs": 300,
  "fat": 70,
  "meals": [...],
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T10:30:00.000Z"
}
```

### 4. Update Diet Plan

**PATCH** `/diet-plans/:id`

Updates an existing diet plan.

**Request Body:**

```json
{
  "calories": 2600,
  "protein": 160,
  "meals": [...]
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "member": { ... },
  "assigned_by": { ... },
  "calories": 2600,
  "protein": 160,
  "carbs": 300,
  "fat": 70,
  "meals": [...],
  "created_at": "2025-06-12T10:30:00.000Z",
  "updated_at": "2025-06-12T11:00:00.000Z"
}
```

### 5. Delete Diet Plan

**DELETE** `/diet-plans/:id`

Deletes a diet plan.

**Response (200 OK):**

```json
{
  "message": "Diet plan deleted successfully"
}
```

### 6. Get Diet Plans for a Member

**GET** `/diet-plans/member/:memberId`

Returns all diet plans for a specific member.

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "member": { ... },
    "assigned_by": { ... },
    "calories": 2500,
    "protein": 150,
    "carbs": 300,
    "fat": 70,
    "meals": [...],
    "created_at": "2025-06-12T10:30:00.000Z",
    "updated_at": "2025-06-12T10:30:00.000Z"
  }
]
```

### 7. Get User's Assigned Diet Plans

**GET** `/diet-plans/user/my-diet-plans`

Returns all diet plans assigned by the current user (trainer or gym owner).

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "member": { ... },
    "assigned_by": { ... },
    "calories": 2500,
    "protein": 150,
    "carbs": 300,
    "fat": 70,
    "meals": [...],
    "created_at": "2025-06-12T10:30:00.000Z",
    "updated_at": "2025-06-12T10:30:00.000Z"
  }
]
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Authorization

- **GYM_OWNER**: Full access to all diet plans
- **TRAINER**: Access only to diet plans they created
- **MEMBER**: No direct access (must use member-specific endpoints through other services)

## Error Responses

### 401 Unauthorized

- Missing or invalid JWT token

### 403 Forbidden

- User doesn't have permission to perform the action
- Trainer trying to modify/delete another trainer's diet plan

### 404 Not Found

- Diet plan with specified ID not found
- Member with specified ID not found

### 400 Bad Request

- Invalid request body format
- Missing required fields

## Files Created/Modified

### New Files:

- `src/entities/diets.entity.ts` - Database entity for diet plans
- `src/diet-plans/dto/create-diet.dto.ts` - DTO for creating diet plans
- `src/diet-plans/dto/update-diet.dto.ts` - DTO for updating diet plans
- `src/diet-plans/diet-plans.service.ts` - Business logic for diet plans
- `src/diet-plans/diet-plans.controller.ts` - API endpoints for diet plans
- `src/diet-plans/diet-plans.module.ts` - NestJS module for diet plans
- `src/auth/decorators/current-user.decorator.ts` - Decorator for getting current user

### Modified Files:

- `src/app.module.ts` - Added DietPlansModule to imports

## Database Schema

The `diets` table includes:

- `id` (Primary Key)
- `member_id` (Foreign Key to members)
- `assigned_by` (Foreign Key to users - gym admin or trainer)
- `calories`, `protein`, `carbs`, `fat` (Nutritional values)
- `meals` (JSONB field for meal details)
- `created_at`, `updated_at` (Timestamps)
