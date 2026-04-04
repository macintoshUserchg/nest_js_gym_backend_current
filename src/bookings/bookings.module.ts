import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../entities/bookings.entity';
import { Class } from '../entities/classes.entity';
import { Member } from '../entities/members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Class, Member])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
