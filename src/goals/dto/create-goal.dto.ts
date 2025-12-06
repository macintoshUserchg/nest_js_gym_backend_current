import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @IsNumber()
  memberId: number;

  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @IsString()
  goal_type: string;

  @IsOptional()
  @IsNumber()
  target_value?: number;

  @IsOptional()
  @IsDateString()
  target_timeline?: string;

  @IsOptional()
  milestone?: any;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  completion_percent?: number;
}
