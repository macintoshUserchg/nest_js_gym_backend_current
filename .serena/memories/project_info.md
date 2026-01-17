# Project Information - new-nestjs-gym-app

## Overview

**Purpose**: Production-ready multi-tenant gym management system

**Description**: A comprehensive gym management system built with NestJS that supports multiple gym chains with branch-level operations, member/trainer management, subscriptions, classes, attendance tracking, financial management (invoices/payments), lead management, analytics, and advanced fitness tracking.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Code Quality**: ESLint, Prettier, Jest

## Key Features

### Multi-Tenant Architecture
- Supports multiple gym chains
- Branch-level operations and data isolation
- Hierarchical: Gym → Branch → Members/Trainers/Classes

### Core Modules (23 feature modules)
- Authentication & Authorization
- User & Role Management
- Gym & Branch Management
- Member Management (with transactional creation)
- Trainer Management
- Class Scheduling (with recurrence support)
- Membership Plans & Subscriptions
- Attendance Tracking (polymorphic: members + trainers)
- Lead Management (inquiries with conversion workflow)
- Financial Management (invoices, payments)
- Analytics & Dashboards
- Fitness Tracking (diet plans, workouts, progress)

### Fitness Features
- Diet Plans with meal tracking
- Workout Plans with exercise library
- Body Progress measurements & photos
- Goal Setting & Progress Tracking
- Attendance Goals with streaks

## Architecture Highlights

### Entity Architecture
- **27 TypeORM entities** with relationships
- **15 UUID-based entities** for distributed systems
- **12 auto-increment entities** for simplicity
- **15 cascade delete relationships** for data integrity
- **JSONB columns** for flexible data (measurements, milestones, meals)

### Authentication & Security
- JWT Bearer token authentication
- bcrypt password hashing (10 rounds)
- Role-based access control (SUPERADMIN, ADMIN, TRAINER, MEMBER)
- All sensitive endpoints protected

### Service Patterns
- **Transactions**: Used in MembersService for atomic operations
- **Auto-Settlement**: Payments automatically settle invoices
- **Streak Calculation**: Attendance service tracks check-in streaks
- **Parallel Queries**: Analytics service uses Promise.all() for performance

### API Design
- RESTful endpoints with Swagger documentation
- Standard patterns: CRUD operations with DTOs
- Custom decorators: `@CurrentUser()` for authenticated user
- Polymorphic endpoints: Attendance works for members OR trainers

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
```
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

### Running the Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation
- URL: http://localhost:3000/api
- Includes all endpoints with request/response schemas

## File Structure

```
src/
├── main.ts                    # Entry point with global config
├── app.module.ts              # Root module importing all features
├── auth/                      # JWT authentication
├── users/                     # User management
├── roles/                     # Role definitions
├── gyms/                      # Gym management
├── members/                   # Member profiles
├── trainers/                  # Trainer profiles
├── classes/                   # Class scheduling
├── membership-plans/          # Subscription plans
├── subscriptions/             # Member subscriptions
├── assignments/               # Member-trainer assignments
├── attendance/                # Check-in/check-out
├── inquiries/                 # Lead management
├── invoices/                  # Invoice generation
├── payments/                  # Payment processing
├── analytics/                 # Business dashboards
├── audit-logs/                # Activity tracking
├── diet-plans/                # Diet planning
├── workouts/                  # Workout management
├── workout-logs/              # Workout history
├── body-progress/             # Body measurements
├── progress-tracking/         # Progress monitoring
├── goals/                     # Goal tracking
├── exercise-library/          # Exercise database
├── entities/                  # TypeORM entities
├── common/                    # Shared utilities
└── database/                  # Database config & seeds
```

## Development Guidelines

1. **Understand Before Acting**: Read the codebase before making changes
2. **Verify Before Changes**: Present plans for user verification
3. **Explain Changes**: Provide high-level explanations
4. **Keep It Simple**: Minimize code changes, avoid complexity
5. **Document Architecture**: Maintain clear documentation
6. **No Speculation**: Always read files before referencing them

## Testing

- **Unit Tests**: `npm run test`
- **Watch Mode**: `npm run test:watch`
- **Coverage**: `npm run test:cov`
- **E2E Tests**: `npm run test:e2e`

## Database Notes

- `synchronize: true` enabled in development (dbConfig.ts)
- **Production**: Disable sync and use TypeORM migrations
- Seed data available in `src/database/`
