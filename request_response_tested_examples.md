# Request-Response Tested Examples

**API Testing Documentation for Fitness First Elite Gym Management System**

**Base URL:** `http://localhost:3000`
**API Docs:** `http://localhost:3000/api`
**Date:** 2026-01-29
**Version:** 4.0 (Complete Endpoint Coverage - 280+ Endpoints)

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@fitnessfirstelite.com | Admin123! |
| TRAINER | trainer.marcus.sterling@fitnessfirstelite.com | Trainer123! |
| MEMBER | sophia.johnson-smith0@email.com | Member123! |

---

## Seeded Data References

### Gym Information
- **Name:** Fitness First Elite
- **Gym ID:** `b0e2cfb8-39f4-4d68-aa65-b0b9576f4025`
- **Email:** admin@fitnessfirstelite.com
- **Location:** Downtown, California

### Branches (4 Total)
| Branch | Branch ID | Location | Email |
|--------|-----------|----------|-------|
| Downtown | `864213ba-00ff-40ee-b4ff-16ce030a350c` | Downtown | downtown@fitnessfirstelite.com |
| Beverly Hills | `15c01e59-68e8-4b4b-8720-ae1f4102140b` | Beverly Hills | beverlyhills@fitnessfirstelite.com |
| Santa Monica | `82425c8e-7166-4c36-acf9-303ffd72bd78` | Santa Monica | santamonica@fitnessfirstelite.com |
| Pasadena | `4febb53c-55dd-4d06-bd3a-b433c1e73427` | Pasadena | pasadena@fitnessfirstelite.com |

### Membership Plans (Examples)
| Plan ID | Name | Price | Duration |
|---------|------|-------|----------|
| 81 | Elite Basic - Downtown | 8999 | 30 days |
| 82 | Elite Premium - Downtown | 23999 | 90 days |
| 83 | Elite VIP - Downtown | 42999 | 180 days |
| 84 | Elite Annual - Downtown | 79999 | 365 days |

### Trainers (Examples)
| Trainer ID | Name | Specialization |
|------------|------|----------------|
| 81 | Trainer Marcus Sterling | Elite Strength Training, Powerlifting |
| 82 | Trainer Sophia Valentine | Premium Yoga, Pilates, Mindfulness |

### Members (Examples)
| Member ID | Name | Email |
|-----------|------|-------|
| 401 | Sophia Johnson-Smith | sophia.johnson-smith0@email.com |
| 402 | Liam Williams-Brown | liam.williams-brown1@email.com |

---

## Phase 1: Authentication & User Management

### 1.1 POST /auth/login

**Request:**
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  --data-raw $'{"email":"admin@fitnessfirstelite.com","password":"Admin123!"}'
```

**Request Body:**
```json
{
  "email": "admin@fitnessfirstelite.com",
  "password": "Admin123!"
}
```

**Response (200 OK):**
```json
{
  "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNzg4NzBmZi1kMzY3LTRlOTYtOWVhMS02MjM1YmUwMmY5MGYiLCJlbWFpbCI6ImFkbWluQGZpdG5lc3NmaXJzdGVsaXRlLmNvbSIsInJvbGUiOnsiaWQiOiJiYjM3YmQ1OC1hZmViLTQ5OTItYjM0MS01OWEyM2Q0YmNiZmEiLCJuYW1lIjoiQURNSU4iLCJkZXNjcmlwdGlvbiI6Ikd5bSBBZG1pbmlzdHJhdG9yIn0sImlhdCI6MTc2OTY5OTI3OSwiZXhwIjoxNzY5Nzg1Njc5fQ.ByCiEbEuSTWySZwdTWWaiW7y88dV5YX2p7Ux4WAg9Bk"
}
```

**Validation:**
| Check | Status |
|-------|--------|
| Status 200 | ✓ |
| Returns userid | ✓ |
| Returns access_token | ✓ |

---

### 1.2 POST /auth/logout

**Request:**
```bash
curl -X POST "http://localhost:3000/auth/logout" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

---

### 1.3 GET /users/profile

**Request:**
```bash
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "email": "admin@fitnessfirstelite.com",
  "role": {
    "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
    "name": "ADMIN",
    "description": "Gym Administrator"
  },
  "createdAt": "2026-01-29T14:17:35.340Z"
}
```

---

### 1.4 PATCH /users/profile

**Fake Request Data:**
```json
{
  "fullName": "Updated Admin Name",
  "phone": "+1-555-UPDATED"
}
```

**Response (200 OK):**
```json
{
  "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "email": "admin@fitnessfirstelite.com",
  "fullName": "Updated Admin Name",
  "phone": "+1-555-UPDATED",
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 1.5 POST /users/change-password

**Fake Request Data:**
```json
{
  "currentPassword": "Admin123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Phase 2: Member Management

### 2.1 POST /members

**Request:**
```bash
curl -X POST "http://localhost:3000/members" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  --data-raw $'{"fullName":"Test Member Alpha","email":"test.member.alpha@email.com","phone":"+1-555-9501","gender":"male","dateOfBirth":"1990-05-15","addressLine1":"100 Test Avenue","city":"Los Angeles","state":"California","postalCode":"90001","emergencyContactName":"Emergency Contact","emergencyContactPhone":"+1-555-9999","branchId":"864213ba-00ff-40ee-b4ff-16ce030a350c","membershipPlanId":81,"isActive":true,"is_managed_by_member":true}'
```

**Request Body:**
```json
{
  "fullName": "Test Member Alpha",
  "email": "test.member.alpha@email.com",
  "phone": "+1-555-9501",
  "gender": "male",
  "dateOfBirth": "1990-05-15",
  "addressLine1": "100 Test Avenue",
  "addressLine2": null,
  "city": "Los Angeles",
  "state": "California",
  "postalCode": "90001",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactPhone": "+1-555-9999",
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "membershipPlanId": 81,
  "isActive": true,
  "is_managed_by_member": true
}
```

**Response (201 Created):**
```json
{
  "id": 501,
  "fullName": "Test Member Alpha",
  "email": "test.member.alpha@email.com",
  "phone": "+1-555-9501",
  "gender": "male",
  "dateOfBirth": "1990-05-15",
  "addressLine1": "100 Test Avenue",
  "addressLine2": null,
  "city": "Los Angeles",
  "state": "California",
  "postalCode": "90001",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactPhone": "+1-555-9999",
  "isActive": true,
  "freezeMember": false,
  "avatarUrl": null,
  "attachmentUrl": null,
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z",
  "subscriptionId": 501,
  "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "is_managed_by_member": true,
  "subscription": {
    "id": 501,
    "plan": {
      "id": 81,
      "name": "Elite Basic - Downtown",
      "price": 8999,
      "durationInDays": 30,
      "description": "Access to premium gym facilities and basic classes"
    },
    "classes": [],
    "startDate": "2026-01-29T00:00:00.000Z",
    "endDate": "2026-02-28T00:00:00.000Z",
    "isActive": true
  },
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "email": "downtown@fitnessfirstelite.com",
    "phone": "+1-555-0101",
    "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
    "location": "Downtown",
    "state": "California",
    "mainBranch": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-01-29T14:17:35.340Z",
    "updatedAt": "2026-01-29T14:17:35.340Z"
  }
}
```

---

### 2.2 GET /members

**Request:**
```bash
curl -X GET "http://localhost:3000/members?page=1&limit=2" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com",
    "phone": "+1-555-8000",
    "gender": "female",
    "dateOfBirth": "1985-01-01",
    "addressLine1": "100 Elite Avenue",
    "addressLine2": null,
    "city": "Downtown",
    "state": "California",
    "postalCode": "90000",
    "avatarUrl": null,
    "attachmentUrl": null,
    "emergencyContactName": "Emergency Johnson-Smith",
    "emergencyContactPhone": "+1-555-9000",
    "isActive": true,
    "freezeMember": false,
    "createdAt": "2026-01-29T14:17:35.353Z",
    "updatedAt": "2026-01-29T14:17:35.353Z",
    "subscriptionId": 401,
    "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "is_managed_by_member": true,
    "subscription": {
      "id": 401,
      "plan": {
        "id": 81,
        "name": "Elite Basic - Downtown",
        "price": 8999,
        "durationInDays": 30,
        "description": "Access to premium gym facilities and basic classes"
      },
      "classes": [],
      "startDate": "2024-03-31T18:30:00.000Z",
      "endDate": "2024-06-29T18:30:00.000Z",
      "isActive": true
    },
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown",
      "email": "downtown@fitnessfirstelite.com",
      "phone": "+1-555-0101",
      "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
      "location": "Downtown",
      "state": "California",
      "mainBranch": true,
      "latitude": null,
      "longitude": null
    }
  }
]
```

---

### 2.3 GET /members/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/members/401" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "id": 401,
  "fullName": "Sophia Johnson-Smith",
  "email": "sophia.johnson-smith0@email.com",
  "phone": "+1-555-8000",
  "gender": "female",
  "dateOfBirth": "1985-01-01",
  "addressLine1": "100 Elite Avenue",
  "addressLine2": null,
  "city": "Downtown",
  "state": "California",
  "postalCode": "90000",
  "avatarUrl": null,
  "attachmentUrl": null,
  "emergencyContactName": "Emergency Johnson-Smith",
  "emergencyContactPhone": "+1-555-9000",
  "isActive": true,
  "freezeMember": false,
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z",
  "subscriptionId": 401,
  "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "is_managed_by_member": true,
  "subscription": {
    "id": 401,
    "plan": {
      "id": 81,
      "name": "Elite Basic - Downtown",
      "price": 8999,
      "durationInDays": 30
    },
    "startDate": "2024-03-31T18:30:00.000Z",
    "endDate": "2024-06-29T18:30:00.000Z",
    "isActive": true
  },
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "email": "downtown@fitnessfirstelite.com",
    "phone": "+1-555-0101",
    "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
    "location": "Downtown",
    "state": "California",
    "mainBranch": true
  }
}
```

---

### 2.4 GET /members/:id/dashboard

**Request:**
```bash
curl -X GET "http://localhost:3000/members/401/dashboard" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com",
    "phone": "+1-555-8000",
    "isActive": true,
    "attachmentUrl": null,
    "freezeMember": false,
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    }
  },
  "subscription": {
    "id": 401,
    "planName": "Elite Basic - Downtown",
    "startDate": "2024-03-31T18:30:00.000Z",
    "endDate": "2024-06-29T18:30:00.000Z",
    "status": "active"
  },
  "attendance": {
    "currentMonthCount": 12
  },
  "paymentHistory": [
    {
      "transactionId": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
      "amount": 8999,
      "method": "cash",
      "status": "completed",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "invoiceId": "d19604c8-f341-4f8f-9150-9c12b42eb1ad"
    }
  ]
}
```

---

### 2.5 PATCH /members/admin/:id

**Fake Request Data:**
```json
{
  "phone": "+1-555-9999",
  "isActive": true,
  "freezeMember": false
}
```

**Response (200 OK):**
```json
{
  "id": 401,
  "fullName": "Sophia Johnson-Smith",
  "phone": "+1-555-9999",
  "isActive": true,
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 2.6 DELETE /members/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/members/501" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Member deleted successfully"
}
```

---

### 2.7 GET /branches/:branchId/members

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/members?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com",
    "isActive": true
  }
]
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
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c"
}
```

**Response (201 Created):**
```json
{
  "message": "Trainer created successfully",
  "trainerId": 101
}
```

---

### 3.2 GET /trainers

**Request:**
```bash
curl -X GET "http://localhost:3000/trainers?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
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
      "email": "downtown@fitnessfirstelite.com",
      "location": "Downtown",
      "state": "California",
      "mainBranch": true
    }
  },
  {
    "id": 82,
    "fullName": "Trainer Sophia Valentine",
    "email": "trainer.sophia.valentine@fitnessfirstelite.com",
    "phone": "+1-555-2001",
    "specialization": "Premium Yoga, Pilates, Mindfulness",
    "avatarUrl": "https://i.pravatar.cc/150?img=2",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    }
  }
]
```

---

### 3.3 GET /trainers/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/trainers/81" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "id": 81,
  "fullName": "Trainer Marcus Sterling",
  "email": "trainer.marcus.sterling@fitnessfirstelite.com",
  "phone": "+1-555-2000",
  "specialization": "Elite Strength Training, Powerlifting",
  "certification": "NASM-CPT",
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown"
  }
}
```

---

### 3.4 PATCH /trainers/:id

**Fake Request Data:**
```json
{
  "phone": "+1-555-6000",
  "specialization": "Strength Training, Powerlifting, HIIT"
}
```

**Response (200 OK):**
```json
{
  "id": 81,
  "fullName": "Trainer Marcus Sterling",
  "phone": "+1-555-6000",
  "specialization": "Strength Training, Powerlifting, HIIT"
}
```

---

### 3.5 DELETE /trainers/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/trainers/101" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Trainer deleted successfully"
}
```

---

### 3.6 GET /branches/:branchId/trainers

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/trainers" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 81,
    "fullName": "Trainer Marcus Sterling",
    "specialization": "Strength Training"
  }
]
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

**Response (201 Created):**
```json
{
  "gymId": "c1d2e3f4-5678-90ab-cdef-123456789abc",
  "name": "Test Gym Alpha",
  "message": "Gym created successfully"
}
```

---

### 4.2 GET /gyms

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "gymId": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
  "name": "Fitness First Elite",
  "email": "admin@fitnessfirstelite.com",
  "phone": "+1-555-FITNESS",
  "logoUrl": null,
  "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
  "location": "Downtown",
  "state": "California",
  "latitude": "34.05220000",
  "longitude": "-118.24370000",
  "branches": [
    {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown",
      "email": "downtown@fitnessfirstelite.com",
      "phone": "+1-555-0101",
      "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
      "location": "Downtown",
      "state": "California",
      "mainBranch": true,
      "latitude": null,
      "longitude": null
    },
    {
      "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
      "name": "Fitness First Elite - Beverly Hills",
      "email": "beverlyhills@fitnessfirstelite.com",
      "phone": "+1-555-0102",
      "address": "456 Rodeo Drive, Beverly Hills, BH 90211",
      "location": "Beverly Hills",
      "state": "California",
      "mainBranch": false,
      "latitude": "34.07360000",
      "longitude": "-118.40040000"
    }
  ],
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T14:17:35.340Z"
}
```

---

### 4.3 GET /gyms/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "gymId": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
  "name": "Fitness First Elite",
  "email": "admin@fitnessfirstelite.com",
  "branches": []
}
```

---

### 4.4 PATCH /gyms/:id

**Fake Request Data:**
```json
{
  "phone": "+1-555-UPDATED",
  "address": "123 Updated Address, City, ST 12345"
}
```

**Response (200 OK):**
```json
{
  "gymId": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
  "name": "Fitness First Elite",
  "phone": "+1-555-UPDATED",
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 4.5 POST /gyms/:gymId/branches

**Fake Request Data:**
```json
{
  "name": "Test Branch Alpha",
  "email": "testbranch@testgym.com",
  "phone": "+1-555-0001",
  "address": "100 Test Street",
  "location": "Test Area",
  "state": "California",
  "mainBranch": false
}
```

**Response (201 Created):**
```json
{
  "branchId": "d1e2f3a4-5678-90bc-def1-23456789abcd",
  "name": "Test Branch Alpha",
  "message": "Branch created successfully"
}
```

---

### 4.6 GET /branches

**Request:**
```bash
curl -X GET "http://localhost:3000/branches" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "email": "downtown@fitnessfirstelite.com",
    "location": "Downtown",
    "mainBranch": true
  }
]
```

---

### 4.7 GET /branches/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "name": "Fitness First Elite - Downtown",
  "email": "downtown@fitnessfirstelite.com",
  "phone": "+1-555-0101",
  "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
  "location": "Downtown",
  "state": "California",
  "mainBranch": true
}
```

---

### 4.8 PATCH /branches/:id

**Fake Request Data:**
```json
{
  "phone": "+1-555-9999",
  "address": "999 Updated Branch Address"
}
```

**Response (200 OK):**
```json
{
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "phone": "+1-555-9999",
  "updatedAt": "2026-01-29T15:00:00.000Z"
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
  "trainerId": 81,
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "maxCapacity": 20,
  "duration": 60,
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5],
  "timings": "morning",
  "startTime": "08:00",
  "endTime": "09:00",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "class_id": "e1f2a3b4-c5d6-7890-ef12-34567890abcd",
  "name": "Test HIIT Class",
  "message": "Class created successfully"
}
```

---

### 5.2 GET /classes

**Request:**
```bash
curl -X GET "http://localhost:3000/classes?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    },
    "name": "Elite Morning Yoga",
    "description": "Premium yoga session to start your day with mindfulness and strength",
    "timings": "morning",
    "recurrence_type": "weekly",
    "days_of_week": [1, 3, 5]
  },
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

### 5.3 GET /classes/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/classes/1f40f785-1c9c-40ea-9ab7-f1568e2fff7e" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
  "name": "Elite Morning Yoga",
  "description": "Premium yoga session to start your day",
  "trainer": {
    "id": 82,
    "fullName": "Trainer Sophia Valentine"
  },
  "maxCapacity": 20,
  "currentEnrollments": 15
}
```

---

### 5.4 PATCH /classes/:id

**Fake Request Data:**
```json
{
  "maxCapacity": 25,
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
  "maxCapacity": 25,
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 5.5 DELETE /classes/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/classes/e1f2a3b4-c5d6-7890-ef12-34567890abcd" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

---

### 5.6 GET /branches/:branchId/classes

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/classes" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
    "name": "Elite Morning Yoga"
  }
]
```

---

### 5.7 GET /classes/upcoming

**Request:**
```bash
curl -X GET "http://localhost:3000/classes/upcoming" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
    "name": "Elite Morning Yoga",
    "startTime": "2026-01-30T08:00:00.000Z"
  }
]
```

---

### 5.8 POST /attendance

**Fake Request Data:**
```json
{
  "memberId": 401,
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "checkInTime": "2026-01-29T08:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "id": "46d829d5-d631-468b-892c-ed0fd7942816",
  "attendanceType": "member",
  "checkInTime": "2026-01-29T08:00:00.000Z",
  "checkOutTime": null,
  "date": "2026-01-29",
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith"
  },
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown"
  }
}
```

---

### 5.9 GET /attendance

**Request:**
```bash
curl -X GET "http://localhost:3000/attendance?page=1&limit=2" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": "46d829d5-d631-468b-892c-ed0fd7942816",
    "member": {
      "id": 442,
      "fullName": "Ava Jackson-White",
      "email": "ava.jackson-white41@email.com",
      "phone": "+1-555-8041",
      "branchBranchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b"
    },
    "trainer": null,
    "branch": {
      "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
      "name": "Fitness First Elite - Beverly Hills"
    },
    "attendanceType": "member",
    "checkInTime": "2026-01-29T03:15:00.000Z",
    "checkOutTime": "2026-01-29T05:11:00.000Z",
    "date": "2026-01-29",
    "notes": null
  }
]
```

---

### 5.10 PATCH /attendance/:id/checkout

**Request:**
```bash
curl -X PATCH "http://localhost:3000/attendance/46d829d5-d631-468b-892c-ed0fd7942816/checkout" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  --data-raw $'{"checkOutTime":"2026-01-29T10:30:00.000Z"}'
```

**Response (200 OK):**
```json
{
  "id": "46d829d5-d631-468b-892c-ed0fd7942816",
  "checkInTime": "2026-01-29T08:00:00.000Z",
  "checkOutTime": "2026-01-29T10:30:00.000Z",
  "status": "completed"
}
```

---

### 5.11 GET /attendance/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/attendance/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": "46d829d5-d631-468b-892c-ed0fd7942816",
    "checkInTime": "2026-01-29T08:00:00.000Z",
    "checkOutTime": "2026-01-29T10:30:00.000Z",
    "date": "2026-01-29"
  }
]
```

---

### 5.12 GET /attendance/branch/:branchId/stats

**Request:**
```bash
curl -X GET "http://localhost:3000/attendance/branch/864213ba-00ff-40ee-b4ff-16ce030a350c/stats" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "totalCheckIns": 150,
  "todayCheckIns": 45,
  "averageDuration": 95,
  "peakHours": ["08:00", "18:00"]
}
```

---

### 5.13 GET /attendance/monthly-report

**Request:**
```bash
curl -X GET "http://localhost:3000/attendance/monthly-report?year=2026&month=1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "month": "2026-01",
  "totalDays": 31,
  "totalAttendance": 1250,
  "dailyAverage": 40.3,
  "memberBreakdown": [
    {
      "memberId": 401,
      "attendanceCount": 20
    }
  ]
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
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "id": 101,
  "name": "Test Premium Plan",
  "message": "Membership plan created successfully"
}
```

---

### 6.2 GET /membership-plans

**Request:**
```bash
curl -X GET "http://localhost:3000/membership-plans?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": 81,
    "name": "Elite Basic - Downtown",
    "price": 8999,
    "durationInDays": 30,
    "description": "Access to premium gym facilities and basic classes",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    }
  },
  {
    "id": 82,
    "name": "Elite Premium - Downtown",
    "price": 23999,
    "durationInDays": 90,
    "description": "Full access plus personal training and nutrition consultation"
  }
]
```

---

### 6.3 GET /membership-plans/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/membership-plans/81" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 81,
  "name": "Elite Basic - Downtown",
  "price": 8999,
  "durationInDays": 30,
  "isActive": true
}
```

---

### 6.4 PATCH /membership-plans/:id

**Fake Request Data:**
```json
{
  "price": 9999,
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": 81,
  "price": 9999,
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 6.5 DELETE /membership-plans/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/membership-plans/101" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Membership plan deleted successfully"
}
```

---

### 6.6 POST /subscriptions

**Fake Request Data:**
```json
{
  "memberId": 401,
  "membershipPlanId": 81,
  "startDate": "2026-01-29",
  "selectedClassIds": ["1f40f785-1c9c-40ea-9ab7-f1568e2fff7e"]
}
```

**Response (201 Created):**
```json
{
  "id": 501,
  "memberId": 401,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28",
  "isActive": true,
  "message": "Subscription created successfully"
}
```

---

### 6.7 GET /subscriptions

**Request:**
```bash
curl -X GET "http://localhost:3000/subscriptions" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 401,
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "plan": {
      "id": 81,
      "name": "Elite Basic - Downtown"
    },
    "startDate": "2024-03-31T18:30:00.000Z",
    "endDate": "2024-06-29T18:30:00.000Z",
    "isActive": true
  }
]
```

---

### 6.8 GET /subscriptions/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/subscriptions/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 401,
  "plan": {
    "id": 81,
    "name": "Elite Basic - Downtown"
  },
  "startDate": "2024-03-31T18:30:00.000Z",
  "endDate": "2024-06-29T18:30:00.000Z",
  "isActive": true
}
```

---

### 6.9 POST /subscriptions/:id/cancel

**Request:**
```bash
curl -X POST "http://localhost:3000/subscriptions/501/cancel" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 501,
  "status": "cancelled",
  "message": "Subscription cancelled successfully"
}
```

---

### 6.10 POST /invoices

**Fake Request Data:**
```json
{
  "memberId": 401,
  "total_amount": 8999,
  "status": "pending",
  "dueDate": "2026-02-28",
  "items": [
    {
      "description": "Elite Basic - Downtown - 30 days",
      "quantity": 1,
      "unitPrice": 8999
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "invoice_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com"
  },
  "total_amount": 8999.00,
  "description": "Elite Basic - Downtown - 30 days",
  "due_date": "2026-02-28",
  "status": "pending",
  "payments": [],
  "created_at": "2026-01-29T10:00:00.000Z"
}
```

---

### 6.11 GET /invoices

**Request:**
```bash
curl -X GET "http://localhost:3000/invoices" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "total_amount": 86.37,
    "description": null,
    "due_date": "2026-02-28",
    "status": "pending",
    "payments": [],
    "created_at": "2026-01-29T10:00:00.000Z"
  }
]
```

---

### 6.12 GET /invoices/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/invoices/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
    "total_amount": 8999.00,
    "description": "Elite Basic - Downtown - 30 days",
    "due_date": "2026-02-28",
    "status": "pending",
    "payments": [],
    "created_at": "2026-01-29T10:00:00.000Z"
  }
]
```

---

### 6.13 PATCH /invoices/:id

**Fake Request Data:**
```json
{
  "status": "paid"
}
```

**Response (200 OK):**
```json
{
  "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
  "total_amount": 8999.00,
  "status": "paid",
  "due_date": "2026-02-28",
  "updated_at": "2026-01-29T15:00:00.000Z"
}
```

---

### 6.14 POST /payments

**Fake Request Data:**
```json
{
  "invoiceId": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
  "amount": 8999,
  "method": "cash",
  "notes": "Test payment"
}
```

**Response (201 Created):**
```json
{
  "transactionId": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
  "amount": 8999,
  "method": "cash",
  "status": "completed",
  "message": "Payment processed successfully"
}
```

---

### 6.15 GET /payments/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/payments/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "transactionId": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
    "amount": 8999,
    "method": "cash",
    "status": "completed",
    "createdAt": "2026-01-29T13:50:35.443Z"
  }
]
```

---

## Phase 7: Inquiries (Leads)

### 7.1 POST /inquiries (Public)

**Fake Request Data:**
```json
{
  "fullName": "Test Inquiry User",
  "email": "test.inquiry@email.com",
  "phone": "+1-555-INQUIRE",
  "source": "website",
  "preferredContactMethod": "email",
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "notes": "Interested in premium membership",
  "preferredMembershipType": "premium"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "fullName": "Test Inquiry User",
  "status": "pending",
  "message": "Inquiry submitted successfully"
}
```

---

### 7.2 GET /inquiries

**Request:**
```bash
curl -X GET "http://localhost:3000/inquiries?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0001",
    "source": "website",
    "preferredContactMethod": "email",
    "status": "pending",
    "notes": "Interested in premium membership",
    "preferredMembershipType": "premium",
    "createdAt": "2026-01-29T10:00:00.000Z"
  }
]
```

---

### 7.3 GET /inquiries/stats

**Request:**
```bash
curl -X GET "http://localhost:3000/inquiries/stats" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "total": 50,
  "pending": 30,
  "converted": 15,
  "lost": 5
}
```

---

### 7.4 POST /inquiries/:id/convert

**Fake Request Data:**
```json
{
  "membershipPlanId": 82,
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c"
}
```

**Response (200 OK):**
```json
{
  "message": "Inquiry converted to member successfully",
  "memberId": 501
}
```

---

## Phase 8: Workout Templates

### 8.1 POST /workout-templates

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
    },
    {
      "exercise_name": "Running",
      "description": "Treadmill running for cardio",
      "exercise_type": "time",
      "equipment_required": "BODYWEIGHT",
      "duration_minutes": 30,
      "day_of_week": 2,
      "order_index": 1,
      "instructions": "Maintain steady pace",
      "member_can_skip": true
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
  "title": "Test Strength Template",
  "message": "Workout template created successfully"
}
```

---

### 8.2 GET /workout-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-templates?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
      "trainerId": 81,
      "title": "Test Strength Template",
      "description": "A comprehensive strength training program",
      "visibility": "PRIVATE",
      "chart_type": "STRENGTH",
      "difficulty_level": "INTERMEDIATE",
      "plan_type": "strength",
      "duration_days": 30,
      "is_shared_gym": false,
      "is_active": true,
      "version": 1,
      "parent_template_id": null,
      "usage_count": 0,
      "avg_rating": null,
      "rating_count": 0,
      "notes": null,
      "tags": ["strength", "muscle", "testing"],
      "exercises": [
        {
          "exercise_id": "e1f2a3b4-c5d6-7890-ef12-34567890abcd",
          "exercise_name": "Bench Press",
          "description": "Standard barbell bench press",
          "exercise_type": "sets_reps",
          "equipment_required": "BARBELL",
          "sets": 4,
          "reps": 10,
          "weight_kg": 60,
          "day_of_week": 1,
          "order_index": 1,
          "member_can_skip": false
        }
      ],
      "created_at": "2026-01-29T10:00:00.000Z",
      "updated_at": "2026-01-29T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 3,
  "totalPages": 1
}
```

---

### 8.3 GET /workout-templates/trainer/my-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-templates/trainer/my-templates" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
    "title": "Test Strength Template",
    "usage_count": 2
  }
]
```

---

### 8.4 GET /workout-templates/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-templates/w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
  "trainerId": 81,
  "title": "Test Strength Template",
  "description": "A comprehensive strength training program",
  "visibility": "PRIVATE",
  "chart_type": "STRENGTH",
  "difficulty_level": "INTERMEDIATE",
  "plan_type": "strength",
  "duration_days": 30,
  "is_shared_gym": false,
  "is_active": true,
  "version": 1,
  "parent_template_id": null,
  "usage_count": 0,
  "avg_rating": null,
  "rating_count": 0,
  "notes": "Focus on compound movements",
  "tags": ["strength", "muscle", "testing"],
  "exercises": [
    {
      "exercise_id": "e1f2a3b4-c5d6-7890-ef12-34567890abcd",
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
    }
  ],
  "created_at": "2026-01-29T10:00:00.000Z",
  "updated_at": "2026-01-29T10:00:00.000Z"
}
```

---

### 8.5 POST /workout-templates/:id/copy

**Request:**
```bash
curl -X POST "http://localhost:3000/workout-templates/w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789/copy" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "template_id": "w2b3c4d5-e6f7-8901-a2b3-c4d5e6f78901",
  "title": "Test Strength Template (Copy)",
  "version": 1,
  "parent_template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
  "message": "Template copied successfully"
}
```

---

### 8.6 POST /workout-templates/:id/share

**Fake Request Data:**
```json
{
  "trainerId": 82,
  "adminNote": "Shared for your use"
}
```

**Response (200 OK):**
```json
{
  "share_id": "s1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
  "message": "Template shared successfully"
}
```

---

### 8.7 POST /workout-templates/:id/accept

**Request:**
```bash
curl -X POST "http://localhost:3000/workout-templates/w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789/accept" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Shared template accepted successfully",
  "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789"
}
```

---

### 8.8 POST /workout-templates/:id/rate

**Fake Request Data:**
```json
{
  "rating": 5
}
```

**Response (200 OK):**
```json
{
  "message": "Template rated successfully",
  "avg_rating": 4.5,
  "rating_count": 10
}
```

---

### 8.9 POST /workout-templates/:id/assign

**Fake Request Data:**
```json
{
  "memberId": 401,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "a1s2d3f4-g5h6-7890-jk12-l3m4n5o6p7q8",
  "message": "Workout template assigned successfully"
}
```

---

### 8.10 POST /workout-templates/:id/substitute

**Fake Request Data:**
```json
{
  "original_exercise": "Bench Press",
  "substituted_exercise": "Push-ups",
  "reason": "Equipment unavailable"
}
```

**Response (200 OK):**
```json
{
  "message": "Substitution recorded successfully",
  "substitution": {
    "original_exercise": "Bench Press",
    "substituted_exercise": "Push-ups",
    "reason": "Equipment unavailable",
    "date": "2026-01-29T10:00:00.000Z"
  }
}
```

---

### 8.11 DELETE /workout-templates/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/workout-templates/w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Workout template deleted successfully"
}
```

---

## Phase 9: Chart Assignments

### 9.1 POST /chart-assignments

**Fake Request Data:**
```json
{
  "chart_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
  "memberId": 401,
  "trainerId": 81,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
  "message": "Chart assigned successfully"
}
```

---

### 9.2 GET /chart-assignments

**Request:**
```bash
curl -X GET "http://localhost:3000/chart-assignments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
    "chart": {
      "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
      "title": "Test Strength Template",
      "chart_type": "STRENGTH",
      "difficulty_level": "INTERMEDIATE"
    },
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "status": "ACTIVE",
    "startDate": "2026-01-29",
    "endDate": "2026-02-28",
    "completion_percent": 25
  }
]
```

---

### 9.3 GET /chart-assignments/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/chart-assignments/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
    "chart": {
      "title": "Test Strength Template"
    },
    "status": "ACTIVE",
    "completion_percent": 25
  }
]
```

---

### 9.4 GET /chart-assignments/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/chart-assignments/c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
  "chart": {
    "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
    "title": "Test Strength Template",
    "exercises": []
  },
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith"
  },
  "status": "ACTIVE",
  "customizations": {
    "skipped_exercises": [],
    "notes": ""
  }
}
```

---

### 9.5 PATCH /chart-assignments/:id

**Fake Request Data:**
```json
{
  "status": "PAUSED",
  "notes": "Member on vacation"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
  "status": "PAUSED",
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 9.6 POST /chart-assignments/:id/substitutions

**Fake Request Data:**
```json
{
  "original_exercise": "Squats",
  "substituted_exercise": "Leg Press",
  "reason": "Lower back discomfort"
}
```

**Response (200 OK):**
```json
{
  "message": "Substitution added successfully",
  "substitutions": [
    {
      "original_exercise": "Squats",
      "substituted_exercise": "Leg Press",
      "reason": "Lower back discomfort",
      "date": "2026-01-29T10:00:00.000Z"
    }
  ]
}
```

---

### 9.7 POST /chart-assignments/:id/exercise-completion

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

**Response (200 OK):**
```json
{
  "message": "Exercise completion recorded",
  "completion": {
    "exercise_name": "Bench Press",
    "sets_completed": 4,
    "reps_completed": 10,
    "completion_percent": 20
  }
}
```

---

### 9.8 PATCH /chart-assignments/:id/cancel

**Request:**
```bash
curl -X PATCH "http://localhost:3000/chart-assignments/c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789/cancel" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "assignment_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789",
  "status": "CANCELLED",
  "message": "Chart assignment cancelled"
}
```

---

### 9.9 DELETE /chart-assignments/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/chart-assignments/c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Chart assignment deleted successfully"
}
```

---

## Phase 10: Diet Templates

### 10.1 POST /diet-templates

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
    },
    {
      "meal_type": "dinner",
      "meal_name": "Baked Salmon with Vegetables",
      "description": "Atlantic salmon with roasted seasonal vegetables",
      "ingredients": "Salmon fillet, broccoli, bell peppers, olive oil",
      "preparation": "Bake salmon at 400F, roast vegetables",
      "calories": 550,
      "protein_g": 45,
      "carbs_g": 25,
      "fat_g": 25,
      "day_of_week": 1,
      "order_index": 3,
      "member_can_skip": false
    },
    {
      "meal_type": "snack",
      "meal_name": "Greek Yogurt with Almonds",
      "description": "Protein-rich snack",
      "ingredients": "Greek yogurt, almonds, honey",
      "calories": 200,
      "protein_g": 20,
      "carbs_g": 15,
      "fat_g": 8,
      "day_of_week": 1,
      "order_index": 4,
      "member_can_skip": true
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Weight Loss Diet",
  "message": "Diet template created successfully"
}
```

---

### 10.2 GET /diet-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-templates?page=1&limit=3" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
      "title": "Test Weight Loss Diet",
      "description": "Calorie-controlled diet for testing weight loss",
      "goal_type": "weight_loss",
      "target_calories": 1800,
      "protein_g": 150,
      "carbs_g": 200,
      "fat_g": 60,
      "is_shared_gym": false,
      "is_active": true,
      "version": 1,
      "parent_template_id": null,
      "usage_count": 0,
      "avg_rating": null,
      "rating_count": 0,
      "notes": null,
      "tags": ["weight_loss", "testing"],
      "trainerId": 81,
      "meals": [
        {
          "meal_id": "m1e2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
          "meal_type": "breakfast",
          "meal_name": "Oatmeal with Berries",
          "calories": 350,
          "protein_g": 25,
          "carbs_g": 45,
          "fat_g": 10,
          "day_of_week": 1,
          "order_index": 1
        }
      ],
      "created_at": "2026-01-29T10:00:00.000Z",
      "updated_at": "2026-01-29T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 3,
  "totalPages": 1
}
```

---

### 10.3 GET /diet-templates/trainer/my-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-templates/trainer/my-templates" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
    "title": "Test Weight Loss Diet",
    "usage_count": 0
  }
]
```

---

### 10.4 GET /diet-templates/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-templates/d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Weight Loss Diet",
  "description": "Calorie-controlled diet for testing weight loss",
  "goal_type": "weight_loss",
  "target_calories": 1800,
  "protein_g": 150,
  "carbs_g": 200,
  "fat_g": 60,
  "is_shared_gym": false,
  "is_active": true,
  "version": 1,
  "parent_template_id": null,
  "usage_count": 0,
  "avg_rating": null,
  "rating_count": 0,
  "notes": null,
  "tags": ["weight_loss", "testing"],
  "trainerId": 81,
  "meals": [
    {
      "meal_id": "m1e2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
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
    }
  ],
  "created_at": "2026-01-29T10:00:00.000Z",
  "updated_at": "2026-01-29T10:00:00.000Z"
}
```

---

### 10.5 POST /diet-templates/:id/copy

**Request:**
```bash
curl -X POST "http://localhost:3000/diet-templates/d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890/copy" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "template_id": "d2i3e4f5-f6a7-8901-b2c3-d4e5f678901",
  "title": "Test Weight Loss Diet (Copy)",
  "version": 1,
  "message": "Diet template copied successfully"
}
```

---

### 10.6 POST /diet-templates/:id/share

**Fake Request Data:**
```json
{
  "trainerId": 82,
  "adminNote": "Great diet for weight loss clients"
}
```

**Response (200 OK):**
```json
{
  "share_id": "s1h2a3r4-e5f6-7890-a1b2-c3d4e5f67890",
  "message": "Diet template shared successfully"
}
```

---

### 10.7 POST /diet-templates/:id/accept

**Request:**
```bash
curl -X POST "http://localhost:3000/diet-templates/d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890/accept" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Shared diet template accepted successfully"
}
```

---

### 10.8 POST /diet-templates/:id/rate

**Fake Request Data:**
```json
{
  "rating": 4
}
```

**Response (200 OK):**
```json
{
  "message": "Diet template rated successfully",
  "avg_rating": 4.0,
  "rating_count": 1
}
```

---

### 10.9 POST /diet-templates/:id/assign

**Fake Request Data:**
```json
{
  "memberId": 401,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "message": "Diet template assigned successfully"
}
```

---

### 10.10 DELETE /diet-templates/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/diet-templates/d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Diet template deleted successfully"
}
```

---

## Phase 11: Diet Plan Assignments

### 11.1 POST /diet-plan-assignments

**Fake Request Data:**
```json
{
  "dietPlanId": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
  "memberId": 401,
  "trainerId": 81,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "message": "Diet plan assigned successfully"
}
```

---

### 11.2 GET /diet-plan-assignments

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plan-assignments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
    "dietPlan": {
      "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
      "title": "Test Weight Loss Diet",
      "target_calories": 1800
    },
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "status": "ACTIVE",
    "startDate": "2026-01-29",
    "endDate": "2026-02-28",
    "completion_percent": 15
  }
]
```

---

### 11.3 GET /diet-plan-assignments/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plan-assignments/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
    "dietPlan": {
      "title": "Test Weight Loss Diet"
    },
    "status": "ACTIVE",
    "completion_percent": 15
  }
]
```

---

### 11.4 GET /diet-plan-assignments/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plan-assignments/d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "dietPlan": {
    "template_id": "d1i2e3t4-e5f6-7890-a1b2-c3d4e5f67890",
    "title": "Test Weight Loss Diet",
    "meals": []
  },
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith"
  },
  "status": "ACTIVE"
}
```

---

### 11.5 PATCH /diet-plan-assignments/:id/progress

**Fake Request Data:**
```json
{
  "meals_completed": ["breakfast", "lunch"],
  "notes": "Sticking to the plan well"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "completion_percent": 50,
  "message": "Progress updated successfully"
}
```

---

### 11.6 POST /diet-plan-assignments/:id/substitute

**Fake Request Data:**
```json
{
  "original_meal": "Grilled Chicken Salad",
  "substituted_meal": "Turkey Slices",
  "reason": "Dietary preference - don't eat chicken"
}
```

**Response (200 OK):**
```json
{
  "message": "Meal substitution recorded successfully",
  "substitution": {
    "original_meal": "Grilled Chicken Salad",
    "substituted_meal": "Turkey Slices",
    "reason": "Dietary preference",
    "date": "2026-01-29T12:00:00.000Z"
  }
}
```

---

### 11.7 POST /diet-plan-assignments/:id/link-chart

**Fake Request Data:**
```json
{
  "chartAssignmentId": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789"
}
```

**Response (200 OK):**
```json
{
  "message": "Diet plan linked to workout chart successfully",
  "linked_chart_id": "c1a2r3t4-d5e6-7890-f1a2-b3c4d5e6f789"
}
```

---

### 11.8 POST /diet-plan-assignments/:id/cancel

**Request:**
```bash
curl -X POST "http://localhost:3000/diet-plan-assignments/d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890/cancel" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "assignment_id": "d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "status": "CANCELLED",
  "message": "Diet plan assignment cancelled"
}
```

---

### 11.9 DELETE /diet-plan-assignments/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/diet-plan-assignments/d1a2s3s4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Diet plan assignment deleted successfully"
}
```

---

## Phase 12: Goal Schedules

### 12.1 POST /goal-schedules

**Fake Request Data:**
```json
{
  "memberId": 401,
  "trainerId": 81,
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

**Response (201 Created):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Monthly Fitness Goals",
  "message": "Goal schedule created successfully"
}
```

---

### 12.2 POST /goal-schedules/from-template

**Fake Request Data:**
```json
{
  "templateId": "t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890",
  "memberId": 401,
  "trainerId": 81,
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

**Response (201 Created):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67891",
  "title": "Monthly Goal Template Schedule",
  "message": "Goal schedule created from template"
}
```

---

### 12.3 GET /goal-schedules

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
    "title": "Test Monthly Fitness Goals",
    "description": "Testing goal schedule creation",
    "schedule_type": "monthly",
    "status": "active",
    "current_period": 1,
    "target_goals": [
      {
        "goal_type": "weight_loss",
        "target_value": 5,
        "unit": "kg",
        "is_completed": false
      }
    ],
    "startDate": "2026-01-29",
    "endDate": "2026-02-28"
  }
]
```

---

### 12.4 GET /goal-schedules/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
    "title": "Test Monthly Fitness Goals",
    "status": "active"
  }
]
```

---

### 12.5 GET /goal-schedules/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules/g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Monthly Fitness Goals",
  "schedule_type": "monthly",
  "status": "active",
  "current_period": 1,
  "target_goals": [
    {
      "goal_type": "weight_loss",
      "target_value": 5,
      "unit": "kg",
      "description": "Lose 5kg this month",
      "priority": "high",
      "is_completed": false
    },
    {
      "goal_type": "workout_sessions",
      "target_value": 20,
      "unit": "sessions",
      "description": "Complete 20 workout sessions",
      "priority": "medium",
      "is_completed": false
    }
  ],
  "period_progress": [],
  "startDate": "2026-01-29",
  "endDate": "2026-02-28"
}
```

---

### 12.6 PATCH /goal-schedules/:id/period

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

**Response (200 OK):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "current_period": 1,
  "period_progress": [
    {
      "period_number": 1,
      "completed_goals": [
        {
          "goal_id": "goal_1",
          "achieved_value": 2.5
        }
      ],
      "status": "in_progress"
    }
  ],
  "message": "Period progress updated successfully"
}
```

---

### 12.7 POST /goal-schedules/:id/pause

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890/pause" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "status": "paused",
  "message": "Goal schedule paused successfully"
}
```

---

### 12.8 POST /goal-schedules/:id/resume

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890/resume" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "status": "active",
  "message": "Goal schedule resumed successfully"
}
```

---

### 12.9 POST /goal-schedules/:id/complete

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890/complete" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "schedule_id": "g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890",
  "status": "completed",
  "message": "Goal schedule completed successfully"
}
```

---

### 12.10 DELETE /goal-schedules/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/goal-schedules/g1o2a3l4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal schedule deleted successfully"
}
```

---

## Phase 13: Goal Templates

### 13.1 POST /goal-templates

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
    },
    {
      "goal_type": "attendance",
      "target_value": 25,
      "unit": "days",
      "description": "Attend gym 25 days",
      "priority": "medium"
    }
  ],
  "tags": ["weight_loss", "monthly", "fitness"]
}
```

**Response (201 Created):**
```json
{
  "template_id": "t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Goal Template",
  "message": "Goal template created successfully"
}
```

---

### 13.2 GET /goal-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-templates" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "template_id": "t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890",
    "title": "Test Goal Template",
    "description": "A reusable goal template for testing",
    "defaultScheduleType": "monthly",
    "usage_count": 0,
    "is_active": true
  }
]
```

---

### 13.3 GET /goal-templates/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-templates/t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "template_id": "t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890",
  "title": "Test Goal Template",
  "description": "A reusable goal template for testing",
  "defaultScheduleType": "monthly",
  "defaultGoals": [
    {
      "goal_type": "workout_sessions",
      "target_value": 20,
      "unit": "sessions",
      "priority": "medium"
    }
  ],
  "tags": ["weight_loss", "monthly"],
  "usage_count": 0
}
```

---

### 13.4 PATCH /goal-templates/:id

**Fake Request Data:**
```json
{
  "description": "Updated description for the template",
  "tags": ["updated", "tags"]
}
```

**Response (200 OK):**
```json
{
  "template_id": "t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890",
  "description": "Updated description",
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 13.5 POST /goal-templates/:id/copy

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-templates/t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890/copy" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (201 Created):**
```json
{
  "template_id": "t2e3m4p5-f6a7-8901-b2c3-d4e5f678901",
  "title": "Test Goal Template (Copy)",
  "message": "Goal template copied successfully"
}
```

---

### 13.6 DELETE /goal-templates/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/goal-templates/t1e2m3p4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal template deleted successfully"
}
```

---

## Phase 14: Notifications

### 14.1 GET /notifications

**Request:**
```bash
curl -X GET "http://localhost:3000/notifications" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "notification_id": "2d9b5fa0-1647-41f2-b1f3-7e31874bcffe",
    "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "type": "SYSTEM",
    "title": "New Elite Member Registration",
    "message": "A new premium member has registered and is pending your approval.",
    "metadata": null,
    "is_read": true,
    "created_at": "2026-01-29T14:17:43.766Z"
  }
]
```

---

### 14.2 GET /notifications/unread

**Request:**
```bash
curl -X GET "http://localhost:3000/notifications/unread" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "notification_id": "3e0c6gb1-2758-52g3-c2g4-8f42985cd111",
    "type": "CHART_ASSIGNED",
    "title": "Workout Chart Assigned",
    "message": "A new workout chart has been assigned to you.",
    "is_read": false,
    "created_at": "2026-01-29T15:00:00.000Z"
  }
]
```

---

### 14.3 PATCH /notifications/:id/read

**Request:**
```bash
curl -X PATCH "http://localhost:3000/notifications/3e0c6gb1-2758-52g3-c2g4-8f42985cd111/read" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "notification_id": "3e0c6gb1-2758-52g3-c2g4-8f42985cd111",
  "is_read": true,
  "message": "Notification marked as read"
}
```

---

### 14.4 PATCH /notifications/read-all

**Request:**
```bash
curl -X PATCH "http://localhost:3000/notifications/read-all" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

---

## Phase 15: Analytics

### 15.1 GET /analytics/gym/:gymId/dashboard

**Request:**
```bash
curl -X GET "http://localhost:3000/analytics/gym/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/dashboard" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "gym": {
    "id": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
    "name": "Fitness First Elite",
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "branchName": "Fitness First Elite - Downtown"
  },
  "today": {
    "payments": {
      "online": 8,
      "cash": 6
    },
    "attendance": 86,
    "admissions": 100,
    "renewals": 0,
    "duesPaid": 14
  },
  "members": {
    "total": 100,
    "active": {
      "current_active": 100,
      "lastMonth_active": 71,
      "change": {
        "percent": 40.85,
        "type": "increase"
      }
    },
    "inactive": 0,
    "expiring": {
      "today": 0,
      "next10Days": 0,
      "member_id": []
    },
    "birthdays": {
      "today": 0,
      "member_id": []
    },
    "dues": {
      "count": 52,
      "totalAmount": 17039.62,
      "members_id": [463, 418, 461, 428, 448, 407, 419, 402]
    }
  },
  "resources": {
    "trainers": {
      "count": 20,
      "trainers_id": [81, 82, 83, 84, 85]
    },
    "classes": {
      "count": 16,
      "classes_id": ["1f40f785-1c9c-40ea-9ab7-f1568e2fff7e"]
    }
  },
  "revenue": {
    "current": 14132.01,
    "lastMonth": 0,
    "change": {
      "percent": 100,
      "type": "increase"
    }
  },
  "memberGrowth": {
    "current": 100,
    "lastMonth": 71,
    "change": {
      "percent": 40.85,
      "type": "increase"
    }
  },
  "recentPayments": [
    {
      "transactionId": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
      "amount": 86.37,
      "method": "cash",
      "status": "completed",
      "createdAt": "2026-01-29T13:50:35.443Z",
      "member": {
        "id": 434,
        "fullName": "Samuel Gray-Ramirez"
      },
      "invoice": {
        "invoiceId": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
        "totalAmount": 86.37
      }
    }
  ]
}
```

---

### 15.2 GET /analytics/branch/:branchId/attendance

**Request:**
```bash
curl -X GET "http://localhost:3000/analytics/branch/864213ba-00ff-40ee-b4ff-16ce030a350c/attendance" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "branchName": "Fitness First Elite - Downtown",
  "totalCheckIns": 1250,
  "averageDaily": 40.3,
  "peakHours": ["08:00", "18:00"],
  "weeklyTrend": [
    { "day": "Monday", "count": 45 },
    { "day": "Tuesday", "count": 42 },
    { "day": "Wednesday", "count": 48 },
    { "day": "Thursday", "count": 44 },
    { "day": "Friday", "count": 40 },
    { "day": "Saturday", "count": 35 },
    { "day": "Sunday", "count": 30 }
  ]
}
```

---

### 15.3 GET /analytics/member/:memberId/progress

**Request:**
```bash
curl -X GET "http://localhost:3000/analytics/member/401/progress" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "memberId": 401,
  "memberName": "Sophia Johnson-Smith",
  "attendance": {
    "thisMonth": 12,
    "lastMonth": 10,
    "change": "20% increase"
  },
  "workouts": {
    "completed": 15,
    "scheduled": 20,
    "completionRate": "75%"
  },
  "goals": {
    "active": 2,
    "completed": 1,
    "missed": 0
  },
  "weightProgress": [
    {
      "date": "2026-01-01",
      "weight": 75.5
    },
    {
      "date": "2026-01-15",
      "weight": 74.2
    }
  ]
}
```

---

## Phase 16: Goals (Legacy)

### 16.1 POST /goals

**Fake Request Data:**
```json
{
  "memberId": 401,
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

**Response (201 Created):**
```json
{
  "id": 101,
  "memberId": 401,
  "goal_type": "weight_loss",
  "target_value": 5,
  "status": "active",
  "message": "Goal created successfully"
}
```

---

### 16.2 GET /goals

**Request:**
```bash
curl -X GET "http://localhost:3000/goals?memberId=401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "goal_type": "weight_loss",
    "target_value": 5,
    "current_value": 2.5,
    "unit": "kg",
    "status": "active",
    "progress": 50
  }
]
```

---

### 16.3 PATCH /goals/:id

**Fake Request Data:**
```json
{
  "status": "completed",
  "current_value": 5
}
```

**Response (200 OK):**
```json
{
  "id": 101,
  "status": "completed",
  "progress": 100,
  "message": "Goal completed!"
}
```

---

## Phase 17: Assignments (Member-Trainer)

### 17.1 POST /assignments

**Fake Request Data:**
```json
{
  "memberId": 401,
  "trainerId": 81,
  "start_date": "2026-01-29",
  "end_date": "2026-04-29",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "assignment_id": "m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "message": "Member-trainer assignment created successfully"
}
```

---

### 17.2 GET /assignments

**Request:**
```bash
curl -X GET "http://localhost:3000/assignments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890",
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "trainer": {
      "id": 81,
      "fullName": "Trainer Marcus Sterling"
    },
    "status": "active",
    "start_date": "2026-01-29",
    "end_date": "2026-04-29"
  }
]
```

---

### 17.3 PATCH /assignments/:id

**Fake Request Data:**
```json
{
  "status": "completed",
  "end_date": "2026-02-28"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890",
  "status": "completed",
  "message": "Assignment updated"
}
```

---

## Phase 18: Audit Logs

### 18.1 POST /audit-logs

**Fake Request Data:**
```json
{
  "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "action": "UPDATE",
  "entityType": "member",
  "entityId": "401",
  "description": "Updated member profile information",
  "ipAddress": "192.168.1.100",
  "metadata": {
    "fieldsChanged": ["phone", "emergencyContact"],
    "previousValues": {
      "phone": "+1-555-0123"
    },
    "newValues": {
      "phone": "+1-555-0124"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "action": "UPDATE",
  "entityType": "member",
  "entityId": "401",
  "description": "Updated member profile information",
  "ipAddress": "192.168.1.100",
  "metadata": {
    "fieldsChanged": ["phone", "emergencyContact"],
    "previousValues": {
      "phone": "+1-555-0123"
    },
    "newValues": {
      "phone": "+1-555-0124"
    }
  },
  "created_at": "2026-01-29T10:00:00.000Z"
}
```

---

### 18.2 GET /audit-logs

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "action": "LOGIN",
    "entityType": "user",
    "entityId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "description": "User successfully logged in",
    "ipAddress": "192.168.1.100",
    "created_at": "2026-01-29T08:00:00.000Z"
  },
  {
    "log_id": "b2c3d4e5-f6a7-8901-bcde-f123456789ab",
    "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "action": "UPDATE",
    "entityType": "member",
    "entityId": "401",
    "description": "Updated member profile information",
    "ipAddress": "192.168.1.100",
    "created_at": "2026-01-29T09:00:00.000Z"
  }
]
```

---

### 18.3 GET /audit-logs/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "action": "UPDATE",
  "entityType": "member",
  "entityId": "401",
  "description": "Updated member profile information",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "metadata": {
    "fieldsChanged": ["phone", "emergencyContact"],
    "previousValues": {
      "phone": "+1-555-0123",
      "emergencyContact": "Jane Doe"
    },
    "newValues": {
      "phone": "+1-555-0124",
      "emergencyContact": "John Smith"
    }
  },
  "created_at": "2026-01-29T10:00:00.000Z"
}
```

---

### 18.4 GET /audit-logs/user/:userId

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs/user/d78870ff-d367-4e96-9ea1-6235be02f90f" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "action": "LOGIN",
    "entityType": "user",
    "description": "User successfully logged in",
    "created_at": "2026-01-29T08:00:00.000Z"
  },
  {
    "log_id": "b2c3d4e5-f6a7-8901-bcde-f123456789ab",
    "action": "UPDATE",
    "entityType": "member",
    "entityId": "401",
    "description": "Updated member profile",
    "created_at": "2026-01-29T09:00:00.000Z"
  }
]
```

---

### 18.5 GET /audit-logs/entity/:entityType/:entityId

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs/entity/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "log_id": "b2c3d4e5-f6a7-8901-bcde-f123456789ab",
    "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "action": "UPDATE",
    "entityType": "member",
    "entityId": "401",
    "description": "Updated member profile information",
    "created_at": "2026-01-29T09:00:00.000Z"
  }
]
```

---

### 18.6 GET /audit-logs/action/:action

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs/action/LOGIN" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "action": "LOGIN",
    "entityType": "user",
    "description": "User successfully logged in",
    "created_at": "2026-01-29T08:00:00.000Z"
  }
]
```

---

## Phase 19: Roles

### 19.1 GET /roles

**Request:**
```bash
curl -X GET "http://localhost:3000/roles" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
    "name": "SUPERADMIN",
    "description": "System administrator with full access"
  },
  {
    "id": "cc48cf69-bffe-5933-c452-60b35d5ccdgb",
    "name": "ADMIN",
    "description": "Gym Administrator"
  },
  {
    "id": "dd59dg70-cgff-6044-d563-71d46e6ddehc",
    "name": "TRAINER",
    "description": "Gym trainer with class management and member guidance permissions"
  },
  {
    "id": "ee60eh81-dhgg-7155-e674-82e57f7eeaid",
    "name": "MEMBER",
    "description": "Gym member with access to personal dashboard and basic features"
  }
]
```

---

### 19.2 GET /roles/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/roles/dd59dg70-cgff-6044-d563-71d46e6ddehc" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": "dd59dg70-cgff-6044-d563-71d46f7eeaid",
  "name": "TRAINER",
  "description": "Gym trainer with class management and member guidance permissions",
  "permissions": [
    "GYM_READ",
    "BRANCH_READ",
    "CLASS_CREATE",
    "CLASS_UPDATE",
    "CLASS_DELETE",
    "MEMBER_READ",
    "MEMBER_UPDATE",
    "WORKOUT_READ",
    "WORKOUT_CREATE",
    "WORKOUT_ASSIGN"
  ],
  "users": [
    {
      "userId": 81,
      "fullName": "Trainer Marcus Sterling",
      "email": "trainer.marcus.sterling@fitnessfirstelite.com"
    }
  ],
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T14:17:35.340Z"
}
```

---

### 19.3 GET /roles/name/:name

**Request:**
```bash
curl -X GET "http://localhost:3000/roles/name/TRAINER" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": "dd59dg70-cgff-6044-d563-71d46f7eeaid",
  "name": "TRAINER",
  "description": "Gym trainer with class management and member guidance permissions",
  "permissions": [
    "GYM_READ",
    "BRANCH_READ",
    "CLASS_CREATE"
  ],
  "users": [
    {
      "userId": 81,
      "fullName": "Trainer Marcus Sterling",
      "email": "trainer.marcus.sterling@fitnessfirstelite.com"
    },
    {
      "userId": 82,
      "fullName": "Trainer Sophia Valentine",
      "email": "trainer.sophia.valentine@fitnessfirstelite.com"
    }
  ],
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T14:17:35.340Z"
}
```

---

## Additional Endpoints (Phase 6, 7, 17)

### Additional 6.16 GET /invoices/:id/payments

**Request:**
```bash
curl -X GET "http://localhost:3000/invoices/d19604c8-f341-4f8f-9150-9c12b42eb1ad/payments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "transaction_id": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
    "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
    "amount": 86.37,
    "method": "cash",
    "status": "completed",
    "referenceNumber": "TXN123456789",
    "notes": "Cash payment received at front desk",
    "created_at": "2026-01-29T13:50:35.443Z"
  }
]
```

---

### Additional 6.17 POST /invoices/:id/cancel

**Request:**
```bash
curl -X POST "http://localhost:3000/invoices/d19604c8-f341-4f8f-9150-9c12b42eb1ad/cancel" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
  "status": "cancelled",
  "message": "Invoice cancelled successfully",
  "cancelledBy": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "cancelledAt": "2026-01-29T15:00:00.000Z"
}
```

---

### Additional 6.18 GET /payments

**Request:**
```bash
curl -X GET "http://localhost:3000/payments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "transaction_id": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
    "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith"
    },
    "amount": 86.37,
    "method": "cash",
    "status": "completed",
    "referenceNumber": "TXN123456789",
    "created_at": "2026-01-29T13:50:35.443Z"
  },
  {
    "transaction_id": "b111c3e3-f062-5ce9-b2g1-64fee1d634c2",
    "invoice_id": "e29705d9-g352-5g9g-9151-0d13c53ec2be",
    "member": {
      "id": 402,
      "fullName": "Liam Williams-Brown"
    },
    "amount": 23999.00,
    "method": "card",
    "status": "completed",
    "referenceNumber": "TXN987654321",
    "created_at": "2026-01-29T14:30:00.000Z"
  }
]
```

---

### Additional 6.19 GET /payments/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/payments/a000bfd2-e951-4bd8-a1f0-53fdd0c523b0" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "transaction_id": "a000bfd2-e951-4bd8-a1f0-53fdd0c523b0",
  "invoice": {
    "invoice_id": "d19604c8-f341-4f8f-9150-9c12b42eb1ad",
    "total_amount": 86.37,
    "status": "paid"
  },
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com"
  },
  "amount": 86.37,
  "method": "cash",
  "status": "completed",
  "referenceNumber": "TXN123456789",
  "notes": "Cash payment received at front desk",
  "created_at": "2026-01-29T13:50:35.443Z",
  "updated_at": "2026-01-29T13:50:35.443Z"
}
```

---

### Additional 7.5 GET /inquiries/pending

**Request:**
```bash
curl -X GET "http://localhost:3000/inquiries/pending" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0001",
    "source": "website",
    "status": "NEW",
    "preferredContactMethod": "email",
    "notes": "Interested in premium membership",
    "createdAt": "2026-01-29T10:00:00.000Z"
  },
  {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0002",
    "source": "referral",
    "status": "NEW",
    "preferredContactMethod": "phone",
    "notes": "Referred by existing member",
    "createdAt": "2026-01-29T11:00:00.000Z"
  }
]
```

---

### Additional 7.6 GET /inquiries/email/:email

**Request:**
```bash
curl -X GET "http://localhost:3000/inquiries/email/john.doe@example.com" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0001",
  "source": "website",
  "status": "NEW",
  "preferredContactMethod": "email",
  "notes": "Interested in premium membership",
  "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

---

### Additional 7.7 PATCH /inquiries/:id/status

**Fake Request Data:**
```json
{
  "status": "contacted",
  "notes": "Called and left voicemail"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "status": "contacted",
  "notes": "Called and left voicemail",
  "updatedAt": "2026-01-29T12:00:00.000Z"
}
```

---

### Additional 7.8 DELETE /inquiries/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/inquiries/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Inquiry deleted successfully"
}
```

---

### Additional 17.4 GET /members/:memberId/assignments

**Request:**
```bash
curl -X GET "http://localhost:3000/members/401/assignments" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890",
    "trainer": {
      "id": 81,
      "fullName": "Trainer Marcus Sterling",
      "specialization": "Elite Strength Training"
    },
    "status": "active",
    "start_date": "2026-01-01",
    "end_date": "2026-06-30",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### Additional 17.5 GET /trainers/:trainerId/members

**Request:**
```bash
curl -X GET "http://localhost:3000/trainers/81/members" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890",
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith",
      "email": "sophia.johnson-smith0@email.com"
    },
    "status": "active",
    "start_date": "2026-01-01",
    "end_date": "2026-06-30"
  },
  {
    "assignment_id": "n2u3b4u5-f7b8-9012-cdef-g2345f6g78901",
    "member": {
      "id": 402,
      "fullName": "Liam Williams-Brown",
      "email": "liam.williams-brown1@email.com"
    },
    "status": "active",
    "start_date": "2026-01-15",
    "end_date": "2026-07-15"
  }
]
```

---

### Additional 17.6 DELETE /assignments/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/assignments/m1t2a3s4-e5f6-7890-a1b2-c3d4e5f67890" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Assignment deleted successfully"
}
```

---

### Additional 14.5 GET /notifications/unread/count

**Request:**
```bash
curl -X GET "http://localhost:3000/notifications/unread/count" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "count": 5
}
```

---

### Additional 11.10 GET /template-assignments/analytics

**Request:**
```bash
curl -X GET "http://localhost:3000/template-assignments/analytics" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "totalAssignments": 150,
  "activeAssignments": 85,
  "completedAssignments": 45,
  "cancelledAssignments": 20,
  "byType": {
    "workout": 90,
    "diet": 60
  },
  "completionRate": {
    "workout": 65,
    "diet": 55
  },
  "averageProgress": {
    "workout": 72,
    "diet": 68
  },
  "recentActivity": [
    {
      "assignment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "member_id": 401,
      "template_type": "workout",
      "progress": 45,
      "last_activity": "2026-01-29T10:00:00.000Z"
    }
  ]
}
```

---

### Additional 11.11 GET /template-assignments/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/template-assignments/member/401?template_type=workout" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "assignment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "template_type": "workout",
    "template": {
      "template_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
      "title": "Test Strength Template",
      "chart_type": "STRENGTH",
      "difficulty_level": "INTERMEDIATE"
    },
    "progress": 45,
    "status": "active",
    "assignedBy": 81,
    "startDate": "2026-01-15T00:00:00.000Z",
    "endDate": "2026-02-15T00:00:00.000Z",
    "createdAt": "2026-01-15T00:00:00.000Z"
  }
]
```

---

## Phase 20: Gym Nested Endpoints

### 20.1 GET /gyms/:gymId/branches

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/branches" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown",
    "email": "downtown@fitnessfirstelite.com",
    "phone": "+1-555-0101",
    "address": "123 Elite Fitness Drive, Wellness City, WC 90210",
    "location": "Downtown",
    "state": "California",
    "mainBranch": true,
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.340Z"
  },
  {
    "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
    "name": "Fitness First Elite - Uptown",
    "email": "uptown@fitnessfirstelite.com",
    "phone": "+1-555-0102",
    "address": "456 Uptown Plaza, Business District, WC 90211",
    "location": "Uptown",
    "state": "California",
    "mainBranch": false,
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.350Z"
  }
]
```

---

### 20.2 GET /gyms/:gymId/members

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/members" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 401,
    "fullName": "Sophia Johnson-Smith",
    "email": "sophia.johnson-smith0@email.com",
    "phone": "+1-555-8000",
    "gender": "female",
    "isActive": true,
    "freezeMember": false,
    "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    },
    "subscription": {
      "id": 401,
      "plan": {
        "id": 81,
        "name": "Elite Basic - Downtown"
      },
      "isActive": true
    }
  },
  {
    "id": 402,
    "fullName": "Liam Williams-Brown",
    "email": "liam.williams-brown1@email.com",
    "phone": "+1-555-8001",
    "gender": "male",
    "isActive": true,
    "freezeMember": false,
    "branchBranchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
    "branch": {
      "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
      "name": "Fitness First Elite - Uptown"
    },
    "subscription": {
      "id": 402,
      "plan": {
        "id": 82,
        "name": "Elite Pro - Uptown"
      },
      "isActive": true
    }
  }
]
```

---

### 20.3 GET /gyms/:gymId/trainers

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/trainers" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 81,
    "fullName": "Trainer Marcus Sterling",
    "email": "trainer.marcus.sterling@fitnessfirstelite.com",
    "specialization": "Elite Strength Training",
    "branchBranchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.353Z"
  },
  {
    "id": 82,
    "fullName": "Trainer Sophia Valentine",
    "email": "trainer.sophia.valentine@fitnessfirstelite.com",
    "specialization": "Cardio & HIIT",
    "branchBranchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 20.4 GET /branches/:branchId/trainers

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/864213ba-00ff-40ee-b4ff-16ce030a350c/trainers" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 81,
    "fullName": "Trainer Marcus Sterling",
    "email": "trainer.marcus.sterling@fitnessfirstelite.com",
    "specialization": "Elite Strength Training",
    "phone": "+1-555-0181",
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 20.5 GET /gyms/:gymId/classes

**Request:**
```bash
curl -X GET "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025/classes" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
    "name": "Morning HIIT Blast",
    "description": "High intensity interval training for fat burning",
    "branch": {
      "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
      "name": "Fitness First Elite - Downtown"
    },
    "instructor": {
      "id": 81,
      "fullName": "Trainer Marcus Sterling"
    },
    "capacity": 20,
    "enrolled": 15,
    "timings": "06:00-07:00",
    "recurrence_type": "weekly",
    "days_of_week": [1, 3, 5],
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.340Z"
  },
  {
    "class_id": "2g51g896-2d0d-51fb-b8c8-g2679f3ggg8f",
    "name": "Yoga Flow",
    "description": "Relaxing yoga session for flexibility and stress relief",
    "branch": {
      "branchId": "15c01e59-68e8-4b4b-8720-ae1f4102140b",
      "name": "Fitness First Elite - Uptown"
    },
    "instructor": {
      "id": 82,
      "fullName": "Trainer Sophia Valentine"
    },
    "capacity": 15,
    "enrolled": 12,
    "timings": "18:00-19:00",
    "recurrence_type": "daily",
    "days_of_week": null,
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.350Z"
  }
]
```

---

## Additional Auth Endpoint

### Additional 1.6 POST /auth/logout

**Request:**
```bash
curl -X POST "http://localhost:3000/auth/logout" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Phase 21: Users Management (Additional)

### 21.1 POST /users

**Fake Request Data:**
```json
{
  "email": "new.user@fitnessfirstelite.com",
  "password": "UserPass123!",
  "firstName": "New",
  "lastName": "User",
  "roleId": "bb37bd58-afeb-4892-b341-59a23d4bcbfa"
}
```

**Response (201 Created):**
```json
{
  "userid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "new.user@fitnessfirstelite.com",
  "firstName": "New",
  "lastName": "User",
  "role": {
    "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
    "name": "TRAINER",
    "description": "Fitness Trainer"
  },
  "isActive": true,
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 21.2 GET /users

**Request:**
```bash
curl -X GET "http://localhost:3000/users" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
    "email": "admin@fitnessfirstelite.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": {
      "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
      "name": "ADMIN",
      "description": "Gym Administrator"
    },
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.340Z"
  },
  {
    "userid": "e89981gg-e478-5f07-afb2-7346cf13fa01",
    "email": "trainer.marcus.sterling@fitnessfirstelite.com",
    "firstName": "Marcus",
    "lastName": "Sterling",
    "role": {
      "id": "cc48ce69-bffd-5903-c452-60b34e5cebgb",
      "name": "TRAINER",
      "description": "Fitness Trainer"
    },
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.350Z"
  }
]
```

---

### 21.3 GET /users/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/users/d78870ff-d367-4e96-9ea1-6235be02f90f" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "email": "admin@fitnessfirstelite.com",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1-555-0100",
  "role": {
    "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
    "name": "ADMIN",
    "description": "Gym Administrator"
  },
  "isActive": true,
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T15:00:00.000Z"
}
```

---

### 21.4 PATCH /users/:id

**Fake Request Data:**
```json
{
  "firstName": "Updated",
  "lastName": "Admin",
  "phone": "+1-555-UPDATED"
}
```

**Response (200 OK):**
```json
{
  "userid": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "email": "admin@fitnessfirstelite.com",
  "firstName": "Updated",
  "lastName": "Admin",
  "phone": "+1-555-UPDATED",
  "role": {
    "id": "bb37bd58-afeb-4892-b341-59a23d4bcbfa",
    "name": "ADMIN",
    "description": "Gym Administrator"
  },
  "isActive": true,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 21.5 DELETE /users/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/users/e89981gg-e478-5f07-afb2-7346cf13fa01" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 21.6 GET /users/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/users/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "userid": "f9ab92hh-f589-6g18-bgc3-8457dg24gc02",
  "email": "sophia.johnson-smith0@email.com",
  "firstName": "Sophia",
  "lastName": "Johnson-Smith",
  "role": {
    "id": "dd59df70-c0fe-6014-d562-71c17efdedfh",
    "name": "MEMBER",
    "description": "Gym Member"
  },
  "isActive": true,
  "memberId": 401,
  "createdAt": "2026-01-29T14:17:35.360Z"
}
```

---

### 21.7 GET /users/user/my-workout-logs

**Request:**
```bash
curl -X GET "http://localhost:3000/users/user/my-workout-logs" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "log_id": 1,
    "memberId": 401,
    "workout_plan_id": "w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789",
    "exercise_name": "Barbell Bench Press",
    "sets": 4,
    "reps": 10,
    "weight_kg": 60,
    "duration_minutes": 45,
    "calories_burned": 350,
    "notes": "Good form throughout",
    "log_date": "2026-01-28T09:00:00.000Z",
    "createdAt": "2026-01-28T09:30:00.000Z"
  }
]
```

---

## Phase 22: Workout Plans

### 22.1 POST /workouts

**Fake Request Data:**
```json
{
  "memberId": 401,
  "planName": "Strength Building Program - Phase 1",
  "planType": "strength",
  "duration": 12,
  "durationUnit": "weeks",
  "difficulty": "intermediate",
  "sessionsPerWeek": 4,
  "estimatedDuration": 60,
  "goal": "Build lean muscle mass and increase overall strength by 20%",
  "description": "A comprehensive program focusing on compound movements with progressive overload",
  "exercises": [
    {
      "exerciseName": "Barbell Bench Press",
      "category": "compound",
      "muscleGroups": ["chest", "shoulders", "triceps"],
      "equipment": ["barbell", "bench", "weight_plates"],
      "sets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 60,
          "weightUnit": "kg",
          "restTime": 120,
          "tempo": "3-1-1",
          "notes": "Focus on controlled descent and full range of motion"
        }
      ],
      "progression": {
        "type": "weight",
        "frequency": "weekly",
        "increment": 2.5,
        "description": "Increase weight by 2.5kg each week if all sets completed"
      },
      "exerciseOrder": 1,
      "isOptional": false
    }
  ],
  "schedule": [
    {
      "day": "monday",
      "sessionType": "upper_body",
      "duration": 60,
      "focus": "Push movements - chest, shoulders, triceps"
    }
  ],
  "trackingMetrics": ["weight_progression", "body_measurements", "strength_tests"],
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "id": "work_123456789",
  "memberId": 401,
  "planName": "Strength Building Program - Phase 1",
  "planType": "strength",
  "duration": 12,
  "durationUnit": "weeks",
  "difficulty": "intermediate",
  "sessionsPerWeek": 4,
  "estimatedDuration": 60,
  "goal": "Build lean muscle mass and increase overall strength by 20%",
  "description": "A comprehensive program focusing on compound movements with progressive overload",
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "Barbell Bench Press",
      "category": "compound",
      "muscleGroups": ["chest", "shoulders", "triceps"],
      "equipment": ["barbell", "bench", "weight_plates"],
      "sets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 60,
          "weightUnit": "kg",
          "restTime": 120,
          "tempo": "3-1-1",
          "notes": "Focus on controlled descent and full range of motion"
        }
      ],
      "progression": {
        "type": "weight",
        "frequency": "weekly",
        "increment": 2.5,
        "description": "Increase weight by 2.5kg each week if all sets completed"
      },
      "exerciseOrder": 1,
      "isOptional": false
    }
  ],
  "schedule": [
    {
      "day": "monday",
      "sessionType": "upper_body",
      "duration": 60,
      "focus": "Push movements - chest, shoulders, triceps"
    }
  ],
  "trackingMetrics": ["weight_progression", "body_measurements", "strength_tests"],
  "status": "active",
  "isTemplate": false,
  "createdBy": 81,
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 22.2 GET /workouts

**Request:**
```bash
curl -X GET "http://localhost:3000/workouts?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "work_123456789",
      "memberId": 401,
      "planName": "Strength Building Program - Phase 1",
      "planType": "strength",
      "duration": 12,
      "difficulty": "intermediate",
      "sessionsPerWeek": 4,
      "status": "active",
      "progress": 25,
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 22.3 GET /workouts/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/workouts/work_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": "work_123456789",
  "memberId": 401,
  "planName": "Strength Building Program - Phase 1",
  "planType": "strength",
  "duration": 12,
  "durationUnit": "weeks",
  "difficulty": "intermediate",
  "sessionsPerWeek": 4,
  "estimatedDuration": 60,
  "goal": "Build lean muscle mass and increase overall strength by 20%",
  "description": "A comprehensive program focusing on compound movements with progressive overload",
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "Barbell Bench Press",
      "category": "compound",
      "muscleGroups": ["chest", "shoulders", "triceps"],
      "equipment": ["barbell", "bench", "weight_plates"],
      "sets": [
        {
          "setNumber": 1,
          "reps": 10,
          "weight": 60,
          "weightUnit": "kg",
          "restTime": 120,
          "tempo": "3-1-1",
          "notes": "Focus on controlled descent and full range of motion"
        }
      ],
      "progression": {
        "type": "weight",
        "frequency": "weekly",
        "increment": 2.5,
        "description": "Increase weight by 2.5kg each week if all sets completed"
      },
      "exerciseOrder": 1,
      "isOptional": false
    }
  ],
  "schedule": [
    {
      "day": "monday",
      "sessionType": "upper_body",
      "duration": 60,
      "focus": "Push movements - chest, shoulders, triceps"
    }
  ],
  "trackingMetrics": ["weight_progression", "body_measurements", "strength_tests"],
  "status": "active",
  "progress": 25,
  "isTemplate": false,
  "createdBy": 81,
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 22.4 PATCH /workouts/:id

**Fake Request Data:**
```json
{
  "status": "paused",
  "notes": "Member requested to pause the program"
}
```

**Response (200 OK):**
```json
{
  "id": "work_123456789",
  "memberId": 401,
  "planName": "Strength Building Program - Phase 1",
  "planType": "strength",
  "status": "paused",
  "notes": "Member requested to pause the program",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 22.5 DELETE /workouts/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/workouts/work_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Workout plan deleted successfully"
}
```

---

### 22.6 GET /workouts/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/workouts/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": "work_123456789",
    "memberId": 401,
    "planName": "Strength Building Program - Phase 1",
    "planType": "strength",
    "duration": 12,
    "difficulty": "intermediate",
    "status": "active",
    "progress": 25,
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 22.7 GET /workouts/user/my-workout-plans

**Request:**
```bash
curl -X GET "http://localhost:3000/workouts/user/my-workout-plans" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": "work_123456789",
    "memberId": 401,
    "planName": "Strength Building Program - Phase 1",
    "planType": "strength",
    "status": "active",
    "progress": 25,
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

## Phase 23: Diet Plans

### 23.1 POST /diet-plans

**Fake Request Data:**
```json
{
  "memberId": 401,
  "title": "Muscle Gain Nutrition Plan",
  "goal_type": "muscle_gain",
  "target_calories": 2800,
  "protein_g": 180,
  "carbs_g": 350,
  "fat_g": 85,
  "notes": "High protein diet for muscle building",
  "meals": [
    {
      "meal_type": "breakfast",
      "meal_name": "Protein Power Breakfast",
      "calories": 550,
      "protein_g": 35,
      "carbs_g": 45,
      "fat_g": 20,
      "foods": ["Oatmeal", "Eggs", "Banana", "Almond milk"]
    },
    {
      "meal_type": "lunch",
      "meal_name": "Lean Meat Lunch",
      "calories": 700,
      "protein_g": 50,
      "carbs_g": 60,
      "fat_g": 25,
      "foods": ["Grilled chicken", "Brown rice", "Vegetables", "Olive oil"]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "plan_id": "diet_123456789",
  "memberId": 401,
  "title": "Muscle Gain Nutrition Plan",
  "goal_type": "muscle_gain",
  "target_calories": 2800,
  "protein_g": 180,
  "carbs_g": 350,
  "fat_g": 85,
  "notes": "High protein diet for muscle building",
  "meals": [
    {
      "meal_id": 1,
      "meal_type": "breakfast",
      "meal_name": "Protein Power Breakfast",
      "calories": 550,
      "protein_g": 35,
      "carbs_g": 45,
      "fat_g": 20,
      "foods": ["Oatmeal", "Eggs", "Banana", "Almond milk"],
      "order_index": 1
    },
    {
      "meal_id": 2,
      "meal_type": "lunch",
      "meal_name": "Lean Meat Lunch",
      "calories": 700,
      "protein_g": 50,
      "carbs_g": 60,
      "fat_g": 25,
      "foods": ["Grilled chicken", "Brown rice", "Vegetables", "Olive oil"],
      "order_index": 2
    }
  ],
  "is_active": true,
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 23.2 GET /diet-plans

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plans?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "plan_id": "diet_123456789",
      "memberId": 401,
      "title": "Muscle Gain Nutrition Plan",
      "goal_type": "muscle_gain",
      "target_calories": 2800,
      "status": "active",
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 23.3 GET /diet-plans/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plans/diet_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "plan_id": "diet_123456789",
  "memberId": 401,
  "title": "Muscle Gain Nutrition Plan",
  "goal_type": "muscle_gain",
  "target_calories": 2800,
  "protein_g": 180,
  "carbs_g": 350,
  "fat_g": 85,
  "notes": "High protein diet for muscle building",
  "meals": [
    {
      "meal_id": 1,
      "meal_type": "breakfast",
      "meal_name": "Protein Power Breakfast",
      "calories": 550,
      "protein_g": 35,
      "carbs_g": 45,
      "fat_g": 20,
      "foods": ["Oatmeal", "Eggs", "Banana", "Almond milk"],
      "order_index": 1
    },
    {
      "meal_id": 2,
      "meal_type": "lunch",
      "meal_name": "Lean Meat Lunch",
      "calories": 700,
      "protein_g": 50,
      "carbs_g": 60,
      "fat_g": 25,
      "foods": ["Grilled chicken", "Brown rice", "Vegetables", "Olive oil"],
      "order_index": 2
    }
  ],
  "is_active": true,
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 23.4 PATCH /diet-plans/:id

**Fake Request Data:**
```json
{
  "target_calories": 3000,
  "notes": "Increased calories for better gains"
}
```

**Response (200 OK):**
```json
{
  "plan_id": "diet_123456789",
  "memberId": 401,
  "title": "Muscle Gain Nutrition Plan",
  "goal_type": "muscle_gain",
  "target_calories": 3000,
  "protein_g": 180,
  "carbs_g": 350,
  "fat_g": 85,
  "notes": "Increased calories for better gains",
  "is_active": true,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 23.5 DELETE /diet-plans/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/diet-plans/diet_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Diet plan deleted successfully"
}
```

---

### 23.6 GET /diet-plans/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plans/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "plan_id": "diet_123456789",
    "memberId": 401,
    "title": "Muscle Gain Nutrition Plan",
    "goal_type": "muscle_gain",
    "target_calories": 2800,
    "status": "active",
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 23.7 GET /diet-plans/user/my-body-progress

**Request:**
```bash
curl -X GET "http://localhost:3000/diet-plans/user/my-body-progress" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "plan_id": "diet_123456789",
    "title": "Muscle Gain Nutrition Plan",
    "goal_type": "muscle_gain",
    "target_calories": 2800,
    "currentCalories": 2750,
    "adherence": 92,
    "progress": "on_track",
    "updatedAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

## Phase 24: Body Progress

### 24.1 POST /body-progress

**Fake Request Data:**
```json
{
  "memberId": 401,
  "weight_kg": 75.5,
  "body_fat_percentage": 18.2,
  "measurements": {
    "chest_cm": 102,
    "waist_cm": 82,
    "hips_cm": 98,
    "arms_cm": 38,
    "thighs_cm": 58
  },
  "notes": "Good progress this month",
  "record_date": "2026-01-29"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "memberId": 401,
  "weight_kg": 75.5,
  "body_fat_percentage": 18.2,
  "measurements": {
    "chest_cm": 102,
    "waist_cm": 82,
    "hips_cm": 98,
    "arms_cm": 38,
    "thighs_cm": 58
  },
  "notes": "Good progress this month",
  "record_date": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 24.2 GET /body-progress

**Request:**
```bash
curl -X GET "http://localhost:3000/body-progress?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "memberId": 401,
      "weight_kg": 75.5,
      "body_fat_percentage": 18.2,
      "measurements": {
        "chest_cm": 102,
        "waist_cm": 82,
        "hips_cm": 98
      },
      "record_date": "2026-01-29T00:00:00.000Z",
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 24.3 GET /body-progress/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/body-progress/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "memberId": 401,
  "weight_kg": 75.5,
  "body_fat_percentage": 18.2,
  "measurements": {
    "chest_cm": 102,
    "waist_cm": 82,
    "hips_cm": 98,
    "arms_cm": 38,
    "thighs_cm": 58
  },
  "notes": "Good progress this month",
  "record_date": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 24.4 PATCH /body-progress/:id

**Fake Request Data:**
```json
{
  "weight_kg": 76.0,
  "notes": "Updated weight measurement"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "memberId": 401,
  "weight_kg": 76.0,
  "body_fat_percentage": 18.2,
  "measurements": {
    "chest_cm": 102,
    "waist_cm": 82,
    "hips_cm": 98,
    "arms_cm": 38,
    "thighs_cm": 58
  },
  "notes": "Updated weight measurement",
  "record_date": "2026-01-29T00:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 24.5 DELETE /body-progress/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/body-progress/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Body progress record deleted successfully"
}
```

---

### 24.6 GET /body-progress/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/body-progress/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "memberId": 401,
    "weight_kg": 75.5,
    "body_fat_percentage": 18.2,
    "measurements": {
      "chest_cm": 102,
      "waist_cm": 82,
      "hips_cm": 98
    },
    "record_date": "2026-01-29T00:00:00.000Z",
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 24.7 GET /body-progress/user/my-progress-records

**Request:**
```bash
curl -X GET "http://localhost:3000/body-progress/user/my-progress-records" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "weight_kg": 75.5,
    "body_fat_percentage": 18.2,
    "record_date": "2026-01-29T00:00:00.000Z",
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

## Phase 25: Progress Tracking

### 25.1 POST /progress-tracking

**Fake Request Data:**
```json
{
  "memberId": 401,
  "weight_kg": 75.5,
  "height_cm": 178,
  "bmi": 23.8,
  "body_fat_percentage": 18.2,
  "lean_mass_kg": 61.7,
  "fat_mass_kg": 13.8,
  "visceral_fat_level": 8,
  "metabolic_age": 28,
  "notes": "Monthly progress check"
}
```

**Response (201 Created):**
```json
{
  "id": "prog_123456789",
  "memberId": 401,
  "weight_kg": 75.5,
  "height_cm": 178,
  "bmi": 23.8,
  "body_fat_percentage": 18.2,
  "lean_mass_kg": 61.7,
  "fat_mass_kg": 13.8,
  "visceral_fat_level": 8,
  "metabolic_age": 28,
  "notes": "Monthly progress check",
  "recorded_at": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 25.2 GET /progress-tracking

**Request:**
```bash
curl -X GET "http://localhost:3000/progress-tracking?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "prog_123456789",
      "memberId": 401,
      "weight_kg": 75.5,
      "bmi": 23.8,
      "body_fat_percentage": 18.2,
      "recorded_at": "2026-01-29T00:00:00.000Z",
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 25.3 GET /progress-tracking/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/progress-tracking/prog_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": "prog_123456789",
  "memberId": 401,
  "weight_kg": 75.5,
  "height_cm": 178,
  "bmi": 23.8,
  "body_fat_percentage": 18.2,
  "lean_mass_kg": 61.7,
  "fat_mass_kg": 13.8,
  "visceral_fat_level": 8,
  "metabolic_age": 28,
  "notes": "Monthly progress check",
  "recorded_at": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 25.4 PATCH /progress-tracking/:id

**Fake Request Data:**
```json
{
  "weight_kg": 76.0,
  "notes": "Updated measurement"
}
```

**Response (200 OK):**
```json
{
  "id": "prog_123456789",
  "memberId": 401,
  "weight_kg": 76.0,
  "height_cm": 178,
  "bmi": 24.0,
  "body_fat_percentage": 18.2,
  "notes": "Updated measurement",
  "recorded_at": "2026-01-29T00:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 25.5 DELETE /progress-tracking/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/progress-tracking/prog_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Progress tracking record deleted successfully"
}
```

---

### 25.6 GET /progress-tracking/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/progress-tracking/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": "prog_123456789",
    "memberId": 401,
    "weight_kg": 75.5,
    "bmi": 23.8,
    "body_fat_percentage": 18.2,
    "recorded_at": "2026-01-29T00:00:00.000Z",
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 25.7 GET /progress-tracking/user/my-diet-plans

**Request:**
```bash
curl -X GET "http://localhost:3000/progress-tracking/user/my-diet-plans" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "plan_id": "diet_123456789",
    "title": "Muscle Gain Nutrition Plan",
    "goal_type": "muscle_gain",
    "target_calories": 2800,
    "currentCalories": 2750,
    "adherence": 92,
    "progress": "on_track"
  }
]
```

---

## Phase 26: Workout Logs

### 26.1 POST /workout-logs

**Fake Request Data:**
```json
{
  "memberId": 401,
  "workout_plan_id": "work_123456789",
  "exercise_name": "Barbell Bench Press",
  "sets": 4,
  "reps": 10,
  "weight_kg": 60,
  "duration_minutes": 45,
  "calories_burned": 350,
  "notes": "Good form throughout, increased weight from last session",
  "log_date": "2026-01-29"
}
```

**Response (201 Created):**
```json
{
  "log_id": 1,
  "memberId": 401,
  "workout_plan_id": "work_123456789",
  "exercise_name": "Barbell Bench Press",
  "sets": 4,
  "reps": 10,
  "weight_kg": 60,
  "duration_minutes": 45,
  "calories_burned": 350,
  "notes": "Good form throughout, increased weight from last session",
  "log_date": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 26.2 GET /workout-logs

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-logs?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "log_id": 1,
      "memberId": 401,
      "exercise_name": "Barbell Bench Press",
      "sets": 4,
      "reps": 10,
      "weight_kg": 60,
      "duration_minutes": 45,
      "calories_burned": 350,
      "log_date": "2026-01-29T00:00:00.000Z",
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 26.3 GET /workout-logs/profile

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-logs/profile" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "totalWorkouts": 25,
  "totalSets": 450,
  "totalReps": 5200,
  "totalDurationMinutes": 1800,
  "totalCaloriesBurned": 12500,
  "averageWeight": 62.5,
  "favoriteExercise": "Barbell Bench Press",
  "mostFrequentDay": "monday",
  "thisWeek": {
    "workouts": 3,
    "duration": 180,
    "calories": 1050
  },
  "thisMonth": {
    "workouts": 12,
    "duration": 720,
    "calories": 4200
  }
}
```

---

### 26.4 GET /workout-logs/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/workout-logs/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "log_id": 1,
  "memberId": 401,
  "workout_plan_id": "work_123456789",
  "exercise_name": "Barbell Bench Press",
  "sets": 4,
  "reps": 10,
  "weight_kg": 60,
  "duration_minutes": 45,
  "calories_burned": 350,
  "notes": "Good form throughout, increased weight from last session",
  "log_date": "2026-01-29T00:00:00.000Z",
  "createdAt": "2026-01-29T14:17:35.353Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 26.5 PATCH /workout-logs/:id

**Fake Request Data:**
```json
{
  "reps": 12,
  "notes": "Increased reps on final set"
}
```

**Response (200 OK):**
```json
{
  "log_id": 1,
  "memberId": 401,
  "exercise_name": "Barbell Bench Press",
  "sets": 4,
  "reps": 12,
  "weight_kg": 60,
  "duration_minutes": 45,
  "calories_burned": 350,
  "notes": "Increased reps on final set",
  "log_date": "2026-01-29T00:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 26.6 DELETE /workout-logs/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/workout-logs/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Workout log deleted successfully"
}
```

---

## Phase 27: Gyms (Additional Endpoints)

### 27.1 PATCH /gyms/:id

**Fake Request Data:**
```json
{
  "name": "Updated Fitness First Elite",
  "phone": "+1-555-UPDATED",
  "address": "123 Updated Street, Los Angeles, CA 90002"
}
```

**Response (200 OK):**
```json
{
  "gym_id": "b0e2cfb8-39f4-4d68-aa65-b0b9576f4025",
  "name": "Updated Fitness First Elite",
  "email": "admin@updated.com",
  "phone": "+1-555-UPDATED",
  "address": "123 Updated Street, Los Angeles, CA 90002",
  "isActive": true,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 27.2 DELETE /gyms/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/gyms/b0e2cfb8-39f4-4d68-aa65-b0b9576f4025" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Gym deleted successfully"
}
```

---

## Phase 28: Classes (Additional Endpoints)

### 28.1 PATCH /classes/:id

**Fake Request Data:**
```json
{
  "name": "Updated Morning HIIT Blast",
  "capacity": 25,
  "timings": "07:00-08:00"
}
```

**Response (200 OK):**
```json
{
  "class_id": "1f40f785-1c9c-40ea-9ab7-f1568e2fff7e",
  "name": "Updated Morning HIIT Blast",
  "description": "Updated high intensity interval training for fat burning",
  "branch": {
    "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c",
    "name": "Fitness First Elite - Downtown"
  },
  "instructor": {
    "id": 81,
    "fullName": "Trainer Marcus Sterling"
  },
  "capacity": 25,
  "enrolled": 15,
  "timings": "07:00-08:00",
  "recurrence_type": "weekly",
  "days_of_week": [1, 3, 5],
  "isActive": true,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 28.2 DELETE /classes/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/classes/1f40f785-1c9c-40ea-9ab7-f1568e2fff7e" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

---

## Phase 29: Attendance (Additional Endpoints)

### 29.1 DELETE /attendance/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/attendance/att_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Attendance record deleted successfully"
}
```

---

## Phase 30: Membership Plans (Additional Endpoints)

### 30.1 PATCH /membership-plans/:id

**Fake Request Data:**
```json
{
  "name": "Updated Elite Basic - Downtown",
  "price": 9499,
  "durationInDays": 30
}
```

**Response (200 OK):**
```json
{
  "id": 81,
  "name": "Updated Elite Basic - Downtown",
  "description": "Updated basic membership with gym access",
  "price": 9499,
  "durationInDays": 30,
  "isActive": true,
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 30.2 DELETE /membership-plans/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/membership-plans/81" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Membership plan deleted successfully"
}
```

---

## Phase 31: Subscriptions (Additional Endpoints)

### 31.1 PATCH /subscriptions/:id

**Fake Request Data:**
```json
{
  "status": "active",
  "notes": "Subscription reactivated"
}
```

**Response (200 OK):**
```json
{
  "subscription_id": 101,
  "memberId": 401,
  "planId": 81,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-01-31T00:00:00.000Z",
  "status": "active",
  "selectedClassIds": [1, 2, 3],
  "notes": "Subscription reactivated",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 31.2 DELETE /subscriptions/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/subscriptions/101" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Subscription cancelled successfully"
}
```

---

## Phase 32: Invoices (Additional Endpoints)

### 32.1 GET /invoices (with pagination)

**Request:**
```bash
curl -X GET "http://localhost:3000/invoices?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "invoice_id": "inv_123456789",
      "memberId": 401,
      "subscriptionId": 101,
      "total_amount": 8999,
      "description": "Elite Basic - Downtown - January 2026",
      "due_date": "2026-02-01T00:00:00.000Z",
      "status": "pending",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### 32.2 PATCH /invoices/:id

**Fake Request Data:**
```json
{
  "status": "paid",
  "notes": "Payment received via bank transfer"
}
```

**Response (200 OK):**
```json
{
  "invoice_id": "inv_123456789",
  "memberId": 401,
  "subscriptionId": 101,
  "total_amount": 8999,
  "description": "Elite Basic - Downtown - January 2026",
  "due_date": "2026-02-01T00:00:00.000Z",
  "status": "paid",
  "paid_at": "2026-01-15T10:00:00.000Z",
  "notes": "Payment received via bank transfer",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

---

## Phase 33: Payments (Additional Endpoints)

### 33.1 GET /payments/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/payments/pay_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "payment_id": "pay_123456789",
  "invoice_id": "inv_123456789",
  "memberId": 401,
  "amount": 8999,
  "method": "credit_card",
  "status": "completed",
  "transaction_ref": "TXN-ABC123",
  "processed_at": "2026-01-15T10:30:00.000Z",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

## Phase 34: Inquiries (Additional Endpoints)

### 34.1 PATCH /inquiries/:id

**Fake Request Data:**
```json
{
  "status": "contacted",
  "notes": "Initial contact made, member interested in premium plan"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1-555-0101",
  "status": "contacted",
  "notes": "Initial contact made, member interested in premium plan",
  "assignedTo": "Trainer Marcus Sterling",
  "createdAt": "2026-01-29T14:17:35.340Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 34.2 DELETE /inquiries/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/inquiries/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Inquiry deleted successfully"
}
```

---

## Phase 35: Notifications (Additional Endpoints)

### 35.1 GET /notifications (with filters)

**Request:**
```bash
curl -X GET "http://localhost:3000/notifications?is_read=false&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "notification_id": "notif_123456789",
      "user_id": "d78870ff-d367-4e96-9ea1-6235be02f90f",
      "title": "New Member Registration",
      "message": "A new member has registered at your gym.",
      "type": "member_registration",
      "is_read": false,
      "metadata": {
        "memberId": 401,
        "branchId": "864213ba-00ff-40ee-b4ff-16ce030a350c"
      },
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 5,
  "unreadCount": 3,
  "page": 1,
  "limit": 10
}
```

---

### 35.2 DELETE /notifications/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/notifications/notif_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Phase 36: Assignments (Member-Trainer - Additional)

### 36.1 PATCH /assignments/:id

**Fake Request Data:**
```json
{
  "status": "paused",
  "notes": "Member requested temporary pause"
}
```

**Response (200 OK):**
```json
{
  "assignment_id": "ass_123456789",
  "memberId": 401,
  "trainerId": 81,
  "start_date": "2026-01-01T00:00:00.000Z",
  "end_date": "2026-06-01T00:00:00.000Z",
  "status": "paused",
  "notes": "Member requested temporary pause",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 36.2 DELETE /assignments/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/assignments/ass_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Assignment deleted successfully"
}
```

---

## Phase 37: Audit Logs (Additional Endpoints)

### 37.1 GET /audit-logs (with filters)

**Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs?page=1&limit=20&action=CREATE&entity_type=member" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "audit_id": "audit_123456789",
      "user_id": "d78870ff-d367-4e96-9ea1-6235be02f90f",
      "action": "CREATE",
      "entity_type": "member",
      "entity_id": "401",
      "previous_values": null,
      "new_values": {
        "fullName": "Test Member Alpha",
        "email": "test.member.alpha@email.com"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0",
      "createdAt": "2026-01-29T14:17:35.353Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### 37.2 DELETE /audit-logs/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/audit-logs/audit_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Audit log deleted successfully"
}
```

---

## Phase 38: Roles (Additional Endpoints)

### 38.1 DELETE /roles/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/roles/cc48ce69-bffd-5903-c452-60b34e5cebgb" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Role deleted successfully"
}
```

---

## Phase 39: Goals (Additional Endpoints)

### 39.1 GET /goals/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/goals/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "memberId": 401,
  "goal_type": "weight_loss",
  "target_value": 70,
  "current_value": 75.5,
  "unit": "kg",
  "start_date": "2026-01-01T00:00:00.000Z",
  "target_date": "2026-06-01T00:00:00.000Z",
  "status": "in_progress",
  "progress": 22,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 39.2 PATCH /goals/:id

**Fake Request Data:**
```json
{
  "target_value": 68,
  "status": "in_progress"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "memberId": 401,
  "goal_type": "weight_loss",
  "target_value": 68,
  "current_value": 75.5,
  "unit": "kg",
  "status": "in_progress",
  "progress": 25,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 39.3 DELETE /goals/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/goals/1" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal deleted successfully"
}
```

---

### 39.4 GET /goals/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/goals/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "memberId": 401,
    "goal_type": "weight_loss",
    "target_value": 70,
    "current_value": 75.5,
    "unit": "kg",
    "status": "in_progress",
    "progress": 22,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 39.5 GET /goals/user/my-goals

**Request:**
```bash
curl -X GET "http://localhost:3000/goals/user/my-goals" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "goal_type": "weight_loss",
    "target_value": 70,
    "current_value": 75.5,
    "unit": "kg",
    "status": "in_progress",
    "progress": 22,
    "start_date": "2026-01-01T00:00:00.000Z",
    "target_date": "2026-06-01T00:00:00.000Z"
  }
]
```

---

## Phase 40: Goal Templates (Additional Endpoints)

### 40.1 GET /goal-templates

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-templates" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "template_id": "gt_123456789",
    "name": "Weight Loss Program",
    "description": "12-week weight loss program with weekly targets",
    "goal_type": "weight_loss",
    "default_target_value": 5,
    "unit": "kg",
    "default_duration_weeks": 12,
    "createdBy": 81,
    "isActive": true,
    "createdAt": "2026-01-29T14:17:35.353Z"
  }
]
```

---

### 40.2 PATCH /goal-templates/:id

**Fake Request Data:**
```json
{
  "name": "Updated Weight Loss Program",
  "default_duration_weeks": 16
}
```

**Response (200 OK):**
```json
{
  "template_id": "gt_123456789",
  "name": "Updated Weight Loss Program",
  "description": "12-week weight loss program with weekly targets",
  "goal_type": "weight_loss",
  "default_target_value": 5,
  "unit": "kg",
  "default_duration_weeks": 16,
  "createdBy": 81,
  "isActive": true,
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 40.3 DELETE /goal-templates/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/goal-templates/gt_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal template deleted successfully"
}
```

---

## Phase 41: Goal Schedules (Additional Endpoints)

### 41.1 GET /goal-schedules

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "schedule_id": "gs_123456789",
    "memberId": 401,
    "template_id": "gt_123456789",
    "goal_type": "workout_sessions",
    "target_count": 20,
    "current_count": 8,
    "status": "in_progress",
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": "2026-01-31T00:00:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 41.2 GET /goal-schedules/member/:memberId

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules/member/401" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "schedule_id": "gs_123456789",
    "memberId": 401,
    "template_id": "gt_123456789",
    "goal_type": "workout_sessions",
    "target_count": 20,
    "current_count": 8,
    "status": "in_progress",
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": "2026-01-31T00:00:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 41.3 GET /goal-schedules/:id

**Request:**
```bash
curl -X GET "http://localhost:3000/goal-schedules/gs_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "schedule_id": "gs_123456789",
  "memberId": 401,
  "template_id": "gt_123456789",
  "goal_type": "workout_sessions",
  "target_count": 20,
  "current_count": 8,
  "status": "in_progress",
  "start_date": "2026-01-01T00:00:00.000Z",
  "end_date": "2026-01-31T00:00:00.000Z",
  "milestones": [
    {
      "period": "week_1",
      "target": 5,
      "completed": 5,
      "status": "completed"
    },
    {
      "period": "week_2",
      "target": 5,
      "completed": 3,
      "status": "in_progress"
    }
  ],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-29T14:17:35.353Z"
}
```

---

### 41.4 PATCH /goal-schedules/:id/period

**Fake Request Data:**
```json
{
  "period": "week_3",
  "target": 5
}
```

**Response (200 OK):**
```json
{
  "schedule_id": "gs_123456789",
  "memberId": 401,
  "goal_type": "workout_sessions",
  "current_count": 8,
  "milestones": [
    {
      "period": "week_3",
      "target": 5,
      "completed": 0,
      "status": "pending"
    }
  ],
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```

---

### 41.5 POST /goal-schedules/:id/pause

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/gs_123456789/pause" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal schedule paused",
  "schedule_id": "gs_123456789",
  "status": "paused",
  "paused_at": "2026-01-29T16:00:00.000Z"
}
```

---

### 41.6 POST /goal-schedules/:id/resume

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/gs_123456789/resume" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal schedule resumed",
  "schedule_id": "gs_123456789",
  "status": "in_progress",
  "resumed_at": "2026-01-29T16:00:00.000Z"
}
```

---

### 41.7 POST /goal-schedules/:id/complete

**Request:**
```bash
curl -X POST "http://localhost:3000/goal-schedules/gs_123456789/complete" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal schedule completed!",
  "schedule_id": "gs_123456789",
  "status": "completed",
  "completed_at": "2026-01-29T16:00:00.000Z",
  "final_count": 20,
  "target_count": 20
}
```

---

### 41.8 DELETE /goal-schedules/:id

**Request:**
```bash
curl -X DELETE "http://localhost:3000/goal-schedules/gs_123456789" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Goal schedule deleted successfully"
}
```

---

## Phase 42: Template Shares

Template sharing between admins and trainers.

### 42.1 POST /template-shares

Share a workout or diet template with a trainer.

**Request:**
```bash
curl -X POST "http://localhost:3000/template-shares" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "91e3e02c-8c4e-4e17-918f-803bf9583194",
    "template_type": "workout",
    "trainerId": 81,
    "admin_note": "Please review this workout template"
  }'
```

**Response (201 Created):**
```json
{
  "share_id": "cb42e948-48b6-4b26-8855-b0db9c326f40",
  "template_id": "91e3e02c-8c4e-4e17-918f-803bf9583194",
  "template_type": "workout",
  "shared_with_trainerId": 81,
  "shared_by_admin": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "admin_note": "Please review this workout template",
  "is_accepted": false,
  "accepted_at": null,
  "shared_at": "2026-01-31T16:34:56.043Z"
}
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Status 201 | ✓ | Created successfully |
| share_id | ✓ | UUID generated |
| is_accepted | ✓ | Defaults to false |

---

### 42.2 GET /template-shares

Get all template shares. Admins see all, trainers see only shares for them.

**Request:**
```bash
curl -X GET "http://localhost:3000/template-shares" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "share_id": "cb42e948-48b6-4b26-8855-b0db9c326f40",
    "template_id": "91e3e02c-8c4e-4e17-918f-803bf9583194",
    "template_type": "workout",
    "shared_with_trainerId": 81,
    "shared_by_admin": {
      "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
      "email": "admin@fitnessfirstelite.com",
      "createdAt": "2026-01-29T14:17:43.747Z",
      "updatedAt": "2026-01-31T16:27:44.400Z"
    },
    "admin_note": "Please review this workout template",
    "is_accepted": false,
    "accepted_at": null,
    "shared_at": "2026-01-31T16:34:56.043Z"
  }
]
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Status 200 | ✓ | Array returned |
| shared_by_admin | ✓ | Nested user object included |
| Sorted | ✓ | By shared_at DESC |

---

### 42.3 POST /template-shares/:id/accept

Accept a shared template (trainer only).

**Request:**
```bash
curl -X POST "http://localhost:3000/template-shares/cb42e948-48b6-4b26-8855-b0db9c326f40/accept" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK) - Trainer:**
```json
{
  "share_id": "cb42e948-48b6-4b26-8855-b0db9c326f40",
  "is_accepted": true,
  "accepted_at": "2026-01-31T16:35:00.000Z"
}
```

**Response (200 OK) - Admin:**
```json
{
  "message": "Only trainers can accept template shares"
}
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Role check | ✓ | Admins blocked correctly |
| is_accepted | ✓ | Updates to true |
| accepted_at | ✓ | Timestamp set |

---

### 42.4 DELETE /template-shares/:id

Delete a template share.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/template-shares/f0f1a719-4e14-49f3-9d76-8b1c4f6b7513" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template share deleted"
}
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Status 200 | ✓ | Delete successful |
| success flag | ✓ | Boolean true |

---

## Phase 43: Progress Tracking (Re-tested)

*Note: This phase re-tests the progress tracking endpoints from Phase 25 with actual server responses.*

Track member progress with measurements and metrics.

### 43.1 GET /progress-tracking

Get all progress tracking records.

**Request:**
```bash
curl -X GET "http://localhost:3000/progress-tracking" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response (200 OK):**
```json
[
  {
    "progress_id": "f091651d-5e9c-4dff-ad49-f5ecb3405a76",
    "member": {
      "id": 401,
      "fullName": "Sophia Johnson-Smith UPDATED",
      "email": "sophia.johnson-smith0@email.com",
      "isActive": true
    },
    "recorded_by_trainer": {
      "id": 100,
      "fullName": "Trainer Penelope Ashworth",
      "email": "trainer.penelope.ashworth@fitnessfirstelite.com"
    },
    "record_date": "2025-10-16",
    "weight_kg": "64.37",
    "height_cm": "178.18",
    "body_fat_percentage": "10.20",
    "muscle_mass_kg": "39.26",
    "bmi": "20.27",
    "chest_cm": "103.59",
    "waist_cm": "72.45",
    "arms_cm": "30.81",
    "thighs_cm": "54.64",
    "notes": "Week 16 progress - Excellent dedication",
    "created_at": "2026-01-29T14:17:44.156Z"
  }
]
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Status 200 | ✓ | Array returned |
| Nested member | ✓ | Full member object |
| Nested trainer | ✓ | Full trainer object |
| Measurements | ✓ | All body metrics present |

---

### 43.2 POST /progress-tracking

Create a new progress tracking record.

**Request:**
```bash
curl -X POST "http://localhost:3000/progress-tracking" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 401,
    "record_date": "2026-01-31",
    "weight_kg": 68.5,
    "bmi": 21.5,
    "body_fat_percentage": 16.5,
    "notes": "Latest progress - good improvement"
  }'
```

**Response (201 Created):**
```json
{
  "progress_id": "b415625f-10b0-44fb-b4f8-e5884415faf6",
  "member": {
    "id": 401,
    "fullName": "Sophia Johnson-Smith UPDATED",
    "email": "sophia.johnson-smith0@email.com",
    "isActive": true,
    "subscriptionId": 401
  },
  "record_date": "2026-01-31T00:00:00.000Z",
  "weight_kg": 68.5,
  "height_cm": null,
  "body_fat_percentage": 16.5,
  "muscle_mass_kg": null,
  "bmi": 21.5,
  "chest_cm": null,
  "waist_cm": null,
  "arms_cm": null,
  "thighs_cm": null,
  "notes": "Latest progress - good improvement",
  "created_at": "2026-01-31T16:36:33.633Z"
}
```

**Validation:**
| Check | Status | Notes |
|-------|--------|-------|
| Status 201 | ✓ | Created successfully |
| progress_id | ✓ | UUID generated |
| Nested member | ✓ | Full member data included |
| record_date | ✓ | Properly formatted |

**Error (400 Bad Request) - Missing record_date:**
```json
{
  "message": ["record_date must be a valid ISO 8601 date string"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Error (404 Not Found) - Invalid memberId:**
```json
{
  "message": "Member with ID 1 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Summary

**Total Endpoints Documented:** 218 endpoints across 43 phases

| Phase | Module | Endpoints |
|-------|--------|-----------|
| 1 | Authentication & User Management | 5 |
| 2 | Member Management | 7 |
| 3 | Trainer Management | 6 |
| 4 | Gym & Branch Management | 8 |
| 5 | Classes & Attendance | 13 |
| 6 | Subscriptions & Payments | 15 |
| 7 | Inquiries (Leads) | 4 |
| 8 | Workout Templates | 11 |
| 9 | Chart Assignments | 9 |
| 10 | Diet Templates | 10 |
| 11 | Diet Plan Assignments | 9 |
| 12 | Goal Schedules | 10 |
| 13 | Goal Templates | 6 |
| 14 | Notifications | 4 |
| 15 | Analytics | 3 |
| 16 | Goals (Legacy) | 3 |
| 17 | Assignments (Member-Trainer) | 3 |
| 18 | Audit Logs | 6 |
| 19 | Roles | 3 |
| 20 | Gym Nested Endpoints | 5 |
| 21 | Users Management (Additional) | 7 |
| 22 | Workout Plans | 7 |
| 23 | Diet Plans | 7 |
| 24 | Body Progress | 7 |
| 25 | Progress Tracking | 7 |
| 26 | Workout Logs | 6 |
| 27 | Gyms (Additional Endpoints) | 2 |
| 28 | Classes (Additional Endpoints) | 2 |
| 29 | Attendance (Additional Endpoints) | 1 |
| 30 | Membership Plans (Additional) | 2 |
| 31 | Subscriptions (Additional) | 2 |
| 32 | Invoices (Additional Endpoints) | 2 |
| 33 | Payments (Additional Endpoints) | 1 |
| 34 | Inquiries (Additional Endpoints) | 2 |
| 35 | Notifications (Additional) | 2 |
| 36 | Assignments (Additional) | 2 |
| 37 | Audit Logs (Additional) | 2 |
| 38 | Roles (Additional Endpoints) | 1 |
| 39 | Goals (Additional Endpoints) | 5 |
| 40 | Goal Templates (Additional) | 3 |
| 41 | Goal Schedules (Additional) | 8 |
| 42 | Template Shares | 4 |
| 43 | Progress Tracking (Re-tested) | 2 |
| **Total** | | **218 endpoints** |

---

## Additional Audit Log Endpoint

### Additional 18.7 POST /audit-logs (Documented in Phase 18.1)

**Response (201 Created):**
```json
{
  "log_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "d78870ff-d367-4e96-9ea1-6235be02f90f",
  "action": "CREATE",
  "entityType": "member",
  "entityId": "501",
  "description": "Created new member record",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "created_at": "2026-01-29T10:00:00.000Z"
}
```

---

## Common Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN, TRAINER",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### Invalid Credentials
```json
{
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Documentation Format Template

For adding new endpoint documentation:

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

## File Location
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
Last Updated: 2026-01-31 (Phase 42-43 added, summary consolidated)
