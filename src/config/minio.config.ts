import { registerAs } from '@nestjs/config';

export interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
  useSsl: boolean;
}

export interface UploadConfig {
  maxFileSize: number;
  maxFiles: number;
  avatarMaxSize: number;
  documentMaxSize: number;
  mediaMaxSize: number;
}

export const minioConfig = registerAs('minio', (): { minio: MinioConfig; upload: UploadConfig } => ({
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost:9000',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'gym-media',
    publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000',
    useSsl: process.env.MINIO_USE_SSL === 'true',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    maxFiles: 5,
    avatarMaxSize: 5 * 1024 * 1024,
    documentMaxSize: 10 * 1024 * 1024,
    mediaMaxSize: 50 * 1024 * 1024,
  },
}));
