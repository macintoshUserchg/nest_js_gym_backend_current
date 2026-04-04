import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notifications.entity';
import { User } from '../entities/users.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.SYSTEM,
      metadata: dto.metadata,
    });
    return this.notificationRepository.save(notification);
  }

  async findByUser(
    userId: string,
    options?: { is_read?: boolean },
    page = 1,
    limit = 20,
  ) {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.created_at', 'DESC');

    if (options?.is_read !== undefined) {
      queryBuilder.andWhere('n.is_read = :is_read', {
        is_read: options.is_read,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async findUnread(userId: string) {
    return this.findByUser(userId, { is_read: false });
  }

  async markAsRead(notificationId: string, user: User) {
    const notification = await this.notificationRepository.findOne({
      where: { notification_id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Verify ownership
    if (notification.userId !== user.userId) {
      throw new NotFoundException('Notification not found');
    }

    notification.is_read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, is_read: false },
      { is_read: true },
    );
    return { success: true, message: 'All notifications marked as read' };
  }

  async delete(notificationId: string, user: User) {
    const notification = await this.notificationRepository.findOne({
      where: { notification_id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== user.userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
    return { success: true, message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, is_read: false },
    });
  }

  // ===== Goal-related notification methods =====

  async sendGoalProgressNotification(
    userId: string,
    goalTitle: string,
    progress: number,
  ) {
    return this.create({
      userId,
      title: 'Goal Progress Update',
      message: `Your goal "${goalTitle}" is now ${progress}% complete. Keep up the good work!`,
      type: NotificationType.GOAL_PROGRESS,
      metadata: {
        entity_type: 'goal',
        action: 'progress',
        related_data: { progress },
      },
    });
  }

  async sendGoalCompletedNotification(
    userId: string,
    goalTitle: string,
    memberName: string,
  ) {
    return this.create({
      userId,
      title: 'Goal Completed!',
      message: `Congratulations! The goal "${goalTitle}" for ${memberName} has been completed.`,
      type: NotificationType.GOAL_COMPLETED,
      metadata: { entity_type: 'goal', action: 'completed' },
    });
  }

  async sendGoalMissedNotification(userId: string, goalTitle: string) {
    return this.create({
      userId,
      title: 'Goal Missed',
      message: `The goal "${goalTitle}" was not completed within the timeframe.`,
      type: NotificationType.GOAL_MISSED,
      metadata: { entity_type: 'goal', action: 'missed' },
    });
  }

  async sendMilestoneCompleteNotification(
    userId: string,
    milestoneTitle: string,
    goalTitle: string,
  ) {
    return this.create({
      userId,
      title: 'Milestone Complete!',
      message: `Great job! You completed the milestone "${milestoneTitle}" in "${goalTitle}".`,
      type: NotificationType.MILESTONE_COMPLETE,
      metadata: { entity_type: 'milestone', action: 'completed' },
    });
  }

  async sendMilestoneMissedNotification(
    userId: string,
    milestoneTitle: string,
    goalTitle: string,
  ) {
    return this.create({
      userId,
      title: 'Milestone Missed',
      message: `The milestone "${milestoneTitle}" in "${goalTitle}" was not completed on time.`,
      type: NotificationType.MILESTONE_MISSED,
      metadata: { entity_type: 'milestone', action: 'missed' },
    });
  }

  // ===== Chart/Training notification methods =====

  async sendChartAssignedNotification(
    userId: string,
    chartTitle: string,
    memberName: string,
  ) {
    return this.create({
      userId,
      title: 'Workout Chart Assigned',
      message: `A new workout chart "${chartTitle}" has been assigned to ${memberName}.`,
      type: NotificationType.CHART_ASSIGNED,
      metadata: { entity_type: 'chart', action: 'assigned' },
    });
  }

  async sendChartSharedNotification(
    userId: string,
    chartTitle: string,
    sharedBy: string,
  ) {
    return this.create({
      userId,
      title: 'Workout Chart Shared With You',
      message: `${sharedBy} has shared the workout chart "${chartTitle}" with you.`,
      type: NotificationType.CHART_SHARED,
      metadata: { entity_type: 'chart', action: 'shared' },
    });
  }

  // ===== Diet notification methods =====

  async sendDietAssignedNotification(
    userId: string,
    dietTitle: string,
    memberName: string,
  ) {
    return this.create({
      userId,
      title: 'Diet Plan Assigned',
      message: `A new diet plan "${dietTitle}" has been assigned to ${memberName}.`,
      type: NotificationType.DIET_ASSIGNED,
      metadata: { entity_type: 'diet', action: 'assigned' },
    });
  }

  // ===== Template notification methods =====

  async sendTemplateFeedbackRequestNotification(
    userId: string,
    templateTitle: string,
  ) {
    return this.create({
      userId,
      title: 'Feedback Request',
      message: `Please provide feedback on the template "${templateTitle}".`,
      type: NotificationType.TEMPLATE_FEEDBACK_REQUEST,
      metadata: { entity_type: 'template', action: 'feedback_request' },
    });
  }
}
