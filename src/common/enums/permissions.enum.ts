export enum Permissions {
  // Gym permissions
  GYM_CREATE = 'gym:create',
  GYM_READ = 'gym:read',
  GYM_UPDATE = 'gym:update',
  GYM_DELETE = 'gym:delete',

  // Branch permissions
  BRANCH_MANAGE = 'branch:manage',
  BRANCH_READ = 'branch:read',

  // Member permissions
  MEMBER_MANAGE = 'member:manage',
  MEMBER_READ = 'member:read',

  // Trainer permissions
  TRAINER_MANAGE = 'trainer:manage',
  TRAINER_READ = 'trainer:read',

  // Chart/Workout permissions
  CHART_CREATE = 'chart:create',
  CHART_VIEW_ALL = 'chart:view_all',
  CHART_VIEW_ASSIGNED = 'chart:view_assigned',
  CHART_ASSIGN_ANY = 'chart:assign_any',
  CHART_ASSIGN_ASSIGNED = 'chart:assign_assigned',

  // Diet permissions
  DIET_CREATE = 'diet:create',
  DIET_VIEW_ALL = 'diet:view_all',
  DIET_ASSIGN_ANY = 'diet:assign_any',
  DIET_ASSIGN_ASSIGNED = 'diet:assign_assigned',

  // Goal permissions
  GOAL_CREATE = 'goal:create',
  GOAL_VIEW_ALL = 'goal:view_all',
  GOAL_ASSIGN_ASSIGNED = 'goal:assign_assigned',

  // Admin permissions
  ADMIN_ALL = 'admin:all',
  SUPERADMIN_ALL = 'superadmin:all',
}

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN', // Gym owner level
  TRAINER = 'TRAINER',
  MEMBER = 'MEMBER',
}

// Role to Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permissions[]> = {
  [UserRole.SUPERADMIN]: Object.values(Permissions),
  [UserRole.ADMIN]: [
    Permissions.GYM_READ,
    Permissions.GYM_UPDATE,
    Permissions.BRANCH_MANAGE,
    Permissions.BRANCH_READ,
    Permissions.MEMBER_MANAGE,
    Permissions.MEMBER_READ,
    Permissions.TRAINER_MANAGE,
    Permissions.TRAINER_READ,
    Permissions.CHART_CREATE,
    Permissions.CHART_VIEW_ALL,
    Permissions.CHART_ASSIGN_ANY,
    Permissions.DIET_CREATE,
    Permissions.DIET_VIEW_ALL,
    Permissions.DIET_ASSIGN_ANY,
    Permissions.GOAL_CREATE,
    Permissions.GOAL_VIEW_ALL,
    Permissions.ADMIN_ALL,
  ],
  [UserRole.TRAINER]: [
    Permissions.CHART_CREATE,
    Permissions.CHART_VIEW_ASSIGNED,
    Permissions.CHART_ASSIGN_ASSIGNED,
    Permissions.DIET_ASSIGN_ASSIGNED,
    Permissions.GOAL_ASSIGN_ASSIGNED,
    Permissions.MEMBER_READ,
  ],
  [UserRole.MEMBER]: [
    // Members have limited self-access - handled at service level
  ],
};
