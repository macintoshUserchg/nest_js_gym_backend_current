# Authentication API

<cite>
**Referenced Files in This Document**
- [auth.controller.ts](file://src/auth/auth.controller.ts)
- [auth.service.ts](file://src/auth/auth.service.ts)
- [auth.module.ts](file://src/auth/auth.module.ts)
- [jwt.config.ts](file://src/auth/config/jwt.config.ts)
- [jwt.strategy.ts](file://src/auth/strategies/jwt.strategy.ts)
- [jwt-auth.guard.ts](file://src/auth/guards/jwt-auth.guard.ts)
- [roles.guard.ts](file://src/auth/guards/roles.guard.ts)
- [branch-access.guard.ts](file://src/auth/guards/branch-access.guard.ts)
- [roles.decorator.ts](file://src/auth/decorators/roles.decorator.ts)
- [current-user.decorator.ts](file://src/auth/decorators/current-user.decorator.ts)
- [login-user.dto.ts](file://src/auth/dto/login-user.dto.ts)
- [login-response.dto.ts](file://src/auth/dto/login-response.dto.ts)
- [request-mobile-otp.dto.ts](file://src/auth/dto/request-mobile-otp.dto.ts)
- [verify-mobile-otp.dto.ts](file://src/auth/dto/verify-mobile-otp.dto.ts)
- [users.service.ts](file://src/users/users.service.ts)
- [phone.util.ts](file://src/common/utils/phone.util.ts)
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
This document describes the Authentication API endpoints and JWT token management for the application. It covers login, logout, mobile OTP verification, and related flows. It also documents request/response schemas, validation rules, guards, role-based access control, session management, and security headers. Practical examples include curl commands and JavaScript fetch implementations for common flows.

## Project Structure
The authentication module is organized around a controller, service, guards, strategies, DTOs, and configuration. The module integrates with the users service and external OTP provider (Twilio) for mobile verification.

```mermaid
graph TB
subgraph "Auth Module"
AC["AuthController<br/>POST /auth/login<br/>POST /auth/logout<br/>POST /auth/otp/mobile/request<br/>POST /auth/otp/mobile/verify"]
AS["AuthService<br/>validateUser()<br/>login()<br/>requestMobileOtp()<br/>verifyMobileOtp()"]
JSG["JwtAuthGuard"]
RG["RolesGuard"]
BG["BranchAccessGuard"]
JS["JwtStrategy"]
JC["jwt.config.ts"]
D1["LoginUserDto"]
D2["LoginResponseDto"]
D3["RequestMobileOtpDto"]
D4["VerifyMobileOtpDto"]
end
subgraph "External Services"
TW["Twilio Verify"]
US["UsersService"]
PU["PhoneUtil.normalizePhoneNumber"]
end
AC --> AS
AS --> US
AS --> TW
AS --> PU
AC --> D1
AC --> D2
AC --> D3
AC --> D4
AC --> JSG
AC --> RG
AC --> BG
JS --> JC
```

**Diagram sources**
- [auth.controller.ts:23-154](file://src/auth/auth.controller.ts#L23-L154)
- [auth.service.ts:14-163](file://src/auth/auth.service.ts#L14-L163)
- [jwt.strategy.ts:10-25](file://src/auth/strategies/jwt.strategy.ts#L10-L25)
- [jwt.config.ts:4-12](file://src/auth/config/jwt.config.ts#L4-L12)
- [login-user.dto.ts:4-17](file://src/auth/dto/login-user.dto.ts#L4-L17)
- [login-response.dto.ts:3-15](file://src/auth/dto/login-response.dto.ts#L3-L15)
- [request-mobile-otp.dto.ts:4-12](file://src/auth/dto/request-mobile-otp.dto.ts#L4-L12)
- [verify-mobile-otp.dto.ts:4-20](file://src/auth/dto/verify-mobile-otp.dto.ts#L4-L20)

**Section sources**
- [auth.controller.ts:23-154](file://src/auth/auth.controller.ts#L23-L154)
- [auth.service.ts:14-163](file://src/auth/auth.service.ts#L14-L163)
- [auth.module.ts:11-21](file://src/auth/auth.module.ts#L11-L21)

## Core Components
- AuthController: Exposes endpoints for login, logout, and mobile OTP request/verify.
- AuthService: Implements user validation, JWT signing, and OTP lifecycle via Twilio.
- Guards: JwtAuthGuard for bearer token validation, RolesGuard for role checks, BranchAccessGuard for branch/gym scoping.
- Strategies: JwtStrategy extracts and validates JWT from Authorization header.
- DTOs: Strongly typed request/response schemas with validation rules.
- Configuration: JWT secret and expiration loaded from environment via jwt.config.

**Section sources**
- [auth.controller.ts:23-154](file://src/auth/auth.controller.ts#L23-L154)
- [auth.service.ts:14-163](file://src/auth/auth.service.ts#L14-L163)
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:12-41](file://src/auth/guards/roles.guard.ts#L12-L41)
- [branch-access.guard.ts:14-72](file://src/auth/guards/branch-access.guard.ts#L14-L72)
- [jwt.strategy.ts:10-25](file://src/auth/strategies/jwt.strategy.ts#L10-L25)
- [jwt.config.ts:4-12](file://src/auth/config/jwt.config.ts#L4-L12)
- [login-user.dto.ts:4-17](file://src/auth/dto/login-user.dto.ts#L4-L17)
- [login-response.dto.ts:3-15](file://src/auth/dto/login-response.dto.ts#L3-L15)
- [request-mobile-otp.dto.ts:4-12](file://src/auth/dto/request-mobile-otp.dto.ts#L4-L12)
- [verify-mobile-otp.dto.ts:4-20](file://src/auth/dto/verify-mobile-otp.dto.ts#L4-L20)

## Architecture Overview
The authentication flow integrates three primary paths:
- Email/password login: Validates credentials, signs JWT, returns access token.
- Mobile OTP login: Sends OTP via Twilio, verifies OTP, signs JWT.
- Logout: Acknowledges client-side token discard.

```mermaid
sequenceDiagram
participant C as "Client"
participant AC as "AuthController"
participant AS as "AuthService"
participant US as "UsersService"
participant TW as "Twilio Verify"
rect rgb(255,255,255)
Note over C,AC : "Email/Password Login"
C->>AC : "POST /auth/login {email,password}"
AC->>AS : "validateUser(email,password)"
AS->>US : "findByEmail(email)"
US-->>AS : "User"
AS->>AS : "bcrypt.compare(password, hash)"
AS-->>AC : "User without passwordHash"
AC->>AS : "login(user)"
AS-->>AC : "access_token"
AC-->>C : "{userid, access_token}"
end
rect rgb(255,255,255)
Note over C,AC : "Mobile OTP Request"
C->>AC : "POST /auth/otp/mobile/request {phoneNumber}"
AC->>AS : "requestMobileOtp(phoneNumber)"
AS->>US : "findOtpEligibleUserByPhone()"
AS->>TW : "verify.v2.services(...).verifications.create()"
TW-->>AS : "OK"
AS-->>AC : "{message, phoneNumber}"
AC-->>C : "{message, phoneNumber}"
end
rect rgb(255,255,255)
Note over C,AC : "Mobile OTP Verify"
C->>AC : "POST /auth/otp/mobile/verify {phoneNumber, code}"
AC->>AS : "verifyMobileOtp(phoneNumber, code)"
AS->>TW : "verificationChecks.create()"
TW-->>AS : "status"
AS->>US : "findOtpEligibleUserByPhone()"
AS->>AS : "login(user)"
AS-->>AC : "{userid, access_token}"
AC-->>C : "{userid, access_token}"
end
```

**Diagram sources**
- [auth.controller.ts:75-127](file://src/auth/auth.controller.ts#L75-L127)
- [auth.service.ts:31-118](file://src/auth/auth.service.ts#L31-L118)
- [users.service.ts](file://src/users/users.service.ts)
- [phone.util.ts](file://src/common/utils/phone.util.ts)

## Detailed Component Analysis

### Endpoints and Schemas

#### POST /auth/login
- Description: Authenticate user with email and password. Returns JWT access token.
- Security: No authentication required for this endpoint.
- Request body: LoginUserDto
  - email: string, required, must be a valid email format
  - password: string, required, must be non-empty
- Response: LoginResponseDto
  - userid: string, user identifier
  - access_token: string, JWT signed token
- Success response: 200 OK
- Error responses: 401 Unauthorized (invalid credentials)

Example request payload:
{
  "email": "member@example.com",
  "password": "SecurePassword123!"
}

Example success response:
{
  "userid": "usr_1234567890abcdef",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

curl example:
curl -X POST https://your-api.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"SecurePassword123!"}'

JavaScript fetch example:
fetch("https://your-api.com/auth/login", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({email: "member@example.com", password: "SecurePassword123!"})
})
.then(res => res.json())
.then(data => console.log(data));

**Section sources**
- [auth.controller.ts:27-88](file://src/auth/auth.controller.ts#L27-L88)
- [login-user.dto.ts:4-17](file://src/auth/dto/login-user.dto.ts#L4-L17)
- [login-response.dto.ts:3-15](file://src/auth/dto/login-response.dto.ts#L3-L15)

#### POST /auth/logout
- Description: Acknowledge logout. Client should discard the token.
- Security: Requires a valid JWT bearer token.
- Request body: none
- Response: 200 OK with message
- Success response: 200 OK
- Error responses: 401 Unauthorized (invalid/expired token)

curl example:
curl -X POST https://your-api.com/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

JavaScript fetch example:
fetch("https://your-api.com/auth/logout", {
  method: "POST",
  headers: {"Authorization": "Bearer eyJhb..."}
})

**Section sources**
- [auth.controller.ts:129-153](file://src/auth/auth.controller.ts#L129-L153)

#### POST /auth/otp/mobile/request
- Description: Send an OTP to a mobile number registered for OTP login.
- Security: No authentication required for this endpoint.
- Request body: RequestMobileOtpDto
  - phoneNumber: string, required, must be non-empty
- Response: 200 OK with message and normalized phoneNumber
- Error responses: 400 Bad Request (invalid/missing parameters), 401 Unauthorized (no eligible account), 503 Service Unavailable (Twilio misconfigured/unavailable)

curl example:
curl -X POST https://your-api.com/auth/otp/mobile/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210"}'

**Section sources**
- [auth.controller.ts:90-109](file://src/auth/auth.controller.ts#L90-L109)
- [request-mobile-otp.dto.ts:4-12](file://src/auth/dto/request-mobile-otp.dto.ts#L4-L12)
- [auth.service.ts:53-80](file://src/auth/auth.service.ts#L53-L80)

#### POST /auth/otp/mobile/verify
- Description: Verify the OTP and return a JWT access token for eligible users.
- Security: No authentication required for this endpoint.
- Request body: VerifyMobileOtpDto
  - phoneNumber: string, required, must be non-empty
  - code: string, required, length 4-10
- Response: LoginResponseDto
- Error responses: 400 Bad Request (invalid/missing parameters), 401 Unauthorized (invalid/expired OTP or not eligible), 503 Service Unavailable (Twilio misconfigured/unavailable)

curl example:
curl -X POST https://your-api.com/auth/otp/mobile/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","code":"123456"}'

**Section sources**
- [auth.controller.ts:111-127](file://src/auth/auth.controller.ts#L111-L127)
- [verify-mobile-otp.dto.ts:4-20](file://src/auth/dto/verify-mobile-otp.dto.ts#L4-L20)
- [auth.service.ts:82-118](file://src/auth/auth.service.ts#L82-L118)

### JWT Token Management
- Token generation: Signed JWT with subject (userId), email, and role.
- Validation: From Authorization header as Bearer token.
- Expiration: Controlled by JWT_EXPIRES_IN environment variable.
- Payload shape: See AuthJwtPayload type.

```mermaid
flowchart TD
Start(["Login or OTP Verify"]) --> BuildPayload["Build JWT payload<br/>sub, email, role"]
BuildPayload --> Sign["Sign with JWT secret"]
Sign --> ReturnToken["Return access_token"]
ReturnToken --> UseToken["Client stores token"]
UseToken --> Validate["Server validates via JwtStrategy"]
Validate --> Authorized["Authorized request"]
```

**Diagram sources**
- [auth.service.ts:44-51](file://src/auth/auth.service.ts#L44-L51)
- [jwt.strategy.ts:22-24](file://src/auth/strategies/jwt.strategy.ts#L22-L24)
- [jwt.config.ts:6-10](file://src/auth/config/jwt.config.ts#L6-L10)
- [auth-jwtPayload.d.ts:1-6](file://src/auth/types/auth-jwtPayload.d.ts#L1-L6)

**Section sources**
- [auth.service.ts:44-51](file://src/auth/auth.service.ts#L44-L51)
- [jwt.strategy.ts:22-24](file://src/auth/strategies/jwt.strategy.ts#L22-L24)
- [jwt.config.ts:6-10](file://src/auth/config/jwt.config.ts#L6-L10)
- [auth-jwtPayload.d.ts:1-6](file://src/auth/types/auth-jwtPayload.d.ts#L1-L6)

### Guards and Access Control
- JwtAuthGuard: Ensures a valid JWT is present and unexpired.
- RolesGuard: Enforces role-based access using @Roles decorator.
- BranchAccessGuard: Restricts admins to their own gym/branch when required.

```mermaid
flowchart TD
Req["Incoming Request"] --> HasJWT{"Has Bearer Token?"}
HasJWT --> |No| Unauthorized["401 Unauthorized"]
HasJWT --> |Yes| Validate["JwtStrategy.validate()"]
Validate --> Roles{"@Roles required?"}
Roles --> |No| Allow["Allow"]
Roles --> |Yes| CheckRole["Check user role vs required roles"]
CheckRole --> Allowed{"Allowed?"}
Allowed --> |Yes| Allow
Allowed --> |No| Forbidden["403 Forbidden"]
```

**Diagram sources**
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:16-40](file://src/auth/guards/roles.guard.ts#L16-L40)
- [roles.decorator.ts:5-7](file://src/auth/decorators/roles.decorator.ts#L5-L7)
- [jwt.strategy.ts:22-24](file://src/auth/strategies/jwt.strategy.ts#L22-L24)

**Section sources**
- [jwt-auth.guard.ts:1-6](file://src/auth/guards/jwt-auth.guard.ts#L1-L6)
- [roles.guard.ts:12-41](file://src/auth/guards/roles.guard.ts#L12-L41)
- [branch-access.guard.ts:14-72](file://src/auth/guards/branch-access.guard.ts#L14-L72)
- [roles.decorator.ts:5-7](file://src/auth/decorators/roles.decorator.ts#L5-L7)
- [jwt.strategy.ts:22-24](file://src/auth/strategies/jwt.strategy.ts#L22-L24)

### Decorators
- @CurrentUser: Provides the authenticated user object on the request.
- @Roles(...): Declares required roles for a route or controller.

**Section sources**
- [current-user.decorator.ts:4-9](file://src/auth/decorators/current-user.decorator.ts#L4-L9)
- [roles.decorator.ts:5-7](file://src/auth/decorators/roles.decorator.ts#L5-L7)

## Dependency Analysis
- AuthController depends on AuthService and DTOs.
- AuthService depends on UsersService, Twilio SDK, and phone normalization utility.
- Guards depend on Reflector and user context.
- JwtStrategy depends on jwt.config for secret and expiration.

```mermaid
graph LR
AC["AuthController"] --> AS["AuthService"]
AC --> D1["LoginUserDto"]
AC --> D2["LoginResponseDto"]
AC --> D3["RequestMobileOtpDto"]
AC --> D4["VerifyMobileOtpDto"]
AS --> US["UsersService"]
AS --> PU["PhoneUtil.normalizePhoneNumber"]
AC --> JSG["JwtAuthGuard"]
AC --> RG["RolesGuard"]
AC --> BG["BranchAccessGuard"]
JS["JwtStrategy"] --> JC["jwt.config.ts"]
```

**Diagram sources**
- [auth.controller.ts:16-20](file://src/auth/auth.controller.ts#L16-L20)
- [auth.service.ts:18-29](file://src/auth/auth.service.ts#L18-L29)
- [jwt.strategy.ts:11-19](file://src/auth/strategies/jwt.strategy.ts#L11-L19)

**Section sources**
- [auth.controller.ts:16-20](file://src/auth/auth.controller.ts#L16-L20)
- [auth.service.ts:18-29](file://src/auth/auth.service.ts#L18-L29)
- [jwt.strategy.ts:11-19](file://src/auth/strategies/jwt.strategy.ts#L11-L19)

## Performance Considerations
- Prefer short-lived JWTs (controlled by JWT_EXPIRES_IN) to minimize risk window.
- Use efficient hashing for passwords (bcrypt) and avoid synchronous blocking operations in hot paths.
- Cache frequently accessed user metadata when safe and appropriate.
- Monitor Twilio API latency and configure timeouts to prevent slow requests.

## Troubleshooting Guide
Common errors and resolutions:
- 401 Unauthorized
  - Invalid credentials during login.
  - Expired or malformed JWT token.
  - Invalid or expired OTP during mobile verification.
- 403 Forbidden
  - Insufficient roles for protected routes.
- 400 Bad Request
  - Missing or invalid fields in OTP request/verify.
- 503 Service Unavailable
  - Twilio not configured (missing environment variables).

Operational checks:
- Verify JWT_SECRET and JWT_EXPIRES_IN are set.
- Confirm TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID are configured for OTP features.
- Ensure phone numbers are normalized to E.164 format for OTP operations.

**Section sources**
- [auth.service.ts:31-42](file://src/auth/auth.service.ts#L31-L42)
- [auth.service.ts:53-80](file://src/auth/auth.service.ts#L53-L80)
- [auth.service.ts:82-118](file://src/auth/auth.service.ts#L82-L118)
- [auth.service.ts:120-140](file://src/auth/auth.service.ts#L120-L140)
- [roles.guard.ts:27-37](file://src/auth/guards/roles.guard.ts#L27-L37)

## Conclusion
The Authentication API provides secure, standards-compliant JWT-based authentication with optional mobile OTP verification. It enforces bearer token validation, supports role-based access control, and offers clear error semantics. Clients should store tokens securely and send them in the Authorization header for protected endpoints.

## Appendices

### Security Headers and Best Practices
- Authorization: Bearer <access_token> for protected endpoints.
- Content-Type: application/json for JSON payloads.
- HTTPS only in production.
- Rotate JWT_SECRET periodically.
- Implement rate limiting for login and OTP endpoints.

### Environment Variables
- JWT_SECRET: Secret key for signing JWTs.
- JWT_EXPIRES_IN: Expiration for JWTs (e.g., "1h").
- TWILIO_ACCOUNT_SID: Twilio account identifier.
- TWILIO_AUTH_TOKEN: Twilio authentication token.
- TWILIO_VERIFY_SERVICE_SID: Twilio Verify service SID.

**Section sources**
- [jwt.config.ts:6-10](file://src/auth/config/jwt.config.ts#L6-L10)
- [jwt.strategy.ts:15-19](file://src/auth/strategies/jwt.strategy.ts#L15-L19)
- [auth.service.ts:22-28](file://src/auth/auth.service.ts#L22-L28)