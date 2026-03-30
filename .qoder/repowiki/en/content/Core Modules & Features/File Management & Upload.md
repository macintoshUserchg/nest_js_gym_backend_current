# File Management & Upload

<cite>
**Referenced Files in This Document**
- [upload.module.ts](file://src/upload/upload.module.ts)
- [upload.service.ts](file://src/upload/upload.service.ts)
- [upload.controller.ts](file://src/upload/upload.controller.ts)
- [minio.config.ts](file://src/config/minio.config.ts)
- [upload.constants.ts](file://src/upload/constants/upload.constants.ts)
- [upload-file.dto.ts](file://src/upload/dto/upload-file.dto.ts)
- [presigned-url.dto.ts](file://src/upload/dto/presigned-url.dto.ts)
- [upload.interface.ts](file://src/upload/interfaces/upload.interface.ts)
- [users.entity.ts](file://src/entities/users.entity.ts)
- [workouts.service.ts](file://src/workouts/workouts.service.ts)
- [diet-plans.service.ts](file://src/diet-plans/diet-plans.service.ts)
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
This document explains the file management and upload module that integrates with MinIO for cloud storage, supports multiple file categories, enforces validation and access control, and enables both server-side uploads and browser-direct uploads via presigned URLs. It covers supported file types, size limits, security controls, file organization strategies, metadata handling, and integration points with user profiles, training programs, and diet plans. Practical examples demonstrate uploading member documents, training photos, nutrition images, and administrative files, along with cleanup procedures for orphaned files.

## Project Structure
The upload module is organized around a dedicated controller, service, configuration, constants, DTOs, and interfaces. It relies on NestJS ConfigModule for MinIO configuration and uses MinIO client for storage operations.

```mermaid
graph TB
subgraph "Upload Module"
UM["upload.module.ts"]
UC["upload.controller.ts"]
US["upload.service.ts"]
UCFG["minio.config.ts"]
UCONST["upload.constants.ts"]
UD1["upload-file.dto.ts"]
UD2["presigned-url.dto.ts"]
UI["upload.interface.ts"]
end
subgraph "Entities"
UE["users.entity.ts"]
end
subgraph "Related Services"
WS["workouts.service.ts"]
DS["diet-plans.service.ts"]
end
UM --> UC
UM --> US
UM --> UCFG
UC --> US
US --> UCONST
UC --> UD1
UC --> UD2
UC --> UI
US --> UE
WS --> UE
DS --> UE
```

**Diagram sources**
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [upload.controller.ts:1-167](file://src/upload/upload.controller.ts#L1-L167)
- [upload.service.ts:1-345](file://src/upload/upload.service.ts#L1-L345)
- [minio.config.ts:1-37](file://src/config/minio.config.ts#L1-L37)
- [upload.constants.ts:1-34](file://src/upload/constants/upload.constants.ts#L1-L34)
- [upload-file.dto.ts:1-19](file://src/upload/dto/upload-file.dto.ts#L1-L19)
- [presigned-url.dto.ts:1-14](file://src/upload/dto/presigned-url.dto.ts#L1-L14)
- [upload.interface.ts:1-21](file://src/upload/interfaces/upload.interface.ts#L1-L21)
- [users.entity.ts:1-52](file://src/entities/users.entity.ts#L1-L52)
- [workouts.service.ts:1-200](file://src/workouts/workouts.service.ts#L1-L200)
- [diet-plans.service.ts:1-180](file://src/diet-plans/diet-plans.service.ts#L1-L180)

**Section sources**
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [upload.controller.ts:24-27](file://src/upload/upload.controller.ts#L24-L27)
- [upload.service.ts:11-38](file://src/upload/upload.service.ts#L11-L38)
- [minio.config.ts:20-36](file://src/config/minio.config.ts#L20-L36)

## Core Components
- UploadModule: Declares the upload module with imports, controller, provider, and exports.
- UploadController: Exposes endpoints for avatar, document, media, progress uploads, presigned URL generation, download, deletion, and health checks. Applies JWT and role guards.
- UploadService: Implements MinIO integration, bucket lifecycle, file validation, upload and delete operations, presigned URL generation, and access control validation.
- Configuration: Centralized MinIO and upload settings via ConfigModule.
- Constants: Defines allowed MIME types, categories, and bucket defaults.
- DTOs and Interfaces: Define request/response shapes for uploads and presigned URLs.

**Section sources**
- [upload.module.ts:6-12](file://src/upload/upload.module.ts#L6-L12)
- [upload.controller.ts:24-167](file://src/upload/upload.controller.ts#L24-L167)
- [upload.service.ts:11-345](file://src/upload/upload.service.ts#L11-L345)
- [minio.config.ts:20-36](file://src/config/minio.config.ts#L20-L36)
- [upload.constants.ts:6-34](file://src/upload/constants/upload.constants.ts#L6-L34)
- [upload-file.dto.ts:10-18](file://src/upload/dto/upload-file.dto.ts#L10-L18)
- [presigned-url.dto.ts:4-13](file://src/upload/dto/presigned-url.dto.ts#L4-L13)
- [upload.interface.ts:1-21](file://src/upload/interfaces/upload.interface.ts#L1-L21)

## Architecture Overview
The upload module orchestrates file operations through a controller that delegates to a service. The service connects to MinIO using configured credentials and ensures the bucket exists. It validates file types and sizes per category, generates unique keys, and supports both direct server uploads and browser-direct uploads via presigned URLs. Access control restricts downloads and uploads based on user roles and ownership.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "UploadController"
participant Service as "UploadService"
participant MinIO as "MinIO"
Client->>Controller : "POST /upload/document" (multipart)
Controller->>Service : "uploadFileForUser(file, 'document', user, roleFolder)"
Service->>Service : "ensureBucketExists()"
Service->>Service : "validateFile(category, mimetype, size)"
Service->>MinIO : "putObject(bucket, key, buffer, size, headers)"
MinIO-->>Service : "success"
Service-->>Controller : "UploadedFile"
Controller-->>Client : "{url, key, size, mimetype, originalName}"
```

**Diagram sources**
- [upload.controller.ts:53-69](file://src/upload/upload.controller.ts#L53-L69)
- [upload.service.ts:143-184](file://src/upload/upload.service.ts#L143-L184)

**Section sources**
- [upload.controller.ts:24-89](file://src/upload/upload.controller.ts#L24-L89)
- [upload.service.ts:43-54](file://src/upload/upload.service.ts#L43-L54)
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)
- [upload.service.ts:102-137](file://src/upload/upload.service.ts#L102-L137)

## Detailed Component Analysis

### MinIO Integration Setup
- Configuration loading: The service reads MinIO endpoint, SSL flag, access/secret keys, bucket, and public URL from configuration. Defaults are applied if environment variables are missing.
- Bucket management: On first use, the service ensures the bucket exists; otherwise, it throws a service unavailable error.
- Public URL construction: Files are served via a configurable public URL combined with bucket and key.

Security and reliability:
- SSL support is configurable.
- Health check endpoint exposes bucket existence status.

**Section sources**
- [upload.service.ts:21-38](file://src/upload/upload.service.ts#L21-L38)
- [upload.service.ts:43-54](file://src/upload/upload.service.ts#L43-L54)
- [minio.config.ts:20-36](file://src/config/minio.config.ts#L20-L36)
- [upload.service.ts:331-344](file://src/upload/upload.service.ts#L331-L344)

### File Categories, Types, and Size Limits
Supported categories and constraints:
- Avatar: Images up to 5 MB.
- Document: PDF and images up to 10 MB.
- Media: Images and videos up to 50 MB.
- Progress: Images up to 10 MB.

Allowed MIME types:
- Images: JPEG, PNG, WebP, GIF.
- Documents: PDF, JPEG, PNG.
- Videos: MP4, WebM.

Validation logic:
- Category lookup and allowed type enforcement.
- Size enforcement per category with fallback defaults.
- Throws bad request exceptions on invalid category, unsupported type, or oversized files.

**Section sources**
- [upload.constants.ts:1-34](file://src/upload/constants/upload.constants.ts#L1-L34)
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)

### File Upload Workflows
- General upload: Controller routes multipart uploads to service; service validates and stores under category-specific folders.
- User-scoped upload: Generates keys scoped by user ID and role to prevent cross-user access.
- Upload for user: Controller selects appropriate role-based folder depending on user role and requested category.

Examples of upload endpoints:
- Avatar: Any authenticated user uploads to role-scoped avatars.
- Document: Member uploads own documents; admins/trainers upload general documents.
- Media: Admin/superadmin/trainer uploads to templates; trainer can upload for assigned members.
- Progress: Any user uploads personal progress photos; trainer can upload for assigned members.

**Section sources**
- [upload.controller.ts:33-45](file://src/upload/upload.controller.ts#L33-L45)
- [upload.controller.ts:53-69](file://src/upload/upload.controller.ts#L53-L69)
- [upload.controller.ts:77-89](file://src/upload/upload.controller.ts#L77-L89)
- [upload.controller.ts:96-106](file://src/upload/upload.controller.ts#L96-L106)
- [upload.service.ts:102-137](file://src/upload/upload.service.ts#L102-L137)
- [upload.service.ts:143-184](file://src/upload/upload.service.ts#L143-L184)

### Presigned URL Generation
- Upload URLs: Generated for direct browser uploads with 1-hour expiry. Supports both general and user-scoped keys.
- Download URLs: Generated for authorized retrieval with 1-hour expiry.
- Access control: Controllers validate access before generating download URLs; service enforces role-based and ownership-based rules.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "UploadController"
participant Service as "UploadService"
participant MinIO as "MinIO"
Client->>Controller : "POST /upload/presign" (folder, filename, contentType)
Controller->>Service : "getPresignedUploadUrlForUser(folder, filename, contentType, user, roleFolder)"
Service->>Service : "ensureBucketExists()"
Service->>MinIO : "presignedPutObject(bucket, key, 3600)"
MinIO-->>Service : "uploadUrl"
Service-->>Controller : "PresignedUrlResponse"
Controller-->>Client : "{uploadUrl, key, publicUrl, expiresIn}"
```

**Diagram sources**
- [upload.controller.ts:113-127](file://src/upload/upload.controller.ts#L113-L127)
- [upload.service.ts:239-273](file://src/upload/upload.service.ts#L239-L273)

**Section sources**
- [upload.controller.ts:113-145](file://src/upload/upload.controller.ts#L113-L145)
- [upload.service.ts:202-233](file://src/upload/upload.service.ts#L202-L233)
- [upload.service.ts:239-273](file://src/upload/upload.service.ts#L239-L273)
- [upload.service.ts:314-326](file://src/upload/upload.service.ts#L314-L326)

### Access Control Mechanisms
- Admin/Superadmin: Full access to all files.
- Trainer: Can access templates folder; can upload for assigned members.
- Member: Owns files in personal folders; cannot upload media.
- Ownership validation: Controllers call service to validate access before download; service checks role folder patterns and user ID presence in key.

```mermaid
flowchart TD
Start(["Validate Access"]) --> CheckAdmin["Is user admin/superadmin?"]
CheckAdmin --> |Yes| Allow["Allow access"]
CheckAdmin --> |No| CheckOwn["Is key in user's role folder or contains user ID?"]
CheckOwn --> |Yes| Allow
CheckOwn --> |No| CheckTrainer["Is user trainer and key starts with templates/?"]
CheckTrainer --> |Yes| Allow
CheckTrainer --> |No| Deny["Deny access"]
Allow --> End(["Proceed"])
Deny --> End
```

**Diagram sources**
- [upload.service.ts:279-309](file://src/upload/upload.service.ts#L279-L309)
- [upload.controller.ts:133-145](file://src/upload/upload.controller.ts#L133-L145)

**Section sources**
- [upload.service.ts:279-309](file://src/upload/upload.service.ts#L279-L309)
- [upload.controller.ts:133-145](file://src/upload/upload.controller.ts#L133-L145)

### File Organization Strategies and Metadata Handling
- Organization: Keys follow structured paths:
  - Avatars: avatars/{role}/{userId}/{uuid}.ext
  - Documents: documents/{userId?}/{uuid}.ext
  - Templates/Media: templates/{role}/{userId?}/{uuid}.ext
  - Progress: progress/{userId}/{uuid}.ext
- Metadata: Returned in upload responses includes URL, key, size, MIME type, and original name. Public URL composition uses configured base URL and bucket.

**Section sources**
- [upload.service.ts:84-97](file://src/upload/upload.service.ts#L84-L97)
- [upload.service.ts:102-137](file://src/upload/upload.service.ts#L102-L137)
- [upload.service.ts:143-184](file://src/upload/upload.service.ts#L143-L184)
- [upload.interface.ts:1-7](file://src/upload/interfaces/upload.interface.ts#L1-L7)

### CDN Integration for Optimized Delivery
- Public URL: Constructed from configured public URL, bucket, and key, enabling CDN-backed delivery when the public URL points to a CDN endpoint.
- Presigned download URLs: Provide controlled access to files with short-lived links suitable for secure delivery.

**Section sources**
- [upload.service.ts:122](file://src/upload/upload.service.ts#L122)
- [upload.service.ts:266](file://src/upload/upload.service.ts#L266)
- [minio.config.ts:25-27](file://src/config/minio.config.ts#L25-L27)

### Integration with User Profiles, Training Programs, and Content Management
- User entity: Provides userId, role, and associations used for scoping and access control.
- Training programs: Workouts service manages exercise libraries and workout plans; media files can be associated with templates and plans by trainers.
- Diet plans: Diet plans service manages nutritional plans; media/images can be associated with diet content by admins/trainers.

Practical integration examples:
- Member documents: Stored under documents/{userId} for ownership and privacy.
- Training photos/media: Stored under templates/{role}/{userId} for trainer-managed content.
- Nutrition images: Stored under templates/{role}/{userId} for diet-related materials.
- Administrative files: Stored under general documents folder for admin/superadmin use.

**Section sources**
- [users.entity.ts:15-52](file://src/entities/users.entity.ts#L15-L52)
- [workouts.service.ts:1-200](file://src/workouts/workouts.service.ts#L1-L200)
- [diet-plans.service.ts:1-180](file://src/diet-plans/diet-plans.service.ts#L1-L180)
- [upload.controller.ts:53-69](file://src/upload/upload.controller.ts#L53-L69)
- [upload.controller.ts:77-89](file://src/upload/upload.controller.ts#L77-L89)

### File Versioning, Backup Strategies, and Cleanup Procedures
- Versioning: Not implemented in the current service; files overwrite existing objects with the same key.
- Backups: No explicit backup routine; rely on MinIO snapshot/backup capabilities external to this module.
- Cleanup:
  - Delete endpoint: Admin/superadmin can delete files by key.
  - Orphaned files: Implement periodic cleanup by scanning bucket keys against referenced records in application entities; remove keys not present in references.

Operational notes:
- Deletion requires admin/superadmin roles.
- Access validation prevents unauthorized deletions.

**Section sources**
- [upload.controller.ts:150-158](file://src/upload/upload.controller.ts#L150-L158)
- [upload.service.ts:189-197](file://src/upload/upload.service.ts#L189-L197)

## Dependency Analysis
The upload module depends on:
- ConfigModule for MinIO configuration.
- MinIO client for storage operations.
- NestJS guards and decorators for authentication and authorization.
- Entities for user role and ownership checks.

```mermaid
graph LR
UC["UploadController"] --> US["UploadService"]
US --> MC["MinIO Client"]
US --> CFG["ConfigService"]
UC --> GUARDS["JWT + Roles Guards"]
US --> ENT["User Entity"]
UC --> DTO1["UploadFileDto"]
UC --> DTO2["PresignedUrlDto"]
UC --> IFACE["Interfaces"]
```

**Diagram sources**
- [upload.controller.ts:14-27](file://src/upload/upload.controller.ts#L14-L27)
- [upload.service.ts:1-10](file://src/upload/upload.service.ts#L1-L10)
- [users.entity.ts:15-52](file://src/entities/users.entity.ts#L15-L52)
- [upload-file.dto.ts:10-18](file://src/upload/dto/upload-file.dto.ts#L10-L18)
- [presigned-url.dto.ts:4-13](file://src/upload/dto/presigned-url.dto.ts#L4-L13)
- [upload.interface.ts:1-21](file://src/upload/interfaces/upload.interface.ts#L1-L21)

**Section sources**
- [upload.controller.ts:14-27](file://src/upload/upload.controller.ts#L14-L27)
- [upload.service.ts:1-10](file://src/upload/upload.service.ts#L1-L10)
- [users.entity.ts:15-52](file://src/entities/users.entity.ts#L15-L52)

## Performance Considerations
- Upload size limits reduce memory pressure and storage costs.
- Presigned URLs shift bandwidth and CPU load from the server to the client and CDN.
- Unique UUID-based keys minimize collision risks and enable parallel uploads.
- Bucket existence checks occur on demand; cache or pre-create buckets in production environments.

## Troubleshooting Guide
Common issues and resolutions:
- Storage service unavailable: Health check indicates bucket existence failures; verify MinIO connectivity and credentials.
- Upload failed: Check allowed types and size limits; confirm category matches intended folder.
- Access denied: Ensure user role and ownership; verify key path includes user ID or role folder.
- Delete failed: Confirm caller has admin/superadmin role.

**Section sources**
- [upload.service.ts:50-53](file://src/upload/upload.service.ts#L50-L53)
- [upload.service.ts:133-136](file://src/upload/upload.service.ts#L133-L136)
- [upload.service.ts:193-196](file://src/upload/upload.service.ts#L193-L196)
- [upload.controller.ts:140-142](file://src/upload/upload.controller.ts#L140-L142)
- [upload.service.ts:331-344](file://src/upload/upload.service.ts#L331-L344)

## Conclusion
The upload module provides a robust, role-aware file management system built on MinIO. It enforces strict validation, scoping, and access control while supporting flexible upload workflows and secure delivery via presigned URLs. Integrations with user profiles, training programs, and diet plans enable contextual media handling. Administrators can manage storage health, enforce policies, and maintain data hygiene through targeted cleanup procedures.

## Appendices

### Supported File Types and Size Limits
- Avatar: Images up to 5 MB.
- Document: PDF and images up to 10 MB.
- Media: Images and videos up to 50 MB.
- Progress: Images up to 10 MB.

**Section sources**
- [upload.constants.ts:1-34](file://src/upload/constants/upload.constants.ts#L1-L34)
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)

### Practical Upload Examples
- Member documents: POST to document endpoint; stored under documents/{userId}.
- Training photos/media: POST to media endpoint; stored under templates/{role}/{userId}.
- Nutrition images: POST to media endpoint; stored under templates/{role}/{userId}.
- Administrative files: POST to document endpoint; stored under documents.

**Section sources**
- [upload.controller.ts:53-69](file://src/upload/upload.controller.ts#L53-L69)
- [upload.controller.ts:77-89](file://src/upload/upload.controller.ts#L77-L89)