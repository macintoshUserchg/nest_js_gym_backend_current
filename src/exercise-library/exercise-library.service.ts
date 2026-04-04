import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ExerciseLibrary } from '../entities/exercise_library.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { paginate } from '../common/dto/pagination.dto';
import { FilterExerciseDto } from './dto/filter-exercise.dto';

@Injectable()
export class ExerciseLibraryService {
  constructor(
    @InjectRepository(ExerciseLibrary)
    private exerciseLibraryRepo: Repository<ExerciseLibrary>,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<ExerciseLibrary> {
    const existing = await this.exerciseLibraryRepo.findOne({
      where: { exercise_name: createExerciseDto.exercise_name },
    });
    if (existing) {
      throw new ConflictException(
        `Exercise with name "${createExerciseDto.exercise_name}" already exists`,
      );
    }

    const exercise = this.exerciseLibraryRepo.create(createExerciseDto);
    return this.exerciseLibraryRepo.save(exercise);
  }

  async findAll(
    filterDto: FilterExerciseDto,
  ): Promise<{ data: ExerciseLibrary[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filterDto.body_part) {
      where.body_part = filterDto.body_part;
    }
    if (filterDto.exercise_type) {
      where.exercise_type = filterDto.exercise_type;
    }
    if (filterDto.difficulty_level) {
      where.difficulty_level = filterDto.difficulty_level;
    }
    if (filterDto.is_active !== undefined) {
      where.is_active = filterDto.is_active;
    }
    if (filterDto.search) {
      where.exercise_name = ILike(`%${filterDto.search}%`);
    }

    const [data, total] = await this.exerciseLibraryRepo.findAndCount({
      where,
      order: { exercise_name: 'ASC' },
      skip: ((filterDto.page || 1) - 1) * (filterDto.limit || 20),
      take: filterDto.limit || 20,
    });

    return paginate(data, total, filterDto.page || 1, filterDto.limit || 20);
  }

  async findOne(exercise_id: string): Promise<ExerciseLibrary> {
    const exercise = await this.exerciseLibraryRepo.findOne({
      where: { exercise_id },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exercise_id} not found`);
    }
    return exercise;
  }

  async update(
    exercise_id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<ExerciseLibrary> {
    const exercise = await this.findOne(exercise_id);

    if (
      updateExerciseDto.exercise_name &&
      updateExerciseDto.exercise_name !== exercise.exercise_name
    ) {
      const existing = await this.exerciseLibraryRepo.findOne({
        where: { exercise_name: updateExerciseDto.exercise_name },
      });
      if (existing) {
        throw new ConflictException(
          `Exercise with name "${updateExerciseDto.exercise_name}" already exists`,
        );
      }
    }

    Object.assign(exercise, updateExerciseDto);
    return this.exerciseLibraryRepo.save(exercise);
  }

  async remove(exercise_id: string): Promise<void> {
    const exercise = await this.findOne(exercise_id);
    await this.exerciseLibraryRepo.remove(exercise);
  }
}
