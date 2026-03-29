import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/classes.entity';
import { Branch } from '../entities/branch.entity';
import { Trainer } from '../entities/trainers.entity';
import { Gym } from '../entities/gym.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(Gym)
    private gymsRepo: Repository<Gym>,
  ) {}

  async create(createDto: CreateClassDto) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId: createDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${createDto.branchId} not found`,
      );
    }

    const classData: any = {
      name: createDto.name,
      description: createDto.description,
      branch,
    };

    if (createDto.trainerId) {
      const trainer = await this.trainersRepo.findOne({
        where: { id: createDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createDto.trainerId} not found`,
        );
      }
      classData.trainer = trainer;
    }

    // Add timings if provided
    if (createDto.timings) {
      classData.timings = createDto.timings;
    }

    // Add recurrence fields if provided
    if (createDto.recurrenceType) {
      classData.recurrence_type = createDto.recurrenceType;
    }
    if (createDto.daysOfWeek) {
      classData.days_of_week = createDto.daysOfWeek;
    }
    const classEntity = this.classesRepo.create(classData);
    return this.classesRepo.save(classEntity);
  }

  async findAll(branchId?: string, timing?: string, day?: number) {
    const queryBuilder = this.classesRepo
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.branch', 'branch')
      .leftJoinAndSelect('class.trainer', 'trainer');

    if (branchId) {
      queryBuilder.andWhere('branch.branchId = :branchId', { branchId });
    }

    if (timing) {
      queryBuilder.andWhere('class.timings ILIKE :timing', {
        timing: `%${timing}%`,
      });
    }

    if (day !== undefined) {
      queryBuilder.andWhere('class.days_of_week::int[] && :day', {
        day: [day],
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const classEntity = await this.classesRepo.findOne({
      where: { class_id: id },
      relations: ['branch', 'trainer'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async findByBranch(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }
    return this.classesRepo.find({
      where: { branch: { branchId } },
      relations: ['branch', 'trainer'],
    });
  }

  async update(id: string, updateDto: UpdateClassDto) {
    const classEntity = await this.findOne(id);

    if (updateDto.branchId) {
      const branch = await this.branchesRepo.findOne({
        where: { branchId: updateDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateDto.branchId} not found`,
        );
      }
      classEntity.branch = branch;
    }

    if (updateDto.trainerId !== undefined) {
      if (updateDto.trainerId) {
        const trainer = await this.trainersRepo.findOne({
          where: { id: updateDto.trainerId },
        });
        if (!trainer) {
          throw new NotFoundException(
            `Trainer with ID ${updateDto.trainerId} not found`,
          );
        }
        classEntity.trainer = trainer;
      } else {
        classEntity.trainer = undefined;
      }
    }

    if (updateDto.name) classEntity.name = updateDto.name;
    if (updateDto.description !== undefined)
      classEntity.description = updateDto.description;

    // Update timings
    if (updateDto.timings !== undefined) {
      classEntity.timings = updateDto.timings;
    }

    // Update recurrence fields
    if (updateDto.recurrenceType !== undefined) {
      classEntity.recurrence_type = updateDto.recurrenceType;
    }
    if (updateDto.daysOfWeek !== undefined) {
      classEntity.days_of_week = updateDto.daysOfWeek;
    }
    return this.classesRepo.save(classEntity);
  }

  async remove(id: string) {
    const classEntity = await this.findOne(id);
    return this.classesRepo.remove(classEntity);
  }

  async findByGym(gymId: string) {
    // Verify gym exists
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    // Get all branches for the gym
    const branches = await this.branchesRepo.find({
      where: { gym: { gymId } },
    });

    if (branches.length === 0) {
      return [];
    }

    // Get all classes for all branches
    const branchIds = branches.map((branch) => branch.branchId);
    return this.classesRepo.find({
      where: branchIds.map((branchId) => ({ branch: { branchId } })),
      relations: ['branch', 'trainer'],
    });
  }

  async findByTrainer(trainerId: number) {
    const trainer = await this.trainersRepo.findOne({
      where: { id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    return this.classesRepo.find({
      where: { trainer: { id: trainerId } },
      relations: ['branch', 'trainer'],
    });
  }
}
