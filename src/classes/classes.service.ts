import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/classes.entity';
import { Branch } from '../entities/branch.entity';
import { Trainer } from '../entities/trainers.entity';
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

  async findAll() {
    return this.classesRepo.find({
      relations: ['branch'],
    });
  }

  async findOne(id: string) {
    const classEntity = await this.classesRepo.findOne({
      where: { class_id: id },
      relations: ['branch'],
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
      relations: ['branch'],
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
}
