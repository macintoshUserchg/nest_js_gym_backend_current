# Gym Management System

[![Build Status](https://img.shields.io/travis/com/your-username/your-repo.svg)](https://travis-ci.com/your-username/your-repo)
[![Coverage Status](https://img.shields.io/coveralls/github/your-username/your-repo.svg)](https://coveralls.io/github/your-username/your-repo?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sophisticated multi-tenant gym management system built with NestJS, TypeScript, and PostgreSQL. This system provides a complete solution for managing multiple gyms, their branches, members, trainers, classes, and subscriptions.

## Table of Contents

- [Gym Management System](#gym-management-system)
  - [Table of Contents](#table-of-contents)
  - [System Overview](#system-overview)
  - [Technology Stack](#technology-stack)
  - [Core Features](#core-features)
    - [1. Multi-tenant Architecture](#1-multi-tenant-architecture)
    - [2. User Management](#2-user-management)
    - [3. Membership System](#3-membership-system)
    - [4. Class Management](#4-class-management)
    - [5. Equipment Management](#5-equipment-management)
  - [Technical Architecture](#technical-architecture)
    - [1. Core Modules](#1-core-modules)
      - [App Module (`app.module.ts`)](#app-module-appmodulets)
      - [Authentication Module (`auth/`)](#authentication-module-auth)
      - [User Module (`user/`)](#user-module-user)
      - [Gym Tenant Module (`gymtenant/`)](#gym-tenant-module-gymtenant)
    - [2. Entity Structure](#2-entity-structure)
      - [User Entity (`user.entity.ts`)](#user-entity-userentityts)
      - [Gym Entity](#gym-entity)
      - [Member Entity](#member-entity)
      - [Trainer Entity](#trainer-entity)
    - [3. Security Implementation](#3-security-implementation)
      - [Authentication](#authentication)
      - [Data Protection](#data-protection)
  - [API Endpoints](#api-endpoints)
    - [Auth Endpoints](#auth-endpoints)
    - [User Endpoints](#user-endpoints)
    - [Gym Tenant Endpoints](#gym-tenant-endpoints)
  - [Database Schema](#database-schema)
  - [Development Setup](#development-setup)
  - [Running Tests](#running-tests)
  - [API Documentation](#api-documentation)
  - [Environment Variables](#environment-variables)
  - [Contributing](#contributing)
  - [License](#license)

## System Overview

This is a robust multi-tenant gym management platform that enables:

- Multiple gym chain management
- Branch operations
- Member and trainer management
- Class scheduling and registration
- Equipment tracking
- Subscription and payment handling

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens) with Passport
- **Password Security**: bcrypt for hashing
- **Input Validation**: Class Validator & Class Transformer
- **API Documentation**: Swagger/OpenAPI (http://localhost:3000/api)

## Core Features

### 1. Multi-tenant Architecture

- Support for multiple gym chains
- Hierarchical structure: Gym Chain → Branches
- Isolated data access per tenant
- Role-based access control

### 2. User Management

- **User Roles**:
  - Super Admin (System level)
  - Gym Admin (Tenant level)
  - Branch Admin
  - Trainer
  - Member
- Secure authentication using JWT
- Email-based user identification
- Encrypted password storage
- Profile management

### 3. Membership System

- Flexible membership plans
- Member subscription tracking
- Payment processing
- Subscription status management
- Member-trainer relationships

### 4. Class Management

- Class scheduling
- Trainer assignments
- Member registration
- Class capacity management
- Attendance tracking

### 5. Equipment Management

- Equipment inventory
- Maintenance tracking
- Branch-wise equipment allocation

## Technical Architecture

### 1. Core Modules

#### App Module (`app.module.ts`)

- Application root module
- Global configuration
- Module integration
- Database connection setup

#### Authentication Module (`auth/`)

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Security guards implementation

#### User Module (`user/`)

- User CRUD operations
- Profile management
- Role management
- User search and filtering

#### Gym Tenant Module (`gymtenant/`)

- Gym chain management
- Branch operations
- Tenant isolation
- Administrative functions

### 2. Entity Structure

#### User Entity (`user.entity.ts`)

```typescript
- user_id: UUID (Primary Key)
- email: string (unique)
- password_hash: string (encrypted)
- role: UserRole (enum)
- gym_id: UUID (optional)
- branch_id: UUID (optional)
- member_id: UUID (optional)
- trainer_id: UUID (optional)
```

#### Gym Entity

- Multi-tenant support
- Branch management
- Administrative settings

#### Member Entity

- Member-specific information
- Subscription tracking
- Class registrations

#### Trainer Entity

- Trainer profiles
- Class assignments
- Availability management

### 3. Security Implementation

#### Authentication

- JWT token-based authentication
- Secure password hashing
- Role-based access control
- Session management

#### Data Protection

- Tenant data isolation
- Input validation
- Request sanitization
- Password encryption

## API Endpoints

### Auth Endpoints

- `POST /auth/login` - User authentication

### User Endpoints

- `POST /user/create` - Create user
- `GET /user/profile` - Get user profile

### Gym Tenant Endpoints

- `GET /gymtenant/getallgyms` - List all gyms
- `GET /gymtenant/getallgyms:id` - Get gym details
- `POST /gymtenant/creategym` - Create new gym
- `PUT /gymtenant/updategym:id` - Update gym
- `DELETE /gymtenant/deletegym:id` - Delete gym

## Database Schema

The system uses PostgreSQL with TypeORM for data persistence. Key entities include:

- users
- gyms
- branches
- members
- trainers
- classes
- equipment
- subscriptions
- payments

Here is a visualization of the database schema:

```mermaid
erDiagram
    users {
        UUID user_id PK
        UUID gym_id FK
        UUID branch_id FK
        string email
        string password_hash
        UserRole role
        UUID member_id FK
        UUID trainer_id FK
    }
    gyms {
        UUID gym_id PK
        string name
        string email
        string phone
    }
    branches {
        UUID branch_id PK
        UUID gym_id FK
        string name
        string address
        string phone
        string email
    }
    members {
        UUID member_id PK
        UUID branch_id FK
        string first_name
        string last_name
        string email
        string phone
        date date_of_birth
        string address
        date join_date
        string status
    }
    trainers {
        UUID trainer_id PK
        UUID branch_id FK
        string first_name
        string last_name
        string email
        string phone
        string specialization
        date hire_date
        string status
    }
    classes {
        UUID class_id PK
        UUID branch_id FK
        string name
        string description
        UUID trainer_id FK
        int max_capacity
        int duration_minutes
    }
    class_schedules {
        UUID schedule_id PK
        UUID class_id FK
        timestamp start_time
        timestamp end_time
        string room
        string status
    }
    class_registrations {
        UUID registration_id PK
        UUID member_id FK
        UUID schedule_id FK
        timestamp registration_date
        string status
    }
    equipment {
        UUID equipment_id PK
        UUID branch_id FK
        string name
        string description
        date purchase_date
        string status
    }
    membership_plans {
        UUID plan_id PK
        UUID branch_id FK
        string name
        string description
        int duration_days
        decimal price
    }
    member_subscriptions {
        UUID subscription_id PK
        UUID member_id FK
        UUID plan_id FK
        date start_date
        date end_date
        string status
    }
    payments {
        UUID payment_id PK
        UUID member_id FK
        UUID subscription_id FK
        decimal amount
        timestamp payment_date
        string payment_method
        string status
    }

    users ||--o{ gyms : " "
    users ||--o{ branches : " "
    users }o--|| members : " "
    users }o--|| trainers : " "
    gyms ||--|{ branches : " "
    branches ||--|{ members : " "
    branches ||--|{ trainers : " "
    branches ||--|{ classes : " "
    branches ||--|{ equipment : " "
    branches ||--|{ membership_plans : " "
    trainers ||--|{ classes : " "
    classes ||--|{ class_schedules : " "
    class_schedules ||--|{ class_registrations : " "
    members ||--|{ class_registrations : " "
    members ||--|{ member_subscriptions : " "
    membership_plans ||--|{ member_subscriptions : " "
    member_subscriptions ||--|{ payments : " "
    members ||--|{ payments : " "
```

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:

   - Create a `.env` file
   - Set database connection details
   - Configure JWT secret

4. Run migrations:

   ```bash
   npm run typeorm:run-migrations
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Running Tests

To run the tests, use the following command:

```bash
npm run test
```

## API Documentation

API documentation is not yet implemented. It will be available at `/api` once implemented.

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/gym_db
JWT_SECRET=your-secret-key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
