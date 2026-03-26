import { IsString, IsEnum } from 'class-validator';
import { UploadCategory } from './upload-file.dto';

export class PresignedUrlDto {
  @IsEnum(UploadCategory)
  folder: UploadCategory;

  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}
