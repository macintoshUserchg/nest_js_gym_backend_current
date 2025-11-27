import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { Inquiry } from '../entities/inquiry.entity';
import { Branch } from '../entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, Branch])],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService, TypeOrmModule],
})
export class InquiriesModule {}
