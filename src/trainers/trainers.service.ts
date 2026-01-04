import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
  ) {}

  async create(createDto: CreateTrainerDto) {
    // Check if trainer with email already exists
    const existingTrainer = await this.trainersRepo.findOne({
      where: { email: createDto.email },
    });
    if (existingTrainer) {
      throw new ConflictException('Trainer with this email already exists');
    }

    // Check if user with email already exists
    const existingUser = await this.usersRepo.findOne({
      where: { email: createDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get branch if branchId is provided
    let branch: Branch | undefined = undefined;
    if (createDto.branchId) {
      const foundBranch = await this.branchesRepo.findOne({
        where: { branchId: createDto.branchId },
        relations: ['gym'],
      });
      if (!foundBranch) {
        throw new NotFoundException(
          `Branch with ID ${createDto.branchId} not found`,
        );
      }
      branch = foundBranch;
    }

    // Create trainer
    const trainer = this.trainersRepo.create({
      fullName: createDto.fullName,
      email: createDto.email,
      phone: createDto.phone,
      specialization: createDto.specialization,
      avatarUrl: createDto.avatarUrl,
      branch,
    });

    const savedTrainer = await this.trainersRepo.save(trainer);

    // Create corresponding user with default password
    const trainerRole = await this.rolesRepo.findOne({
      where: { name: 'TRAINER' },
    });

    if (!trainerRole) {
      throw new NotFoundException('TRAINER role not found in the system');
    }

    const defaultPassword = 'pass@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = this.usersRepo.create({
      email: createDto.email,
      passwordHash: hashedPassword,
      role: trainerRole,
      gym: branch?.gym,
      branch: branch,
      trainerId: savedTrainer.id.toString(),
    });

    await this.usersRepo.save(user);

    return savedTrainer;
  }

  async findAll(branchId?: string, specialization?: string) {
    const queryBuilder = this.trainersRepo
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.branch', 'branch');

    if (branchId) {
      queryBuilder.andWhere('branch.branchId = :branchId', { branchId });
    }

    if (specialization) {
      queryBuilder.andWhere('trainer.specialization ILIKE :specialization', {
        specialization: `%${specialization}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const trainer = await this.trainersRepo.findOne({
      where: { id },
      relations: ['branch', 'classes'],
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }
    return trainer;
  }

  async findByBranch(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.trainersRepo.find({
      where: { branch: { branchId } },
      relations: ['branch'],
    });
  }

  async update(id: number, updateDto: UpdateTrainerDto) {
    const trainer = await this.findOne(id);

    if (updateDto.email && updateDto.email !== trainer.email) {
      const existingTrainer = await this.trainersRepo.findOne({
        where: { email: updateDto.email },
      });
      if (existingTrainer) {
        throw new ConflictException('Trainer with this email already exists');
      }
    }

    if (updateDto.branchId !== undefined) {
      if (updateDto.branchId) {
        const branch = await this.branchesRepo.findOne({
          where: { branchId: updateDto.branchId },
        });
        if (!branch) {
          throw new NotFoundException(
            `Branch with ID ${updateDto.branchId} not found`,
          );
        }
        trainer.branch = branch;
      } else {
        trainer.branch = null as any;
      }
    }

    Object.assign(trainer, {
      fullName: updateDto.fullName,
      email: updateDto.email,
      phone: updateDto.phone,
      specialization: updateDto.specialization,
      avatarUrl: updateDto.avatarUrl,
    });

    return this.trainersRepo.save(trainer);
  }

  async remove(id: number) {
    const trainer = await this.findOne(id);
    return this.trainersRepo.remove(trainer);
  }
}
