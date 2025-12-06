import { IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateDietDto {
  @IsNumber()
  memberId: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsArray()
  meals?: any[];
}
