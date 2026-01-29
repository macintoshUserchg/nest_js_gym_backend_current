import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { DietTemplate } from '../entities/diet_templates.entity';
import { Member } from '../entities/members.entity';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { TemplateAssignmentsController } from './template-assignments.controller';
import { TemplateAssignmentsService } from './template-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateAssignment, WorkoutTemplate, DietTemplate, Member, MemberTrainerAssignment])],
  controllers: [TemplateAssignmentsController],
  providers: [TemplateAssignmentsService],
  exports: [TemplateAssignmentsService],
})
export class TemplateAssignmentsModule {}
