# Cloud Storage Configuration

<cite>
**Referenced Files in This Document**
- [minio.config.ts](file://src/config/minio.config.ts)
- [upload.constants.ts](file://src/upload/constants/upload.constants.ts)
- [upload.interface.ts](file://src/upload/interfaces/upload.interface.ts)
- [upload-file.dto.ts](file://src/upload/dto/upload-file.dto.ts)
- [presigned-url.dto.ts](file://src/upload/dto/presigned-url.dto.ts)
- [upload.service.ts](file://src/upload/upload.service.ts)
- [upload.controller.ts](file://src/upload/upload.controller.ts)
- [upload.module.ts](file://src/upload/upload.module.ts)
- [app.module.ts](file://src/app.module.ts)
- [package.json](file://package.json)
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
This document provides comprehensive cloud storage configuration guidance for the gym management system's object storage implementation. The system uses MinIO as the object storage backend and exposes secure file upload, download, and management capabilities via dedicated APIs. It covers MinIO server setup, bucket configuration, access control policies, file upload options, validation rules, integration patterns, security configurations, and operational best practices.

## Project Structure
The storage subsystem is organized around a dedicated upload module that encapsulates MinIO client initialization, file validation, upload/download workflows, and access control enforcement. Configuration is centralized through NestJS ConfigModule and environment variables.

```mermaid
graph TB
subgraph "Application Modules"
APP["AppModule<br/>loads config"]
UM["UploadModule<br/>provides UploadService"]
end
subgraph "Configuration"
CFG["MinioConfig<br/>environment variables"]
UC["Upload Constants<br/>categories & sizes"]
end
subgraph "Storage Layer"
SVC["UploadService<br/>MinIO client"]
CTRL["UploadController<br/>HTTP endpoints"]
MINIO["MinIO Server<br/>object storage"]
end
APP --> UM
UM --> CFG
UM --> UC
UM --> SVC
CTRL --> SVC
SVC --> MINIO
```

**Diagram sources**
- [app.module.ts:66-133](file://src/app.module.ts#L66-L133)
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [minio.config.ts:20-36](file://src/config/minio.config.ts#L20-L36)
- [upload.constants.ts:1-34](file://src/upload/constants/upload.constants.ts#L1-L34)
- [upload.service.ts:11-38](file://src/upload/upload.service.ts#L11-L38)
- [upload.controller.ts:24-27](file://src/upload/upload.controller.ts#L24-L27)

**Section sources**
- [app.module.ts:66-133](file://src/app.module.ts#L66-L133)
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [minio.config.ts:20-36](file://src/config/minio.config.ts#L20-L36)
- [upload.constants.ts:1-34](file://src/upload/constants/upload.constants.ts#L1-L34)

## Core Components
- MinIO configuration provider defines endpoint, credentials, bucket, public URL, and SSL toggle.
- Upload configuration defines per-category size limits and general constraints.
- File categories enumerate allowed MIME types, maximum sizes, and storage folders.
- Interfaces define response structures for uploads and pre-signed URLs.
- DTOs validate incoming requests for upload and pre-signed URL generation.
- UploadService orchestrates bucket creation, file validation, uploads, deletions, and pre-signed URL generation.
- UploadController exposes REST endpoints for authenticated and role-scoped operations.

**Section sources**
- [minio.config.ts:3-36](file://src/config/minio.config.ts#L3-L36)
- [upload.constants.ts:6-34](file://src/upload/constants/upload.constants.ts#L6-L34)
- [upload.interface.ts:1-21](file://src/upload/interfaces/upload.interface.ts#L1-L21)
- [upload-file.dto.ts:1-19](file://src/upload/dto/upload-file.dto.ts#L1-L19)
- [presigned-url.dto.ts:1-14](file://src/upload/dto/presigned-url.dto.ts#L1-L14)
- [upload.service.ts:11-345](file://src/upload/upload.service.ts#L11-L345)
- [upload.controller.ts:24-167](file://src/upload/upload.controller.ts#L24-L167)

## Architecture Overview
The system integrates MinIO as the object storage backend with strict access control and pre-signed URL workflows for secure uploads and downloads.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "UploadController"
participant Service as "UploadService"
participant MinIO as "MinIO Server"
rect rgb(255,255,255)
Note over Client,Controller : Upload flow (authenticated user)
Client->>Controller : POST /upload/avatar (multipart/form-data)
Controller->>Service : uploadFileForUser(file, category, user, roleFolder)
Service->>Service : validateFile(category, mimetype, size)
Service->>MinIO : putObject(bucket, key, buffer, metadata)
MinIO-->>Service : success
Service-->>Controller : UploadedFile {url, key, size, mimetype, originalName}
Controller-->>Client : 201 Created
end
rect rgb(255,255,255)
Note over Client,Controller : Pre-signed upload flow
Client->>Controller : POST /upload/presign
Controller->>Service : getPresignedUploadUrlForUser(folder, filename, contentType, user, roleFolder)
Service->>MinIO : presignedPutObject(bucket, key, expiry)
MinIO-->>Service : uploadUrl
Service-->>Controller : PresignedUrlResponse {uploadUrl, key, publicUrl, expiresIn}
Controller-->>Client : 201 Created
end
rect rgb(255,255,255)
Note over Client,Controller : Download flow with access control
Client->>Controller : GET /upload/ : key
Controller->>Service : validateFileAccess(key, user)
Service-->>Controller : boolean
alt Access granted
Controller->>Service : getPresignedDownloadUrl(key)
Service->>MinIO : presignedGetObject(bucket, key, expiry)
MinIO-->>Service : downloadUrl
Service-->>Controller : downloadUrl
Controller-->>Client : { url }
else Access denied
Controller-->>Client : 403 Forbidden
end
end
```

**Diagram sources**
- [upload.controller.ts:29-106](file://src/upload/upload.controller.ts#L29-L106)
- [upload.controller.ts:113-145](file://src/upload/upload.controller.ts#L113-L145)
- [upload.service.ts:102-184](file://src/upload/upload.service.ts#L102-L184)
- [upload.service.ts:202-273](file://src/upload/upload.service.ts#L202-L273)
- [upload.service.ts:279-326](file://src/upload/upload.service.ts#L279-L326)

## Detailed Component Analysis

### MinIO Configuration Provider
- Centralized configuration via NestJS ConfigModule with environment variable overrides.
- Defines MinIO endpoint, access keys, bucket name, public URL, and SSL flag.
- Provides upload-specific limits for avatars, documents, and media.

```mermaid
classDiagram
class MinioConfigProvider {
+minio.endpoint : string
+minio.accessKey : string
+minio.secretKey : string
+minio.bucket : string
+minio.publicUrl : string
+minio.useSsl : boolean
+upload.maxFileSize : number
+upload.maxFiles : number
+upload.avatarMaxSize : number
+upload.documentMaxSize : number
+upload.mediaMaxSize : number
}
```

**Diagram sources**
- [minio.config.ts:3-36](file://src/config/minio.config.ts#L3-L36)

**Section sources**
- [minio.config.ts:3-36](file://src/config/minio.config.ts#L3-L36)
- [app.module.ts:68-72](file://src/app.module.ts#L68-L72)

### File Categories and Validation
- Enumerated categories: avatar, document, media, progress.
- Each category specifies allowed MIME types, maximum size, and target folder.
- Validation enforces category existence, MIME type allowance, and size limits.

```mermaid
flowchart TD
Start(["validateFile(category, mimetype, size)"]) --> CheckCategory["Lookup category config"]
CheckCategory --> CategoryValid{"Category exists?"}
CategoryValid --> |No| ThrowInvalidCategory["Throw BadRequestException"]
CategoryValid --> |Yes| CheckType["Check mimetype in allowedTypes"]
CheckType --> TypeValid{"Allowed type?"}
TypeValid --> |No| ThrowInvalidType["Throw BadRequestException"]
TypeValid --> |Yes| ComputeMaxSize["Compute maxSize by category"]
ComputeMaxSize --> CheckSize["Compare size <= maxSize"]
CheckSize --> SizeValid{"Within limit?"}
SizeValid --> |No| ThrowTooLarge["Throw BadRequestException"]
SizeValid --> |Yes| Success["Validation passed"]
```

**Diagram sources**
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)
- [upload.constants.ts:6-28](file://src/upload/constants/upload.constants.ts#L6-L28)

**Section sources**
- [upload.constants.ts:6-28](file://src/upload/constants/upload.constants.ts#L6-L28)
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)

### Upload Service Implementation
- Initializes MinIO client from configuration and sets bucket/public URL.
- Ensures bucket exists during operations.
- Generates unique keys with UUIDs and optional user/role scoping.
- Supports direct uploads, user-scoped uploads, deletions, and pre-signed URL generation for upload/download.
- Enforces access control for downloads based on user roles and ownership.

```mermaid
classDiagram
class UploadService {
-minioClient : Client
-bucket : string
-publicUrl : string
-avatarMaxSize : number
-documentMaxSize : number
-mediaMaxSize : number
+ensureBucketExists() : Promise~void~
+validateFile(category, mimetype, size) : void
-generateFileKey(folder, originalFilename) : string
-generateUserFileKey(baseFolder, userId, originalFilename) : string
+uploadFile(file, category) : Promise~UploadedFile~
+uploadFileForUser(file, category, user, roleFolder) : Promise~UploadedFile~
+deleteFile(key) : Promise~void~
+getPresignedUploadUrl(folder, filename, contentType) : Promise~PresignedUrlResponse~
+getPresignedUploadUrlForUser(folder, filename, contentType, user, roleFolder) : Promise~PresignedUrlResponse~
+validateFileAccess(key, user) : boolean
+getPresignedDownloadUrl(key) : Promise~string~
+healthCheck() : Promise~object~
}
```

**Diagram sources**
- [upload.service.ts:11-345](file://src/upload/upload.service.ts#L11-L345)

**Section sources**
- [upload.service.ts:11-345](file://src/upload/upload.service.ts#L11-L345)

### Upload Controller Endpoints
- Avatar upload: authenticated users upload personal avatars to role-scoped folders.
- Document upload: role-based access controls apply; members upload to personal folders; admins/trainers upload globally.
- Media upload: superadmin/admin/trainer can upload workout templates and media to role-scoped folders.
- Progress photos: authenticated users upload to personal progress folders.
- Pre-signed upload: generates short-lived upload URLs for browser-side uploads.
- Pre-signed download: validates access and returns signed download URLs.
- Delete file: admin/superadmin only.
- Health check: public endpoint for storage health verification.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "UploadController"
participant Service as "UploadService"
Client->>Controller : POST /upload/document
Controller->>Controller : Apply RolesGuard (MEMBER/Admin/Trainer)
alt MEMBER
Controller->>Service : uploadFileForUser(file, 'document', user, 'documents/member/{userId}')
else Admin/Trainer
Controller->>Service : uploadFile(file, 'document')
end
Service-->>Controller : UploadedFile
Controller-->>Client : 201 Created
```

**Diagram sources**
- [upload.controller.ts:47-69](file://src/upload/upload.controller.ts#L47-L69)

**Section sources**
- [upload.controller.ts:29-167](file://src/upload/upload.controller.ts#L29-L167)

### Security and Access Control
- Pre-signed URLs: generated with 1-hour expiry for both uploads and downloads.
- Access control: users can only access files in their own folders or designated shared folders (e.g., templates for trainers).
- Admin/SuperAdmin bypass access to all files.
- Role-based folder scoping ensures isolation between user data.

```mermaid
flowchart TD
Request["Download request for key"] --> Validate["validateFileAccess(key, user)"]
Validate --> IsAdmin{"User is Admin/SuperAdmin?"}
IsAdmin --> |Yes| Allow["Allow access"]
IsAdmin --> |No| CheckOwnership["Check key path for user ID or role folder"]
CheckOwnership --> OwnerMatch{"Path matches user ID or role folder?"}
OwnerMatch --> |Yes| Allow
OwnerMatch --> |No| TrainerCheck{"User is Trainer and accessing templates?"}
TrainerCheck --> |Yes| Allow
TrainerCheck --> |No| Deny["403 Forbidden"]
```

**Diagram sources**
- [upload.service.ts:279-309](file://src/upload/upload.service.ts#L279-L309)

**Section sources**
- [upload.service.ts:202-273](file://src/upload/upload.service.ts#L202-L273)
- [upload.service.ts:279-309](file://src/upload/upload.service.ts#L279-L309)

## Dependency Analysis
- UploadModule depends on ConfigModule for configuration injection.
- UploadService depends on MinIO client library and configuration values.
- UploadController depends on UploadService and authentication/authorization guards.
- AppModule loads the MinIO configuration provider and registers UploadModule.

```mermaid
graph LR
PM["package.json<br/>dependencies"] --> MINIO["minio client"]
AM["AppModule"] --> UM["UploadModule"]
UM --> US["UploadService"]
UM --> UC["UploadController"]
US --> MINIO
US --> CFG["MinioConfig"]
```

**Diagram sources**
- [package.json:37](file://package.json#L37)
- [app.module.ts:66-133](file://src/app.module.ts#L66-L133)
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [upload.service.ts:11-38](file://src/upload/upload.service.ts#L11-L38)

**Section sources**
- [package.json:22-47](file://package.json#L22-L47)
- [app.module.ts:66-133](file://src/app.module.ts#L66-L133)
- [upload.module.ts:1-13](file://src/upload/upload.module.ts#L1-L13)
- [upload.service.ts:11-38](file://src/upload/upload.service.ts#L11-L38)

## Performance Considerations
- Pre-signed uploads reduce server bandwidth by allowing direct browser-to-storage transfers.
- UUID-based keys prevent hot-spotting and enable efficient cache invalidation.
- Role-based folder scoping improves organization and simplifies lifecycle management.
- Health checks support monitoring and automated failover detection.
- Consider enabling compression and CDN caching for frequently accessed assets (see CDN section).

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:

- MinIO connectivity failures
  - Verify endpoint, access key, secret key, and SSL configuration.
  - Ensure bucket exists or allow automatic creation during first operation.
  - Check network reachability and firewall rules.

- Upload failures
  - Confirm file MIME type is allowed for the chosen category.
  - Ensure file size does not exceed category-specific limits.
  - Validate multipart form data structure and presence of file field.

- Access denied errors
  - Verify user role and ownership of requested file key.
  - Confirm pre-signed URL was generated for the correct user and role folder.
  - Review trainer access to templates folder.

- Pre-signed URL expiration
  - Regenerate URLs if expired; default expiry is 1 hour.
  - Ensure client-side time synchronization.

- Health check failures
  - Use the public health endpoint to diagnose storage availability.
  - Check MinIO server logs and cluster status.

**Section sources**
- [upload.service.ts:43-54](file://src/upload/upload.service.ts#L43-L54)
- [upload.service.ts:59-79](file://src/upload/upload.service.ts#L59-L79)
- [upload.service.ts:279-309](file://src/upload/upload.service.ts#L279-L309)
- [upload.controller.ts:163-167](file://src/upload/upload.controller.ts#L163-L167)

## Conclusion
The gym management system implements a robust, role-aware object storage solution built on MinIO. Configuration is centralized via environment variables, file validation is enforced per category, and access control ensures data isolation. Pre-signed URLs streamline uploads and downloads while maintaining security. The modular design supports easy maintenance, monitoring, and future enhancements such as CDN integration and multi-provider storage backends.