# Remaining Features & Missing Implementations

**Project:** NestJS Gym Management Backend
**Project Maturity:** ~75% Complete
**Last Updated:** 2026-03-30

---

## Table of Contents

1. [Incomplete Module Implementations](#1-incomplete-module-implementations)
2. [Missing Core Features](#2-missing-core-features)
3. [Security & Production Hardening](#3-security--production-hardening)
4. [Testing & Quality Assurance](#4-testing--quality-assurance)
5. [Infrastructure & DevOps](#5-infrastructure--devops)
6. [API Enhancements](#6-api-enhancements)
7. [User Experience & Reporting](#7-user-experience--reporting)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Priority Matrix](#9-priority-matrix)

---

## 1. Incomplete Module Implementations

### 1.1 Exercise Library Module ✅ Completed

**Implemented:** Entity, Service, Controller, Module with full CRUD.

- Entity: `src/entities/exercise_library.entity.ts` (UUID PK, global scope)
- Module: `src/exercise-library/` (controller, service, DTOs)
- Admin-only write access (SUPERADMIN, ADMIN)
- Filter by body_part, exercise_type, difficulty_level, search
- Registered in `app.module.ts`

**Endpoints:**
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/exercise-library` | Admin | Create exercise |
| GET | `/exercise-library` | Auth | List exercises (filtered) |
| GET | `/exercise-library/:id` | Auth | Get exercise |
| PATCH | `/exercise-library/:id` | Admin | Update exercise |
| DELETE | `/exercise-library/:id` | Admin | Delete exercise |

---

### 1.2 Meal Library Module ✅ Completed

**Implemented:** Entity, Service, Controller, Module with full CRUD.

- Entity: `src/entities/meal_library.entity.ts` (UUID PK, global scope)
- Module: `src/meal-library/` (controller, service, DTOs)
- Admin + Trainer write access
- Basic macros: calories, protein_g, carbs_g, fat_g
- Filter by meal_type, search by name
- Registered in `app.module.ts`

**Endpoints:**
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/meal-library` | Admin/Trainer | Create meal |
| GET | `/meal-library` | Auth | List meals (filtered) |
| GET | `/meal-library/:id` | Auth | Get meal |
| PATCH | `/meal-library/:id` | Admin/Trainer | Update meal |
| DELETE | `/meal-library/:id` | Admin/Trainer | Delete meal |

---

### 1.3 Upload Module 🟡 High

**Current State:** Module exists with endpoints defined but MinIO integration is incomplete. Configuration present in `src/config/minio.config.ts` but full integration with file validation and access control needs verification.

**Missing/Needs Verification:**

- End-to-end MinIO connectivity testing
- File type validation (MIME type checking)
- File size limits enforcement
- Image compression/resizing for progress photos
- Bulk upload support
- File access audit logging
- CDN URL generation for public assets
- Cleanup job for orphaned files

---

### 1.4 Reminders Module 🟡 High

**Current State:** Basic module exists with manual reminder sending and cron job scaffolding.

**Missing:**

- Configurable reminder schedules (per-gym settings)
- Multi-channel delivery (email + SMS + push)
- Reminder templates customization
- Unsubscribe/opt-out mechanism
- Reminder delivery status tracking
- Batch reminder processing for large member bases
- Reminder analytics (open rates, click-through)

---

### 1.5 Renewals Module 🟡 High

**Current State:** Basic CRUD for renewal requests exists.

**Missing:**

- Auto-renewal processing with payment integration
- Renewal notification workflow
- Grace period handling after subscription expiry
- Renewal discount/loyalty pricing
- Renewal history and reporting
- Bulk renewal processing
- Renewal approval workflow (admin review)

---

## 2. Missing Core Features

### 2.1 Password Reset Flow 🔴 Critical

**Current State:** No password reset functionality exists. Users can only change password when logged in (`POST /users/change-password`).

**Missing:**

- `POST /auth/forgot-password` - Request reset via email
- `POST /auth/reset-password` - Reset with token
- Reset token generation and storage
- Token expiration (e.g., 15 minutes)
- Reset email template
- Rate limiting on reset requests
- Audit logging for password changes

---

### 2.2 User Registration / Self-Signup 🔴 Critical

**Current State:** Users can only be created by admins (`POST /users`). No public registration endpoint.

**Missing:**

- `POST /auth/register` - Public registration endpoint
- Email verification flow
- Phone number verification (OTP)
- Role assignment on signup (default: MEMBER)
- Terms of service acceptance tracking
- Duplicate account prevention
- Account activation email

---

### 2.3 Session Management 🟡 High

**Current State:** Stateless JWT authentication with no session tracking.

**Missing:**

- Refresh token mechanism (access + refresh token pair)
- Token blacklisting on logout
- Active session listing per user
- Force logout (admin capability)
- Device tracking (IP, user agent)
- Concurrent session limits
- Token rotation on refresh

---

### 2.4 WebSocket / Real-Time Notifications 🟡 High

**Current State:** Notifications are stored in DB and fetched via REST polling. No real-time push.

**Missing:**

- WebSocket gateway (`@nestjs/websockets`)
- Real-time notification delivery
- Live attendance updates
- Real-time class schedule changes
- Trainer-member chat capability
- Push notification service (FCM/APNs)
- Notification preferences per user

---

### 2.5 Email Notification Service 🟡 High

**Current State:** `nodemailer` is in `package.json` dependencies but no email service implementation exists.

**Missing:**

- Email service module (`src/email/`)
- SMTP configuration
- Email templates (welcome, reset, renewal, expiry, birthday)
- Email queue processing
- Email delivery status tracking
- Unsubscribe link handling
- Email preference management per user

---

### 2.6 Member Portal Features 🟠 Medium

**Current State:** Member dashboard endpoint exists but limited self-service capabilities.

**Missing:**

- Member self-service profile editing (beyond basic)
- Class booking/reservation system
- Personal workout history viewer
- Diet plan viewer with daily meal tracking
- Progress photo gallery
- Goal progress self-reporting
- Trainer feedback/messaging
- Subscription management (view, renew)
- Invoice/payment history viewer

---

### 2.7 Class Booking System 🟠 Medium

**Current State:** Classes can be created with recurrence patterns. No booking/enrollment system.

**Missing:**

- `POST /classes/:classId/book` - Book a class slot
- `DELETE /classes/:classId/booking/:id` - Cancel booking
- `GET /classes/:classId/availability` - Check available spots
- Capacity management (max participants)
- Waitlist functionality
- Booking notifications and reminders
- No-show tracking
- Recurring class instance generation

---

### 2.8 Trainer Schedule Management 🟠 Medium

**Current State:** Trainers can be assigned to classes and members. No dedicated schedule view.

**Missing:**

- `GET /trainers/:id/schedule` - Weekly/monthly schedule view
- Availability management (blocked time slots)
- Schedule conflict detection
- Client session calendar
- Schedule sharing with members
- Break time management
- Overtime tracking

---

## 3. Security & Production Hardening

### 3.1 Rate Limiting 🔴 Critical

**Current State:** No rate limiting on any endpoint.

**Missing:**

- Global rate limiting (`@nestjs/throttler`)
- Per-endpoint rate limits (stricter on auth endpoints)
- IP-based throttling
- User-based throttling
- Rate limit headers (`X-RateLimit-*`)
- Custom rate limit response formatting
- Whitelist for internal services

---

### 3.2 Security Headers 🔴 Critical

**Current State:** No security middleware configured.

**Missing:**

- Helmet.js integration
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy

---

### 3.3 Input Sanitization 🔴 Critical

**Current State:** class-validator for DTO validation only. No additional sanitization.

**Missing:**

- HTML sanitization for text fields
- SQL injection prevention hardening (beyond parameterized queries)
- XSS prevention for stored content
- Request body size limits (configured)
- File upload content scanning
- Custom validation pipes for complex business rules

---

### 3.4 CORS Configuration 🟡 High

**Current State:** CORS env variable exists but configuration may be incomplete.

**Missing:**

- Strict origin whitelist
- Credential handling configuration
- Preflight caching
- Method/header restrictions per origin

---

### 3.5 API Key Authentication 🟠 Medium

**Current State:** Only JWT Bearer token authentication.

**Missing:**

- API key generation and management
- API key authentication for service-to-service calls
- Key rotation mechanism
- Key scoping (read-only, specific modules)
- API key usage analytics

---

### 3.6 Audit Log Completeness 🟠 Medium

**Current State:** Audit log module exists but may not capture all mutations.

**Missing:**

- Automatic audit logging via interceptor
- Before/after value capture for all updates
- Bulk operation auditing
- Audit log retention policy
- Audit log export
- Compliance reporting (who did what, when)

---

## 4. Testing & Quality Assurance

### 4.1 Unit Tests 🔴 Critical

**Current State:** Only 1 test file (`src/app.controller.spec.ts`) out of ~150 source files. **0.67% coverage.**

**Missing Unit Tests For:**

- All 32 module services
- All 32 module controllers
- All guards (JWT, Roles, Branch Access)
- All DTOs validation
- Utility functions (phone, subscription)
- Entity relationships and constraints
- Custom decorators
- Interceptors

**Target Coverage:** 80%+ line coverage

---

### 4.2 Integration Tests 🔴 Critical

**Current State:** No integration tests exist.

**Missing:**

- Database integration tests (TypeORM repository tests)
- Auth flow integration tests
- API endpoint integration tests
- External service integration tests (MinIO, Twilio)
- Cascade delete behavior tests
- Transaction rollback tests

---

### 4.3 E2E Tests 🔴 Critical

**Current State:** E2E test infrastructure exists (`test/jest-e2e.json`) but no test files.

**Missing:**

- Critical user journey tests:
  - Member registration → subscription → attendance
  - Trainer assignment → workout plan → progress tracking
  - Inquiry → conversion → membership
  - Payment flow (invoice → payment → receipt)
- Auth flow E2E tests
- Multi-tenant isolation tests
- Error scenario coverage

---

### 4.4 Load/Performance Tests 🟠 Medium

**Current State:** No performance testing.

**Missing:**

- API response time benchmarks
- Concurrent user load testing
- Database query performance analysis
- Memory leak detection
- Connection pool stress testing
- Large dataset pagination performance

---

## 5. Infrastructure & DevOps

### 5.1 Database Migrations 🔴 Critical

**Current State:** Using `synchronize: true` in `dbConfig.ts` which auto-migrates schema on startup. **This causes data loss in production.**

**Missing:**

- Disable `synchronize: true` for production
- TypeORM migration files for all 40 entities
- Migration generation scripts
- Migration rollback procedures
- Seed data scripts (beyond `seed_gym_Fitness_First_Elte.ts`)
- Data migration testing

---

### 5.2 Soft Delete Support 🟡 High

**Current State:** All deletes are permanent (hard delete with CASCADE). 15 cascade relationships identified.

**Missing:**

- Soft delete implementation on critical entities (Members, Trainers, Users)
- `deletedAt` timestamp columns
- Exclude soft-deleted records from queries (global scopes)
- Restore endpoints
- Permanent delete (admin-only, with confirmation)
- Cascade soft-delete propagation
- Soft delete-aware unique constraints

---

### 5.3 Health Checks & Monitoring 🟡 High

**Current State:** Basic health endpoint exists (`GET /upload/health/check`).

**Missing:**

- Comprehensive health check module (`@nestjs/terminus`)
- Database connectivity check
- MinIO connectivity check
- External service health (Twilio)
- Memory/CPU usage reporting
- Readiness vs liveness probes (Kubernetes)
- Prometheus metrics endpoint
- Structured logging (JSON format)
- Error tracking integration (Sentry/Bugsnag)

---

### 5.4 Environment Configuration 🟡 High

**Current State:** `.env` and `.env.example` exist.

**Missing:**

- Configuration validation on startup (required vs optional)
- Environment-specific configs (dev, staging, prod)
- Secret management integration (Vault, AWS Secrets Manager)
- Configuration schema documentation
- Runtime config hot-reloading for non-critical settings

---

### 5.5 Docker & Deployment 🟠 Medium

**Current State:** No Docker or deployment configuration files.

**Missing:**

- Dockerfile (multi-stage build)
- docker-compose.yml (app + PostgreSQL + MinIO)
- Kubernetes manifests
- CI/CD pipeline configuration
- Blue-green deployment support
- Database backup automation
- Disaster recovery procedures

---

## 6. API Enhancements

### 6.1 Pagination 🔴 Critical

**Current State:** Most LIST endpoints return all records without pagination.

**Missing:**

- Cursor-based or offset pagination on all list endpoints
- Configurable page size (default: 20, max: 100)
- Pagination metadata in responses (total, page, totalPages)
- Sort parameters (sortBy, sortOrder)
- Consistent pagination DTO across all modules

**Affected Endpoints:** ~30+ list endpoints across all modules

---

### 6.2 API Versioning 🟠 Medium

**Current State:** No API versioning. All endpoints at root path.

**Missing:**

- URL-based versioning (`/v1/`, `/v2/`)
- Header-based versioning support
- Deprecation notices for old versions
- Version-specific documentation
- Migration guides between versions

---

### 6.3 Bulk Operations 🟠 Medium

**Current State:** All operations are single-entity.

**Missing:**

- Bulk member import (CSV/Excel)
- Bulk member update
- Bulk subscription creation
- Bulk attendance marking
- Bulk notification sending
- Bulk assignment operations
- Import validation and error reporting

---

### 6.4 Export & Reporting 🟠 Medium

**Current State:** No data export capabilities.

**Missing:**

- CSV export for members, attendance, payments
- PDF report generation (invoices, attendance sheets)
- Excel export with formatting
- Scheduled report generation (cron)
- Report customization (date ranges, filters)
- Email delivery of scheduled reports
- Dashboard data export

---

### 6.5 Search Functionality 🟠 Medium

**Current State:** Basic search/filter on some endpoints (name-based).

**Missing:**

- Full-text search across entities
- Advanced filter combinations
- Search suggestions/autocomplete
- Search history
- Saved search filters per user
- Elasticsearch/MeiliSearch integration

---

## 7. User Experience & Reporting

### 7.1 Advanced Analytics 🟡 High

**Current State:** Basic dashboard analytics exist (member counts, revenue, attendance).

**Missing:**

- Revenue forecasting
- Member retention/churn analysis
- Class popularity analytics
- Trainer performance metrics
- Peak hours analysis
- Member engagement scoring
- Comparative analytics (month-over-month, year-over-year)
- Custom date range reports
- Analytics export/download

---

### 7.2 Member Attendance Calendar 🟠 Medium

**Current State:** Attendance records exist with streak calculation.

**Missing:**

- Visual calendar view of attendance
- Attendance heatmap
- Streak leaderboard
- Attendance goals with rewards
- Missed day notifications
- Attendance pattern analysis

---

### 7.3 Financial Reporting 🟠 Medium

**Current State:** Basic payment summary endpoint exists.

**Missing:**

- Profit & loss reports
- Revenue by membership plan
- Outstanding dues report
- Refund tracking report
- Tax calculation and reporting
- Financial year summaries
- Commission tracking for trainers

---

## 8. Third-Party Integrations

### 8.1 Payment Gateway Integration 🔴 Critical

**Current State:** Payments are manually recorded. No actual payment gateway integration.

**Missing:**

- Stripe/Razorpay/PayPal integration
- Online payment processing
- Recurring payment automation
- Payment webhook handling
- Payment link generation
- Refund processing via gateway
- Payment receipt generation
- Multi-currency support

---

### 8.2 SMS Notifications 🟡 High

**Current State:** Twilio is configured for OTP only.

**Missing:**

- SMS for membership expiry reminders
- SMS for payment confirmations
- SMS for class bookings
- SMS for promotional campaigns
- SMS template management
- SMS delivery status tracking
- Opt-in/opt-out management

---

### 8.3 Google Maps Integration 🟠 Medium

**Current State:** Gym/Branch entities have latitude/longitude fields.

**Missing:**

- Geocoding (address to coordinates)
- Reverse geocoding
- Nearby gym search (radius-based)
- Distance calculation for member recommendations
- Map display data endpoints

---

### 8.4 Calendar Integration 🟠 Medium

**Current State:** No external calendar integration.

**Missing:**

- Google Calendar sync for classes
- iCal export for schedules
- Calendar event creation for bookings
- Schedule change notifications to calendar
- Trainer calendar sync

---

## 9. Priority Matrix

### 🔴 P0 - Critical (Must have for production)

| Feature                                | Module/Area      | Estimated Effort |
| -------------------------------------- | ---------------- | ---------------- |
| Exercise Library (full implementation) | exercise-library | 2-3 days         |
| Meal Library (full implementation)     | New module       | 2-3 days         |
| Password Reset Flow                    | auth             | 1-2 days         |
| Rate Limiting                          | Global           | 1 day            |
| Security Headers (Helmet)              | Global           | 0.5 day          |
| Input Sanitization                     | Global           | 1-2 days         |
| Database Migrations                    | database         | 3-5 days         |
| Pagination on all endpoints            | All modules      | 2-3 days         |
| Unit Tests (core modules)              | Testing          | 5-10 days        |
| Integration Tests                      | Testing          | 3-5 days         |
| Payment Gateway Integration            | payments         | 5-7 days         |

### 🟡 P1 - High (Should have before production)

| Feature                             | Module/Area    | Estimated Effort |
| ----------------------------------- | -------------- | ---------------- |
| User Registration                   | auth           | 2-3 days         |
| Session Management (refresh tokens) | auth           | 2-3 days         |
| Email Notification Service          | New module     | 3-5 days         |
| WebSocket Real-Time Notifications   | notifications  | 3-5 days         |
| Soft Delete                         | All modules    | 3-5 days         |
| Health Checks & Monitoring          | Infrastructure | 2-3 days         |
| Reminders (enhanced)                | reminders      | 2-3 days         |
| Renewals (enhanced)                 | renewals       | 2-3 days         |
| Upload Module (complete)            | upload         | 1-2 days         |
| CORS Configuration                  | Global         | 0.5 day          |
| Advanced Analytics                  | analytics      | 3-5 days         |
| SMS Notifications (beyond OTP)      | notifications  | 2-3 days         |

### 🟠 P2 - Medium (Nice to have)

| Feature                      | Module/Area | Estimated Effort |
| ---------------------------- | ----------- | ---------------- |
| Class Booking System         | classes     | 3-5 days         |
| Trainer Schedule Management  | trainers    | 2-3 days         |
| Member Portal (self-service) | members     | 5-7 days         |
| API Versioning               | Global      | 1-2 days         |
| Bulk Operations              | All modules | 3-5 days         |
| Export & Reporting           | New module  | 3-5 days         |
| Search (full-text)           | Global      | 2-3 days         |
| E2E Tests                    | Testing     | 3-5 days         |
| Docker & Deployment          | DevOps      | 2-3 days         |
| Financial Reporting          | analytics   | 2-3 days         |
| Google Maps Integration      | gyms        | 1-2 days         |
| Calendar Integration         | classes     | 2-3 days         |
| Load Testing                 | Testing     | 2-3 days         |
| API Key Authentication       | auth        | 1-2 days         |

---

## Summary Statistics

| Category                 | Total Items | Critical | High   | Medium |
| ------------------------ | ----------- | -------- | ------ | ------ |
| Incomplete Modules       | 5           | 2        | 3      | 0      |
| Missing Core Features    | 8           | 3        | 3      | 2      |
| Security & Production    | 6           | 3        | 2      | 1      |
| Testing & QA             | 4           | 3        | 0      | 1      |
| Infrastructure & DevOps  | 5           | 1        | 2      | 2      |
| API Enhancements         | 5           | 1        | 0      | 4      |
| UX & Reporting           | 3           | 0        | 1      | 2      |
| Third-Party Integrations | 4           | 1        | 1      | 2      |
| **Total**                | **40**      | **14**   | **12** | **14** |

---

## Existing Implemented Modules (Reference)

These modules are fully implemented with controllers, services, DTOs, and entities:

- Auth (JWT login, OTP)
- Users (CRUD)
- Gyms & Branches (multi-tenant)
- Members (CRUD + dashboard)
- Trainers (CRUD)
- Classes (with recurrence)
- Membership Plans
- Subscriptions (with cancellation)
- Assignments (member-trainer)
- Attendance (check-in/out + streaks)
- Audit Logs
- Analytics (dashboards)
- Roles (RBAC)
- Invoices
- Payments (manual recording)
- Inquiries (lead management)
- Diet Plans + Templates + Assignments
- Workout Plans + Templates + Assignments
- Workout Logs
- Body Progress
- Goals + Schedules + Templates
- Template Assignments & Shares
- Notifications (REST-based)
- Progress Tracking
- Renewals (basic)
- Reminders (basic)
- Upload (partial)
