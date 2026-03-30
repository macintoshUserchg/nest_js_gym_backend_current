import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enums/permissions.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Member) private membersRepo: Repository<Member>,
    @InjectRepository(Trainer) private trainersRepo: Repository<Trainer>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user entity
    const user = this.usersRepo.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      role: { id: createUserDto.roleId },
      gym: createUserDto.gymId ? { gymId: createUserDto.gymId } : undefined,
      branch: createUserDto.branchId
        ? { branchId: createUserDto.branchId }
        : undefined,
      phoneNumber: createUserDto.phoneNumber,
    });

    return this.usersRepo.save(user);
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { userId: id },
      relations: ['role', 'gym', 'branch'],
    });

    if (!user) {
      return null;
    }

    // Fetch member data if memberId exists
    let memberData: Member | null = null;
    if (user.memberId) {
      const member = await this.membersRepo.findOne({
        where: { id: parseInt(user.memberId) },
        relations: ['subscription'],
      });

      // Remove branch from member to avoid duplication (it's already at user level)
      if (member) {
        const { branch, ...memberWithoutBranch } = member;
        memberData = memberWithoutBranch as Member;
      }
    }

    // Fetch trainer data if trainerId exists
    let trainerData: Trainer | null = null;
    if (user.trainerId) {
      const trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });

      // Remove branch from trainer to avoid duplication (it's already at user level)
      if (trainer) {
        const { branch, ...trainerWithoutBranch } = trainer;
        trainerData = trainerWithoutBranch as Trainer;
      }
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Return user with additional data
    return {
      ...userWithoutPassword,
      member: memberData,
      trainer: trainerData,
    };
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email }, relations: ['role'] });
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.usersRepo.findOne({
      where: { phoneNumber },
      relations: ['role', 'gym', 'branch'],
    });
  }

  async findOtpEligibleUserByPhone(phoneNumber: string) {
    const user = await this.findByPhoneNumber(phoneNumber);
    if (!user) {
      return null;
    }

    const allowedRoles = new Set([UserRole.MEMBER, UserRole.TRAINER]);
    if (!allowedRoles.has(user.role?.name as UserRole)) {
      return null;
    }

    if (user.role?.name === UserRole.MEMBER && !user.memberId) {
      return null;
    }

    if (user.role?.name === UserRole.TRAINER && !user.trainerId) {
      return null;
    }

    return user;
  }

  async findAll() {
    return this.usersRepo.find({ relations: ['role'] });
  }

  async update(userId: string, updateUserDto: any) {
    await this.usersRepo.update({ userId }, updateUserDto);
    return this.findById(userId);
  }

  async remove(id: string) {
    return this.usersRepo.delete(id);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findById(userId);

    // Get the full user with password hash
    const userWithPassword = await this.usersRepo.findOne({
      where: { userId },
    });

    if (!userWithPassword) {
      throw new NotFoundException('User not found');
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.passwordHash,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(
      { userId },
      { passwordHash: hashedNewPassword },
    );

    return { message: 'Password changed successfully' };
  }
}
