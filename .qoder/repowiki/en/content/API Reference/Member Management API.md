# Member Management API

<cite>
**Referenced Files in This Document**
- [members.controller.ts](file://src/members/members.controller.ts)
- [members.service.ts](file://src/members/members.service.ts)
- [members.module.ts](file://src/members/members.module.ts)
- [create-member.dto.ts](file://src/members/dto/create-member.dto.ts)
- [update-member.dto.ts](file://src/members/dto/update-member.dto.ts)
- [admin-update-member.dto.ts](file://src/members/dto/admin-update-member.dto.ts)
- [member-dashboard.dto.ts](file://src/members/dto/member-dashboard.dto.ts)
- [branch-member-response.dto.ts](file://src/members/dto/branch-member-response.dto.ts)
- [members.entity.ts](file://src/entities/members.entity.ts)
- [member_subscriptions.entity.ts](file://src/entities/member_subscriptions.entity.ts)
- [branch.entity.ts](file://src/entities/branch.entity.ts)
- [gender.enum.ts](file://src/common/enums/gender.enum.ts)
- [role.enum.ts](file://src/common/enums/role.enum.ts)
- [subscription.util.ts](file://src/common/utils/subscription.util.ts)
- [jwt-auth.guard.ts](file://src/auth/guards/jwt-auth.guard.ts)
- [roles.guard.ts](file://src/auth/guards/roles.guard.ts)
- [branch-access.guard.ts](file://src/auth/guards/branch-access.guard.ts)
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
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive API documentation for member management endpoints. It covers member registration, profile updates, dashboard access, and administrative operations. The documentation includes HTTP methods, URL patterns, request/response schemas with validation rules, role-based access controls, member lifecycle management, subscription integration, trainer assignments, and branch-level permissions. Practical examples are provided using curl commands and JavaScript implementations, along with error responses for duplicate memberships, invalid data formats, and permission violations.

## Project Structure
The member management functionality is organized under the `src/members` module with dedicated controller, service, DTOs, and entity definitions. Supporting guards and utilities handle authentication, authorization, and subscription status calculations.

```mermaid
graph TB
subgraph "Members Module"
MC["MembersController<br/>/members endpoints"]
BMC["BranchMembersController<br/>/branches endpoints"]
MS["MembersService"]
MD["MembersModule"]
end
subgraph "DTOs"
CMD["CreateMemberDto"]
UMD["UpdateMemberDto"]
AMD["AdminUpdateMemberDto"]
MDD["MemberDashboardDto"]
BMR["BranchMemberResponseDto"]
end
subgraph "Entities"
ME["Member"]
MSE["MemberSubscription"]
BE["Branch"]
end
subgraph "Security & Utils"
JAG["JwtAuthGuard"]
RG["RolesGuard"]
BAG["BranchAccessGuard"]
SE["subscription.util.ts"]
GE["Gender enum"]
RE["Role enum"]
end
MD --> MC
MD --> BMC
MD --> MS
MC --> MS
BMC --> MS
MS --> ME
MS --> MSE
MS --> BE
MC --> CMD
MC --> UMD
MC --> AMD
MC --> MDD
MC --> BMR
MC --> JAG
MC --> RG
MC --> BAG
MS --> SE
CMD --> GE
MC --> RE
```

**Diagram sources**
- [members.controller.ts:34-36](file://src/members/members.controller.ts#L34-L36)
- [members.service.ts:24-46](file://src/members/members.service.ts#L24-L46)
- [members.module.ts:18-36](file://src/members/members.module.ts#L18-L36)
- [create-member.dto.ts:17-216](file://src/members/dto/create-member.dto.ts#L17-L216)
- [update-member.dto.ts:1-13](file://src/members/dto/update-member.dto.ts#L1-L13)
- [admin-update-member.dto.ts:1-7](file://src/members/dto/admin-update-member.dto.ts#L1-L7)
- [member-dashboard.dto.ts:1-94](file://src/members/dto/member-dashboard.dto.ts#L1-L94)
- [branch-member-response.dto.ts:1-168](file://src/members/dto/branch-member-response.dto.ts#L1-L168)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [member_subscriptions.entity.ts:14-71](file://src/entities/member_subscriptions.entity.ts#L14-L71)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:1-42](file://src/auth/guards/roles.guard.ts#L1-L42)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)
- [subscription.util.ts:1-16](file://src/common/utils/subscription.util.ts#L1-L16)
- [gender.enum.ts:1-6](file://src/common/enums/gender.enum.ts#L1-L6)
- [role.enum.ts:1-7](file://src/common/enums/role.enum.ts#L1-L7)

**Section sources**
- [members.module.ts:1-37](file://src/members/members.module.ts#L1-L37)

## Core Components
- MembersController: Exposes REST endpoints for member operations under `/members` and `/branches`.
- MembersService: Implements business logic for member creation, updates, queries, dashboard retrieval, and branch-level listings.
- DTOs: Define request/response schemas with validation rules for create, update, admin update, dashboard, and branch member responses.
- Entities: Represent database tables for members, subscriptions, and branches with relationships and constraints.
- Guards: Enforce JWT authentication, role-based access (ADMIN/SUPERADMIN), and branch-level permissions.

Key capabilities:
- Member registration with automatic user account creation and subscription setup.
- Profile updates for personal details and contact information.
- Dashboard data retrieval including subscription status, attendance, and payment history.
- Administrative operations for status changes, branch reassignment, and class enrollment.
- Branch-level member listing with subscription and class details.

**Section sources**
- [members.controller.ts:39-553](file://src/members/members.controller.ts#L39-L553)
- [members.service.ts:48-561](file://src/members/members.service.ts#L48-L561)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [member_subscriptions.entity.ts:14-71](file://src/entities/member_subscriptions.entity.ts#L14-L71)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)

## Architecture Overview
The member management API follows a layered architecture with clear separation of concerns:
- Controller layer handles HTTP requests/responses and applies guards.
- Service layer encapsulates business logic and orchestrates database operations.
- DTO layer validates and documents request/response schemas.
- Entity layer defines persistence models and relationships.
- Guard layer enforces authentication and authorization policies.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "MembersController"
participant Service as "MembersService"
participant Repo as "TypeORM Repositories"
participant DB as "Database"
Client->>Controller : POST /members
Controller->>Controller : Apply JwtAuthGuard
Controller->>Service : create(createMemberDto)
Service->>Repo : Find Branch/MembershipPlan
Service->>DB : Transaction : Insert Member/User/Subscription
DB-->>Service : Saved entities
Service->>Repo : Load relations (subscription/branch)
Service-->>Controller : Member with subscription/branch
Controller-->>Client : 201 Created + Member data
```

**Diagram sources**
- [members.controller.ts:39-222](file://src/members/members.controller.ts#L39-L222)
- [members.service.ts:48-234](file://src/members/members.service.ts#L48-L234)

**Section sources**
- [members.controller.ts:34-553](file://src/members/members.controller.ts#L34-L553)
- [members.service.ts:24-561](file://src/members/members.service.ts#L24-L561)

## Detailed Component Analysis

### Member Registration (POST /members)
Purpose: Create a new member profile, assign branch and membership plan, optionally enroll in classes, and create a user account with default credentials.

HTTP Method: POST  
Base URL: `/members`  
Authentication: Required (JWT)  
Authorization: Not role-specific  

Request Schema (CreateMemberDto):
- fullName: string (required, max 100)
- email: string (required, email format, max 255)
- phone: string (optional, max 20)
- gender: enum (optional: male, female, other)
- dateOfBirth: date string (optional)
- addressLine1/addressLine2: strings (optional, max 500 each)
- city/state/postalCode: strings (optional, max 100/20)
- avatarUrl/attachmentUrl: URLs (optional, max 500)
- emergencyContactName/emergencyContactPhone: strings (optional, max 100/20)
- branchId: UUID (required)
- membershipPlanId: integer (required, minimum 1)
- isActive: boolean (optional, default true)
- freezeMember: boolean (optional, default false)
- is_managed_by_member: boolean (optional, default true)
- selectedClassIds: array of UUIDs (optional)

Response: 201 Created with full member data including subscription and branch details.

Validation Rules:
- Email uniqueness enforced via database unique constraint and service checks.
- Branch and membership plan existence validated.
- Gender enum restricted to predefined values.
- Phone normalization handled internally.

Error Responses:
- 400 Bad Request: Validation failures (e.g., invalid gender).
- 401 Unauthorized: Missing/invalid JWT token.
- 404 Not Found: Branch or membership plan not found.
- 409 Conflict: Duplicate email.

Example curl:
```bash
curl -X POST https://your-api.com/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1555123456",
    "gender": "female",
    "dateOfBirth": "1992-05-20",
    "addressLine1": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90001",
    "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
    "membershipPlanId": 1,
    "selectedClassIds": ["8cd45646-061b-4730-a2a5-1f400226564b","33ec8f27-0708-4808-958f-091301f8aa2c"]
  }'
```

JavaScript fetch example:
```javascript
const response = await fetch('https://your-api.com/members', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1555123456",
    gender: "female",
    branchId: "a4a43bf7-e997-4716-839b-9f05a45f42be",
    membershipPlanId: 1,
    selectedClassIds: ["8cd45646-061b-4730-a2a5-1f400226564b","33ec8f27-0708-4808-958f-091301f8aa2c"]
  })
});
const member = await response.json();
console.log(member);
```

**Section sources**
- [members.controller.ts:39-222](file://src/members/members.controller.ts#L39-L222)
- [create-member.dto.ts:17-216](file://src/members/dto/create-member.dto.ts#L17-L216)
- [members.service.ts:48-234](file://src/members/members.service.ts#L48-L234)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [member_subscriptions.entity.ts:14-71](file://src/entities/member_subscriptions.entity.ts#L14-L71)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [gender.enum.ts:1-6](file://src/common/enums/gender.enum.ts#L1-L6)

### Member Profile Updates (PATCH /members/:id)
Purpose: Update member personal details and contact information.

HTTP Method: PATCH  
Base URL: `/members/:id`  
Authentication: Required (JWT)  
Authorization: Not role-specific  

Request Schema (UpdateMemberDto):
- Excludes admin-only fields: branchId, membershipPlanId, isActive, freezeMember, selectedClassIds.

Response: 200 OK with updated member data.

Validation Rules:
- Email uniqueness enforced when email is updated.
- Phone normalization applied.

Error Responses:
- 404 Not Found: Member not found.
- 409 Conflict: Duplicate email.

Example curl:
```bash
curl -X PATCH https://your-api.com/members/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567891",
    "addressLine1": "456 New St",
    "city": "New York",
    "state": "NY"
  }'
```

**Section sources**
- [members.controller.ts:328-411](file://src/members/members.controller.ts#L328-L411)
- [update-member.dto.ts:1-13](file://src/members/dto/update-member.dto.ts#L1-L13)
- [members.service.ts:273-290](file://src/members/members.service.ts#L273-L290)

### Admin Member Modifications (PATCH /members/admin/:id)
Purpose: Admin-only endpoint to update sensitive member fields including status, branch, and class enrollment.

HTTP Method: PATCH  
Base URL: `/members/admin/:id`  
Authentication: Required (JWT)  
Authorization: ADMIN or SUPERADMIN required  

Request Schema (AdminUpdateMemberDto):
- Includes all fields from CreateMemberDto (including sensitive ones).

Response: 200 OK with updated member data.

Validation Rules:
- Email uniqueness enforced when email is updated.
- Branch existence validated when branchId is provided.
- selectedClassIds handled via direct SQL array update.

Error Responses:
- 403 Forbidden: Insufficient role (must be ADMIN or SUPERADMIN).
- 404 Not Found: Member or branch not found.
- 409 Conflict: Duplicate email.

Example curl:
```bash
curl -X PATCH https://your-api.com/members/admin/123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "branchId": "a4a43bf7-e997-4716-839b-9f05a45f42be",
    "selectedClassIds": []
  }'
```

**Section sources**
- [members.controller.ts:413-459](file://src/members/members.controller.ts#L413-L459)
- [admin-update-member.dto.ts:1-7](file://src/members/dto/admin-update-member.dto.ts#L1-L7)
- [members.service.ts:292-360](file://src/members/members.service.ts#L292-L360)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)

### Member Deletion (DELETE /members/:id)
Purpose: Permanently delete a member and associated data.

HTTP Method: DELETE  
Base URL: `/members/:id`  
Authentication: Required (JWT)  
Authorization: ADMIN or SUPERADMIN required  

Response: 200 OK with deleted member data.

Notes:
- Cascade deletion removes related subscriptions, workout plans, diet plans, attendance records, and progress tracking.
- Cannot be undone.

Error Responses:
- 404 Not Found: Member not found.
- 500 Internal Server Error: Cascade deletion failure due to constraints.

Example curl:
```bash
curl -X DELETE https://your-api.com/members/7 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Section sources**
- [members.controller.ts:461-524](file://src/members/members.controller.ts#L461-L524)
- [members.service.ts:362-365](file://src/members/members.service.ts#L362-L365)

### Member Dashboard Access (GET /members/:memberId/dashboard)
Purpose: Retrieve comprehensive dashboard data including subscription, attendance, and payment history.

HTTP Method: GET  
Base URL: `/members/:memberId/dashboard`  
Authentication: Required (JWT)  
Authorization: Not role-specific  

Response Schema (MemberDashboardDto):
- member: profile info (id, fullName, email, phone, isActive, attachmentUrl, freezeMember, branch)
- subscription: planName, startDate, endDate, status (active/inactive)
- attendance: currentMonthCount
- paymentHistory: array of transactions with transactionId, amount, method, status, createdAt, invoiceId
- currentMonthClasses: total classes attended this month
- membershipStatus: summary string

Example curl:
```bash
curl -X GET https://your-api.com/members/123/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Section sources**
- [members.controller.ts:526-552](file://src/members/members.controller.ts#L526-L552)
- [member-dashboard.dto.ts:1-94](file://src/members/dto/member-dashboard.dto.ts#L1-L94)
- [members.service.ts:468-543](file://src/members/members.service.ts#L468-L543)
- [subscription.util.ts:1-16](file://src/common/utils/subscription.util.ts#L1-L16)

### Branch-Level Member Listing (GET /branches/:branchId/members)
Purpose: Retrieve all members for a specific branch with subscription, plan, classes, and branch details.

HTTP Method: GET  
Base URL: `/branches/:branchId/members`  
Authentication: Required (JWT)  
Authorization: Branch access controlled by branch-access.guard  

Query Parameters:
- isActive: boolean (optional)
- search: string (optional, partial match on name/email)

Response Schema (BranchMemberResponseDto):
- Member profile fields
- subscription: id, plan (id, name, price, durationInDays, description), classes (array with classId, name, description, timings, recurrenceType, daysOfWeek), startDate, endDate, isActive
- branch: branch details

Error Responses:
- 400 Bad Request: Invalid branchId UUID format.
- 401 Unauthorized: Missing/invalid JWT token.
- 403 Forbidden: User lacks branch access.
- 404 Not Found: Branch not found.

Example curl:
```bash
curl -X GET "https://your-api.com/branches/a4a43bf7-e997-4716-839b-9f05a45f42be/members?isActive=true&search=john" \
  -H "Authorization: Bearer BRANCH_ADMIN_JWT_TOKEN"
```

**Section sources**
- [members.controller.ts:555-727](file://src/members/members.controller.ts#L555-L727)
- [branch-member-response.dto.ts:1-168](file://src/members/dto/branch-member-response.dto.ts#L1-L168)
- [members.service.ts:367-466](file://src/members/members.service.ts#L367-L466)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)

### Member Retrieval (GET /members/:id)
Purpose: Get a single member by ID with branch and subscription details.

HTTP Method: GET  
Base URL: `/members/:id`  
Authentication: Required (JWT)  
Authorization: Not role-specific  

Response: Member object with branch and subscription relations.

Error Responses:
- 404 Not Found: Member not found.

**Section sources**
- [members.controller.ts:271-326](file://src/members/members.controller.ts#L271-L326)
- [members.service.ts:262-271](file://src/members/members.service.ts#L262-L271)

### Bulk Member Listing (GET /members)
Purpose: Retrieve all members with optional filtering by branch, status, or search.

HTTP Method: GET  
Base URL: `/members`  
Authentication: Required (JWT)  
Authorization: Not role-specific  

Query Parameters:
- branchId: UUID (optional)
- status: string (optional, active or inactive)
- search: string (optional)

Response: Array of Member objects with branch and subscription relations.

**Section sources**
- [members.controller.ts:224-269](file://src/members/members.controller.ts#L224-L269)
- [members.service.ts:236-260](file://src/members/members.service.ts#L236-L260)

## Dependency Analysis
The member management system integrates with several core modules and utilities:

```mermaid
classDiagram
class MembersController {
+create(createMemberDto)
+findAll(branchId,status,search)
+findOne(id)
+update(id,updateMemberDto)
+adminUpdate(id,adminUpdateMemberDto,user)
+remove(id)
+getMemberDashboard(memberId)
}
class MembersService {
+create(createMemberDto)
+findAll(branchId,status,search)
+findOne(id)
+update(id,updateMemberDto)
+adminUpdate(id,adminUpdateMemberDto)
+remove(id)
+findByBranch(branchId)
+getMemberDashboard(memberId)
-syncMemberUser(member)
}
class Member {
+id : number
+email : string
+branchBranchId : string
+subscriptionId : number
+subscription : MemberSubscription
+branch : Branch
}
class MemberSubscription {
+id : number
+member : Member
+plan : MembershipPlan
+startDate : Date
+endDate : Date
+isActive : boolean
+selectedClassIds : string[]
}
class Branch {
+branchId : string
+name : string
+members : Member[]
}
class JwtAuthGuard
class RolesGuard
class BranchAccessGuard
MembersController --> MembersService : "uses"
MembersService --> Member : "operates on"
MembersService --> MemberSubscription : "operates on"
MembersService --> Branch : "operates on"
MembersController --> JwtAuthGuard : "uses"
MembersController --> RolesGuard : "uses"
MembersController --> BranchAccessGuard : "uses"
```

**Diagram sources**
- [members.controller.ts:34-553](file://src/members/members.controller.ts#L34-L553)
- [members.service.ts:24-561](file://src/members/members.service.ts#L24-L561)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [member_subscriptions.entity.ts:14-71](file://src/entities/member_subscriptions.entity.ts#L14-L71)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:1-42](file://src/auth/guards/roles.guard.ts#L1-L42)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)

**Section sources**
- [members.controller.ts:34-553](file://src/members/members.controller.ts#L34-L553)
- [members.service.ts:24-561](file://src/members/members.service.ts#L24-L561)

## Performance Considerations
- Transactional Creation: Member, user, and subscription creation occurs within a single transaction to maintain consistency and prevent partial writes.
- Relation Loading: Eager loading of subscriptions and branches reduces N+1 query issues in responses.
- Array Updates: Direct SQL updates for selectedClassIds avoid unnecessary object hydration.
- Pagination: Use query parameters (branchId, status, search) to filter results efficiently.
- Indexing: Ensure database indexes exist on frequently queried columns (email, branchId, membership plan ID).

## Troubleshooting Guide
Common issues and resolutions:
- Authentication Failures:
  - Symptom: 401 Unauthorized on member endpoints.
  - Cause: Missing or invalid JWT token.
  - Resolution: Obtain a valid token via authentication endpoint and include Authorization: Bearer YOUR_TOKEN header.
- Permission Denied:
  - Symptom: 403 Forbidden when accessing admin endpoints.
  - Cause: User role insufficient (must be ADMIN or SUPERADMIN).
  - Resolution: Authenticate with an admin account.
- Branch Access Violation:
  - Symptom: 403 Forbidden when listing branch members.
  - Cause: User does not belong to the target branch's gym.
  - Resolution: Authenticate with a branch admin who belongs to the correct gym.
- Duplicate Email:
  - Symptom: 409 Conflict during creation/update.
  - Cause: Email already exists in system.
  - Resolution: Use a unique email address.
- Resource Not Found:
  - Symptom: 404 Not Found for members, branches, or membership plans.
  - Cause: Invalid IDs or non-existent resources.
  - Resolution: Verify IDs and ensure resources exist.
- Validation Errors:
  - Symptom: 400 Bad Request with validation messages.
  - Cause: Invalid field formats or missing required fields.
  - Resolution: Review DTO constraints and correct input data.

**Section sources**
- [members.controller.ts:124-177](file://src/members/members.controller.ts#L124-L177)
- [members.service.ts:134-174](file://src/members/members.service.ts#L134-L174)
- [roles.guard.ts:1-42](file://src/auth/guards/roles.guard.ts#L1-L42)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)

## Conclusion
The member management API provides a robust foundation for gym member operations with strong validation, comprehensive error handling, and clear role-based access controls. The integration of subscriptions, branch-level permissions, and dashboard reporting enables efficient member lifecycle management. Following the documented endpoints, schemas, and examples ensures reliable integration and operation.

## Appendices

### Role-Based Access Control Summary
- JwtAuthGuard: Applied to all member endpoints requiring authentication.
- RolesGuard: Enforced for admin endpoints requiring ADMIN or SUPERADMIN roles.
- BranchAccessGuard: Ensures branch administrators can only access their own branch data.

**Section sources**
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:1-42](file://src/auth/guards/roles.guard.ts#L1-L42)
- [branch-access.guard.ts:1-73](file://src/auth/guards/branch-access.guard.ts#L1-L73)
- [role.enum.ts:1-7](file://src/common/enums/role.enum.ts#L1-L7)

### Subscription Status Calculation
Subscription status is determined by comparing the current date with the subscription end date, treating the end date as the end of that day.

**Section sources**
- [subscription.util.ts:1-16](file://src/common/utils/subscription.util.ts#L1-L16)