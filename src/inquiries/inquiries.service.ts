import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from '../entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryResponseDto } from './dto/inquiry-response.dto';

export interface InquiryFilters {
  status?: InquiryStatus;
  source?: string;
  branchId?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  createdFrom?: Date;
  createdTo?: Date;
  convertedOnly?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async create(
    createInquiryDto: CreateInquiryDto,
  ): Promise<InquiryResponseDto> {
    // Check if inquiry with same email already exists
    const existingInquiry = await this.inquiryRepository.findOne({
      where: { email: createInquiryDto.email },
    });

    if (existingInquiry) {
      throw new ConflictException('Inquiry with this email already exists');
    }

    const inquiry = this.inquiryRepository.create(createInquiryDto);
    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // Load the branch relation if branchId is provided
    if (savedInquiry.branchId) {
      const inquiryWithBranch = await this.inquiryRepository.findOne({
        where: { id: savedInquiry.id },
        relations: ['branch'],
      });
      if (inquiryWithBranch) {
        return new InquiryResponseDto(inquiryWithBranch);
      }
    }

    return new InquiryResponseDto(savedInquiry);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: InquiryFilters = {},
  ): Promise<PaginatedResult<InquiryResponseDto>> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.branch', 'branch');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('inquiry.status = :status', {
        status: filters.status,
      });
    }

    if (filters.source) {
      queryBuilder.andWhere('inquiry.source = :source', {
        source: filters.source,
      });
    }

    if (filters.branchId) {
      queryBuilder.andWhere('inquiry.branchId = :branchId', {
        branchId: filters.branchId,
      });
    }

    if (filters.email) {
      queryBuilder.andWhere('inquiry.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.phone) {
      queryBuilder.andWhere('inquiry.phone ILIKE :phone', {
        phone: `%${filters.phone}%`,
      });
    }

    if (filters.fullName) {
      queryBuilder.andWhere('inquiry.fullName ILIKE :fullName', {
        fullName: `%${filters.fullName}%`,
      });
    }

    if (filters.createdFrom) {
      queryBuilder.andWhere('inquiry.createdAt >= :createdFrom', {
        createdFrom: filters.createdFrom,
      });
    }

    if (filters.createdTo) {
      queryBuilder.andWhere('inquiry.createdAt <= :createdTo', {
        createdTo: filters.createdTo,
      });
    }

    if (filters.convertedOnly) {
      queryBuilder.andWhere('inquiry.status = :status', {
        status: InquiryStatus.CONVERTED,
      });
    }

    // Apply sorting
    queryBuilder.orderBy('inquiry.createdAt', 'DESC');

    // Apply pagination
    const [inquiries, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = inquiries.map((inquiry) => new InquiryResponseDto(inquiry));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<InquiryResponseDto> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['branch'],
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    return new InquiryResponseDto(inquiry);
  }

  async findByEmail(email: string): Promise<InquiryResponseDto> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { email },
      relations: ['branch'],
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with email ${email} not found`);
    }

    return new InquiryResponseDto(inquiry);
  }

  async update(
    id: number,
    updateInquiryDto: UpdateInquiryDto,
  ): Promise<InquiryResponseDto> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    // Handle status changes with timestamps
    if (updateInquiryDto.status && updateInquiryDto.status !== inquiry.status) {
      switch (updateInquiryDto.status) {
        case InquiryStatus.CONTACTED:
          updateInquiryDto.contactedAt = new Date();
          break;
        case InquiryStatus.CONVERTED:
          updateInquiryDto.convertedAt = new Date();
          break;
        case InquiryStatus.CLOSED:
          updateInquiryDto.closedAt = new Date();
          break;
      }
    }

    await this.inquiryRepository.update(id, updateInquiryDto);

    const updatedInquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['branch'],
    });

    if (!updatedInquiry) {
      throw new NotFoundException(
        `Inquiry with ID ${id} not found after update`,
      );
    }

    return new InquiryResponseDto(updatedInquiry);
  }

  async remove(id: number): Promise<void> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    await this.inquiryRepository.remove(inquiry);
  }

  async updateStatus(
    id: number,
    status: InquiryStatus,
  ): Promise<InquiryResponseDto> {
    const updateData: any = { status };

    // Set appropriate timestamps based on status
    switch (status) {
      case InquiryStatus.CONTACTED:
        updateData.contactedAt = new Date();
        break;
      case InquiryStatus.CONVERTED:
        updateData.convertedAt = new Date();
        break;
      case InquiryStatus.CLOSED:
        updateData.closedAt = new Date();
        break;
    }

    await this.inquiryRepository.update(id, updateData);

    const updatedInquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['branch'],
    });

    if (!updatedInquiry) {
      throw new NotFoundException(
        `Inquiry with ID ${id} not found after status update`,
      );
    }

    return new InquiryResponseDto(updatedInquiry);
  }

  async getInquiryStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    conversionRate: number;
  }> {
    const total = await this.inquiryRepository.count();

    const byStatus = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inquiry.status')
      .getRawMany();

    const bySource = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inquiry.source')
      .getRawMany();

    const convertedCount = await this.inquiryRepository.count({
      where: { status: InquiryStatus.CONVERTED },
    });

    const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = parseInt(item.count);
        return acc;
      }, {}),
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getPendingInquiries(): Promise<InquiryResponseDto[]> {
    const inquiries = await this.inquiryRepository.find({
      where: [
        { status: InquiryStatus.NEW },
        { status: InquiryStatus.CONTACTED },
      ],
      relations: ['branch'],
      order: { createdAt: 'ASC' },
    });

    return inquiries.map((inquiry) => new InquiryResponseDto(inquiry));
  }

  async convertToMember(id: number): Promise<InquiryResponseDto> {
    const inquiry = await this.findOne(id);

    const updatedInquiry = await this.update(id, {
      status: InquiryStatus.CONVERTED,
      convertedAt: new Date(),
      notes: `${inquiry.notes || ''}\n[CONVERTED TO MEMBER]`,
    });

    return updatedInquiry;
  }
}
