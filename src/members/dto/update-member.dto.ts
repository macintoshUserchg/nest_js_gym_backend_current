import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

// Exclude admin-only and sensitive fields from regular member updates
// These fields should only be modified by admins through separate endpoints
export class UpdateMemberDto extends OmitType(PartialType(CreateMemberDto), [
  'branchId',
  'membershipPlanId',
  'isActive',
  'freezMember',
  'selectedClassIds',
] as const) {}
