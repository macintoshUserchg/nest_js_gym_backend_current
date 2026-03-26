import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum UploadCategory {
  AVATAR = 'avatar',
  DOCUMENT = 'document',
  MEDIA = 'media',
  PROGRESS = 'progress',
}

export class UploadFileDto {
  @IsEnum(UploadCategory)
  category: UploadCategory;
}

export class UploadCategoryParamDto {
  @IsString()
  category: string;
}
