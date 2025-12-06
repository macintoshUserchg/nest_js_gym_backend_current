import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBodyProgressDto {
  @IsNumber()
  memberId: number;

  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  body_fat?: number;

  @IsOptional()
  @IsNumber()
  bmi?: number;

  @IsOptional()
  measurements?: any;

  @IsOptional()
  progress_photos?: any;

  @IsDateString()
  date: string;
}
