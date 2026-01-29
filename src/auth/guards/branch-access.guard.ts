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
import { Gym } from '../../entities/gym.entity';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Gym)
    private gymRepository: Repository<Gym>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireBranchOwner = this.reflector.getAllAndOverride<boolean>('requireBranchOwner', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireBranchOwner) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!user) {
      return true;
    }

    const userRole = user.role?.name;
    const isSuperAdmin = userRole === 'SUPERADMIN';
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER';

    // Admins can only access their own gym/branch
    if (isAdmin && !isSuperAdmin) {
      const branchId = params.branchId || params.id;
      const gymId = params.gymId || params.id;

      if (branchId) {
        const branch = await this.branchRepository.findOne({
          where: { branchId },
          relations: ['gym'],
        });

        if (!branch) {
          throw new NotFoundException('Branch not found');
        }

        // Check if user belongs to the same gym as the branch
        if (branch.gym && user.gymId !== branch.gym.gymId) {
          throw new ForbiddenException('You do not have access to this branch');
        }
      } else if (gymId) {
        if (user.gymId !== gymId) {
          throw new ForbiddenException('You do not have access to this gym');
        }
      }
    }

    return true;
  }
}
