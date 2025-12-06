import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietPlansController } from './diet-plans.controller';
import { DietPlansService } from './diet-plans.service';
import { Diet } from '../entities/diets.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diet, Member, User, Role])],
  controllers: [DietPlansController],
  providers: [DietPlansService],
  exports: [DietPlansService],
})
export class DietPlansModule {}
