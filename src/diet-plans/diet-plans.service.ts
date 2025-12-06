import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diet } from '../entities/diets.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';

@Injectable()
export class DietPlansService {
  constructor(
    @InjectRepository(Diet)
    private dietsRepo: Repository<Diet>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createDietDto: CreateDietDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createDietDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createDietDto.memberId} not found`,
      );
    }

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (GYM_OWNER or TRAINER)
    const userRole = user.role.name;
    if (userRole !== 'GYM_OWNER' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners and trainers can create diet plans',
      );
    }

    const diet = this.dietsRepo.create({
      member,
      assigned_by: user,
      calories: createDietDto.calories,
      protein: createDietDto.protein,
      carbs: createDietDto.carbs,
      fat: createDietDto.fat,
      meals: createDietDto.meals,
    });

    return this.dietsRepo.save(diet);
  }

  async findAll() {
    return this.dietsRepo.find({
      relations: ['member', 'assigned_by'],
    });
  }

  async findOne(id: number) {
    const diet = await this.dietsRepo.findOne({
      where: { id },
      relations: ['member', 'assigned_by'],
    });
    if (!diet) {
      throw new NotFoundException(`Diet plan with ID ${id} not found`);
    }
    return diet;
  }

  async update(id: number, updateDietDto: UpdateDietDto, userId: string) {
    const diet = await this.findOne(id);

    // Check if user has permission to update (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isCreator = diet.assigned_by.userId === userId;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException(
        'Only gym owners or the trainer who created this diet plan can update it',
      );
    }

    Object.assign(diet, updateDietDto);
    return this.dietsRepo.save(diet);
  }

  async remove(id: number, userId: string) {
    const diet = await this.findOne(id);

    // Check if user has permission to delete (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isCreator = diet.assigned_by.userId === userId;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException(
        'Only gym owners or the trainer who created this diet plan can delete it',
      );
    }

    return this.dietsRepo.remove(diet);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.dietsRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'assigned_by'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (GYM_OWNER or TRAINER)
    const userRole = user.role.name;
    if (userRole !== 'GYM_OWNER' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners and trainers can view diet plans',
      );
    }

    if (userRole === 'GYM_OWNER') {
      // Gym owners can see all diet plans
      return this.dietsRepo.find({
        relations: ['member', 'assigned_by'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned diet plans
      return this.dietsRepo.find({
        where: { assigned_by: { userId } },
        relations: ['member', 'assigned_by'],
        order: { created_at: 'DESC' },
      });
    }
  }
}
