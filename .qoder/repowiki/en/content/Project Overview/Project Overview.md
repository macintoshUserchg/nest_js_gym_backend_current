# Project Overview

<cite>
**Referenced Files in This Document**
- [main.ts](file://src/main.ts)
- [app.module.ts](file://src/app.module.ts)
- [package.json](file://package.json)
- [dbConfig.ts](file://dbConfig.ts)
- [auth.module.ts](file://src/auth/auth.module.ts)
- [gyms.module.ts](file://src/gyms/gyms.module.ts)
- [members.module.ts](file://src/members/members.module.ts)
- [workouts.module.ts](file://src/workouts/workouts.module.ts)
- [diet-plans.module.ts](file://src/diet-plans/diet-plans.module.ts)
- [analytics.module.ts](file://src/analytics/analytics.module.ts)
- [gym.entity.ts](file://src/entities/gym.entity.ts)
- [branch.entity.ts](file://src/entities/branch.entity.ts)
- [members.entity.ts](file://src/entities/members.entity.ts)
- [member_subscriptions.entity.ts](file://src/entities/member_subscriptions.entity.ts)
- [create-gym.dto.ts](file://src/gyms/dto/create-gym.dto.ts)
- [create-member.dto.ts](file://src/members/dto/create-member.dto.ts)
- [create-membership-plan.dto.ts](file://src/membership-plans/dto/create-membership-plan.dto.ts)
- [create-workout-plan.dto.ts](file://src/workouts/dto/create-workout-plan.dto.ts)
- [create-diet-plan.dto.ts](file://src/diet-plans/dto/create-diet-plan.dto.ts)
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

## Introduction
The NestJS Gym Management System is a multi-tenant Software-as-a-Service (SaaS) platform designed to streamline fitness center operations across multiple locations. It provides a unified digital infrastructure for gym chains to manage memberships, subscriptions, training programs, nutrition plans, class scheduling, attendance tracking, and financial operations while maintaining tenant isolation and scalability.

Key value propositions:
- Multi-location orchestration with tenant-aware data segregation via gyms and branches
- End-to-end member lifecycle management from registration to subscription renewal
- Integrated wellness program delivery with customizable workout and diet plans
- Real-time analytics and reporting for operational insights
- Secure, scalable backend built on modern NestJS architecture with PostgreSQL persistence

Target audience:
- Franchise and corporate gym chains seeking centralized management
- Regional fitness operators managing multiple studio locations
- Enterprise health and wellness departments requiring robust member engagement tools

Competitive advantages:
- Modular microservice-style NestJS modules for maintainable, testable components
- Strong separation of concerns with dedicated modules for gym management, memberships, training, nutrition, and analytics
- Built-in tenant scoping through gym and branch entities ensuring data isolation
- Comprehensive CRUD APIs with DTO validation and Swagger documentation
- Extensible entity model supporting future fitness industry integrations

## Project Structure
The application follows NestJS's layered architecture with domain-driven modules. The structure emphasizes separation of concerns and modularity:

```mermaid
graph TB
subgraph "Application Layer"
AppModule["AppModule<br/>Root module"]
AuthModule["AuthModule<br/>Authentication & Authorization"]
UsersModule["UsersModule<br/>User management"]
GymsModule["GymsModule<br/>Gym & Branch management"]
MembersModule["MembersModule<br/>Member management"]
MembershipPlansModule["MembershipPlansModule<br/>Pricing plans"]
SubscriptionsModule["SubscriptionsModule<br/>Member subscriptions"]
ClassesModule["ClassesModule<br/>Class scheduling"]
TrainersModule["TrainersModule<br/>Trainer management"]
AssignmentsModule["AssignmentsModule<br/>Member-trainer assignments"]
AttendanceModule["AttendanceModule<br/>Attendance tracking"]
AnalyticsModule["AnalyticsModule<br/>Business intelligence"]
PaymentsModule["PaymentsModule<br/>Financial transactions"]
InvoicesModule["InvoicesModule<br/>Billing & invoicing"]
DietPlansModule["DietPlansModule<br/>Nutrition programs"]
WorkoutTemplatesModule["WorkoutTemplatesModule<br/>Training templates"]
GoalsModule["GoalsModule<br/>Goal tracking"]
ProgressTrackingModule["ProgressTrackingModule<br/>Body metrics"]
NotificationsModule["NotificationsModule<br/>Communication"]
end
subgraph "Persistence Layer"
TypeORM["TypeORM Module"]
Entities["Entities<br/>Gym, Branch, Member,<br/>Subscription, Workout, Diet"]
PostgreSQL["PostgreSQL Database"]
end
subgraph "Infrastructure"
Swagger["Swagger UI<br/>API Documentation"]
Config["Environment Config<br/>.env support"]
Scheduler["Task Scheduling<br/>@nestjs/schedule"]
end
AppModule --> AuthModule
AppModule --> UsersModule
AppModule --> GymsModule
AppModule --> MembersModule
AppModule --> MembershipPlansModule
AppModule --> SubscriptionsModule
AppModule --> ClassesModule
AppModule --> TrainersModule
AppModule --> AssignmentsModule
AppModule --> AttendanceModule
AppModule --> AnalyticsModule
AppModule --> PaymentsModule
AppModule --> InvoicesModule
AppModule --> DietPlansModule
AppModule --> WorkoutTemplatesModule
AppModule --> GoalsModule
AppModule --> ProgressTrackingModule
AppModule --> NotificationsModule
TypeORM --> Entities
Entities --> PostgreSQL
Swagger --> AppModule
Config --> AppModule
Scheduler --> AppModule
```

**Diagram sources**
- [app.module.ts:66-137](file://src/app.module.ts#L66-L137)
- [main.ts:28-65](file://src/main.ts#L28-L65)

The modular design enables independent development, testing, and deployment of functional domains while maintaining cohesive integration through the root AppModule.

**Section sources**
- [app.module.ts:1-138](file://src/app.module.ts#L1-L138)
- [main.ts:1-70](file://src/main.ts#L1-L70)

## Core Components
The system comprises several core modules that collectively enable comprehensive gym management:

### Authentication & Authorization
The AuthModule provides JWT-based authentication with passport strategies, role-based access control, and tenant-aware user management. It integrates with the UsersModule to handle user lifecycle operations within gym and branch contexts.

### Gym & Branch Management
The GymsModule orchestrates multi-location operations through Gym and Branch entities. Each Gym can contain multiple Branches, enabling franchise-style deployments where each location maintains its own data while being part of a larger tenant organization.

### Member Management
The MembersModule handles complete member profiles, including personal information, emergency contacts, membership status, and branch associations. It integrates with subscription management for automated billing and renewal workflows.

### Training & Nutrition Programs
The system supports comprehensive wellness program delivery through:
- Workout Plans: Structured exercise routines with customizable exercises, sets, reps, and timing
- Diet Plans: Personalized nutrition programs with macronutrient tracking and meal planning
- Templates: Reusable workout and diet templates for efficient program creation
- Progress Tracking: Body metrics and goal achievement monitoring

### Financial Operations
The PaymentsModule manages transaction processing, while the InvoicesModule handles billing cycles and renewal requests. Together they provide end-to-end revenue management for subscription-based fitness services.

**Section sources**
- [auth.module.ts:1-25](file://src/auth/auth.module.ts#L1-L25)
- [gyms.module.ts:1-18](file://src/gyms/gyms.module.ts#L1-L18)
- [members.module.ts:1-37](file://src/members/members.module.ts#L1-L37)
- [workouts.module.ts:1-26](file://src/workouts/workouts.module.ts#L1-L26)
- [diet-plans.module.ts:1-17](file://src/diet-plans/diet-plans.module.ts#L1-L17)
- [analytics.module.ts:1-36](file://src/analytics/analytics.module.ts#L1-L36)

## Architecture Overview
The system employs a layered architecture with clear boundaries between presentation, application, and persistence layers:

```mermaid
graph TB
subgraph "Presentation Layer"
Controllers["REST Controllers<br/>HTTP endpoints"]
SwaggerUI["Swagger UI<br/>Interactive docs"]
end
subgraph "Application Layer"
Services["Service Layer<br/>Business logic"]
Guards["Guards & Interceptors<br/>Auth & validation"]
DTOs["DTOs & Validators<br/>Input validation"]
end
subgraph "Domain Layer"
Entities["Entities<br/>Core business models"]
Repositories["Repositories<br/>CRUD operations"]
end
subgraph "Infrastructure Layer"
TypeORMAdapter["TypeORM Adapter<br/>Database mapping"]
PGClient["PostgreSQL Driver<br/>Connection pooling"]
ConfigService["Config Service<br/>Environment variables"]
Logger["Logger<br/>Structured logging"]
end
Controllers --> Services
Services --> DTOs
Services --> Repositories
Repositories --> Entities
Entities --> TypeORMAdapter
TypeORMAdapter --> PGClient
Controllers --> Guards
Guards --> Services
SwaggerUI --> Controllers
ConfigService --> Controllers
Logger --> Services
```

**Diagram sources**
- [app.module.ts:66-137](file://src/app.module.ts#L66-L137)
- [main.ts:28-65](file://src/main.ts#L28-L65)

The architecture ensures:
- Clean separation of concerns with explicit module boundaries
- Testable business logic isolated from HTTP concerns
- Pluggable persistence layer supporting database migrations and schema evolution
- Centralized configuration management for environment-specific settings
- Comprehensive API documentation generation

## Detailed Component Analysis

### Multi-Tenant Data Model
The system implements tenant isolation through hierarchical entity relationships:

```mermaid
erDiagram
GYM {
uuid gymId PK
string name
string email
string phone
string logoUrl
text address
string location
string state
decimal latitude
decimal longitude
timestamp createdAt
timestamp updatedAt
}
BRANCH {
uuid branchId PK
uuid gymId FK
string name
string email
string phone
text address
string location
string state
boolean mainBranch
decimal latitude
decimal longitude
timestamp createdAt
timestamp updatedAt
}
MEMBER {
int id PK
uuid userId
string fullName
string email UK
string phone
enum gender
date dateOfBirth
string addressLine1
string addressLine2
string city
string state
string postalCode
string avatarUrl
string attachmentUrl
string emergencyContactName
string emergencyContactPhone
boolean isActive
boolean freezeMember
timestamp createdAt
timestamp updatedAt
int subscriptionId UK
uuid branchBranchId FK
boolean is_managed_by_member
}
MEMBER_SUBSCRIPTION {
int id PK
int memberId FK
int planId FK
timestamp startDate
timestamp endDate
boolean isActive
uuid[] selectedClassIds
}
GYM ||--o{ BRANCH : "owns"
BRANCH ||--o{ MEMBER : "hosts"
MEMBER ||--|| MEMBER_SUBSCRIPTION : "subscribed_to"
```

**Diagram sources**
- [gym.entity.ts:12-55](file://src/entities/gym.entity.ts#L12-L55)
- [branch.entity.ts:18-78](file://src/entities/branch.entity.ts#L18-L78)
- [members.entity.ts:22-123](file://src/entities/members.entity.ts#L22-L123)
- [member_subscriptions.entity.ts:14-70](file://src/entities/member_subscriptions.entity.ts#L14-L70)

### API Design & Validation
The system enforces strict input validation through DTOs with comprehensive field definitions:

```mermaid
classDiagram
class CreateGymDto {
+string name
+string email
+string phone
+string logoUrl
+string address
+string location
+string state
+number latitude
+number longitude
}
class CreateMemberDto {
+string fullName
+string email
+string phone
+Gender gender
+string dateOfBirth
+string addressLine1
+string addressLine2
+string city
+string state
+string postalCode
+string avatarUrl
+string emergencyContactName
+string emergencyContactPhone
+boolean isActive
+boolean freezeMember
+boolean is_managed_by_member
+string branchId
+number membershipPlanId
+string[] selectedClassIds
}
class CreateMembershipPlanDto {
+string name
+number price
+number durationInDays
+string description
+string branchId
}
class CreateWorkoutPlanDto {
+number memberId
+string title
+string description
+string difficulty_level
+string plan_type
+number duration_days
+Date start_date
+Date end_date
+number trainerId
+string branchId
+string notes
+CreateWorkoutPlanExerciseDto[] exercises
}
class CreateDietPlanDto {
+number memberId
+string title
+string description
+string goal_type
+number target_calories
+Date start_date
+Date end_date
+number trainerId
+string branchId
+string notes
+CreateDietPlanMealDto[] meals
}
```

**Diagram sources**
- [create-gym.dto.ts:4-85](file://src/gyms/dto/create-gym.dto.ts#L4-L85)
- [create-member.dto.ts:17-215](file://src/members/dto/create-member.dto.ts#L17-L215)
- [create-membership-plan.dto.ts:11-44](file://src/membership-plans/dto/create-membership-plan.dto.ts#L11-L44)
- [create-workout-plan.dto.ts:77-144](file://src/workouts/dto/create-workout-plan.dto.ts#L77-L144)
- [create-diet-plan.dto.ts:95-151](file://src/diet-plans/dto/create-diet-plan.dto.ts#L95-L151)

### Practical Multi-Location Examples
The platform demonstrates real-world gym chain scenarios:

**Franchise Deployment Example:**
- Corporate Gym Chain "Fitness First Elite" operates multiple locations
- Each branch maintains separate member databases while sharing corporate branding
- Subscription plans can be location-specific or corporate-wide
- Training programs adapt to branch equipment and instructor availability

**Regional Operator Example:**
- Regional fitness operator manages 15 locations across a metropolitan area
- Centralized analytics dashboard aggregates performance metrics
- Automated billing consolidates payments across all locations
- Standardized training protocols ensure quality consistency

**Section sources**
- [gym.entity.ts:12-55](file://src/entities/gym.entity.ts#L12-L55)
- [branch.entity.ts:18-78](file://src/entities/branch.entity.ts#L18-L78)
- [members.entity.ts:22-123](file://src/entities/members.entity.ts#L22-L123)
- [member_subscriptions.entity.ts:14-70](file://src/entities/member_subscriptions.entity.ts#L14-L70)
- [create-gym.dto.ts:4-85](file://src/gyms/dto/create-gym.dto.ts#L4-L85)
- [create-member.dto.ts:17-215](file://src/members/dto/create-member.dto.ts#L17-L215)

## Dependency Analysis
The system leverages a comprehensive set of NestJS and third-party dependencies:

```mermaid
graph TB
subgraph "NestJS Core"
NestCore["@nestjs/core"]
NestCommon["@nestjs/common"]
NestPlatform["@nestjs/platform-express"]
NestConfig["@nestjs/config"]
NestSchedule["@nestjs/schedule"]
end
subgraph "Database & ORM"
NestTypeORM["@nestjs/typeorm"]
TypeORM["typeorm"]
Postgres["pg driver"]
end
subgraph "Security & Auth"
NestJWT["@nestjs/jwt"]
NestPassport["@nestjs/passport"]
PassportJWT["passport-jwt"]
Bcrypt["bcrypt"]
end
subgraph "Documentation & Dev"
NestSwagger["@nestjs/swagger"]
SwaggerUI["swagger-ui-express"]
Prettier["prettier"]
ESLint["eslint"]
end
subgraph "Utilities"
ClassValidator["class-validator"]
ClassTransformer["class-transformer"]
MinIO["minio"]
Nodemailer["nodemailer"]
Twilio["twilio"]
end
AppModule --> NestCore
AppModule --> NestCommon
AppModule --> NestConfig
AppModule --> NestSchedule
AppModule --> NestTypeORM
AppModule --> NestJWT
AppModule --> NestPassport
AppModule --> NestSwagger
NestTypeORM --> TypeORM
NestTypeORM --> Postgres
NestJWT --> PassportJWT
NestSwagger --> SwaggerUI
AppModule --> ClassValidator
AppModule --> MinIO
AppModule --> Nodemailer
AppModule --> Twilio
```

**Diagram sources**
- [package.json:22-46](file://package.json#L22-L46)
- [app.module.ts:66-137](file://src/app.module.ts#L66-L137)

**Section sources**
- [package.json:1-95](file://package.json#L1-L95)
- [dbConfig.ts:1-12](file://dbConfig.ts#L1-L12)

## Performance Considerations
The system incorporates several performance optimization strategies:

- **Connection Pooling**: PostgreSQL connection pooling through TypeORM configuration
- **Caching Strategy**: Application-level caching for frequently accessed entities
- **Pagination Support**: Built-in pagination for large dataset queries
- **Indexing Strategy**: Strategic database indexing on frequently queried fields
- **Background Jobs**: Scheduled tasks for automated billing and report generation
- **Resource Optimization**: Efficient DTO transformations to minimize payload sizes

## Troubleshooting Guide
Common operational issues and resolutions:

**Database Connectivity Issues:**
- Verify DATABASE_URL or POSTGRES_URL environment variables
- Check PostgreSQL service availability and network connectivity
- Review connection pool limits and timeout configurations

**Authentication Failures:**
- Validate JWT secret configuration and expiration settings
- Check role-based access permissions for requested endpoints
- Review CORS configuration for cross-origin requests

**API Validation Errors:**
- Review DTO validation rules and required field constraints
- Check data type compatibility for numeric and date fields
- Verify UUID format compliance for entity identifiers

**Performance Bottlenecks:**
- Monitor database query execution times
- Implement appropriate indexing strategies
- Review memory usage patterns and optimize entity loading

**Section sources**
- [dbConfig.ts:3-11](file://dbConfig.ts#L3-L11)
- [main.ts:8-19](file://src/main.ts#L8-L19)
- [main.ts:20-26](file://src/main.ts#L20-L26)

## Conclusion
The NestJS Gym Management System represents a comprehensive solution for modern fitness center operations. Its modular architecture, robust multi-tenancy support, and extensive feature coverage position it as an ideal platform for gym chains seeking digital transformation. The system's emphasis on clean code architecture, comprehensive validation, and scalable infrastructure ensures long-term maintainability and growth potential.

Through its unified approach to gym management, member engagement, and operational analytics, the platform delivers measurable value to fitness operators while providing a solid foundation for future enhancements and industry-specific integrations.