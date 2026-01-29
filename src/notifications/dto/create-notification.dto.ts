import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../entities/notifications.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Goal Achieved!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Congratulations! You have completed your weekly goal.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: 'uuid-here' })
  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @ApiPropertyOptional({ example: 'goal' })
  @IsOptional()
  @IsString()
  reference_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: {
    entity_type?: string;
    entity_id?: string;
    action?: string;
    related_data?: any;
  };
}

export class NotificationFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  is_read?: boolean;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
