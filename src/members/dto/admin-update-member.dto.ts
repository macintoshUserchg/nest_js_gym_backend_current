import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

// Admin-only DTO for updating member with all fields including sensitive ones
// Use this for admin endpoints that need to update branch, membership status, etc.
export class AdminUpdateMemberDto extends PartialType(CreateMemberDto) {}
