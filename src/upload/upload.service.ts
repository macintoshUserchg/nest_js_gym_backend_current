import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import {
  FILE_CATEGORIES,
  FileCategory,
  MINIO_BUCKET,
} from './constants/upload.constants';
import {
  UploadedFile,
  PresignedUrlResponse,
} from './interfaces/upload.interface';
import { User } from '../entities/users.entity';
import { UserRole } from '../common/enums/permissions.enum';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly minioClient: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly avatarMaxSize: number;
  private readonly documentMaxSize: number;
  private readonly mediaMaxSize: number;

  constructor(private configService: ConfigService) {
    const endpoint =
      this.configService.get<string>('minio.minio.endpoint') ||
      'localhost:9000';
    const [host, portStr] = endpoint.includes(':')
      ? endpoint.split(':')
      : [endpoint, '9000'];

    this.minioClient = new Client({
      endPoint: host,
      port: parseInt(portStr) || 9000,
      useSSL: this.configService.get<boolean>('minio.minio.useSsl') || false,
      accessKey:
        this.configService.get<string>('minio.minio.accessKey') || 'minioadmin',
      secretKey:
        this.configService.get<string>('minio.minio.secretKey') || 'minioadmin',
    });

    this.bucket =
      this.configService.get<string>('minio.minio.bucket') || MINIO_BUCKET;
    this.publicUrl =
      this.configService.get<string>('minio.minio.publicUrl') ||
      'http://localhost:9000';
    this.avatarMaxSize =
      this.configService.get<number>('minio.upload.avatarMaxSize') ||
      5 * 1024 * 1024;
    this.documentMaxSize =
      this.configService.get<number>('minio.upload.documentMaxSize') ||
      10 * 1024 * 1024;
    this.mediaMaxSize =
      this.configService.get<number>('minio.upload.mediaMaxSize') ||
      50 * 1024 * 1024;
  }

  /**
   * Ensure bucket exists, create if not
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
        this.logger.log(`Bucket ${this.bucket} created`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket exists: ${error.message}`);
      throw new ServiceUnavailableException('Storage service unavailable');
    }
  }

  /**
   * Validate file type and size based on category
   */
  validateFile(category: string, mimetype: string, size: number): void {
    const config = FILE_CATEGORIES[category as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }

    if (!config.allowedTypes.includes(mimetype)) {
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
            : 10 * 1024 * 1024; // progress

    if (size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Generate unique file key with UUID - role-scoped for security
   */
  private generateFileKey(folder: string, originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const uuid = uuidv4();
    return `${folder}/${uuid}${ext}`;
  }

  /**
   * Generate user-scoped file key with role-based folder
   */
  private generateUserFileKey(
    baseFolder: string,
    userId: string,
    originalFilename: string,
  ): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const uuid = uuidv4();
    return `${baseFolder}/${userId}/${uuid}${ext}`;
  }

  /**
   * Upload file to MinIO (general use - no user scoping)
   */
  async uploadFile(
    file: Express.Multer.File,
    category: string,
  ): Promise<UploadedFile> {
    await this.ensureBucketExists();

    this.validateFile(category, file.mimetype, file.size);

    const config = FILE_CATEGORIES[category as FileCategory];
    const key = this.generateFileKey(config.folder, file.originalname);

    try {
      await this.minioClient.putObject(
        this.bucket,
        key,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      const url = `${this.publicUrl}/${this.bucket}/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file for specific user with role-based folder scoping
   * Files are stored in: {category}/{role}/{userId}/{uuid}.ext
   */
  async uploadFileForUser(
    file: Express.Multer.File,
    category: string,
    user: User,
    roleFolder: string,
  ): Promise<UploadedFile> {
    await this.ensureBucketExists();

    this.validateFile(category, file.mimetype, file.size);

    // Generate user-scoped key: avatars/superadmin/usr_123/abc123.jpg
    const key = this.generateUserFileKey(
      FILE_CATEGORIES[category as FileCategory].folder,
      user.userId,
      file.originalname,
    );

    try {
      await this.minioClient.putObject(
        this.bucket,
        key,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      const url = `${this.publicUrl}/${this.bucket}/${key}`;

      this.logger.log(`File uploaded for user ${user.userId}: ${key}`);

      return {
        url,
        key,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file for user: ${error.message}`);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, key);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get presigned URL for upload (direct browser upload) - admin use
   */
  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResponse> {
    await this.ensureBucketExists();

    const config = FILE_CATEGORIES[folder as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid folder: ${folder}`);
    }

    const key = this.generateFileKey(folder, filename);

    try {
      const uploadUrl = await this.minioClient.presignedPutObject(
        this.bucket,
        key,
        3600, // 1 hour expiry
      );

      return {
        uploadUrl,
        key,
        publicUrl: `${this.publicUrl}/${this.bucket}/${key}`,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to generate upload URL: ${error.message}`,
      );
    }
  }

  /**
   * Get presigned URL for user-scoped upload
   * Users can only upload to their own role-scoped folder
   */
  async getPresignedUploadUrlForUser(
    folder: string,
    filename: string,
    contentType: string,
    user: User,
    roleFolder: string,
  ): Promise<PresignedUrlResponse> {
    await this.ensureBucketExists();

    const config = FILE_CATEGORIES[folder as FileCategory];
    if (!config) {
      throw new BadRequestException(`Invalid folder: ${folder}`);
    }

    // Generate user-scoped key
    const key = this.generateUserFileKey(config.folder, user.userId, filename);

    try {
      const uploadUrl = await this.minioClient.presignedPutObject(
        this.bucket,
        key,
        3600, // 1 hour expiry
      );

      return {
        uploadUrl,
        key,
        publicUrl: `${this.publicUrl}/${this.bucket}/${key}`,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to generate upload URL: ${error.message}`,
      );
    }
  }

  /**
   * Validate if user has access to download a file
   * Users can only access files in their own role folder
   */
  validateFileAccess(key: string, user: User): boolean {
    const userRole = user.role.name.toLowerCase();
    const userId = user.userId;

    // Admins can access all files
    if (
      user.role.name === UserRole.SUPERADMIN ||
      user.role.name === UserRole.ADMIN
    ) {
      return true;
    }

    // Check if file is in user's own folder
    // Pattern: {category}/{role}/{userId}/... or {category}/{userId}/...
    const keyParts = key.split('/');

    // Check for direct user ID match in path
    if (key.includes(`/${userId}/`)) {
      return true;
    }

    // Check for role folder pattern: avatars/superadmin/usr_123/...
    if (key.includes(`/${userRole}/${userId}/`)) {
      return true;
    }

    // TRAINERs can access templates folder
    if (user.role.name === UserRole.TRAINER && key.startsWith('templates/')) {
      return true;
    }

    this.logger.warn(`Access denied for user ${userId} to file ${key}`);
    return false;
  }

  /**
   * Get presigned URL for download
   */
  async getPresignedDownloadUrl(key: string): Promise<string> {
    try {
      const downloadUrl = await this.minioClient.presignedGetObject(
        this.bucket,
        key,
        3600, // 1 hour expiry
      );
      return downloadUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned download URL: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to generate download URL: ${error.message}`,
      );
    }
  }

  /**
   * Health check for MinIO connection
   */
  async healthCheck(): Promise<{ status: string; bucket: string }> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      return {
        status: exists ? 'ok' : 'error',
        bucket: this.bucket,
      };
    } catch (error) {
      return {
        status: 'error',
        bucket: this.bucket,
      };
    }
  }
}
