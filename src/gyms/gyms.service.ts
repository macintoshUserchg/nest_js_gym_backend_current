import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(Gym)
    private gymsRepo: Repository<Gym>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
  ) {}

  // ========== GYM OPERATIONS ==========

  async create(createGymDto: CreateGymDto) {
    const gym = this.gymsRepo.create(createGymDto);
    const savedGym = await this.gymsRepo.save(gym);

    // Create default branch for the gym
    const defaultBranch = this.branchesRepo.create({
      name: `${savedGym.name} - Main Branch`,
      email: savedGym.email,
      phone: savedGym.phone,
      address: savedGym.address,
      location: savedGym.location,
      state: savedGym.state,
      gym: savedGym,
      mainBranch: true,
    });

    await this.branchesRepo.save(defaultBranch);

    // Return gym with the default branch
    return this.gymsRepo.findOne({
      where: { gymId: savedGym.gymId },
      relations: ['branches'],
    });
  }

  async findAll() {
    return this.gymsRepo.find({ relations: ['branches'] });
  }

  async findOne(id: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId: id },
      relations: ['branches', 'users'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return gym;
  }

  async update(id: string, updateGymDto: UpdateGymDto) {
    const gym = await this.findOne(id);
    Object.assign(gym, updateGymDto);
    return this.gymsRepo.save(gym);
  }

  async remove(id: string) {
    const gym = await this.findOne(id);
    return this.gymsRepo.remove(gym);
  }

  // ========== BRANCH OPERATIONS ==========

  async createBranch(gymId: string, createBranchDto: CreateBranchDto) {
    const gym = await this.findOne(gymId);

    // Set mainBranch to false if not provided (to ensure only one main branch per gym)
    const branchData = {
      ...createBranchDto,
      gym,
      mainBranch: createBranchDto.mainBranch || false,
    };

    const branch = this.branchesRepo.create(branchData);
    await this.branchesRepo.save(branch);

    // Fetch the gym with all branches to return structured response
    const updatedGym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });

    if (!updatedGym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    return {
      gym: {
        gymId: updatedGym.gymId,
        name: updatedGym.name,
        email: updatedGym.email,
        phone: updatedGym.phone,
        address: updatedGym.address,
        location: updatedGym.location,
        state: updatedGym.state,
        createdAt: updatedGym.createdAt,
        updatedAt: updatedGym.updatedAt,
        branches: updatedGym.branches.map((b) => ({
          branchId: b.branchId,
          name: b.name,
          email: b.email,
          phone: b.phone,
          address: b.address,
          location: b.location,
          state: b.state,
          mainBranch: b.mainBranch,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        })),
      },
    };
  }

  async findBranchesByGym(gymId: string) {
    await this.findOne(gymId); // Verify gym exists
    const branches = await this.branchesRepo.find({
      where: { gym: { gymId } },
    });

    return branches.map((branch) => ({
      branchId: branch.branchId,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      location: branch.location,
      state: branch.state,
      mainBranch: branch.mainBranch,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    }));
  }

  async findOneBranch(id: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId: id },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async updateBranch(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOneBranch(id);
    Object.assign(branch, updateBranchDto);
    return this.branchesRepo.save(branch);
  }

  async removeBranch(id: string) {
    const branch = await this.findOneBranch(id);
    return this.branchesRepo.remove(branch);
  }
}
