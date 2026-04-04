import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus } from '../entities/bookings.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureFlagGuard } from '../common/guards/feature-flag.guard';
import { FeatureFlag } from '../common/decorators/feature-flag.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@UseGuards(FeatureFlagGuard)
@FeatureFlag('enableBookingSystem')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Member already booked for this class.',
  })
  @ApiResponse({ status: 503, description: 'Booking feature is disabled.' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bookings' })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'memberId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of bookings.' })
  findAll(
    @Query('classId') classId?: string,
    @Query('memberId', ParseIntPipe) memberId?: number,
    @Query('status') status?: BookingStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.bookingsService.findAll(
      { classId, memberId, status, dateFrom, dateTo },
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated.' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/delete a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled.' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get all bookings for a class' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of bookings for the class.' })
  getClassBookings(
    @Param('classId') classId: string,
    @Query('date') date?: string,
  ) {
    return this.bookingsService.getClassBookings(classId, date);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get all bookings for a member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'List of bookings for the member.' })
  getMemberBookings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.bookingsService.getMemberBookings(memberId);
  }
}
