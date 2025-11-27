# Gym Management System - Project Description

## Overview

A comprehensive gym management system built with NestJS and TypeScript, designed to handle multi-gym operations with branch management, member subscriptions, trainer assignments, class scheduling, attendance tracking, and audit logging.

## Technology Stack

### Backend Framework

- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.7** - Type-safe development
- **TypeORM 0.3** - ORM for database operations
- **PostgreSQL** - Primary database

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
└── entities/          # TypeORM entities
```

### Design Patterns

- **Module Pattern** - Each feature is a self-contained module
- **Repository Pattern** - TypeORM repositories for data access
- **DTO Pattern** - Data Transfer Objects for validation
- **Guard Pattern** - JWT authentication guards
- **Service Layer** - Business logic separation

## Database Design

### Core Entities

#### User Management

- **users** - System users (UUID primary key)

  - Linked to gyms and branches
  - Role-based access control
  - Profile information

- **user_profiles** - Extended user information
- **roles** - User role definitions

#### Gym Operations

- **gyms** - Top-level gym organizations

  - Multi-gym support
  - Owner relationships

- **branches** - Gym locations
  - Belongs to gym
  - Has managers, members, trainers, classes
  - Location and contact information

#### Member Management

- **members** - Gym members

  - Personal information
  - Active status tracking
  - Branch association
  - One-to-one subscription relationship

- **membership_plans** - Subscription plans

  - Pricing and duration
  - Branch-specific plans

- **member_subscriptions** - Active subscriptions
  - Start/end dates
  - Active status
  - Linked to member and plan

#### Trainer & Class Management

- **trainers** - Gym trainers

  - Specializations
  - Branch association

- **classes** - Class definitions

  - Branch-specific
  - Recurrence scheduling (daily/weekly/monthly)
  - Days of week configuration

- **member_trainer_assignments** - Member-trainer relationships
  - Assignment periods
  - Status tracking (active/ended)

#### Attendance & Tracking

- **attendance** - Check-in/check-out records
  - Supports both members and trainers
  - Branch-specific
  - Timestamp tracking
  - Optional notes

#### Audit & Compliance

- **audit_logs** - System activity tracking
  - User actions
  - Entity changes (previous/new values)
  - JSONB storage for flexible data

#### Financial (Entities defined, APIs pending)

- **invoices** - Billing records
- **payment_transactions** - Payment tracking
- **notifications** - System notifications

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

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
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

### Database Optimization

- Indexed foreign keys
- Efficient relationship queries
- JSONB for flexible data storage

### Modular Architecture

- Easy to add new modules
- Clear separation of concerns
- Reusable service patterns

## Future Enhancements (Entities Ready)

1. **Payment Processing**

   - Invoice generation
   - Payment transaction tracking
   - Integration with payment gateways

2. **Notification System**

   - Member notifications
   - Subscription reminders
   - Class schedule updates

3. **Advanced Reporting**

   - Revenue analytics
   - Attendance analytics
   - Member retention metrics

4. **Mobile App Integration**
   - RESTful API ready for mobile clients
   - JWT authentication compatible

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
