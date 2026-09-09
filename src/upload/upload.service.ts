import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';
import {
  FILE_CATEGORIES,
  FileCategory,
  S3_BUCKET,
} from './constants/upload.constants';
import {
  UploadedFile,
  PresignedUrlResponse,
} from './interfaces/upload.interface';
import { User } from '../entities/users.entity';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;
  private readonly endpoint?: string;
  private readonly region: string;
  private readonly forcePathStyle: boolean;
  private readonly avatarMaxSize: number;
  private readonly documentMaxSize: number;
  private readonly mediaMaxSize: number;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('storage.s3.endpoint');
    const region =
      this.configService.get<string>('storage.s3.region') || 'us-east-1';
    const bucket =
      this.configService.get<string>('storage.s3.bucket') || S3_BUCKET;
    const accessKeyId = this.configService.get<string>(
      'storage.s3.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'storage.s3.secretAccessKey',
    );
    const publicUrl = this.configService.get<string>('storage.s3.publicUrl');
    const forcePathStyle =
      this.configService.get<boolean>('storage.s3.forcePathStyle') ??
      !!endpoint;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new ServiceUnavailableException(
        'S3 storage is not configured. Please set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.',
      );
    }

    this.s3Client = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      forcePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = bucket;
    this.publicUrl = publicUrl;
    this.endpoint = endpoint;
    this.region = region;
    this.forcePathStyle = forcePathStyle;
    this.avatarMaxSize =
      this.configService.get<number>('storage.upload.avatarMaxSize') ||
      5 * 1024 * 1024;
    this.documentMaxSize =
      this.configService.get<number>('storage.upload.documentMaxSize') ||
      10 * 1024 * 1024;
    this.mediaMaxSize =
      this.configService.get<number>('storage.upload.mediaMaxSize') ||
      50 * 1024 * 1024;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }

  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    if (this.endpoint) {
      const base = this.endpoint.replace(/\/$/, '');
      if (this.forcePathStyle) {
        return `${base}/${this.bucket}/${key}`;
      }
      // Derive host from endpoint for virtual-hosted style
      try {
        const url = new URL(base);
        return `${url.protocol}//${this.bucket}.${url.host}/${key}`;
      } catch {
        return `${base}/${this.bucket}/${key}`;
      }
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private isBucketNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };
    return e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404;
  }

  private isAccessDeniedError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as { name?: string; Code?: string };
    return e.name === 'AccessDenied' || e.Code === 'AccessDenied';
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if (this.isBucketNotFoundError(error)) {
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          this.logger.log(`Bucket ${this.bucket} created`);
        } catch (createError) {
          if (this.isAccessDeniedError(createError)) {
            this.logger.warn(
              `No permission to create bucket ${this.bucket}; assuming it exists or will be created externally`,
            );
            return;
          }
          this.logger.error(
            `Failed to create bucket: ${this.getErrorMessage(createError)}`,
          );
          throw new ServiceUnavailableException('Storage service unavailable');
        }
      } else if (this.isAccessDeniedError(error)) {
        this.logger.warn(
          `HeadBucket denied for ${this.bucket}; skipping bucket check`,
        );
        return;
      } else {
        this.logger.error(
          `Failed to ensure bucket exists: ${this.getErrorMessage(error)}`,
        );
        throw new ServiceUnavailableException('Storage service unavailable');
      }
    }
  }

  validateFile(category: string, mimetype: string, size: number): void {
    const config = FILE_CATEGORIES[category as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }
    if (!config.allowedTypes.includes(mimetype as never)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`,
      );
    }
    const maxSize =
      category === 'avatar'
        ? this.avatarMaxSize
        : category === 'document'
          ? this.documentMaxSize
          : category === 'media'
            ? this.mediaMaxSize
            : 10 * 1024 * 1024;
    if (size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }

  private generateFileKey(folder: string, originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const uuid = randomUUID();
    return `${folder}/${uuid}${ext}`;
  }

  private generateUserFileKey(
    baseFolder: string,
    userId: string,
    originalFilename: string,
  ): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const uuid = randomUUID();
    return `${baseFolder}/${userId}/${uuid}${ext}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    category: string,
  ): Promise<UploadedFile> {
    await this.ensureBucketExists();
    this.validateFile(category, file.mimetype, file.size);
    const config = FILE_CATEGORIES[category as FileCategory];
    const key = this.generateFileKey(config.folder, file.originalname);
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );
      const url = this.buildPublicUrl(key);
      this.logger.log(`File uploaded successfully: ${key}`);
      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to upload file: ${message}`);
      throw new BadRequestException(`Upload failed: ${message}`);
    }
  }

  async uploadFileForUser(
    file: Express.Multer.File,
    category: string,
    user: User,
  ): Promise<UploadedFile> {
    await this.ensureBucketExists();
    this.validateFile(category, file.mimetype, file.size);
    const key = this.generateUserFileKey(
      FILE_CATEGORIES[category as FileCategory].folder,
      user.userId,
      file.originalname,
    );
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );
      const url = this.buildPublicUrl(key);
      this.logger.log(`File uploaded for user ${user.userId}: ${key}`);
      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to upload file for user: ${message}`);
      throw new BadRequestException(`Upload failed: ${message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to delete file: ${message}`);
      throw new BadRequestException(`Delete failed: ${message}`);
    }
  }

  async getPresignedUploadUrl(
    folder: string,
    filename: string,
  ): Promise<PresignedUrlResponse> {
    await this.ensureBucketExists();
    const config = FILE_CATEGORIES[folder as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid folder: ${folder}`);
    }
    const key = this.generateFileKey(folder, filename);
    try {
      const uploadUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: 3600 },
      );
      return {
        uploadUrl,
        key,
        publicUrl: this.buildPublicUrl(key),
        expiresIn: 3600,
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to generate presigned upload URL: ${message}`);
      throw new BadRequestException(
        `Failed to generate upload URL: ${message}`,
      );
    }
  }

  async getPresignedUploadUrlForUser(
    folder: string,
    filename: string,
    user: User,
  ): Promise<PresignedUrlResponse> {
    await this.ensureBucketExists();
    const config = FILE_CATEGORIES[folder as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid folder: ${folder}`);
    }
    const key = this.generateUserFileKey(config.folder, user.userId, filename);
    try {
      const uploadUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: 3600 },
      );
      return {
        uploadUrl,
        key,
        publicUrl: this.buildPublicUrl(key),
        expiresIn: 3600,
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to generate presigned upload URL: ${message}`);
      throw new BadRequestException(
        `Failed to generate upload URL: ${message}`,
      );
    }
  }

  validateFileAccess(key: string, user: User): boolean {
    const roleName = typeof user.role?.name === 'string' ? user.role.name : '';
    const userRole = roleName.toLowerCase();
    const userId = user.userId;
    if (roleName === 'SUPERADMIN' || roleName === 'ADMIN') {
      return true;
    }
    if (key.includes(`/${userId}/`)) {
      return true;
    }
    if (key.includes(`/${userRole}/${userId}/`)) {
      return true;
    }
    if (roleName === 'TRAINER' && key.startsWith('templates/')) {
      return true;
    }
    this.logger.warn(`Access denied for user ${userId} to file ${key}`);
    return false;
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    try {
      return await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: 3600 },
      );
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(
        `Failed to generate presigned download URL: ${message}`,
      );
      throw new BadRequestException(
        `Failed to generate download URL: ${message}`,
      );
    }
  }

  async healthCheck(): Promise<{ status: string; bucket: string }> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { status: 'ok', bucket: this.bucket };
    } catch (error) {
      if (this.isAccessDeniedError(error)) {
        return { status: 'ok', bucket: this.bucket };
      }
      return { status: 'error', bucket: this.bucket };
    }
  }
}
