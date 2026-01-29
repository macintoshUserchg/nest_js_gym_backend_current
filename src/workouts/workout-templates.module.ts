import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { WorkoutTemplateExercise } from '../entities/workout_template_exercises.entity';
import { TemplateShare } from '../entities/template_shares.entity';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { WorkoutTemplatesController } from './workout-templates.controller';
import { WorkoutTemplatesService } from './workout-templates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutTemplate,
      WorkoutTemplateExercise,
      TemplateShare,
      TemplateAssignment,
    ]),
  ],
  controllers: [WorkoutTemplatesController],
  providers: [WorkoutTemplatesService],
  exports: [WorkoutTemplatesService],
})
export class WorkoutTemplatesModule {}
