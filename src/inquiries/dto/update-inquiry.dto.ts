import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  InquirySource,
  PreferredMembershipType,
  InquiryStatus,
} from '../../entities/inquiry.entity';
import { CreateInquiryDto } from './create-inquiry.dto';

export class UpdateInquiryDto extends PartialType(CreateInquiryDto) {
  @ApiPropertyOptional({
    description: 'Updated status of the inquiry',
    enum: InquiryStatus,
  })
  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;

  @ApiPropertyOptional({
    description: 'Updated source of inquiry',
    enum: InquirySource,
  })
  @IsEnum(InquirySource)
  @IsOptional()
  source?: InquirySource;

  @ApiPropertyOptional({
    description: 'Updated preferred membership type',
    enum: PreferredMembershipType,
  })
  @IsEnum(PreferredMembershipType)
  @IsOptional()
  preferredMembershipType?: PreferredMembershipType;

  @ApiPropertyOptional({ description: 'Updated contact attempts timestamp' })
  @IsOptional()
  contactedAt?: Date;

  @ApiPropertyOptional({ description: 'Updated conversion timestamp' })
  @IsOptional()
  convertedAt?: Date;

  @ApiPropertyOptional({ description: 'Updated closure timestamp' })
  @IsOptional()
  closedAt?: Date;
}
