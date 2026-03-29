import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { UserRole } from '../../common/enums/permissions.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<Role | UserRole>) =>
  SetMetadata(ROLES_KEY, roles);
