import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Branch } from '../entities/branch.entity';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';

@Injectable()
export class MembershipPlansService {
  constructor(
    @InjectRepository(MembershipPlan)
    private plansRepo: Repository<MembershipPlan>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
  ) {}

  async create(createDto: CreateMembershipPlanDto) {
    let branch: Branch | undefined = undefined;
    if (createDto.branchId) {
      const foundBranch = await this.branchesRepo.findOne({
        where: { branchId: createDto.branchId },
      });
      if (!foundBranch) {
        throw new NotFoundException(`Branch with ID ${createDto.branchId} not found`);
      }
      branch = foundBranch;
    }

    const plan = this.plansRepo.create({
      name: createDto.name,
      price: createDto.price,
      durationInDays: createDto.durationInDays,
      description: createDto.description,
      branch,
    });
    return this.plansRepo.save(plan);
  }

  async findAll() {
    return this.plansRepo.find({
      relations: ['branch'],
    });
  }

  async findOne(id: number) {
    const plan = await this.plansRepo.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!plan) {
      throw new NotFoundException(`Membership plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: number, updateDto: UpdateMembershipPlanDto) {
    const plan = await this.findOne(id);

    if (updateDto.branchId !== undefined) {
      if (updateDto.branchId) {
        const branch = await this.branchesRepo.findOne({
          where: { branchId: updateDto.branchId },
        });
        if (!branch) {
          throw new NotFoundException(`Branch with ID ${updateDto.branchId} not found`);
        }
        plan.branch = branch;
      } else {
        plan.branch = undefined;
      }
    }

    Object.assign(plan, {
      name: updateDto.name,
      price: updateDto.price,
      durationInDays: updateDto.durationInDays,
      description: updateDto.description,
    });
    
    return this.plansRepo.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.plansRepo.remove(plan);
  }

  async findByBranch(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.plansRepo.find({
      where: { branch: { branchId } },
      relations: ['branch'],
    });
  }
}
