# MinIO Enhancement Plan

**Project:** NestJS Gym Management Backend
**Date:** 2026-03-31
**Status:** Ready for Implementation

---

## Overview

Three enhancements to the MinIO upload module:

1. Environment variable configuration
2. Image compression with thumbnail generation
3. Orphaned file cleanup (manual trigger)

---

## Task 1: MINIO Environment Variables

### Files to Modify

- `.env` — add MinIO vars with local dev defaults
- `.env.example` — add MinIO vars as template

### Variables

```
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="gym-media"
MINIO_PUBLIC_URL="http://localhost:9000"
MINIO_USE_SSL="false"
```

These are already read by `src/config/minio.config.ts` but not set in `.env`.

---

## Task 2: Image Compression with Thumbnails

### Install

```bash
npm install sharp
npm install -D @types/sharp
```

### New File: `src/upload/image-compression.service.ts`

**Responsibilities:**

- Generate thumbnails from uploaded image buffers
- Only process image mimetypes (jpeg, png, webp, gif)
- Skip non-images (pdf, video) — pass through unchanged

**Thumbnail Sizes:**
| Suffix | Dimensions | Fit Mode |
|--------|-----------|----------|
| `_small` | 150x150 | cover |
| `_medium` | 400x400 | cover |

**Key Method:**

```typescript
async generateThumbnails(
  buffer: Buffer,
  mimetype: string
): Promise<{
  small: Buffer | null;
  medium: Buffer | null;
}>
```

**Thumbnail Key Convention:**

- Original: `avatars/usr_123/abc-def.jpg`
- Small: `avatars/usr_123/abc-def_small.jpg`
- Medium: `avatars/usr_123/abc-def_medium.jpg`

### Modify: `src/upload/upload.service.ts`

- Inject `ImageCompressionService`
- In `uploadFile()` and `uploadFileForUser()`:
  1. Upload original file (existing)
  2. Call `generateThumbnails()` for images
  3. Upload `_small` and `_medium` variants if generated
  4. Return `UploadedFile` with thumbnail URLs

### Modify: `src/upload/interfaces/upload.interface.ts`

Update `UploadedFile` interface:

```typescript
export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  mimetype: string;
  originalName: string;
  thumbnail_small?: string; // 150x150 URL
  thumbnail_medium?: string; // 400x400 URL
}
```

### Response Format (All URLs in Response)

```json
{
  "url": "http://localhost:9000/gym-media/avatars/usr_123/abc-def.jpg",
  "key": "avatars/usr_123/abc-def.jpg",
  "size": 204800,
  "mimetype": "image/jpeg",
  "originalName": "photo.jpg",
  "thumbnail_small": "http://localhost:9000/gym-media/avatars/usr_123/abc-def_small.jpg",
  "thumbnail_medium": "http://localhost:9000/gym-media/avatars/usr_123/abc-def_medium.jpg"
}
```

---

## Task 3: Orphaned File Cleanup

### New File: `src/upload/cleanup.service.ts`

**Orphaned file definition:** Files in MinIO bucket not referenced by any entity field in the database.

### Entity Fields That Store File URLs

| #   | Entity           | Field             | Type   | Notes         |
| --- | ---------------- | ----------------- | ------ | ------------- |
| 1   | Member           | `avatarUrl`       | string | Single URL    |
| 2   | Member           | `attachmentUrl`   | string | Single URL    |
| 3   | Gym              | `logoUrl`         | string | Single URL    |
| 4   | Trainer          | `avatarUrl`       | string | Single URL    |
| 5   | ProgressTracking | `photo_url`       | string | Single URL    |
| 6   | BodyProgress     | `progress_photos` | JSONB  | Array of URLs |
| 7   | ExerciseLibrary  | `video_url`       | string | Single URL    |
| 8   | ExerciseLibrary  | `image_url`       | string | Single URL    |
| 9   | MealLibrary      | `image_url`       | string | Single URL    |

**Total:** 9 fields across 6 entities (1 is JSONB array)

### Two-Step Process

**Step 1 — Preview (Dry Run):**

```
POST /upload/cleanup/preview
Auth: Admin only
```

Response:

```json
{
  "total_files_in_minio": 150,
  "referenced_in_db": 120,
  "orphaned": 30,
  "orphaned_files": [
    {
      "key": "avatars/usr_old/abc123.jpg",
      "size": 204800,
      "last_modified": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Step 2 — Delete:**

```
POST /upload/cleanup/run
Auth: Admin only
Body: { "keys": ["avatars/usr_old/abc123.jpg", ...] }
```

Response:

```json
{
  "total_submitted": 30,
  "deleted": 28,
  "failed": 2,
  "errors": [{ "key": "avatars/x.jpg", "error": "File not found" }]
}
```

### Cleanup Logic

1. List all objects in MinIO bucket via `minioClient.listObjects(bucket, '', true)`
2. Query all 9 file fields from 6 entities
3. For `progress_photos` (JSONB): parse array, extract each URL
4. Extract MinIO key from each URL (strip `{publicUrl}/{bucket}/` prefix)
5. Build set of all referenced keys
6. Compare: MinIO keys not in referenced set = orphaned
7. Filter out `_small` and `_medium` thumbnail keys if their parent key is referenced (thumbnails are tied to parent)

### Modify: `src/upload/upload.module.ts`

- Import TypeORM entities: Member, Trainer, Gym, ProgressTracking, BodyProgress, ExerciseLibrary, MealLibrary
- Register `ImageCompressionService` and `CleanupService`
- Export both new services

---

## Implementation Order

| Step | Task                                | Files                                       |
| ---- | ----------------------------------- | ------------------------------------------- |
| 1    | Add MINIO env vars                  | `.env`, `.env.example`                      |
| 2    | Install sharp                       | `package.json`                              |
| 3    | Create ImageCompressionService      | `src/upload/image-compression.service.ts`   |
| 4    | Update UploadedFile interface       | `src/upload/interfaces/upload.interface.ts` |
| 5    | Modify UploadService                | `src/upload/upload.service.ts`              |
| 6    | Modify UploadController (responses) | `src/upload/upload.controller.ts`           |
| 7    | Create CleanupService               | `src/upload/cleanup.service.ts`             |
| 8    | Add cleanup endpoints               | `src/upload/upload.controller.ts`           |
| 9    | Update UploadModule                 | `src/upload/upload.module.ts`               |
| 10   | Verify build                        | `npm run build`                             |

---

## File Structure (After Implementation)

```
src/upload/
├── cleanup.service.ts          ← NEW
├── constants/
│   └── upload.constants.ts
├── dto/
│   ├── presigned-url.dto.ts
│   └── upload-file.dto.ts
├── image-compression.service.ts ← NEW
├── interfaces/
│   └── upload.interface.ts     ← MODIFY
├── upload.controller.ts        ← MODIFY
├── upload.module.ts            ← MODIFY
└── upload.service.ts           ← MODIFY
```
