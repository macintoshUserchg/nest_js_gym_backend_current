import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/users.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Member, Trainer])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
