import { PartialType } from '@nestjs/mapped-types';
import { CreateBodyProgressDto } from './create-body-progress.dto';

export class UpdateBodyProgressDto extends PartialType(CreateBodyProgressDto) {}
