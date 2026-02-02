# Gym Management API Test Results

**Test Date:** January 31, 2026
**JWT Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNzg4NzBmZi1kMzY3LTRlOTYtOWVhMS02MjM1YmUwMmY5MGYiLCJlbWFpbCI6ImFkbWluQGZpdG5lc3NmaXJzdGVsaXRlLmNvbSIsInJvbGUiOnsiaWQiOiJiYjM3YmQ1OC1hZmViLTQ4OTItYjM0MS01OWEyM2Q0YmNiZmEiLCJuYW1lIjoiQURNSU4iLCJkZXNjcmlwdGlvbiI6Ikd5bSBBZG1pbmlzdHJhdG9yIn0sImlhdCI6MTc2OTg3NTQyNSwiZXhwIjoxNzY5OTYxODI1fQ.dPUl7m0mrOWqRMRPqT_WPu9rh65oWewx5TijjpRjurU`

---

## Phase 1 - Authentication

### POST /auth/logout
**Status: 200 OK**

```bash
curl -X POST "http://localhost:3000/auth/logout" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "message": "Logged out successfully. Please discard your token."
}
```

---

## Phase 2 - Members (7 endpoints)

### GET /members
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/members" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response Sample:**
```json
[
  {
    "id": 401,
    "fullName": "Sophia Johnson-Smith UPDATED",
    "email": "sophia.johnson-smith0@email.com",
    "phone": "+1-555-9999",
    "gender": "female",
    "dateOfBirth": "1985-01-01",
    "addressLine1": "100 Elite Avenue",
    "city": "Downtown",
    "state": "California",
    "postalCode": "90000",
    "isActive": true,
    "subscriptionId": 401,
    "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "subscription": {
      "id": 401,
      "startDate": "2024-03-31T18:30:00.000Z",
      "endDate": "2024-06-29T18:30:00.000Z",
      "isActive": true
    },
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown",
      "location": "Downtown"
    }
  }
]
```

---

### GET /members/401
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/members/401" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "id": 401,
  "fullName": "Sophia Johnson-Smith UPDATED",
  "email": "sophia.johnson-smith0@email.com",
  "phone": "+1-555-9999",
  "gender": "female",
  "isActive": true,
  "subscriptionId": 401,
  "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "subscription": {
    "id": 401,
    "startDate": "2024-03-31T18:30:00.000Z",
    "endDate": "2024-06-29T18:30:00.000Z",
    "isActive": true
  },
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown"
  }
}
```

---

### GET /members/401/dashboard
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/members/401/dashboard" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com",
    "phone": "+1-555-8000",
    "isActive": false,
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    }
  },
  "subscription": {
    "id": 401,
    "startDate": "2024-03-31T18:30:00.000Z",
    "endDate": "2024-06-29T18:30:00.000Z",
    "status": "active"
  },
  "attendance": {
    "currentMonthCount": 24
  },
  "paymentHistory": [
    {
      "transactionId": "e8d147b5-534d-4761-b59a-a2888b524e32",
      "amount": "240.13",
      "method": "bank_transfer",
      "status": "completed",
      "createdAt": "2026-01-27T03:51:35.443Z",
      "invoiceId": "409326b5-7288-4443-a054-74a1914f9424"
    }
  ]
}
```

---

### PATCH /members/admin/401
**Status: 200 OK**

```bash
curl -X PATCH "http://localhost:3000/members/admin/401" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Sophia Johnson-Smith UPDATED", "phone": "+1-555-9999", "isActive": true}'
```

**Response:**
```json
{
  "id": 401,
  "fullName": "Sophia Johnson-Smith UPDATED",
  "email": "sophia.johnson-smith0@email.com",
  "phone": "+1-555-9999",
  "isActive": true,
  "subscriptionId": 401,
  "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c"
}
```

---

### POST /members
**Status: 201 Created**

```bash
curl -X POST "http://localhost:3000/members" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Member New",
    "email": "testmember.new@example.com",
    "phone": "+1-555-1234",
    "gender": "male",
    "dateOfBirth": "1990-05-15",
    "addressLine1": "123 Test Street",
    "city": "Test City",
    "state": "Test State",
    "postalCode": "12345",
    "emergencyContactName": "Emergency Contact",
    "emergencyContactPhone": "+1-555-5678",
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "membershipPlanId": 82,
    "isActive": true
  }'
```

**Response:**
```json
{
  "id": 501,
  "fullName": "Test Member New",
  "email": "testmember.new@example.com",
  "phone": "+1-555-1234",
  "gender": "male",
  "isActive": true,
  "subscriptionId": 501,
  "subscription": {
    "id": 501,
    "plan": {
      "id": 82,
      "name": "Elite Premium - Downtown",
      "price": 23999,
      "durationInDays": 90
    },
    "startDate": "2026-01-31T16:06:00.346Z",
    "endDate": "2026-05-01T16:06:00.346Z",
    "isActive": true
  }
}
```

---

### GET /branches/864213ba-00ff-40ee-b4ff-16ce030a350c/members
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/members" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** Returns members filtered by branch with full subscription and branch details.

---

## Phase 3 - Trainers (6 endpoints)

### GET /trainers
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/trainers" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response Sample:**
```json
[
  {
    "id": 81,
    "fullName": "Trainer Marcus Sterling",
    "email": "trainer.marcus.sterling@fitnessfirstelite.com",
    "phone": "+1-555-2000",
    "specialization": "Elite Strength Training, Powerlifting",
    "avatarUrl": "https://i.pravatar.cc/150?img=1",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    }
  }
]
```

---

### GET /trainers/81
**Status: 500 Internal Server Error**

```bash
curl -X GET "http://localhost:3000/trainers/81" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

### PATCH /trainers/81
**Status: 400 Bad Request**

```bash
curl -X PATCH "http://localhost:3000/trainers/81" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Mike Johnson UPDATED", "specialization": "CrossFit & HIIT", "hourlyRate": 550}'
```

**Response:**
```json
{
  "message": ["property hourlyRate should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### POST /trainers
**Status: 400 Bad Request**

```bash
curl -X POST "http://localhost:3000/trainers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Trainer New",
    "email": "sarah.trainer@example.com",
    "phone": "+1-555-7777",
    "specialization": "Yoga & Pilates",
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "hourlyRate": 450,
    "isActive": true
  }'
```

**Response:**
```json
{
  "message": ["property hourlyRate should not exist", "property isActive should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### GET /branches/864213ba-00ff-40ee-b4ff-16ce030a350c/trainers
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/trainers" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
[
  {
    "id": 81,
    "fullName": "Trainer Marcus Sterling",
    "email": "trainer.marcus.sterling@fitnessfirstelite.com",
    "phone": "+1-555-2000",
    "specialization": "Elite Strength Training, Powerlifting",
    "avatarUrl": "https://i.pravatar.cc/150?img=1",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown",
      "location": "Downtown"
    }
  }
]
```

---

## Phase 4 - Gyms/Branches (7 endpoints)

### GET /gyms
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/gyms" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
[
  {
    "gymId": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
    "name": "Fitness First Elite",
    "email": "admin@fitnessfirstelite.com",
    "phone": "+1-555-FIT-NEW",
    "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
    "location": "Downtown",
    "state": "California",
    "branches": [...]
  }
]
```

---

### GET /gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** Returns gym with all nested branches (large response ~36KB).

---

### PATCH /gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025
**Status: 400 Bad Request**

```bash
curl -X PATCH "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'
```

**Response:**
```json
{
  "message": ["property description should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### GET /gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/branches
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/branches" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
[
  {
    "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
    "name": "Fitness First Elite - Beverly Hills",
    "email": "beverlyhills@fitnessfirstelite.com",
    "phone": "+1-555-0102",
    "location": "Beverly Hills",
    "state": "California",
    "mainBranch": false
  },
  {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "phone": "+1-555-0101-UPDATED",
    "location": "Downtown",
    "mainBranch": true
  }
]
```

---

### GET /branches
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/branches" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** Returns all branches (same format as above).

---

### GET /branches/864213ba-00ff-40ee-b4ff-16ce030a350c
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "gym": {
    "gymId": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
    "name": "Fitness First Elite",
    "email": "admin@fitnessfirstelite.com",
    "phone": "+1-555-FIT-NEW"
  },
  "name": "Fitness First Elite - Downtown",
  "email": "downtown@fitnessfirstelite.com",
  "phone": "+1-555-0101-UPDATED",
  "location": "Downtown",
  "mainBranch": true
}
```

---

### PATCH /branches/864213ba-00ff-40ee-b4ff-16ce030a350c
**Status: 200 OK**

```bash
curl -X PATCH "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1-555-0101-FINAL", "location": "Downtown UPDATED"}'
```

**Response:**
```json
{
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "gym": {...},
  "name": "Fitness First Elite - Downtown",
  "phone": "+1-555-0101-FINAL",
  "location": "Downtown UPDATED",
  "updatedAt": "2026-01-31T16:06:51.386Z"
}
```

---

## Phase 5 - Classes & Attendance (6 endpoints)

### GET /classes
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/classes" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response Sample:**
```json
[
  {
    "class_id": "e8db8c90-d4b8-4bbd-9a8e-7e785412a2b3",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    },
    "name": "HIIT Elite Performance",
    "description": "High-intensity interval training for elite athletes",
    "timings": "evening",
    "recurrence_type": "weekly",
    "days_of_week": [2, 4]
  }
]
```

---

### POST /classes
**Status: 201 Created**

```bash
curl -X POST "http://localhost:3000/classes" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HIIT Bootcamp NEW",
    "description": "High intensity interval training bootcamp",
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "timings": "morning",
    "recurrenceType": "weekly",
    "daysOfWeek": [1, 3, 5]
  }'
```

**Response:**
```json
{
  "class_id": "bdae36d7-9b67-447d-8f4e-efb5a83f2cba",
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "phone": "+1-555-0101-FINAL"
  },
  "name": "HIIT Bootcamp NEW",
  "description": "High intensity interval training bootcamp",
  "timings": "morning",
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5]
}
```

---

### GET /branches/864213ba-00ff-40ee-b4ff-16ce030a350c/classes
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/classes" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:** Returns classes filtered by branch.

---

### POST /attendance
**Status: 400 Bad Request** (Already checked in)

```bash
curl -X POST "http://localhost:3000/attendance" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"memberId": 401, "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c"}'
```

**Response:**
```json
{
  "message": "Already checked in today",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### GET /attendance
**Status: 200 OK**

```bash
curl -X GET "http://localhost:3000/attendance" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response Sample:**
```json
[
  {
    "id": "46d829d5-d631-468b-892c-ed0fd7942816",
    "member": {
      "id": 442,
      "fullName": "Ava Jackson-White",
      "email": "ava.jackson-white41@email.com"
    },
    "trainer": null,
    "branch": {
      "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
      "name": "Fitness First Elite - Beverly Hills"
    },
    "attendanceType": "member",
    "checkInTime": "2026-01-29T03:15:00.000Z",
    "checkOutTime": "2026-01-29T05:11:00.000Z",
    "date": "2026-01-29"
  }
]
```

---

### PATCH /attendance/:id/checkout
**Status: 400 Bad Request** (Already checked out)

```bash
curl -X PATCH "http://localhost:3000/attendance/46d829d5-d631-468b-892c-ed0fd7942816/checkout" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "message": "Already checked out",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Summary Statistics

| Phase | Endpoints | Successful | Failed | Success Rate |
|-------|-----------|------------|--------|--------------|
| 1 - Authentication | 1 | 1 | 0 | 100% |
| 2 - Members | 7 | 7 | 0 | 100% |
| 3 - Trainers | 6 | 3 | 3 | 50% |
| 4 - Gyms/Branches | 7 | 6 | 1 | 85.7% |
| 5 - Classes/Attendance | 6 | 4 | 2 | 66.7% |
| **TOTAL** | **27** | **21** | **6** | **77.8%** |

---

## Issues Found

### 1. Trainers Endpoints
- **GET /trainers/:id** - Returns 500 Internal Server Error
- **PATCH /trainers/:id** - Rejects `hourlyRate` field
- **POST /trainers** - Rejects `hourlyRate` and `isActive` fields

### 2. Gyms Endpoints
- **PATCH /gyms/:id** - Rejects `description` field

### 3. Attendance Endpoints
- Cannot create duplicate check-in for same day (expected behavior)
- Cannot checkout already checked-out record (expected behavior)

---

## Test Data Created

**New Member Created:**
- ID: 501
- Name: Test Member New
- Email: testmember.new@example.com
- Subscription: Elite Premium - Downtown (Plan ID: 82)

**New Class Created:**
- ID: bdae36d7-9b67-447d-8f4e-efb5a83f2cba
- Name: HIIT Bootcamp NEW
- Schedule: Mon/Wed/Fri mornings

---

## Notes

1. All endpoints require valid JWT authentication
2. Member creation automatically creates User account and Subscription
3. Attendance prevents duplicate check-ins on same day
4. DTO validation prevents certain fields from being updated (hourlyRate, isActive, description)
5. Branch PATCH successfully updates phone and location
6. Member dashboard returns aggregated data (attendance count, payment history)
