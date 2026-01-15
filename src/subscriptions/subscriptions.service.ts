import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Member } from '../entities/members.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Class } from '../entities/classes.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(MembershipPlan)
    private plansRepo: Repository<MembershipPlan>,
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
  ) {}

  async create(memberId: number, createDto: CreateSubscriptionDto) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
      relations: ['subscription'],
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Check if member already has an active subscription
    if (member.subscription) {
      throw new ConflictException('Member already has an active subscription');
    }

    // Check if plan exists
    const plan = await this.plansRepo.findOne({
      where: { id: createDto.planId },
    });
    if (!plan) {
      throw new NotFoundException(
        `Membership plan with ID ${createDto.planId} not found`,
      );
    }

    // Check if selected class exists (if provided)
    let selectedClass: Class | undefined;
    if (createDto.selectedClassId) {
      const classEntity = await this.classesRepo.findOne({
        where: { class_id: createDto.selectedClassId },
      });
      if (!classEntity) {
        throw new NotFoundException(
          `Class with ID ${createDto.selectedClassId} not found`,
        );
      }
      selectedClass = classEntity;
    }

    // Calculate end date based on plan duration
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    const subscriptionData: Partial<MemberSubscription> = {
      member,
      plan,
      startDate,
      endDate,
      isActive: true,
    };

    // Only add selectedClass if it's provided
    if (selectedClass) {
      subscriptionData.selectedClass = selectedClass;
    }

    const subscription = this.subscriptionsRepo.create(subscriptionData);

    return this.subscriptionsRepo.save(subscription);
  }

  async findAll() {
    return this.subscriptionsRepo.find({
      relations: ['member', 'plan'],
    });
  }

  async findOne(id: number) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { id },
      relations: ['member', 'plan'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findByMember(memberId: number) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const subscription = await this.subscriptionsRepo.findOne({
      where: { member: { id: memberId } },
      relations: ['member', 'plan'],
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for member ${memberId}`,
      );
    }

    return subscription;
  }

  async update(id: number, updateDto: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id);

    if (updateDto.startDate) {
      const startDate = new Date(updateDto.startDate);
      subscription.startDate = startDate;

      // Recalculate end date if start date changes
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + subscription.plan.durationInDays);
      subscription.endDate = endDate;
    }

    if (updateDto.isActive !== undefined) {
      subscription.isActive = updateDto.isActive;
    }

    // Handle selectedClassId update
    if (updateDto.selectedClassId !== undefined) {
      if (updateDto.selectedClassId === null) {
        // Remove selected class
        (subscription as any).selectedClass = null;
      } else {
        // Update selected class
        const classEntity = await this.classesRepo.findOne({
          where: { class_id: updateDto.selectedClassId },
        });
        if (!classEntity) {
          throw new NotFoundException(
            `Class with ID ${updateDto.selectedClassId} not found`,
          );
        }
        subscription.selectedClass = classEntity;
      }
    }

    return this.subscriptionsRepo.save(subscription);
  }

  async cancel(id: number) {
    const subscription = await this.findOne(id);
    subscription.isActive = false;
    return this.subscriptionsRepo.save(subscription);
  }

  async remove(id: number) {
    const subscription = await this.findOne(id);
    return this.subscriptionsRepo.remove(subscription);
  }
}
