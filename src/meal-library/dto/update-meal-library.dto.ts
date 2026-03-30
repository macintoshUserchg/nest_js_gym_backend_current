import { PartialType } from '@nestjs/swagger';
import { CreateMealLibraryDto } from './create-meal-library.dto';

export class UpdateMealLibraryDto extends PartialType(CreateMealLibraryDto) {}
