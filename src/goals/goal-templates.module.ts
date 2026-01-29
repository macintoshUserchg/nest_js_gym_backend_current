import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalTemplate } from '../entities/goal_templates.entity';
import { GoalTemplatesController } from './goal-templates.controller';
import { GoalTemplatesService } from './goal-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([GoalTemplate])],
  controllers: [GoalTemplatesController],
  providers: [GoalTemplatesService],
  exports: [GoalTemplatesService],
})
export class GoalTemplatesModule {}
