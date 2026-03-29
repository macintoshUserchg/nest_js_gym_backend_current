import { MemberSubscription } from '../../entities/member_subscriptions.entity';

export function isSubscriptionCurrentlyActive(
  subscription?: Pick<MemberSubscription, 'isActive' | 'endDate'> | null,
  now: Date = new Date(),
): boolean {
  if (!subscription?.isActive || !subscription.endDate) {
    return false;
  }

  const endOfDay = new Date(subscription.endDate);
  endOfDay.setHours(23, 59, 59, 999);

  return endOfDay >= now;
}
