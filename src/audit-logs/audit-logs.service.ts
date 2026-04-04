import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit_logs.entity';
import { User } from '../entities/users.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepo: Repository<AuditLog>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createDto: CreateAuditLogDto) {
    const user = await this.usersRepo.findOne({
      where: { userId: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createDto.userId} not found`);
    }

    const auditLog = this.auditLogsRepo.create({
      user,
      action: createDto.action,
      entity_type: createDto.entityType,
      entity_id: createDto.entityId,
      previous_values: createDto.previousValues,
      new_values: createDto.newValues,
    });

    return this.auditLogsRepo.save(auditLog);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.auditLogsRepo.findAndCount({
      relations: ['user'],
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const log = await this.auditLogsRepo.findOne({
      where: { log_id: id },
      relations: ['user'],
    });
    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return log;
  }

  async findByUser(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.auditLogsRepo.find({
      where: { user: { userId: userId } },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.auditLogsRepo.find({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByAction(action: string) {
    return this.auditLogsRepo.find({
      where: { action },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }
}
