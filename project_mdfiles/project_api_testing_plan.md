# API Testing Plan - Request-Response Tested Examples

## Fake Data Guidelines (Based on Seed Data Analysis)

All fake data is generated following patterns from `/src/database/seed_gym_Fitness_First_Elite.ts`

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@fitnessfirstelite.com | Admin123! |
| TRAINER | trainer.marcus.sterling@fitnessfirstelite.com | Trainer123! |
| MEMBER | sophia.johnson-smith0@email.com | Member123! |

---

## Seeded Data References

### Gym
- **Name:** Fitness First Elite
- **Email:** admin@fitnessfirstelite.com
- **Location:** Downtown, California

### Branches (4 total)
| Branch | Email | Location |
|--------|-------|----------|
| Downtown | downtown@fitnessfirstelite.com | Downtown |
| Beverly Hills | beverlyhills@fitnessfirstelite.com | Beverly Hills |
| Santa Monica | santamonica@fitnessfirstelite.com | Santa Monica |
| Pasadena | pasadena@fitnessfirstelite.com | Pasadena |

### Membership Plans (20 total)
Examples: Basic (30 days), Premium (90 days), Elite (180 days), VIP (365 days)

### Trainers (20 total)
| Name | Specialization |
|------|----------------|
| Marcus Sterling | Strength Training, Powerlifting |
| Sophia Valentine | Yoga, Pilates |
| Alexander Blackwood | HIIT, CrossFit |
| Isabella Montgomery | Cardio, Endurance |
| David Harrington | Nutrition, Weight Management |

### Members (100 total)
- Names: Sophia Johnson-Smith, Liam Williams-Brown, Emma Davis-Jones, etc.
- Emails: sophia.johnson-smith0@email.com, liam.williams-brown1@email.com, etc.
- Phones: +1-555-8000 to +1-555-8099

---

## Phase 1: Authentication & User Management

### 1.1 POST /auth/login
**Fake Request Data:**
```json
{
  "email": "admin@fitnessfirstelite.com",
  "password": "Admin123!"
}
```

**Expected Response (200 OK):**
```json
{
  "userid": "uuid-string",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@fitnessfirstelite.com",
  "role": "ADMIN"
}
```

### 1.2 POST /users/change-password
**Fake Request Data:**
```json
{
  "currentPassword": "Admin123!",
  "newPassword": "NewSecurePass456!"
}
```

---

## Phase 2: Member Management

### 2.1 POST /members
**Fake Request Data:**
```json
{
  "fullName": "Test Member Alpha",
  "email": "test.member.alpha@email.com",
  "phone": "+1-555-9001",
  "gender": "male",
  "dateOfBirth": "1990-05-15",
  "addressLine1": "100 Test Avenue",
  "city": "Los Angeles",
  "state": "California",
  "postalCode": "90001",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactPhone": "+1-555-9999",
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4",
  "membershipPlanId": 1,
  "isActive": true,
  "is_managed_by_member": true
}
```

### 2.2 GET /members?page=1&limit=10
**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "fullName": "Sophia Johnson-Smith",
      "email": "sophia.johnson-smith0@email.com",
      "phone": "+1-555-8000",
      "gender": "female",
      "isActive": true,
      "branch": {
        "branchId": "uuid",
        "name": "Fitness First Elite - Downtown"
      },
      "createdAt": "2026-01-29T10:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 2.3 PATCH /members/admin/1
**Fake Request Data:**
```json
{
  "phone": "+1-555-9999",
  "isActive": true
}
```

---

## Phase 3: Trainer Management

### 3.1 POST /trainers
**Fake Request Data:**
```json
{
  "fullName": "Trainer Test Alpha",
  "email": "trainer.test.alpha@fitnessfirstelite.com",
  "phone": "+1-555-5001",
  "specialization": "Strength Training, HIIT",
  "certification": "NASM-CPT",
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4"
}
```

### 3.2 GET /trainers
**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "fullName": "Trainer Marcus Sterling",
      "email": "trainer.marcus.sterling@fitnessfirstelite.com",
      "phone": "+1-555-2001",
      "specialization": "Strength Training, Powerlifting",
      "branch": {
        "branchId": "uuid",
        "name": "Fitness First Elite - Downtown"
      },
      "createdAt": "2026-01-29T10:30:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

---

## Phase 4: Gym & Branch Management

### 4.1 POST /gyms
**Fake Request Data:**
```json
{
  "name": "Test Gym Alpha",
  "email": "admin@testgym.com",
  "phone": "+1-555-TEST",
  "address": "999 Test Boulevard, Test City, TC 99999",
  "location": "Test District",
  "state": "California",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

### 4.2 POST /gyms/{gymId}/branches
**Fake Request Data:**
```json
{
  "name": "Test Branch Alpha",
  "email": "testbranch@testgym.com",
  "phone": "+1-555-0001",
  "address": "100 Test Street",
  "location": "Test Area",
  "state": "California",
  "mainBranch": true
}
```

---

## Phase 5: Classes & Attendance

### 5.1 POST /classes
**Fake Request Data:**
```json
{
  "name": "Test HIIT Class",
  "description": "High intensity interval training for testing",
  "category": "hiit",
  "trainerId": 1,
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4",
  "maxCapacity": 20,
  "duration": 60,
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5],
  "timing": "morning",
  "startTime": "08:00",
  "endTime": "09:00",
  "isActive": true
}
```

### 5.2 POST /attendance
**Fake Request Data:**
```json
{
  "memberId": 1,
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4",
  "checkInTime": "2026-01-29T08:00:00.000Z"
}
```

**Expected Response:**
```json
{
  "id": "uuid",
  "attendanceType": "member",
  "checkInTime": "2026-01-29T08:00:00.000Z",
  "checkOutTime": null,
  "date": "2026-01-29",
  "member": {
    "id": 1,
    "fullName": "Sophia Johnson-Smith"
  },
  "branch": {
    "branchId": "uuid",
    "name": "Fitness First Elite - Downtown"
  }
}
```

---

## Phase 6: Subscriptions & Payments

### 6.1 POST /membership-plans
**Fake Request Data:**
```json
{
  "name": "Test Premium Plan",
  "description": "Premium membership for testing",
  "price": 14999,
  "durationInDays": 90,
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4",
  "isActive": true
}
```

### 6.2 POST /subscriptions
**Fake Request Data:**
```json
{
  "memberId": 1,
  "membershipPlanId": 1,
  "startDate": "2026-01-29",
  "selectedClassIds": [1, 2, 3]
}
```

### 6.3 POST /invoices
**Fake Request Data:**
```json
{
  "memberId": 1,
  "total_amount": 14999,
  "status": "pending",
  "dueDate": "2026-02-28",
  "items": [
    {
      "description": "Premium Membership - 90 days",
      "quantity": 1,
      "unitPrice": 14999
    }
  ]
}
```

### 6.4 POST /payments
**Fake Request Data:**
```json
{
  "invoiceId": "uuid-string",
  "amount": 14999,
  "method": "cash",
  "notes": "Test payment"
}
```

---

## Phase 7: Workout Templates & Assignments

### 7.1 POST /workout-templates
**Fake Request Data:**
```json
{
  "title": "Test Strength Template",
  "description": "A comprehensive strength training program for testing",
  "visibility": "PRIVATE",
  "chart_type": "STRENGTH",
  "difficulty_level": "INTERMEDIATE",
  "plan_type": "strength",
  "duration_days": 30,
  "notes": "Focus on compound movements",
  "tags": ["strength", "muscle", "testing"],
  "exercises": [
    {
      "exercise_name": "Bench Press",
      "description": "Standard barbell bench press",
      "exercise_type": "sets_reps",
      "equipment_required": "BARBELL",
      "sets": 4,
      "reps": 10,
      "weight_kg": 60,
      "day_of_week": 1,
      "order_index": 1,
      "instructions": "Keep back arched, lower to chest",
      "alternatives": "Push-ups, Dumbbell Press",
      "member_can_skip": false
    },
    {
      "exercise_name": "Squats",
      "description": "Back squats for lower body",
      "exercise_type": "sets_reps",
      "equipment_required": "BARBELL",
      "sets": 5,
      "reps": 5,
      "weight_kg": 80,
      "day_of_week": 1,
      "order_index": 2,
      "instructions": "Keep knees out, descend until thighs parallel",
      "alternatives": "Leg Press, Goblet Squats",
      "member_can_skip": false
    }
  ]
}
```

### 7.2 POST /workout-templates/{id}/assign
**Fake Request Data:**
```json
{
  "memberId": 1,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

### 7.3 POST /workout-templates/{id}/substitute
**Fake Request Data:**
```json
{
  "original_exercise": "Bench Press",
  "substituted_exercise": "Push-ups",
  "reason": "Equipment unavailable"
}
```

---

## Phase 8: Chart Assignments

### 8.1 POST /chart-assignments
**Fake Request Data:**
```json
{
  "chart_id": "uuid-string",
  "memberId": 1,
  "trainerId": 1,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28",
  "status": "ACTIVE"
}
```

### 8.2 POST /chart-assignments/{id}/exercise-completion
**Fake Request Data:**
```json
{
  "exercise_name": "Bench Press",
  "sets_completed": 4,
  "reps_completed": 10,
  "weight_used": 60,
  "notes": "Felt strong today"
}
```

---

## Phase 9: Diet Templates & Assignments

### 9.1 POST /diet-templates
**Fake Request Data:**
```json
{
  "title": "Test Weight Loss Diet",
  "description": "Calorie-controlled diet for testing weight loss",
  "goal_type": "weight_loss",
  "target_calories": 1800,
  "protein_g": 150,
  "carbs_g": 200,
  "fat_g": 60,
  "tags": ["weight_loss", "testing"],
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_name": "Oatmeal with Berries",
      "description": "Rolled oats with mixed berries and protein powder",
      "ingredients": "Oats, blueberries, strawberries, whey protein",
      "preparation": "Cook oats, top with berries and protein shake",
      "calories": 350,
      "protein_g": 25,
      "carbs_g": 45,
      "fat_g": 10,
      "day_of_week": 1,
      "order_index": 1,
      "member_can_skip": false
    },
    {
      "meal_type": "lunch",
      "meal_name": "Grilled Chicken Salad",
      "description": "Mixed greens with grilled chicken breast",
      "ingredients": "Chicken breast, mixed greens, tomatoes, cucumber, olive oil",
      "preparation": "Grill chicken, assemble salad with veggies",
      "calories": 450,
      "protein_g": 40,
      "carbs_g": 20,
      "fat_g": 20,
      "day_of_week": 1,
      "order_index": 2,
      "member_can_skip": false
    }
  ]
}
```

### 9.2 POST /diet-templates/{id}/assign
**Fake Request Data:**
```json
{
  "memberId": 1,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

---

## Phase 10: Goal Schedules & Templates

### 10.1 POST /goal-schedules
**Fake Request Data:**
```json
{
  "memberId": 1,
  "trainerId": 1,
  "title": "Test Monthly Fitness Goals",
  "description": "Testing goal schedule creation",
  "schedule_type": "monthly",
  "startDate": "2026-01-29",
  "endDate": "2026-02-28",
  "target_goals": [
    {
      "goal_type": "weight_loss",
      "target_value": 5,
      "unit": "kg",
      "description": "Lose 5kg this month",
      "priority": "high"
    },
    {
      "goal_type": "workout_sessions",
      "target_value": 20,
      "unit": "sessions",
      "description": "Complete 20 workout sessions",
      "priority": "medium"
    },
    {
      "goal_type": "body_fat",
      "target_value": 3,
      "unit": "percentage",
      "description": "Reduce body fat by 3%",
      "priority": "high"
    }
  ]
}
```

### 10.2 POST /goal-templates
**Fake Request Data:**
```json
{
  "title": "Test Goal Template",
  "description": "A reusable goal template for testing",
  "defaultScheduleType": "monthly",
  "defaultGoals": [
    {
      "goal_type": "workout_sessions",
      "target_value": 20,
      "unit": "sessions",
      "description": "Complete 20 workout sessions",
      "priority": "medium"
    },
    {
      "goal_type": "weight_loss",
      "target_value": 4,
      "unit": "kg",
      "description": "Lose 4kg",
      "priority": "high"
    }
  ],
  "tags": ["weight_loss", "monthly"]
}
```

### 10.3 PATCH /goal-schedules/{id}/period
**Fake Request Data:**
```json
{
  "period_number": 1,
  "completed_goals": [
    {
      "goal_id": "goal_1",
      "achieved_value": 2.5,
      "completion_date": "2026-02-15"
    }
  ],
  "member_notes": "Making good progress on weight loss",
  "trainer_notes": "Member showing great commitment",
  "status": "in_progress"
}
```

---

## Phase 11: Notifications

### Expected Response from GET /notifications
```json
[
  {
    "notification_id": "uuid-string",
    "type": "CHART_ASSIGNED",
    "title": "Workout Chart Assigned",
    "message": "A new workout chart has been assigned to you.",
    "is_read": false,
    "created_at": "2026-01-29T10:30:00.000Z"
  },
  {
    "notification_id": "uuid-string",
    "type": "DIET_ASSIGNED",
    "title": "Diet Plan Assigned",
    "message": "A new diet plan has been assigned to you.",
    "is_read": true,
    "created_at": "2026-01-28T14:00:00.000Z"
  }
]
```

---

## Phase 12: Analytics

### Expected Response from GET /analytics/gym/{gymId}/dashboard
```json
{
  "totalMembers": 100,
  "activeMembers": 85,
  "totalTrainers": 20,
  "totalRevenue": 1500000,
  "revenueThisMonth": 125000,
  "attendanceRate": 0.75,
  "newMembersThisMonth": 15,
  "churnRate": 0.05,
  "topClasses": [
    {
      "name": "Elite Morning Yoga",
      "enrollments": 25
    }
  ]
}
```

---

## Phase 13: Inquiries

### 13.1 POST /inquiries (Public)
**Fake Request Data:**
```json
{
  "fullName": "Test Inquiry User",
  "email": "test.inquiry@email.com",
  "phone": "+1-555-INQUIRE",
  "source": "website",
  "preferredContactMethod": "email",
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4",
  "notes": "Interested in premium membership",
  "preferredMembershipType": "premium"
}
```

### 13.2 POST /inquiries/{id}/convert
**Fake Request Data:**
```json
{
  "membershipPlanId": 2,
  "branchId": "39e6866d-3393-4608-93ca-fa98e4eac5a4"
}
```

---

## Phase 14: Goals (Legacy)

### 14.1 POST /goals
**Fake Request Data:**
```json
{
  "memberId": 1,
  "goal_type": "weight_loss",
  "target_value": 5,
  "unit": "kg",
  "description": "Lose 5kg",
  "start_date": "2026-01-29",
  "end_date": "2026-03-29",
  "priority": "high",
  "status": "active"
}
```

---

## Documentation Format Template

```markdown
## [Endpoint Name]

**Endpoint:** `METHOD /api/endpoint-path`

**Auth Required:** Role(s)

### Request
```bash
curl -X METHOD "http://localhost:3000/endpoint-path" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "value1",
    "field2": "value2"
  }'
```

### Request Body
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Response (200 OK)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2026-01-29T10:30:00.000Z"
}
```

### Validation
| Check | Status | Notes |
|-------|--------|-------|
| Status 200 | ✓ | Expected |
| Required fields | ✓ | All present |
| Data types | ✓ | Correct |

### Notes
- Any additional observations
```

---

## File Output Location
`/project_mdfiles/request_response_tested_examples.md`

---

## Verification Checklist
- [ ] Server running on localhost:3000
- [ ] Database seeded with Fitness First Elite data
- [ ] All endpoints return correct status codes
- [ ] Response fields match expected schema
- [ ] Dates in ISO 8601 format
- [ ] Role-based access control working
- [ ] Authentication tokens valid

---

## Created By
Claude Code with Serena Plugin
Date: 2026-01-29
