import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseLibraryController } from './exercise-library.controller';
import { ExerciseLibraryService } from './exercise-library.service';
import { ExerciseLibrary } from '../entities/exercise_library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseLibrary])],
  controllers: [ExerciseLibraryController],
  providers: [ExerciseLibraryService],
  exports: [ExerciseLibraryService],
})
export class ExerciseLibraryModule {}
