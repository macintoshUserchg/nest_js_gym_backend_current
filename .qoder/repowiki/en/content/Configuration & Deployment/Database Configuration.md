# Database Configuration

<cite>
**Referenced Files in This Document**
- [dbConfig.ts](file://dbConfig.ts)
- [app.module.ts](file://src/app.module.ts)
- [seed_gym_Fitness_First_Elite.ts](file://src/database/seed_gym_Fitness_First_Elite.ts)
- [reset-database.ts](file://scripts/reset-database.ts)
- [gym.entity.ts](file://src/entities/gym.entity.ts)
- [branch.entity.ts](file://src/entities/branch.entity.ts)
- [members.entity.ts](file://src/entities/members.entity.ts)
- [trainers.entity.ts](file://src/entities/trainers.entity.ts)
- [users.entity.ts](file://src/entities/users.entity.ts)
- [package-lock.json](file://package-lock.json)
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
This document provides comprehensive database configuration guidance for the gym management system. It covers PostgreSQL connection configuration, TypeORM setup, entity relationships, database schema management, seeding strategies for development and testing, backup and recovery procedures, connection security, performance optimization, monitoring, indexing, and troubleshooting. It also includes configuration examples for local development, staging, and production environments.

## Project Structure
The database configuration is centralized in a dedicated configuration module and integrated into the NestJS application via TypeORM. Entities define the schema and relationships, while seeding utilities support development and testing workflows.

```mermaid
graph TB
subgraph "Application"
APP["App Module<br/>TypeORM.forRoot(pgConfig)"]
CFG["Database Config<br/>dbConfig.ts"]
ENT_GYM["Gym Entity"]
ENT_BRANCH["Branch Entity"]
ENT_MEMBER["Member Entity"]
ENT_TRAINER["Trainer Entity"]
ENT_USER["User Entity"]
end
subgraph "Database"
PG["PostgreSQL"]
end
CFG --> APP
APP --> ENT_GYM
APP --> ENT_BRANCH
APP --> ENT_MEMBER
APP --> ENT_TRAINER
APP --> ENT_USER
ENT_GYM --> PG
ENT_BRANCH --> PG
ENT_MEMBER --> PG
ENT_TRAINER --> PG
ENT_USER --> PG
```

**Diagram sources**
- [dbConfig.ts:1-12](file://dbConfig.ts#L1-L12)
- [app.module.ts:66-75](file://src/app.module.ts#L66-L75)
- [gym.entity.ts:12-56](file://src/entities/gym.entity.ts#L12-L56)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [trainers.entity.ts:4-27](file://src/entities/trainers.entity.ts#L4-L27)
- [users.entity.ts:14-52](file://src/entities/users.entity.ts#L14-L52)

**Section sources**
- [dbConfig.ts:1-12](file://dbConfig.ts#L1-L12)
- [app.module.ts:66-75](file://src/app.module.ts#L66-L75)

## Core Components
- PostgreSQL connection configuration: Centralized in a TypeORM PostgresConnectionOptions object with environment variable overrides and fallback defaults.
- TypeORM integration: Application bootstraps TypeORM globally and registers entities for feature modules.
- Entity model: Strongly typed entities define schema, relationships, and constraints.
- Seeding utilities: Dedicated scripts for populating development/test databases with realistic data.
- Reset utilities: Scripts to reset sequences and clean state during development.

Key configuration highlights:
- Connection URL resolution via environment variables with sensible fallbacks.
- Development-only schema synchronization for rapid iteration.
- Entity discovery across the project.

**Section sources**
- [dbConfig.ts:3-11](file://dbConfig.ts#L3-L11)
- [app.module.ts:66-75](file://src/app.module.ts#L66-L75)
- [seed_gym_Fitness_First_Elite.ts:47-52](file://src/database/seed_gym_Fitness_First_Elite.ts#L47-L52)

## Architecture Overview
The system uses TypeORM with PostgreSQL as the persistence layer. Connections are configured centrally and consumed by the application module. Entities encapsulate domain logic and relationships. Seeding utilities connect directly to the database to populate test data.

```mermaid
sequenceDiagram
participant ENV as "Environment Variables"
participant CFG as "dbConfig.ts"
participant APP as "App Module"
participant ORM as "TypeORM"
participant DB as "PostgreSQL"
ENV-->>CFG : "DATABASE_URL / POSTGRES_URL"
CFG-->>APP : "PostgresConnectionOptions"
APP->>ORM : "TypeORM.forRoot(pgConfig)"
ORM->>DB : "Establish Connection"
DB-->>ORM : "Connection OK"
ORM-->>APP : "Ready"
```

**Diagram sources**
- [dbConfig.ts:4-7](file://dbConfig.ts#L4-L7)
- [app.module.ts:74](file://src/app.module.ts#L74)

## Detailed Component Analysis

### PostgreSQL Connection Configuration
- Connection URL resolution:
  - Uses DATABASE_URL if present.
  - Falls back to POSTGRES_URL if present.
  - Defaults to a local PostgreSQL URL if neither is set.
- Driver and type:
  - Uses the 'postgres' driver.
- Synchronization:
  - Enabled only in development to auto-create/update schema.
- Entity discovery:
  - Scans the entire project for entity files.

Operational implications:
- Environment-driven configuration supports local, staging, and production deployments.
- Development sync simplifies schema iteration but should be disabled in production.

**Section sources**
- [dbConfig.ts:3-11](file://dbConfig.ts#L3-L11)

### TypeORM Configuration Options
- Global initialization:
  - The application initializes TypeORM with the shared configuration object.
- Feature-specific entity registration:
  - Entities are registered per module for scoped access.

Best practices:
- Keep global configuration minimal and environment-aware.
- Register entities per module to limit scope and improve maintainability.

**Section sources**
- [app.module.ts:74](file://src/app.module.ts#L74)
- [app.module.ts:75-99](file://src/app.module.ts#L75-L99)

### Entity Relationships and Schema Management
The entity model defines core domain relationships:

```mermaid
erDiagram
GYMS {
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
BRANCHES {
uuid branchId PK
uuid gymGymId FK
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
USERS {
uuid userId PK
uuid gymGymId FK
uuid branchBranchId FK
string email
string passwordHash
uuid roleId FK
string memberId
string trainerId
string phoneNumber
timestamp phoneVerifiedAt
timestamp createdAt
timestamp updatedAt
}
MEMBERS {
int id PK
uuid userId
string fullName
string email
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
int subscriptionId
uuid branchBranchId
boolean is_managed_by_member
}
TRAINERS {
int id PK
string fullName
string email
string phone
string specialization
string avatarUrl
uuid branchBranchId FK
}
GYMS ||--o{ BRANCHES : "owns"
BRANCHES ||--o{ USERS : "hosts"
BRANCHES ||--o{ MEMBERS : "hosts"
BRANCHES ||--o{ TRAINERS : "employs"
USERS }o--|| MEMBERS : "may be"
USERS }o--|| TRAINERS : "may be"
```

**Diagram sources**
- [gym.entity.ts:12-56](file://src/entities/gym.entity.ts#L12-L56)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [users.entity.ts:14-52](file://src/entities/users.entity.ts#L14-L52)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [trainers.entity.ts:4-27](file://src/entities/trainers.entity.ts#L4-L27)

**Section sources**
- [gym.entity.ts:12-56](file://src/entities/gym.entity.ts#L12-L56)
- [branch.entity.ts:18-79](file://src/entities/branch.entity.ts#L18-L79)
- [users.entity.ts:14-52](file://src/entities/users.entity.ts#L14-L52)
- [members.entity.ts:22-124](file://src/entities/members.entity.ts#L22-L124)
- [trainers.entity.ts:4-27](file://src/entities/trainers.entity.ts#L4-L27)

### Database Migration Strategies
- Development sync:
  - Synchronize schema automatically in development to reflect entity changes quickly.
- Production safety:
  - Disable automatic synchronization in production to prevent unintended schema alterations.
- Recommended approach:
  - Use a migration framework (e.g., TypeORM migrations) to manage schema changes in production and staging.
  - Apply migrations via CI/CD pipelines with rollback strategies.

[No sources needed since this section provides general guidance]

### Seeding Strategies for Development and Testing
- Purpose:
  - Populate development and testing databases with realistic data sets.
- Safety checks:
  - Prevent seeding in production environments.
- Data clearing:
  - Clear existing data for the target gym and dependencies in a controlled order to avoid constraint violations.
- Credential logging:
  - Log generated user credentials for easy access during development.
- Script usage:
  - Connects directly to the database using the same configuration object.

Operational notes:
- Ensure the database is migrated before seeding.
- Use environment variables to control behavior and safety.

**Section sources**
- [seed_gym_Fitness_First_Elite.ts:54-187](file://src/database/seed_gym_Fitness_First_Elite.ts#L54-L187)
- [seed_gym_Fitness_First_Elite.ts:189-404](file://src/database/seed_gym_Fitness_First_Elite.ts#L189-L404)

### Backup and Recovery Procedures
Recommended steps:
- Backup:
  - Use logical backups (e.g., pg_dump) for schema and data.
  - Automate periodic backups with retention policies.
- Recovery:
  - Restore from the latest successful backup.
  - Validate restoration in a staging environment before applying to production.
- Rollback:
  - Maintain migration history to revert schema changes if needed.

[No sources needed since this section provides general guidance]

### Connection Security
- Connection URLs:
  - Prefer DATABASE_URL or POSTGRES_URL environment variables over hardcoded credentials.
- Secrets management:
  - Store sensitive credentials in environment variables or secret managers.
- Network security:
  - Use TLS connections and restrict network access to the database server.
- Least privilege:
  - Create application-specific database users with minimal required privileges.

[No sources needed since this section provides general guidance]

### Performance Optimization Settings
- Connection pooling:
  - Configure pool size and timeouts appropriate for workload.
- Indexing:
  - Add indexes on frequently queried columns (e.g., foreign keys, unique identifiers).
- Queries:
  - Use lazy loading and batch operations to reduce round trips.
- Monitoring:
  - Enable query logging and slow query detection in development.
  - Monitor database metrics in production.

[No sources needed since this section provides general guidance]

### Configuration Examples by Deployment Scenario

- Local Development
  - Set DATABASE_URL to a local PostgreSQL instance.
  - Keep synchronize enabled for quick schema iteration.
  - Example: DATABASE_URL=postgresql://user:password@localhost:5432/gym_dev

- Staging
  - Use a managed PostgreSQL instance with read replicas if needed.
  - Disable synchronize; apply migrations via CI/CD.
  - Example: DATABASE_URL=postgresql://user:password@staging-host:5432/gym_staging

- Production
  - Use a managed PostgreSQL service with high availability.
  - Disable synchronize; enforce strict migrations and backups.
  - Example: DATABASE_URL=postgresql://user:password@prod-host:5432/gym_prod

[No sources needed since this section provides general guidance]

### Database Monitoring, Indexing, and Query Optimization
- Monitoring:
  - Track query performance, connection counts, and replication lag.
- Indexing:
  - Add composite indexes for frequent JOINs and filters.
  - Monitor index usage and remove unused indexes.
- Query optimization:
  - Use EXPLAIN/EXPLAIN ANALYZE to identify bottlenecks.
  - Optimize N+1 queries with eager loading or batch fetching.

[No sources needed since this section provides general guidance]

## Dependency Analysis
TypeORM and PostgreSQL driver dependencies are managed via npm. The project relies on the 'pg' driver and related packages for PostgreSQL connectivity.

```mermaid
graph TB
PJSON["package-lock.json"]
TYPEORM["typeorm"]
PG["pg"]
PGPOOL["pg-pool"]
PJSON --> TYPEORM
PJSON --> PG
PJSON --> PGPOOL
```

**Diagram sources**
- [package-lock.json:9382-9591](file://package-lock.json#L9382-L9591)

**Section sources**
- [package-lock.json:9382-9591](file://package-lock.json#L9382-L9591)

## Performance Considerations
- Connection pooling:
  - Tune pool size and timeouts to match application concurrency.
- Query patterns:
  - Minimize unnecessary joins and selects.
  - Use pagination for large result sets.
- Maintenance:
  - Regularly update statistics and vacuum/analyze tables.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide

Common connectivity and performance issues:

- Connection refused or host not found
  - Verify PostgreSQL is running.
  - Confirm DATABASE_URL format and credentials.
  - Ensure the database exists and the user has permissions.

- Tables missing
  - Run migrations to create tables before seeding.

- Production seeding attempts
  - Seeding is blocked in production for safety.

- Resetting development state
  - Use the reset script to clear sequences and reset state.

```mermaid
flowchart TD
START(["Start"]) --> CHECK_ENV["Check DATABASE_URL"]
CHECK_ENV --> CONNECT["Connect to DB"]
CONNECT --> CONNECT_OK{"Connected?"}
CONNECT_OK --> |No| FIX_CONN["Fix URL/credentials/network"]
CONNECT_OK --> |Yes| CHECK_ENV2["Check NODE_ENV"]
CHECK_ENV2 --> IS_PROD{"Production?"}
IS_PROD --> |Yes| BLOCK_SEED["Block seeding"]
IS_PROD --> |No| SEED["Seed data"]
FIX_CONN --> END(["End"])
BLOCK_SEED --> END
SEED --> END
```

**Diagram sources**
- [seed_gym_Fitness_First_Elite.ts:58-67](file://src/database/seed_gym_Fitness_First_Elite.ts#L58-L67)
- [seed_gym_Fitness_First_Elite.ts:164-181](file://src/database/seed_gym_Fitness_First_Elite.ts#L164-L181)

**Section sources**
- [seed_gym_Fitness_First_Elite.ts:58-67](file://src/database/seed_gym_Fitness_First_Elite.ts#L58-L67)
- [seed_gym_Fitness_First_Elite.ts:164-181](file://src/database/seed_gym_Fitness_First_Elite.ts#L164-L181)
- [reset-database.ts:47-61](file://scripts/reset-database.ts#L47-L61)

## Conclusion
The gym management system uses a straightforward and environment-aware PostgreSQL configuration via TypeORM. Development benefits from automatic schema synchronization, while production requires explicit migrations and strict safety controls. Seeding utilities streamline development setup, and reset scripts help maintain a clean state. Adopting robust backup, monitoring, indexing, and query optimization practices ensures reliable operation across environments.

## Appendices

### Appendix A: Environment Variable Reference
- DATABASE_URL: Primary connection string for PostgreSQL.
- POSTGRES_URL: Fallback connection string if DATABASE_URL is not set.
- NODE_ENV: Controls development vs. production behavior (affects schema sync).

**Section sources**
- [dbConfig.ts:4-9](file://dbConfig.ts#L4-L9)