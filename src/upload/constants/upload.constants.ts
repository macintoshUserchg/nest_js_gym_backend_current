// Allowed MIME types by category
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// File categories with validation rules
export const FILE_CATEGORIES = {
  avatar: {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'avatars',
  },
  document: {
    allowedTypes: [...ALLOWED_DOCUMENT_TYPES],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'documents',
  },
  media: {
    allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
    maxSize: 50 * 1024 * 1024, // 50MB
    folder: 'templates',
  },
  progress: {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'progress',
  },
} as const;

export type FileCategory = keyof typeof FILE_CATEGORIES;

// Bucket name
export const MINIO_BUCKET = 'gym-media';
