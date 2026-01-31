import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateShareController } from './template-shares.controller';
import { TemplateSharesService } from './template-shares.service';
import { TemplateShare } from '../entities/template_shares.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { DietTemplate } from '../entities/diet_templates.entity';
import { User } from '../entities/users.entity';
import { Trainer } from '../entities/trainers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateShare, WorkoutTemplate, DietTemplate, User, Trainer]),
  ],
  controllers: [TemplateShareController],
  providers: [TemplateSharesService],
  exports: [TemplateSharesService],
})
export class TemplateSharesModule {}
