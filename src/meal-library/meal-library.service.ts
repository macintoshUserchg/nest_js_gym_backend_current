import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MealLibrary } from '../entities/meal_library.entity';
import { CreateMealLibraryDto } from './dto/create-meal-library.dto';
import { UpdateMealLibraryDto } from './dto/update-meal-library.dto';
import { FilterMealLibraryDto } from './dto/filter-meal-library.dto';

@Injectable()
export class MealLibraryService {
  constructor(
    @InjectRepository(MealLibrary)
    private mealLibraryRepo: Repository<MealLibrary>,
  ) {}

  async create(
    createMealLibraryDto: CreateMealLibraryDto,
  ): Promise<MealLibrary> {
    const existing = await this.mealLibraryRepo.findOne({
      where: { meal_name: createMealLibraryDto.meal_name },
    });
    if (existing) {
      throw new ConflictException(
        `Meal with name "${createMealLibraryDto.meal_name}" already exists`,
      );
    }

    const meal = this.mealLibraryRepo.create(createMealLibraryDto);
    return this.mealLibraryRepo.save(meal);
  }

  async findAll(
    filterDto: FilterMealLibraryDto,
  ): Promise<{ data: MealLibrary[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filterDto.meal_type) {
      where.meal_type = filterDto.meal_type;
    }
    if (filterDto.is_active !== undefined) {
      where.is_active = filterDto.is_active;
    }
    if (filterDto.search) {
      where.meal_name = ILike(`%${filterDto.search}%`);
    }

    const [data, total] = await this.mealLibraryRepo.findAndCount({
      where,
      order: { meal_name: 'ASC' },
    });

    return { data, total };
  }

  async findOne(meal_id: string): Promise<MealLibrary> {
    const meal = await this.mealLibraryRepo.findOne({
      where: { meal_id },
    });
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${meal_id} not found`);
    }
    return meal;
  }

  async update(
    meal_id: string,
    updateMealLibraryDto: UpdateMealLibraryDto,
  ): Promise<MealLibrary> {
    const meal = await this.findOne(meal_id);

    if (
      updateMealLibraryDto.meal_name &&
      updateMealLibraryDto.meal_name !== meal.meal_name
    ) {
      const existing = await this.mealLibraryRepo.findOne({
        where: { meal_name: updateMealLibraryDto.meal_name },
      });
      if (existing) {
        throw new ConflictException(
          `Meal with name "${updateMealLibraryDto.meal_name}" already exists`,
        );
      }
    }

    Object.assign(meal, updateMealLibraryDto);
    return this.mealLibraryRepo.save(meal);
  }

  async remove(meal_id: string): Promise<void> {
    const meal = await this.findOne(meal_id);
    await this.mealLibraryRepo.remove(meal);
  }
}
