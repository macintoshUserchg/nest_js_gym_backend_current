# Gym Management System - Project Description

## Overview

A comprehensive gym management system built with NestJS and TypeScript, designed to handle multi-gym operations with branch management, member subscriptions, trainer assignments, class scheduling, attendance tracking, audit logging, financial management, and lead management.

## Technology Stack

### Backend Framework

- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.7** - Type-safe development
- **TypeORM 0.3** - ORM for database operations
- **PostgreSQL** - Primary database (Neon cloud database)

### Authentication & Security

- **Passport JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **JWT Guards** - Route protection

### API Documentation

- **Swagger/OpenAPI** - Interactive API documentation
- Auto-generated API specs at `/api` endpoint

### Validation & Transformation

- **class-validator** - DTO validation
- **class-transformer** - Data transformation

## Architecture

### Modular Structure

The application follows NestJS modular architecture with clear separation of concerns:

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── gyms/              # Gym & branch management
├── members/           # Member management
├── trainers/          # Trainer management
├── classes/           # Class scheduling
├── membership-plans/  # Subscription plans
├── subscriptions/     # Member subscriptions
├── assignments/       # Member-trainer assignments
├── attendance/        # Attendance tracking
├── audit-logs/        # System audit logging
├── diet-plans/        # Diet plan management
├── workout-logs/      # Workout log tracking
├── body-progress/     # Body progress monitoring
├── goals/             # Goal management
└── entities/          # TypeORM entities
```

### Design Patterns

- **Module Pattern** - Each feature is a self-contained module
- **Repository Pattern** - TypeORM repositories for data access
- **DTO Pattern** - Data Transfer Objects for validation
- **Guard Pattern** - JWT authentication guards
- **Service Layer** - Business logic separation
- **Entity-Relationship Pattern** - Comprehensive ORM mapping with TypeORM
- **API Resource Pattern** - RESTful endpoints for all entities

## Database Design

### Core Entities

#### User Management

- **users** - System users (UUID primary key)

  - Linked to gyms and branches
  - Role-based access control
  - Profile information
  - Links to member/trainer IDs for role associations

- **roles** - User role definitions (UUID primary key)
  - Predefined roles: SUPERADMIN, ADMIN, TRAINER, MEMBER
  - Eagerly loaded for authentication

#### Gym Operations

- **gyms** - Top-level gym organizations (UUID primary key)

  - Multi-gym support
  - Owner relationships
  - Contact information (email, phone, address, location)

- **branches** - Gym locations (UUID primary key)
  - Belongs to gym
  - Has managers, members, trainers, classes, inquiries
  - Contact information (email, phone, address, location, state)
  - Main branch designation

#### Member Management

- **members** - Gym members (auto-increment primary key)

  - Personal information (fullName, email, phone, gender, dateOfBirth)
  - Address details (addressLine1, addressLine2, city, state, postalCode)
  - Emergency contact information
  - Profile image (avatarUrl)
  - Active status tracking
  - Branch association
  - One-to-one subscription relationship

- **membership_plans** - Subscription plans (auto-increment primary key)

  - Pricing and duration
  - Branch-specific plans
  - Description field

- **member_subscriptions** - Active subscriptions (auto-increment primary key)
  - Start/end dates
  - Active status
  - Linked to member and plan

#### Trainer & Class Management

- **trainers** - Gym trainers (auto-increment primary key)

  - Personal information (fullName, email, phone)
  - Specialization
  - Profile image (avatarUrl)
  - Branch association

- **classes** - Class definitions (UUID primary key)

  - Branch-specific
  - Recurrence scheduling (daily/weekly/monthly)
  - Days of week configuration (array of integers)
  - Timings (morning/evening/both/either)

- **member_trainer_assignments** - Member-trainer relationships (UUID primary key)
  - Assignment periods (start_date, end_date)
  - Status tracking (active/ended)
  - Created timestamp

#### Lead Management

- **inquiries** - Potential member leads (auto-increment primary key)

  - Contact information (fullName, email, phone, alternatePhone)
  - Address details (addressLine1, addressLine2, city, state, postalCode)
  - Personal details (dateOfBirth, occupation, fitnessGoals)
  - Lead status tracking (new, contacted, qualified, converted, closed)
  - Lead source tracking (walk_in, referral, social_media, website, etc.)
  - Preferred membership type (basic, premium, vip, family, etc.)
  - Contact preferences (preferredContactMethod, preferredContactTime)
  - Gym experience tracking
  - Personal training interest
  - Referral code
  - Status timestamps (contactedAt, convertedAt, closedAt)

#### Attendance & Tracking

- **attendance** - Check-in/check-out records (UUID primary key)
  - Supports both members and trainers
  - Branch-specific
  - Timestamp tracking (checkInTime, checkOutTime, date)
  - Optional notes
  - Attendance type discriminator

#### Audit & Compliance

- **audit_logs** - System activity tracking (UUID primary key)
  - User actions
  - Entity changes (previous/new values as JSONB)
  - Timestamp tracking

#### Financial Management

- **invoices** - Billing records (UUID primary key)

  - Member and subscription associations
  - Amount and description
  - Due date tracking
  - Status (pending, paid, cancelled)

- **payment_transactions** - Payment tracking (UUID primary key)
  - Invoice association
  - Payment method (cash, card, online, bank_transfer)
  - Amount and reference
  - Status tracking (pending, completed, failed)
  - Timestamp

#### Notification System

- **notifications** - System notifications (UUID primary key)

  - User association
  - Title and message content
  - Read status tracking
  - Creation timestamp

#### Diet & Nutrition Management

- **diets** - Member diet plans (auto-increment primary key)

  - Member association
  - Assigned by user (gym owner or trainer)
  - Nutritional values (calories, protein, carbs, fat)
  - Meal plans (JSONB format)
  - Creation and update timestamps

#### Progress Tracking

- **workout_logs** - Member workout records (auto-increment primary key)

  - Member association
  - Optional trainer association
  - Exercise details (name, sets, reps, weight, duration)
  - Notes and date tracking

- **body_progress** - Member body measurements (auto-increment primary key)

  - Member association
  - Optional trainer association
  - Physical metrics (weight, body_fat, bmi)
  - Measurements (JSONB format)
  - Progress photos (JSONB format)
  - Date tracking

- **goals** - Member fitness goals (auto-increment primary key)
  - Member association
  - Optional trainer association
  - Goal type and target values
  - Timeline and milestones (JSONB format)
  - Status and completion percentage
  - Creation and update timestamps

### Relationships

```
Gym (1) ──→ (N) Branches
Gym (1) ──→ (N) Users

Branch (1) ──→ (N) Members
Branch (1) ──→ (N) Trainers
Branch (1) ──→ (N) Classes
Branch (1) ──→ (N) Attendance
Branch (1) ──→ (N) MembershipPlans

Member (1) ──→ (1) MemberSubscription
Member (N) ──→ (N) Trainers (via assignments)

MembershipPlan (1) ──→ (N) MemberSubscriptions
```

## API Structure

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- JWT token-based authentication for all protected routes

### Gym & Branch Management

- `POST /gyms` - Create gym
- `GET /gyms` - List gyms
- `GET /gyms/:id` - Get gym details
- `PATCH /gyms/:id` - Update gym
- `DELETE /gyms/:id` - Delete gym
- `POST /gyms/:gymId/branches` - Create branch
- `GET /branches` - List all branches
- `GET /branches/:id` - Get branch details
- `PATCH /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch

### Member Management

- `POST /members` - Create member
- `GET /members` - List members
- `GET /members/:id` - Get member details
- `PATCH /members/:id` - Update member
- `DELETE /members/:id` - Delete member
- `GET /branches/:branchId/members` - Get branch members

### Trainer Management

- `POST /trainers` - Create trainer
- `GET /trainers` - List trainers
- `GET /trainers/:id` - Get trainer details
- `PATCH /trainers/:id` - Update trainer
- `DELETE /trainers/:id` - Delete trainer
- `GET /branches/:branchId/trainers` - Get branch trainers

### Membership Plans

- `POST /membership-plans` - Create plan
- `GET /membership-plans` - List plans
- `GET /membership-plans/:id` - Get plan details
- `PATCH /membership-plans/:id` - Update plan
- `DELETE /membership-plans/:id` - Delete plan
- `GET /branches/:branchId/membership-plans` - Get branch plans

### Subscriptions

- `POST /subscriptions` - Assign member to plan
- `GET /subscriptions` - List subscriptions
- `GET /subscriptions/:id` - Get subscription details
- `PATCH /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription
- `POST /subscriptions/:id/cancel` - Cancel subscription
- `GET /members/:memberId/subscription` - Get member's subscription

### Classes

- `POST /classes` - Create class
- `GET /classes` - List classes
- `GET /classes/:id` - Get class details
- `PATCH /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class
- `GET /branches/:branchId/classes` - Get branch classes

### Member-Trainer Assignments

- `POST /assignments` - Assign member to trainer
- `GET /assignments` - List assignments
- `GET /assignments/:id` - Get assignment details
- `DELETE /assignments/:id` - Delete assignment
- `GET /members/:memberId/assignments` - Get member's trainers
- `GET /trainers/:trainerId/members` - Get trainer's members

### Attendance

- `POST /attendance` - Mark attendance (check-in)
- `PATCH /attendance/:id/checkout` - Check out
- `GET /attendance` - List all attendance records
- `GET /attendance/:id` - Get attendance record
- `GET /members/:memberId/attendance` - Get member attendance
- `GET /trainers/:trainerId/attendance` - Get trainer attendance
- `GET /branches/:branchId/attendance` - Get branch attendance

### Audit Logs

- `POST /audit-logs` - Create audit log
- `GET /audit-logs` - List all logs
- `GET /audit-logs/:id` - Get log details
- `GET /audit-logs/user/:userId` - Get user logs
- `GET /audit-logs/entity/:entityType/:entityId` - Get entity logs
- `GET /audit-logs/action/:action` - Get logs by action

### User Management

- `POST /users` - Create user
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/profile` - Get current user profile

### Role Management

- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID
- `GET /roles/name/:name` - Get role by name

### Financial Management

#### Invoices

- `POST /invoices` - Create invoice
- `GET /invoices` - List all invoices
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice
- `POST /invoices/:id/cancel` - Cancel invoice
- `GET /members/:memberId/invoices` - Get member invoices

#### Payments

- `POST /payments` - Record payment
- `GET /payments` - List all payments
- `GET /payments/:id` - Get payment details
- `GET /invoices/:invoiceId/payments` - Get invoice payments
- `GET /members/:memberId/payments` - Get member payment history

### Lead Management

- `POST /inquiries` - Create inquiry
- `GET /inquiries` - List inquiries with filtering
- `GET /inquiries/:id` - Get inquiry details
- `PATCH /inquiries/:id` - Update inquiry
- `PATCH /inquiries/:id/status` - Update inquiry status
- `POST /inquiries/:id/convert` - Convert inquiry to member
- `DELETE /inquiries/:id` - Delete inquiry
- `GET /inquiries/pending` - Get pending inquiries
- `GET /inquiries/stats` - Get inquiry statistics
- `GET /inquiries/email/:email` - Get inquiry by email

### Analytics & Reporting

- `GET /analytics/gym/:gymId/dashboard` - Get gym dashboard
- `GET /analytics/branch/:branchId/dashboard` - Get branch dashboard
- `GET /analytics/gym/:gymId/members` - Get gym member analytics
- `GET /analytics/branch/:branchId/members` - Get branch member analytics
- `GET /analytics/gym/:gymId/attendance` - Get gym attendance analytics
- `GET /analytics/branch/:branchId/attendance` - Get branch attendance analytics
- `GET /analytics/gym/:gymId/payments/recent` - Get recent gym payments
- `GET /analytics/branch/:branchId/payments/recent` - Get recent branch payments

### Diet Plans

- `POST /diet-plans` - Create diet plan
- `GET /diet-plans` - List all diet plans
- `GET /diet-plans/:id` - Get diet plan details
- `PATCH /diet-plans/:id` - Update diet plan
- `DELETE /diet-plans/:id` - Delete diet plan
- `GET /diet-plans/member/:memberId` - Get member's diet plans
- `GET /diet-plans/user/my-diet-plans` - Get user's assigned diet plans

### Workout Logs

- `POST /workout-logs` - Create workout log
- `GET /workout-logs` - List all workout logs
- `GET /workout-logs/:id` - Get workout log details
- `PATCH /workout-logs/:id` - Update workout log
- `DELETE /workout-logs/:id` - Delete workout log
- `GET /workout-logs/member/:memberId` - Get member's workout logs
- `GET /workout-logs/user/my-workout-logs` - Get user's assigned workout logs

### Body Progress

- `POST /body-progress` - Create body progress record
- `GET /body-progress` - List all body progress records
- `GET /body-progress/:id` - Get body progress record details
- `PATCH /body-progress/:id` - Update body progress record
- `DELETE /body-progress/:id` - Delete body progress record
- `GET /body-progress/member/:memberId` - Get member's body progress records
- `GET /body-progress/user/my-body-progress` - Get user's assigned body progress records

### Goals

- `POST /goals` - Create goal
- `GET /goals` - List all goals
- `GET /goals/:id` - Get goal details
- `PATCH /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal
- `GET /goals/member/:memberId` - Get member's goals
- `GET /goals/user/my-goals` - Get user's assigned goals

## Operational Flow

### 1. System Setup

1. Create gym organization
2. Add branches to gym
3. Create membership plans for branches
4. Register users with appropriate roles

### 2. Member Onboarding

1. Create member profile
2. Assign member to branch
3. Subscribe member to membership plan
4. Optionally assign member to trainer

### 3. Trainer Management

1. Create trainer profile
2. Assign trainer to branch
3. Assign members to trainer
4. Track trainer attendance

### 4. Class Operations

1. Create class schedules
2. Configure recurrence rules (daily/weekly/monthly)
3. Assign classes to branches
4. Track class attendance

### 5. Daily Operations

1. Members/trainers check in via attendance API
2. System tracks check-in/check-out times
3. Attendance records linked to branch
4. Audit logs track all system changes

### 6. Subscription Management

1. Create/update membership plans
2. Assign members to plans
3. Track subscription status (active/inactive)
4. Cancel subscriptions when needed
5. Auto-calculate end dates based on plan duration

### 7. Reporting & Auditing

1. Query attendance by member/trainer/branch
2. View audit logs for compliance
3. Track user actions and entity changes
4. Monitor subscription status

## Security Features

### Authentication

- JWT-based token authentication
- Secure password hashing with bcrypt
- Token expiration and refresh mechanisms

### Authorization

- Route-level guards using `@UseGuards(JwtAuthGuard)`
- All sensitive endpoints protected
- Role-based access control structure in place

### Data Validation

- DTO validation on all inputs
- Type safety with TypeScript
- Database constraints via TypeORM

### Audit Trail

- Complete audit logging system
- Tracks user actions
- Records entity changes (before/after values)
- Timestamp tracking

## API Documentation

### Swagger UI

- Interactive API documentation at `/api`
- Organized by tags (gyms, members, trainers, etc.)
- Request/response schemas
- Authentication testing support

### API Tags

- `auth` - Authentication endpoints
- `users` - User management
- `gyms` - Gym management
- `branches` - Branch management
- `members` - Member management
- `trainers` - Trainer management
- `membership-plans` - Plan management
- `subscriptions` - Subscription management
- `classes` - Class management
- `assignments` - Assignment management
- `attendance` - Attendance tracking
- `audit-logs` - Audit logging
- `invoices` - Financial billing
- `payments` - Payment processing
- `inquiries` - Lead management
- `roles` - Role management
- `analytics` - Business analytics and reporting
- `diet-plans` - Diet plan management
- `workout-logs` - Workout log tracking
- `body-progress` - Body progress monitoring
- `goals` - Goal management

## Development Features

### Hot Reload

- Development server with watch mode
- Automatic restart on file changes

### Type Safety

- Full TypeScript support
- Strict type checking
- Interface definitions for all entities

### Code Quality

- ESLint configuration
- Prettier formatting
- Jest testing framework

## Scalability Considerations

### Multi-Tenancy

- Support for multiple gyms
- Branch-level data isolation
- Hierarchical organization structure
- Role-based access control across organizations

### Database Optimization

- Indexed foreign keys for performance
- Efficient relationship queries with eager/lazy loading
- JSONB for flexible data storage (audit logs, notifications)
- Cloud PostgreSQL with Neon for scalability

### Modular Architecture

- Easy to add new modules
- Clear separation of concerns
- Reusable service patterns
- Comprehensive API coverage for all entities

### Cloud-Native Design

- Cloud database integration (Neon PostgreSQL)
- Environment-based configuration
- Stateless authentication with JWT
- RESTful API design for mobile/web clients

## Current Features

### Lead Management (Inquiries)

- **Complete inquiry lifecycle management**
  - Lead capture with comprehensive contact information
  - Status tracking (new → contacted → qualified → converted → closed)
  - Source tracking (walk-in, referral, social media, website, ads, etc.)
  - Lead conversion to member functionality
  - Advanced filtering and search capabilities
  - Inquiry statistics and reporting

### Financial Management

- **Invoicing system**

  - Invoice creation linked to members and subscriptions
  - Due date tracking and management
  - Invoice status monitoring (pending/paid/cancelled)

- **Payment processing**
  - Multiple payment methods (cash, card, online, bank transfer)
  - Payment status tracking (pending/completed/failed)
  - Payment history and reference management
  - Integration with invoices for revenue tracking

### Analytics & Reporting

- **Dashboard analytics**
  - Gym-level and branch-level dashboards
  - Member analytics (growth, retention, demographics)
  - Attendance analytics (trends, patterns, utilization)
  - Financial analytics (recent payments, revenue tracking)

### Role-Based Access Control

- **Predefined roles**: SUPERADMIN, ADMIN, TRAINER, MEMBER
- **Role management API** for dynamic role assignment
- **JWT-based authentication** with secure token handling

### Advanced Features

- **Member dashboard** with personalized data
- **Inquiry conversion** to member workflow
- **Recent payment tracking** for financial oversight
- **Comprehensive audit logging** for compliance
- **Flexible class scheduling** with recurrence patterns

## Future Enhancements

1. **Notification System**

   - Member notifications
   - Subscription reminders
   - Class schedule updates

2. **Advanced Reporting**

   - Revenue analytics
   - Attendance analytics
   - Member retention metrics

3. **Mobile App Integration**

   - RESTful API ready for mobile clients
   - JWT authentication compatible

4. **Additional Features**
   - Real-time notifications
   - Advanced payment gateway integration
   - Mobile check-in/check-out
   - Automated marketing campaigns

## Deployment

### Environment Configuration

- `.env` file for configuration
- Database connection settings
- JWT secret configuration
- Port configuration

### Production Considerations

- Database migrations
- Environment-specific configs
- Logging and monitoring
- Error handling and recovery

## Conclusion

This gym management system provides a robust, scalable foundation for managing multi-location gym operations. With comprehensive APIs, strong type safety, and a well-structured database design, it supports all core gym management functions from member onboarding to attendance tracking and audit compliance.

### Key Differentiators

- **Complete Lead-to-Member Pipeline** - From inquiry capture to member conversion
- **Comprehensive Financial Management** - Full invoicing and payment processing
- **Advanced Analytics** - Real-time dashboards and business intelligence
- **Cloud-Native Architecture** - Built for scalability with cloud database integration
- **Role-Based Security** - Multi-level access control with JWT authentication
- **Flexible Scheduling** - Recurring class patterns with configurable timing
- **Audit Compliance** - Complete activity tracking for regulatory requirements

### Production-Ready Features

- **Cloud Database** - Neon PostgreSQL for high availability
- **API Documentation** - Auto-generated Swagger UI
- **Type Safety** - Full TypeScript implementation with strict type checking
- **Code Quality** - ESLint and Prettier configuration
- **Testing Framework** - Jest for unit and integration testing
- **Hot Reload** - Development server with live updates
- **Comprehensive Logging** - Audit trail for all system changes
- **Error-Free Codebase** - All TypeScript compilation errors resolved, including:
  - Fixed type issues with nullable member/trainer properties in attendance service
  - Resolved date comparison logic for attendance goal calculations
  - Corrected TypeScript compilation errors in entity relationships
  - Ensured proper type safety in all service methods

This system is designed to scale from single gyms to large multi-location chains, providing the flexibility and reliability needed for modern fitness business operations.
