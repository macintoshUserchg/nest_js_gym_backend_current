import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealLibraryController } from './meal-library.controller';
import { MealLibraryService } from './meal-library.service';
import { MealLibrary } from '../entities/meal_library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealLibrary])],
  controllers: [MealLibraryController],
  providers: [MealLibraryService],
  exports: [MealLibraryService],
})
export class MealLibraryModule {}
