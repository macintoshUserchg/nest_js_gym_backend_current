import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, QueryFailedError } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Class } from '../entities/classes.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(Gym)
    private gymsRepo: Repository<Gym>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
  ) {}

  // ========== GYM OPERATIONS ==========

  async create(createGymDto: CreateGymDto) {
    try {
      const gym = this.gymsRepo.create(createGymDto);
      const savedGym = await this.gymsRepo.save(gym);

      // Create default branch for the gym
      const defaultBranch = this.branchesRepo.create({
        name: `${savedGym.name} - Main Branch`,
        email: savedGym.email,
        phone: savedGym.phone,
        address: savedGym.address,
        location: savedGym.location,
        state: savedGym.state,
        latitude: savedGym.latitude,
        longitude: savedGym.longitude,
        gym: savedGym,
        mainBranch: true,
      });

      await this.branchesRepo.save(defaultBranch);

      // Return gym with the default branch
      return this.gymsRepo.findOne({
        where: { gymId: savedGym.gymId },
        relations: ['branches'],
      });
    } catch (error) {
      // Handle duplicate key violation (unique constraint on email)
      if (error instanceof QueryFailedError) {
        if (error.message && error.message.includes('duplicate key')) {
          throw new ConflictException('A gym with this email already exists');
        }
        if (error.message && error.message.includes('unique constraint')) {
          throw new ConflictException('A gym with this email already exists');
        }
      }
      throw error;
    }
  }

  async findAll(location?: string, search?: string) {
    const queryBuilder = this.gymsRepo
      .createQueryBuilder('gym')
      .leftJoinAndSelect('gym.branches', 'branches');

    if (location) {
      queryBuilder.andWhere('gym.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere('gym.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    if (!id || id === ':id') {
      throw new NotFoundException('Invalid gym ID provided');
    }

    const gym = await this.gymsRepo
      .createQueryBuilder('gym')
      .leftJoinAndSelect('gym.branches', 'branches')
      .leftJoinAndSelect('gym.users', 'users')
      .where('gym.gymId = :gymId', { gymId: id })
      .getOne();

    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return gym;
  }

  async update(id: string, updateGymDto: UpdateGymDto) {
    const gym = await this.findOne(id);
    Object.assign(gym, updateGymDto);
    return this.gymsRepo.save(gym);
  }

  async remove(id: string) {
    const gym = await this.findOne(id);
    return this.gymsRepo.remove(gym);
  }

  // ========== BRANCH OPERATIONS ==========

  async createBranch(gymId: string, createBranchDto: CreateBranchDto) {
    const gym = await this.findOne(gymId);

    // Set mainBranch to false if not provided (to ensure only one main branch per gym)
    const branchData = {
      ...createBranchDto,
      gym,
      mainBranch: createBranchDto.mainBranch || false,
    };

    const branch = this.branchesRepo.create(branchData);
    await this.branchesRepo.save(branch);

    // Fetch the gym with all branches to return structured response
    const updatedGym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });

    if (!updatedGym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    return {
      gym: {
        gymId: updatedGym.gymId,
        name: updatedGym.name,
        email: updatedGym.email,
        phone: updatedGym.phone,
        address: updatedGym.address,
        location: updatedGym.location,
        state: updatedGym.state,
        latitude: updatedGym.latitude,
        longitude: updatedGym.longitude,
        createdAt: updatedGym.createdAt,
        updatedAt: updatedGym.updatedAt,
        branches: updatedGym.branches.map((b) => ({
          branchId: b.branchId,
          name: b.name,
          email: b.email,
          phone: b.phone,
          address: b.address,
          location: b.location,
          state: b.state,
          latitude: b.latitude,
          longitude: b.longitude,
          mainBranch: b.mainBranch,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        })),
      },
    };
  }

  async findBranchesByGym(gymId: string) {
    if (!gymId || gymId === ':id') {
      throw new NotFoundException('Invalid gym ID provided');
    }

    await this.findOne(gymId); // Verify gym exists

    const branches = await this.branchesRepo
      .createQueryBuilder('branch')
      .leftJoin('branch.gym', 'gym')
      .where('gym.gymId = :gymId', { gymId })
      .getMany();

    return branches.map((branch) => ({
      branchId: branch.branchId,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      location: branch.location,
      state: branch.state,
      latitude: branch.latitude,
      longitude: branch.longitude,
      mainBranch: branch.mainBranch,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    }));
  }

  async findOneBranch(id: string) {
    if (!id || id === ':id') {
      throw new NotFoundException('Invalid branch ID provided');
    }

    // Basic UUID validation (format: 8-4-4-4-12 characters)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException(
        `Invalid branch ID format. Branch ID must be a valid UUID.`,
      );
    }

    try {
      const branch = await this.branchesRepo
        .createQueryBuilder('branch')
        .leftJoinAndSelect('branch.gym', 'gym')
        .where('branch.branchId = :branchId', { branchId: id })
        .getOne();

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }
      return branch;
    } catch (error) {
      // Handle database-specific errors (e.g., invalid UUID syntax)
      if (
        error.code === '22P02' ||
        error.message?.includes('invalid input syntax for type uuid')
      ) {
        throw new NotFoundException(
          `Invalid branch ID format. Branch ID must be a valid UUID.`,
        );
      }
      throw error;
    }
  }

  async updateBranch(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOneBranch(id);
    Object.assign(branch, updateBranchDto);
    return this.branchesRepo.save(branch);
  }

  async removeBranch(id: string) {
    const branch = await this.findOneBranch(id);
    return this.branchesRepo.remove(branch);
  }

  // ========== MEMBER OPERATIONS BY GYM ==========

  async findMembersByGym(gymId: string) {
    // Verify gym exists
    await this.findOne(gymId);

    // Get all members from all branches of this gym
    const members = await this.membersRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.branch', 'branch')
      .leftJoinAndSelect('member.subscription', 'subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoin('branch.gym', 'gym')
      .where('gym.gymId = :gymId', { gymId })
      .getMany();

    // Transform response to include nested plan and classes (same as findByBranch)
    return Promise.all(
      members.map(async (member) => {
        const subscription = member.subscription;

        // Fetch class details if classes are selected
        let classes: Class[] = [];
        const selectedClassIds = subscription?.selectedClassIds;
        if (selectedClassIds && selectedClassIds.length > 0) {
          classes = await this.classesRepo.find({
            where: { class_id: In(selectedClassIds) },
          });
        }

        // Build transformed subscription object
        const transformedSubscription = subscription
          ? {
              id: subscription.id,
              plan: subscription.plan
                ? {
                    id: subscription.plan.id,
                    name: subscription.plan.name,
                    price: subscription.plan.price,
                    durationInDays: subscription.plan.durationInDays,
                    description: subscription.plan.description,
                  }
                : null,
              classes: classes.map((cls) => ({
                classId: cls.class_id,
                name: cls.name,
                description: cls.description,
                timings: cls.timings,
                recurrenceType: cls.recurrence_type,
                daysOfWeek: cls.days_of_week,
              })),
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              isActive: subscription.isActive,
            }
          : null;

        // Build transformed branch object
        const transformedBranch = member.branch
          ? {
              branchId: member.branch.branchId,
              name: member.branch.name,
              email: member.branch.email,
              phone: member.branch.phone,
              address: member.branch.address,
              location: member.branch.location,
              state: member.branch.state,
              mainBranch: member.branch.mainBranch,
              latitude: member.branch.latitude,
              longitude: member.branch.longitude,
              createdAt: member.branch.createdAt,
              updatedAt: member.branch.updatedAt,
            }
          : null;

        return {
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          gender: member.gender,
          dateOfBirth: member.dateOfBirth,
          addressLine1: member.addressLine1,
          addressLine2: member.addressLine2,
          city: member.city,
          state: member.state,
          postalCode: member.postalCode,
          avatarUrl: member.avatarUrl,
          attachmentUrl: member.attachmentUrl,
          emergencyContactName: member.emergencyContactName,
          emergencyContactPhone: member.emergencyContactPhone,
          isActive: member.isActive,
          freezeMember: member.freezeMember,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          branchBranchId: member.branchBranchId,
          is_managed_by_member: member.is_managed_by_member,
          subscription: transformedSubscription,
          branch: transformedBranch,
        };
      }),
    );
  }

  // ========== TRAINER OPERATIONS BY GYM ==========

  async findTrainersByGym(gymId: string) {
    // Verify gym exists
    await this.findOne(gymId);

    // Get all trainers from all branches of this gym
    const trainers = await this.trainersRepo
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.branch', 'branch')
      .leftJoin('branch.gym', 'gym')
      .where('gym.gymId = :gymId', { gymId })
      .getMany();

    return trainers.map((trainer) => ({
      id: trainer.id,
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      avatarUrl: trainer.avatarUrl,
      branch: trainer.branch
        ? {
            branchId: trainer.branch.branchId,
            name: trainer.branch.name,
            location: trainer.branch.location,
          }
        : null,
    }));
  }

  // ========== MEMBER OPERATIONS BY BRANCH ==========

  async findMembersByBranch(branchId: string) {
    // Verify branch exists
    await this.findOneBranch(branchId);

    // Get all members for this specific branch
    const members = await this.membersRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.branch', 'branch')
      .leftJoinAndSelect('member.subscription', 'subscription')
      .where('branch.branchId = :branchId', { branchId })
      .getMany();

    return members.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      addressLine1: member.addressLine1,
      addressLine2: member.addressLine2,
      city: member.city,
      state: member.state,
      postalCode: member.postalCode,
      avatarUrl: member.avatarUrl,
      emergencyContactName: member.emergencyContactName,
      emergencyContactPhone: member.emergencyContactPhone,
      isActive: member.isActive,
      attachmentUrl: member.attachmentUrl,
      freezeMember: member.freezeMember,
      branch: member.branch
        ? {
            branchId: member.branch.branchId,
            name: member.branch.name,
            location: member.branch.location,
          }
        : null,
      subscription: member.subscription
        ? {
            id: member.subscription.id,
            isActive: member.subscription.isActive,
            startDate: member.subscription.startDate,
            endDate: member.subscription.endDate,
          }
        : null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));
  }

  // ========== TRAINER OPERATIONS BY BRANCH ==========

  async findTrainersByBranch(branchId: string) {
    // Verify branch exists
    await this.findOneBranch(branchId);

    // Get all trainers for this specific branch
    const trainers = await this.trainersRepo
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.branch', 'branch')
      .where('branch.branchId = :branchId', { branchId })
      .getMany();

    return trainers.map((trainer) => ({
      id: trainer.id,
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      avatarUrl: trainer.avatarUrl,
      branch: trainer.branch
        ? {
            branchId: trainer.branch.branchId,
            name: trainer.branch.name,
            location: trainer.branch.location,
          }
        : null,
    }));
  }
}
