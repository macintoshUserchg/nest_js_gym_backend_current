import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/permissions.enum';
import { UploadService } from './upload.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload avatar - Any authenticated user can upload their own avatar
   * Role-based folder assignment: avatars/{role}/{userId}/{uuid}.ext
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    // Store in role-based folder: avatars/{role}/{userId}/
    const roleFolder = user.role.name.toLowerCase();
    return this.uploadService.uploadFileForUser(file, 'avatar', user, roleFolder);
  }

  /**
   * Upload document
   * - ADMIN/SUPERADMIN: Can upload any documents
   * - TRAINER: Can upload documents for assigned members
   * - MEMBER: Can only upload own documents
   */
  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    // Check permissions based on role
    if (user.role.name === UserRole.MEMBER) {
      // Members can only upload to their own documents folder
      return this.uploadService.uploadFileForUser(file, 'document', user, `documents/member/${user.userId}`);
    }
    // ADMIN/SUPERADMIN/TRAINER can upload to general documents folder
    return this.uploadService.uploadFile(file, 'document');
  }

  /**
   * Upload media file
   * - ADMIN/SUPERADMIN: Full access
   * - TRAINER: Can upload workout templates and media
   * - MEMBER: Read-only (cannot upload media)
   */
  @Post('media')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TRAINER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const roleFolder = user.role.name.toLowerCase();
    return this.uploadService.uploadFileForUser(file, 'media', user, `templates/${roleFolder}`);
  }

  /**
   * Upload progress photo
   * - Any user can upload their own progress photos
   * - TRAINER can upload for assigned members
   */
  @Post('progress')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProgress(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadService.uploadFileForUser(file, 'progress', user, `progress/${user.userId}`);
  }

  /**
   * Get presigned upload URL
   * - Any authenticated user for their own folders
   * - ADMIN/SUPERADMIN for all folders
   */
  @Post('presign')
  async getPresignedUploadUrl(
    @Body() dto: PresignedUrlDto,
    @CurrentUser() user: User,
  ) {
    // Users can only generate presigned URLs for their own role folder
    const roleFolder = user.role.name.toLowerCase();
    return this.uploadService.getPresignedUploadUrlForUser(
      dto.folder,
      dto.filename,
      dto.contentType,
      user,
      roleFolder,
    );
  }

  /**
   * Get presigned download URL
   * - Users can only download files they own or have access to
   */
  @Get(':key')
  async getPresignedDownloadUrl(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ) {
    // Verify user has access to this file
    const hasAccess = this.uploadService.validateFileAccess(key, user);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this file');
    }
    const url = await this.uploadService.getPresignedDownloadUrl(key);
    return { url };
  }

  /**
   * Delete file - ADMIN/SUPERADMIN only
   */
  @Delete(':key')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async deleteFile(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ) {
    await this.uploadService.deleteFile(key);
    return { success: true, message: 'File deleted successfully' };
  }

  /**
   * Health check - Public endpoint
   */
  @Get('health/check')
  async healthCheck() {
    return this.uploadService.healthCheck();
  }
}