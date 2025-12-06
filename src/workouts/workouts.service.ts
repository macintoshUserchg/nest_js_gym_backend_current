import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from '../entities/workout_plans.entity';
import { WorkoutPlanExercise } from '../entities/workout_plan_exercises.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutPlan)
    private workoutPlansRepo: Repository<WorkoutPlan>,
    @InjectRepository(WorkoutPlanExercise)
    private workoutPlanExercisesRepo: Repository<WorkoutPlanExercise>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createWorkoutPlanDto: CreateWorkoutPlanDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createWorkoutPlanDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createWorkoutPlanDto.memberId} not found`,
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
        'Only gym owners and trainers can create workout plans',
      );
    }

    let trainer: Trainer | null = null;
    if (userRole === 'TRAINER' && user.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });
    } else if (createWorkoutPlanDto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: createWorkoutPlanDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createWorkoutPlanDto.trainerId} not found`,
        );
      }
    }

    // Create workout plan
    const workoutPlanData: any = {
      member,
      title: createWorkoutPlanDto.title,
      description: createWorkoutPlanDto.description,
      difficulty_level: createWorkoutPlanDto.difficulty_level,
      plan_type: createWorkoutPlanDto.plan_type,
      duration_days: createWorkoutPlanDto.duration_days,
      start_date: new Date(createWorkoutPlanDto.start_date),
      end_date: new Date(createWorkoutPlanDto.end_date),
      notes: createWorkoutPlanDto.notes,
    };

    if (trainer) {
      workoutPlanData.assigned_by_trainer = trainer;
    }

    const workoutPlan = this.workoutPlansRepo.create(workoutPlanData);
    const savedWorkoutPlans = await this.workoutPlansRepo.save(workoutPlan);
    const savedWorkoutPlan = savedWorkoutPlans[0];

    // Create exercises
    if (
      createWorkoutPlanDto.exercises &&
      createWorkoutPlanDto.exercises.length > 0
    ) {
      const exercises = createWorkoutPlanDto.exercises.map((exercise) => {
        const exerciseData: any = {
          workout_plan: savedWorkoutPlan,
          exercise_name: exercise.exercise_name,
          description: exercise.description,
          exercise_type: exercise.exercise_type,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_kg: exercise.weight_kg,
          duration_minutes: exercise.duration_minutes,
          distance_km: exercise.distance_km,
          day_of_week: exercise.day_of_week,
          instructions: exercise.instructions,
        };

        return this.workoutPlanExercisesRepo.create(exerciseData);
      });

      await this.workoutPlanExercisesRepo.save(exercises.flat());
    }

    return this.workoutPlansRepo.findOne({
      where: { plan_id: savedWorkoutPlan.plan_id },
      relations: ['member', 'assigned_by_trainer', 'exercises'],
    });
  }

  async findAll() {
    return this.workoutPlansRepo.find({
      relations: ['member', 'assigned_by_trainer', 'exercises'],
    });
  }

  async findOne(plan_id: string) {
    const workoutPlan = await this.workoutPlansRepo.findOne({
      where: { plan_id },
      relations: ['member', 'assigned_by_trainer', 'exercises'],
    });
    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID ${plan_id} not found`);
    }
    return workoutPlan;
  }

  async update(
    plan_id: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto,
    userId: string,
  ) {
    const workoutPlan = await this.findOne(plan_id);

    // Check if user has permission to update (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';

    let isAssignedTrainer = false;
    if (workoutPlan.assigned_by_trainer && user.trainerId) {
      isAssignedTrainer =
        workoutPlan.assigned_by_trainer.id === parseInt(user.trainerId);
    }

    if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners or the trainer assigned to this workout plan can update it',
      );
    }

    if (updateWorkoutPlanDto.trainerId && userRole === 'GYM_OWNER') {
      const trainer = await this.trainersRepo.findOne({
        where: { id: updateWorkoutPlanDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateWorkoutPlanDto.trainerId} not found`,
        );
      }
      workoutPlan.assigned_by_trainer = trainer;
    }

    Object.assign(workoutPlan, updateWorkoutPlanDto);
    if (updateWorkoutPlanDto.start_date) {
      workoutPlan.start_date = new Date(updateWorkoutPlanDto.start_date);
    }
    if (updateWorkoutPlanDto.end_date) {
      workoutPlan.end_date = new Date(updateWorkoutPlanDto.end_date);
    }

    return this.workoutPlansRepo.save(workoutPlan);
  }

  async remove(plan_id: string, userId: string) {
    const workoutPlan = await this.findOne(plan_id);

    // Check if user has permission to delete (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';

    let isAssignedTrainer = false;
    if (workoutPlan.assigned_by_trainer && user.trainerId) {
      isAssignedTrainer =
        workoutPlan.assigned_by_trainer.id === parseInt(user.trainerId);
    }

    if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners or the trainer assigned to this workout plan can delete it',
      );
    }

    return this.workoutPlansRepo.remove(workoutPlan);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.workoutPlansRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'assigned_by_trainer', 'exercises'],
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
        'Only gym owners and trainers can view workout plans',
      );
    }

    if (userRole === 'GYM_OWNER') {
      // Gym owners can see all workout plans
      return this.workoutPlansRepo.find({
        relations: ['member', 'assigned_by_trainer', 'exercises'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned workout plans
      if (!user.trainerId) {
        throw new NotFoundException(`Trainer ID not found for user ${userId}`);
      }
      const trainerId = parseInt(user.trainerId);
      return this.workoutPlansRepo.find({
        where: { assigned_by_trainer: { id: trainerId } },
        relations: ['member', 'assigned_by_trainer', 'exercises'],
        order: { created_at: 'DESC' },
      });
    }
  }
}
