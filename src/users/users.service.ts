import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

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
      branch: createUserDto.branchId ? { branchId: createUserDto.branchId } : undefined,
    });

    return this.usersRepo.save(user);
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ 
      where: { userId: id }, 
      relations: ['role', 'gym', 'branch'] 
    });

    if (!user) {
      return null;
    }

    // Fetch member data if memberId exists
    let memberData: Member | null = null;
    if (user.memberId) {
      const member = await this.membersRepo.findOne({
        where: { id: parseInt(user.memberId) },
        relations: ['subscription']
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
        where: { id: parseInt(user.trainerId) }
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
      trainer: trainerData
    };
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email }, relations: ['role'] });
  }

  async findAll() {
    return this.usersRepo.find({ relations: ['role'] });
  }

  async update(id: string, updateUserDto: any) {
    await this.usersRepo.update(id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: string) {
    return this.usersRepo.delete(id);
  }
}
