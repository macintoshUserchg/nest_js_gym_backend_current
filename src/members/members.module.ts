import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import {
  MembersController,
  BranchMembersController,
} from './members.controller';
import { Member } from '../entities/members.entity';
import { Branch } from '../entities/branch.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';
import { Attendance } from '../entities/attendance.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Branch,
      User,
      Role,
      Attendance,
      PaymentTransaction,
    ]),
  ],
  controllers: [MembersController, BranchMembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
