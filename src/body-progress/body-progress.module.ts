import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyProgressController } from './body-progress.controller';
import { BodyProgressService } from './body-progress.service';
import { BodyProgress } from '../entities/body_progress.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BodyProgress, Member, Trainer, User, Role]),
  ],
  controllers: [BodyProgressController],
  providers: [BodyProgressService],
  exports: [BodyProgressService],
})
export class BodyProgressModule {}
