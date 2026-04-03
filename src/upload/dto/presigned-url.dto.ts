import { MaxLength, IsString, IsEnum} from 'class-validator';
import { UploadCategory } from './upload-file.dto';

export class PresignedUrlDto {
  @IsEnum(UploadCategory)
  folder: UploadCategory;

  @IsString()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(255)
  contentType: string;
}
