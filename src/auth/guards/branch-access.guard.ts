import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Role } from '../../common/enums/role.enum';

interface BranchAccessRequest {
  user?: {
    role?: string;
    gymId?: string;
  };
  params: Record<string, string | undefined>;
}

@Injectable()
export class BranchAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireBranchOwner = this.reflector.getAllAndOverride<boolean>(
      'requireBranchOwner',
      [context.getHandler(), context.getClass()],
    );

    if (!requireBranchOwner) {
      return true;
    }

    const request = context.switchToHttp().getRequest<BranchAccessRequest>();
    const { user, params } = request;

    if (!user) {
      return true;
    }

    const userRole = user.role;
    const isSuperAdmin = userRole === Role.SUPERADMIN;

    // SUPERADMIN can read any tenant. MEMBER/TRAINER scoping is handled at
    // the service layer for their own records; this guard confines admins.
    if (isSuperAdmin || userRole !== Role.ADMIN) {
      return true;
    }

    // From here the caller is an ADMIN: restrict to their own gym.
    const adminGymId = user.gymId;
    if (!adminGymId) {
      throw new ForbiddenException('Your account is not associated with a gym');
    }

    const branchId = params.branchId;
    const gymId = params.gymId;

    if (branchId) {
      const branch = await this.branchRepository.findOne({
        where: { branchId },
        relations: ['gym'],
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      if (!branch.gym || branch.gym.gymId !== adminGymId) {
        throw new ForbiddenException('You do not have access to this branch');
      }

      return true;
    }

    if (gymId && gymId !== adminGymId) {
      throw new ForbiddenException('You do not have access to this gym');
    }

    return true;
  }
}
