import { registerAs } from '@nestjs/config';

export interface S3Config {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
  forcePathStyle: boolean;
}

export interface UploadConfig {
  maxFileSize: number;
  maxFiles: number;
  avatarMaxSize: number;
  documentMaxSize: number;
  mediaMaxSize: number;
}

function normalizeEndpoint(raw?: string): string | undefined {
  if (!raw || raw.trim().length === 0) return undefined;
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const storageConfig = registerAs(
  'storage',
  (): { s3: S3Config; upload: UploadConfig } => {
    const endpoint = normalizeEndpoint(process.env.S3_ENDPOINT);
    const hasEndpoint = typeof endpoint === 'string' && endpoint.length > 0;
    return {
      s3: {
        endpoint,
        region: process.env.S3_REGION || 'us-east-1',
        bucket: process.env.S3_BUCKET || 'gym-media',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        publicUrl: process.env.S3_PUBLIC_URL
          ? process.env.S3_PUBLIC_URL.trim()
          : undefined,
        forcePathStyle:
          process.env.S3_FORCE_PATH_STYLE !== undefined
            ? process.env.S3_FORCE_PATH_STYLE === 'true'
            : hasEndpoint,
      },
      upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
        maxFiles: 5,
        avatarMaxSize: 5 * 1024 * 1024,
        documentMaxSize: 10 * 1024 * 1024,
        mediaMaxSize: 50 * 1024 * 1024,
      },
    };
  },
);
