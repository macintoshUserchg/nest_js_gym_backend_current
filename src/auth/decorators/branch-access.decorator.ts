import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as tenant-scoped. Must be paired with `@UseGuards(JwtAuthGuard, BranchAccessGuard)`.
 *
 * When set, BranchAccessGuard restricts ADMIN callers to their own gym:
 * - `:gymId` routes: the param must equal the caller's gym.
 * - `:branchId` routes: the branch's gym must match the caller's gym.
 *
 * SUPERADMIN bypasses the check; MEMBER/TRAINER are expected to be scoped at
 * the service layer for their own records.
 */
export const REQUIRE_BRANCH_OWNER_KEY = 'requireBranchOwner';
export const RequireBranchOwner = () =>
  SetMetadata(REQUIRE_BRANCH_OWNER_KEY, true);
