import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/dto/pagination.dto';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../entities/bookings.entity';
import { Class } from '../entities/classes.entity';
import { Member } from '../entities/members.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const classEntity = await this.classesRepo.findOne({
      where: { class_id: createBookingDto.classId },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const member = await this.membersRepo.findOne({
      where: { id: createBookingDto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const existingBooking = await this.bookingsRepo.findOne({
      where: {
        class: { class_id: createBookingDto.classId },
        member: { id: createBookingDto.memberId },
        bookingDate: createBookingDto.bookingDate as unknown as Date,
        status: BookingStatus.CONFIRMED,
      },
    });
    if (existingBooking) {
      throw new ConflictException(
        'Member already booked for this class on this date',
      );
    }

    const capacity = classEntity.capacity || 0;
    const enrolledCount = classEntity.enrolledCount || 0;
    const isFull = capacity > 0 && enrolledCount >= capacity;

    const booking = this.bookingsRepo.create({
      class: classEntity,
      member,
      bookingDate: createBookingDto.bookingDate as unknown as Date,
      status: isFull ? BookingStatus.WAITLIST : BookingStatus.CONFIRMED,
      waitlistPosition: isFull ? enrolledCount - capacity + 1 : 0,
      notes: createBookingDto.notes,
    });

    if (!isFull) {
      classEntity.enrolledCount = enrolledCount + 1;
      await this.classesRepo.save(classEntity);
    }

    await this.bookingsRepo.save(booking);
    return booking;
  }

  findAll(filters?: {
    classId?: string;
    memberId?: number;
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
  }, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};

    if (filters?.classId) {
      where.class = { class_id: filters.classId };
    }
    if (filters?.memberId) {
      where.member = { id: filters.memberId };
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom) {
      where.bookingDate = MoreThanOrEqual(filters.dateFrom);
    }
    if (filters?.dateTo) {
      where.bookingDate = LessThanOrEqual(filters.dateTo);
    }

    return this.bookingsRepo.find({
      where,
      relations: ['class', 'class.branch', 'class.trainer', 'member'],
      order: { bookingDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['class', 'class.branch', 'class.trainer', 'member'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);

    if (updateBookingDto.status && updateBookingDto.status !== booking.status) {
      const classEntity = booking.class as Class;
      const capacity = classEntity.capacity || 0;
      const enrolledCount = classEntity.enrolledCount || 0;

      if (
        booking.status === BookingStatus.CONFIRMED &&
        updateBookingDto.status === BookingStatus.CANCELLED
      ) {
        classEntity.enrolledCount = Math.max(0, enrolledCount - 1);
        await this.classesRepo.save(classEntity);

        const nextWaitlisted = await this.bookingsRepo.findOne({
          where: {
            class: { class_id: classEntity.class_id },
            status: BookingStatus.WAITLIST,
          },
          order: { waitlistPosition: 'ASC', createdAt: 'ASC' },
        });
        if (
          nextWaitlisted &&
          capacity > 0 &&
          classEntity.enrolledCount < capacity
        ) {
          nextWaitlisted.status = BookingStatus.CONFIRMED;
          nextWaitlisted.waitlistPosition = 0;
          await this.bookingsRepo.save(nextWaitlisted);
          classEntity.enrolledCount += 1;
          await this.classesRepo.save(classEntity);
        }
      }

      if (
        booking.status === BookingStatus.WAITLIST &&
        updateBookingDto.status === BookingStatus.CONFIRMED
      ) {
        classEntity.enrolledCount = enrolledCount + 1;
        await this.classesRepo.save(classEntity);
      }
    }

    Object.assign(booking, updateBookingDto);
    return this.bookingsRepo.save(booking);
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    const classEntity = booking.class as Class;

    if (booking.status === BookingStatus.CONFIRMED) {
      classEntity.enrolledCount = Math.max(
        0,
        (classEntity.enrolledCount || 0) - 1,
      );
      await this.classesRepo.save(classEntity);

      const nextWaitlisted = await this.bookingsRepo.findOne({
        where: {
          class: { class_id: classEntity.class_id },
          status: BookingStatus.WAITLIST,
        },
        order: { waitlistPosition: 'ASC', createdAt: 'ASC' },
      });
      if (
        nextWaitlisted &&
        classEntity.capacity &&
        classEntity.enrolledCount < classEntity.capacity
      ) {
        nextWaitlisted.status = BookingStatus.CONFIRMED;
        nextWaitlisted.waitlistPosition = 0;
        await this.bookingsRepo.save(nextWaitlisted);
        classEntity.enrolledCount += 1;
        await this.classesRepo.save(classEntity);
      }
    }

    return this.bookingsRepo.remove(booking);
  }

  async getClassBookings(classId: string, date?: string) {
    const where: Record<string, unknown> = { class: { class_id: classId } };
    if (date) {
      where.bookingDate = date;
    }
    return this.bookingsRepo.find({
      where,
      relations: ['member'],
      order: { bookingDate: 'ASC', waitlistPosition: 'ASC' },
    });
  }

  async getMemberBookings(memberId: number) {
    return this.bookingsRepo.find({
      where: { member: { id: memberId } },
      relations: ['class', 'class.branch', 'class.trainer'],
      order: { bookingDate: 'DESC' },
    });
  }
}
