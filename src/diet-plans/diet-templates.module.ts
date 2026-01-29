import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietTemplate } from '../entities/diet_templates.entity';
import { DietTemplateMeal } from '../entities/diet_template_meals.entity';
import { TemplateShare } from '../entities/template_shares.entity';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { DietTemplatesController } from './diet-templates.controller';
import { DietTemplatesService } from './diet-templates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DietTemplate,
      DietTemplateMeal,
      TemplateShare,
      TemplateAssignment,
    ]),
  ],
  controllers: [DietTemplatesController],
  providers: [DietTemplatesService],
  exports: [DietTemplatesService],
})
export class DietTemplatesModule {}
