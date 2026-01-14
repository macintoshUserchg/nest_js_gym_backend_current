import { DataSource, In } from 'typeorm';
import { pgConfig } from '../../dbConfig';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Trainer } from '../entities/trainers.entity';
import { Member } from '../entities/members.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { Class } from '../entities/classes.entity';
import { Invoice } from '../entities/invoices.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { Attendance } from '../entities/attendance.entity';
import { User } from '../entities/users.entity';
import { Notification } from '../entities/notifications.entity';
import { AuditLog } from '../entities/audit_logs.entity';
import {
  Inquiry,
  InquiryStatus,
  InquirySource,
  PreferredMembershipType,
} from '../entities/inquiry.entity';
import { Role } from '../entities/roles.entity';
import { Gender } from '../common/enums/gender.enum';
import { WorkoutPlan } from '../entities/workout_plans.entity';
import { WorkoutPlanExercise } from '../entities/workout_plan_exercises.entity';
import { DietPlan } from '../entities/diet_plans.entity';
import { DietPlanMeal } from '../entities/diet_plan_meals.entity';
import { ExerciseLibrary } from '../entities/exercise_library.entity';
import { ProgressTracking } from '../entities/progress_tracking.entity';
import { Goal } from '../entities/goals.entity';
import { AttendanceGoal } from '../entities/attendance_goals.entity';
import { WorkoutLog } from '../entities/workout_logs.entity';
import * as bcrypt from 'bcrypt';

interface UserCredential {
  email: string;
  password: string;
  role: string;
  gymName?: string;
  branchName?: string;
}

// User credentials tracker
const userCredentials: UserCredential[] = [];

class FitnessFirstEliteSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource(pgConfig);
  }

  async seed() {
    try {
      console.log('🔄 Initializing database connection...');

      // Validate environment first
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'Cannot seed data in production environment. Use migrations instead.',
        );
      }

      await this.dataSource.initialize();
      console.log('✅ Database connection established');

      // Clear existing data for Fitness First Elite (except roles)
      await this.clearExistingFitnessFirstEliteData();

      // Seed data in proper order
      const gyms = await this.seedGyms();
      const branches = await this.seedBranches(gyms);
      const membershipPlans = await this.seedMembershipPlans(branches);
      const trainers = await this.seedTrainers(branches);
      const members = await this.seedMembers(branches);
      const classes = await this.seedClasses(branches);
      const memberSubscriptions = await this.seedMemberSubscriptions(
        members,
        membershipPlans,
        classes, // NEW: Pass classes for subscription assignment
      );
      const memberTrainerAssignments = await this.seedMemberTrainerAssignments(
        members,
        trainers,
      );

      const inquiries = await this.seedInquiries(branches);
      const invoices = await this.seedInvoices(members, memberSubscriptions);
      const paymentTransactions = await this.seedPaymentTransactions(invoices);
      const attendances = await this.seedAttendance(
        members,
        trainers,
        branches,
      );

      // Seed roles first (if they don't exist)
      const roles = await this.seedRoles();

      // Seed users (needs roles, gyms, branches, members, trainers)
      const users = await this.seedUsers(
        gyms,
        branches,
        members,
        trainers,
        roles,
      );

      const notifications = await this.seedNotifications(users);
      const auditLogs = await this.seedAuditLogs(users);

      // Seed comprehensive data
      console.log('Seeding comprehensive data for Fitness First Elite...');
      const workoutPlans = await this.seedWorkoutPlans(members, trainers);
      const workoutPlanExercises =
        await this.seedWorkoutPlanExercises(workoutPlans);
      const dietPlans = await this.seedDietPlans(members, trainers);
      const dietPlanMeals = await this.seedDietPlanMeals(dietPlans);
      const exerciseLibrary = await this.seedExerciseLibrary();
      const progressTracking = await this.seedProgressTracking(
        members,
        trainers,
      );
      const goals = await this.seedGoals(members, trainers);
      const attendanceGoals = await this.seedAttendanceGoals(members, branches);
      const workoutLogs = await this.seedWorkoutLogs(members, trainers);

      console.log('\n=== FITNESS FIRST ELITE SEEDING COMPLETED ===');
      console.log('\n=== USER CREDENTIALS ===');
      this.displayUserCredentials();

      console.log('\n=== SUMMARY ===');
      console.log(`Gyms: ${gyms.length}`);
      console.log(`Branches: ${branches.length}`);
      console.log(`Membership Plans: ${membershipPlans.length}`);
      console.log(`Trainers: ${trainers.length}`);
      console.log(`Members: ${members.length}`);
      console.log(`Member Subscriptions: ${memberSubscriptions.length}`);
      console.log(
        `Member Trainer Assignments: ${memberTrainerAssignments.length}`,
      );
      console.log(`Classes: ${classes.length}`);
      console.log(`Inquiries: ${inquiries.length}`);
      console.log(`Invoices: ${invoices.length}`);
      console.log(`Payment Transactions: ${paymentTransactions.length}`);
      console.log(`Attendance Records: ${attendances.length}`);
      console.log(`Users: ${users.length}`);
      console.log(`Notifications: ${notifications.length}`);
      console.log(`Audit Logs: ${auditLogs.length}`);
      console.log('\n=== COMPREHENSIVE DATA ===');
      console.log(`Workout Plans: ${workoutPlans.length}`);
      console.log(`Workout Plan Exercises: ${workoutPlanExercises.length}`);
      console.log(`Diet Plans: ${dietPlans.length}`);
      console.log(`Diet Plan Meals: ${dietPlanMeals.length}`);
      console.log(`Exercise Library: ${exerciseLibrary.length}`);
      console.log(`Progress Tracking: ${progressTracking.length}`);
      console.log(`Goals: ${goals.length}`);
      console.log(`Attendance Goals: ${attendanceGoals.length}`);
      console.log(`Workout Logs: ${workoutLogs.length}`);
    } catch (error) {
      console.error('\n❌ Seeding failed:', error.message);

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Check if PostgreSQL is running');
        console.error(
          '  2. Verify DATABASE_URL format: postgresql://user:pass@host:5432/dbname',
        );
        console.error('  3. Ensure database exists and user has permissions');
      } else if (error.code === '42P01') {
        console.error('\n🔧 Database tables missing - run migrations first');
      } else if (error.message.includes('production')) {
        console.error('\n🔒 Safety check prevented seeding in production');
      }

      process.exit(1);
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Database connection closed');
      }
    }
  }

  private async clearExistingFitnessFirstEliteData() {
    console.log('Checking for existing Fitness First Elite data...');

    // First, find Fitness First Elite gym
    const fitnessFirstGym = await this.dataSource
      .getRepository(Gym)
      .findOne({ where: { name: 'Fitness First Elite' } });

    if (!fitnessFirstGym) {
      console.log(
        'No existing Fitness First Elite data found. Starting fresh.',
      );
      return;
    }

    console.log('Fitness First Elite found. Clearing existing data...');
    console.log('  Gym ID:', fitnessFirstGym.gymId);

    // Get branches for this gym
    const branches = await this.dataSource
      .getRepository(Branch)
      .find({ where: { gym: { gymId: fitnessFirstGym.gymId } } });

    if (branches.length === 0) {
      console.log('No branches found for this gym.');
      return;
    }

    const branchIds = branches.map((b) => b.branchId);
    console.log('  Branch IDs:', branchIds);

    // Get all members for this gym
    const members = await this.dataSource
      .getRepository(Member)
      .find({ where: { branch: { branchId: In(branchIds) } } });
    const memberIds = members.map((m) => m.id);

    // Get all trainers for this gym
    const trainers = await this.dataSource
      .getRepository(Trainer)
      .find({ where: { branch: { branchId: In(branchIds) } } });
    const trainerIds = trainers.map((t) => t.id);

    // Get all users for this gym
    const users = await this.dataSource
      .getRepository(User)
      .find({ where: { gym: { gymId: fitnessFirstGym.gymId } } });
    const userIds = users.map((u) => u.userId);

    console.log(
      `Found ${members.length} members, ${trainers.length} trainers, ${users.length} users to clear`,
    );

    // Helper to safely delete
    const safeDelete = async (query: string, errorMsg: string) => {
      try {
        await this.dataSource.query(query);
        return true;
      } catch (e) {
        console.log(`  ⚠ ${errorMsg}: ${e.message}`);
        return false;
      }
    };

    const branchIdsStr = branchIds.map((id) => `'${id}'`).join(', ');
    const memberIdsStr = memberIds.map((id) => `'${id}'`).join(', ');
    const trainerIdsStr = trainerIds.map((id) => `'${id}'`).join(', ');
    const userIdsStr = userIds.map((id) => `'${id}'`).join(', ');

    console.log('\n--- Deleting in dependency order ---\n');
    console.log('NOTE: Roles table data will be preserved (not cleared)\n');

    // Level 1: Deep children that depend on members/trainers/users
    // These must be deleted BEFORE members/trainers/users
    if (memberIds.length > 0) {
      await safeDelete(
        `DELETE FROM "payment_transactions" WHERE "invoiceInvoiceId" IN (SELECT "invoice_id" FROM invoices WHERE "memberId" IN (${memberIdsStr}))`,
        'payment_transactions',
      );
      await safeDelete(
        `DELETE FROM "invoices" WHERE "memberId" IN (${memberIdsStr})`,
        'invoices',
      );
      await safeDelete(
        `DELETE FROM "diet_plan_meals" WHERE "dietPlanPlanId" IN (SELECT "plan_id" FROM diet_plans WHERE "memberId" IN (${memberIdsStr}))`,
        'diet_plan_meals',
      );
      await safeDelete(
        `DELETE FROM "workout_plan_exercises" WHERE "workoutPlanPlanId" IN (SELECT "plan_id" FROM workout_plans WHERE "memberId" IN (${memberIdsStr}))`,
        'workout_plan_exercises',
      );
      await safeDelete(
        `DELETE FROM "diet_plans" WHERE "memberId" IN (${memberIdsStr})`,
        'diet_plans',
      );
      await safeDelete(
        `DELETE FROM "workout_plans" WHERE "memberId" IN (${memberIdsStr})`,
        'workout_plans',
      );
      await safeDelete(
        `DELETE FROM "member_trainer_assignments" WHERE "member_id" IN (${memberIdsStr}) OR "trainer_id" IN (${trainerIdsStr})`,
        'member_trainer_assignments',
      );
      await safeDelete(
        `DELETE FROM "attendance" WHERE "memberId" IN (${memberIdsStr}) OR "trainerId" IN (${trainerIdsStr})`,
        'attendance',
      );
      await safeDelete(
        `DELETE FROM "workout_logs" WHERE "memberId" IN (${memberIdsStr}) OR "trainerId" IN (${trainerIdsStr})`,
        'workout_logs',
      );
      await safeDelete(
        `DELETE FROM "goals" WHERE "memberId" IN (${memberIdsStr}) OR "trainerId" IN (${trainerIdsStr})`,
        'goals',
      );
      await safeDelete(
        `DELETE FROM "progress_tracking" WHERE "memberId" IN (${memberIdsStr}) OR "recordedByTrainerId" IN (${trainerIdsStr})`,
        'progress_tracking',
      );
      await safeDelete(
        `DELETE FROM "attendance_goals" WHERE "memberId" IN (${memberIdsStr})`,
        'attendance_goals',
      );
    }

    // Level 2: Direct children of users
    if (userIds.length > 0) {
      await safeDelete(
        `DELETE FROM "audit_logs" WHERE "userUserId" IN (${userIdsStr})`,
        'audit_logs',
      );
      await safeDelete(
        `DELETE FROM "notifications" WHERE "userUserId" IN (${userIdsStr})`,
        'notifications',
      );
    }

    // Level 3: Member subscriptions must be deleted BEFORE classes (due to selectedClass FK)
    if (memberIds.length > 0) {
      await safeDelete(
        `DELETE FROM "member_subscriptions" WHERE "memberId" IN (${memberIdsStr})`,
        'member_subscriptions',
      );
    }

    // Level 4: Classes and inquiries (depend on branches)
    if (branchIds.length > 0) {
      await safeDelete(
        `DELETE FROM "classes" WHERE "branchBranchId" IN (${branchIdsStr})`,
        'classes',
      );
      await safeDelete(
        `DELETE FROM "inquiries" WHERE "branchBranchId" IN (${branchIdsStr})`,
        'inquiries',
      );
    }

    // Level 5: Members (cascade deletes subscriptions)
    if (branchIds.length > 0) {
      await safeDelete(
        `DELETE FROM "members" WHERE "branchBranchId" IN (${branchIdsStr})`,
        'members',
      );
    }

    // Level 6: Trainers
    if (branchIds.length > 0) {
      await safeDelete(
        `DELETE FROM "trainers" WHERE "branchBranchId" IN (${branchIdsStr})`,
        'trainers',
      );
    }

    // Level 7: Users
    await safeDelete(
      `DELETE FROM "users" WHERE "gymGymId" = '${fitnessFirstGym.gymId}'`,
      'users',
    );

    // Level 8: Membership plans (must delete before branches)
    if (branchIds.length > 0) {
      await safeDelete(
        `DELETE FROM "membership_plans" WHERE "branchBranchId" IN (${branchIdsStr})`,
        'membership_plans',
      );
    }

    // Level 9: Branches (must delete before gym)
    await safeDelete(
      `DELETE FROM "branches" WHERE "gymGymId" = '${fitnessFirstGym.gymId}'`,
      'branches',
    );

    // Level 10: Gym
    await safeDelete(
      `DELETE FROM "gyms" WHERE "gymId" = '${fitnessFirstGym.gymId}'`,
      'gym',
    );

    // IMPORTANT: Roles table is intentionally NOT cleared to preserve existing role definitions
    console.log('✅ Roles table data preserved (not cleared)');

    console.log('\nData clearing completed.');

    // Verify deletion
    const checkGym = await this.dataSource.getRepository(Gym).findOne({
      where: { gymId: fitnessFirstGym.gymId },
    });
    console.log(
      '  Verification - Gym still exists?',
      checkGym ? 'YES (PROBLEM!)' : 'NO (GOOD!)',
    );
  }

  private async seedRoles(): Promise<Role[]> {
    console.log('Seeding roles...');
    const roleRepository = this.dataSource.getRepository(Role);

    const existingRoles = await roleRepository.find();
    if (existingRoles.length > 0) {
      console.log('Roles already exist, skipping...');
      return existingRoles;
    }

    const roles = [
      { name: 'SUPERADMIN', description: 'System Super Administrator' },
      { name: 'ADMIN', description: 'Gym Administrator' },
      { name: 'TRAINER', description: 'Fitness Trainer' },
      { name: 'MEMBER', description: 'Gym Member' },
    ];

    const savedRoles = await roleRepository.save(roles);
    console.log(`Seeded ${savedRoles.length} roles`);
    return savedRoles;
  }

  private async seedGyms(): Promise<Gym[]> {
    console.log('Seeding Fitness First Elite gym...');
    const gymRepository = this.dataSource.getRepository(Gym);

    const existingGym = await gymRepository.findOne({
      where: { name: 'Fitness First Elite' },
    });

    if (existingGym) {
      console.log('Fitness First Elite gym already exists, updating...');
      // Update existing gym
      const updatedGym = await gymRepository.save({
        ...existingGym,
        email: 'admin@fitnessfirstelite.com',
        phone: '+1-555-FITNESS',
        address: '123 Elite Fitness Drive, Wellness City, WC 90210',
        location: 'Downtown',
        state: 'California',
        latitude: 34.0522,
        longitude: -118.2437,
      });
      return [updatedGym];
    }

    const gyms = [
      {
        name: 'Fitness First Elite',
        email: 'admin@fitnessfirstelite.com',
        phone: '+1-555-FITNESS',
        address: '123 Elite Fitness Drive, Wellness City, WC 90210',
        location: 'Downtown',
        state: 'California',
        latitude: 34.0522,
        longitude: -118.2437,
      },
    ];

    const savedGyms = await gymRepository.save(gyms);
    console.log(`Seeded ${savedGyms.length} gym`);
    return savedGyms;
  }

  private async seedBranches(gyms: Gym[]): Promise<Branch[]> {
    console.log('Seeding Fitness First Elite branches...');
    const branchRepository = this.dataSource.getRepository(Branch);

    const branches = [
      {
        name: 'Fitness First Elite - Downtown',
        email: 'downtown@fitnessfirstelite.com',
        phone: '+1-555-0101',
        address: '123 Elite Fitness Drive, Wellness City, WC 90210',
        location: 'Downtown',
        state: 'California',
        gym: gyms[0],
        mainBranch: true,
      },
      {
        name: 'Fitness First Elite - Beverly Hills',
        email: 'beverlyhills@fitnessfirstelite.com',
        phone: '+1-555-0102',
        address: '456 Rodeo Drive, Beverly Hills, BH 90211',
        location: 'Beverly Hills',
        state: 'California',
        latitude: 34.0736,
        longitude: -118.4004,
        gym: gyms[0],
        mainBranch: false,
      },
      {
        name: 'Fitness First Elite - Santa Monica',
        email: 'santamonica@fitnessfirstelite.com',
        phone: '+1-555-0103',
        address: '789 Ocean Avenue, Santa Monica, SM 90401',
        location: 'Santa Monica',
        state: 'California',
        latitude: 34.0195,
        longitude: -118.4912,
        gym: gyms[0],
        mainBranch: false,
      },
      {
        name: 'Fitness First Elite - Pasadena',
        email: 'pasadena@fitnessfirstelite.com',
        phone: '+1-555-0104',
        address: '321 Colorado Blvd, Pasadena, PS 91101',
        location: 'Pasadena',
        state: 'California',
        latitude: 34.1478,
        longitude: -118.1445,
        gym: gyms[0],
        mainBranch: false,
      },
    ];

    const savedBranches = await branchRepository.save(branches);
    console.log(`Seeded ${savedBranches.length} branches`);
    return savedBranches;
  }

  private async seedMembershipPlans(
    branches: Branch[],
  ): Promise<MembershipPlan[]> {
    console.log('Seeding membership plans...');
    const membershipPlanRepository =
      this.dataSource.getRepository(MembershipPlan);

    const planTemplates = [
      {
        name: 'Elite Basic',
        durationInDays: 30,
        price: 8999,
        description: 'Access to premium gym facilities and basic classes',
      },
      {
        name: 'Elite Premium',
        durationInDays: 90,
        price: 23999,
        description:
          'Full access plus personal training and nutrition consultation',
      },
      {
        name: 'Elite VIP',
        durationInDays: 180,
        price: 42999,
        description:
          'Premium access with unlimited personal training and VIP amenities',
      },
      {
        name: 'Elite Annual',
        durationInDays: 365,
        price: 79999,
        description: 'Full year access with exclusive member benefits',
      },
      {
        name: 'Elite Student',
        durationInDays: 30,
        price: 5999,
        description: 'Discounted plan for students with valid ID',
      },
    ];

    const membershipPlans: any[] = [];

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];

      for (let planIndex = 0; planIndex < planTemplates.length; planIndex++) {
        const template = planTemplates[planIndex];
        membershipPlans.push({
          name: `${template.name} - ${branch.location}`,
          price: template.price,
          durationInDays: template.durationInDays,
          description: template.description,
          branch: branch,
        });
      }
    }

    const savedMembershipPlans =
      await membershipPlanRepository.save(membershipPlans);
    console.log(`Seeded ${savedMembershipPlans.length} membership plans`);
    return savedMembershipPlans;
  }

  private async seedTrainers(branches: Branch[]): Promise<Trainer[]> {
    console.log('Seeding trainers...');
    const trainerRepository = this.dataSource.getRepository(Trainer);

    const specializations = [
      'Elite Strength Training, Powerlifting',
      'Premium Yoga, Pilates, Mindfulness',
      'High-Performance Cardio, Endurance Training',
      'Functional Training, Movement Optimization',
      'CrossFit Level 3, HIIT Performance',
      'Elite Personal Training, Nutrition Science',
      'Olympic Lifting, Sport Performance',
      'Bodybuilding, Competition Prep',
      'Dance Fitness, Ballet Conditioning',
      'Athletic Performance, Speed Training',
      'Group Fitness, Bootcamp Leadership',
      'Martial Arts, Combat Fitness',
      'Boxing, Kickboxing Conditioning',
      'Swimming, Aquatic Fitness',
      'Indoor Cycling, Spin Performance',
      'Pilates Equipment Specialist',
      'TRX Suspension Training',
      'Kettlebell Sport, Strength Conditioning',
    ];

    const firstNames = [
      'Marcus',
      'Sophia',
      'Alexander',
      'Isabella',
      'David',
      'Aria',
      'James',
      'Maya',
      'Ethan',
      'Zoe',
      'Oliver',
      'Lily',
      'Lucas',
      'Chloe',
      'Henry',
      'Grace',
      'Jack',
      'Victoria',
      'Sebastian',
      'Penelope', // Added for 20 trainers
    ];
    const lastNames = [
      'Sterling',
      'Valentine',
      'Blackwood',
      'Montgomery',
      'Harrington',
      'Ashworth',
      'Kingsley',
      'Wellington',
      'Rutherford',
      'Chamberlain',
      'Fairfax',
      'Pembroke',
      'Sinclair',
      'Armstrong',
      'Winchester',
      'Marlowe',
      'Cavendish',
      'Beaumont',
      'Harrington',
      'Ashworth', // Added for 20 trainers
    ];

    const trainers: any[] = [];
    let trainerIndex = 0;

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      for (let i = 0; i < 5; i++) {
        const firstName = firstNames[trainerIndex % firstNames.length];
        const lastName = lastNames[trainerIndex % lastNames.length];
        const fullName = `Trainer ${firstName} ${lastName}`;
        const email = `trainer.${firstName.toLowerCase()}.${lastName.toLowerCase()}@fitnessfirstelite.com`;
        const phone = `+1-555-${String(2000 + trainerIndex).padStart(4, '0')}`;
        const specialization =
          specializations[trainerIndex % specializations.length];
        const avatarUrl = `https://i.pravatar.cc/150?img=${trainerIndex + 1}`;

        trainers.push({
          fullName,
          email,
          phone,
          specialization,
          avatarUrl,
          branch,
        });

        trainerIndex++;
      }
    }

    const savedTrainers = await trainerRepository.save(trainers);
    console.log(`Seeded ${savedTrainers.length} trainers`);
    return savedTrainers;
  }

  private async seedMembers(branches: Branch[]): Promise<Member[]> {
    console.log('Seeding members...');
    const memberRepository = this.dataSource.getRepository(Member);

    const firstNames = [
      'Sophia',
      'Liam',
      'Emma',
      'Noah',
      'Olivia',
      'Elijah',
      'Ava',
      'Lucas',
      'Isabella',
      'Mason',
      'Mia',
      'Ethan',
      'Amelia',
      'Logan',
      'Harper',
      'James',
      'Evelyn',
      'Benjamin',
      'Abigail',
      'Jacob',
      'Emily',
      'Michael',
      'Elizabeth',
      'Alexander',
      'Mila',
      'Henry',
      'Ella',
      'Sebastian',
      'Avery',
      'Jack',
      'Sofia',
      'Owen',
      'Camila',
      'Samuel',
      'Aria',
    ];
    const lastNames = [
      'Johnson-Smith',
      'Williams-Brown',
      'Davis-Jones',
      'Miller-Wilson',
      'Moore-Taylor',
      'Anderson-Thomas',
      'Jackson-White',
      'Harris-Martin',
      'Thompson-Garcia',
      'Martinez-Robinson',
      'Clark-Rodriguez',
      'Lewis-Lee',
      'Walker-Hall',
      'Allen-Young',
      'King-Wright',
      'Scott-Green',
      'Baker-Adams',
      'Nelson-Hill',
      'Ramirez-Campbell',
      'Mitchell-Roberts',
      'Carter-Phillips',
      'Evans-Turner',
      'Parker-Collins',
      'Edwards-Stewart',
      'Flores-Morris',
      'Nguyen-Rogers',
      'Reed-Cook',
      'Morgan-Bell',
      'Murphy-Bailey',
      'Rivera-Cooper',
      'Richardson-Cox',
      'Howard-Ward',
      'Torres-Peterson',
      'Gray-Ramirez',
      'James-Watson',
    ];

    const members: any[] = [];
    let memberIndex = 0;

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      for (let i = 0; i < 25; i++) {
        const firstName = firstNames[memberIndex % firstNames.length];
        const lastName = lastNames[memberIndex % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${memberIndex}@email.com`;
        const phone = `+1-555-${String(8000 + memberIndex).padStart(4, '0')}`;
        const gender = memberIndex % 2 === 0 ? Gender.FEMALE : Gender.MALE;
        const dateOfBirth = new Date(
          1985 + (memberIndex % 20),
          memberIndex % 12,
          1 + (memberIndex % 28),
        );
        const addressLine1 = `${String(100 + memberIndex)} Elite Avenue`;
        const city = branch.location;
        const state = 'California';
        const postalCode = String(90000 + memberIndex).padStart(5, '0');
        const emergencyContactName = `Emergency ${lastName}`;
        const emergencyContactPhone = `+1-555-${String(9000 + memberIndex).padStart(4, '0')}`;

        members.push({
          fullName,
          email,
          phone,
          gender,
          dateOfBirth,
          addressLine1,
          city,
          state,
          postalCode,
          emergencyContactName,
          emergencyContactPhone,
          branch,
          isActive: true,
          is_managed_by_member: true,
        });

        memberIndex++;
      }
    }

    const savedMembers = await memberRepository.save(members);
    console.log(`Seeded ${savedMembers.length} members`);
    return savedMembers;
  }

  private async seedMemberTrainerAssignments(
    members: Member[],
    trainers: Trainer[],
  ): Promise<MemberTrainerAssignment[]> {
    console.log('Seeding member trainer assignments...');
    const memberTrainerAssignmentRepository = this.dataSource.getRepository(
      MemberTrainerAssignment,
    );

    const assignments: any[] = [];

    for (let trainerIndex = 0; trainerIndex < trainers.length; trainerIndex++) {
      const trainer = trainers[trainerIndex];
      const branchMembers = members.filter(
        (member) =>
          member.branch &&
          trainer.branch &&
          member.branch.branchId === trainer.branch.branchId,
      );
      const numAssignments = Math.floor(Math.random() * 4) + 6;

      const shuffledMembers = branchMembers.sort(() => 0.5 - Math.random());
      const assignedMembers = shuffledMembers.slice(0, numAssignments);

      for (let i = 0; i < assignedMembers.length; i++) {
        const member = assignedMembers[i];
        const startDate = new Date(
          2024,
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 28) + 1,
        );
        const status = Math.random() > 0.15 ? 'active' : 'ended';

        assignments.push({
          member: member,
          trainer: trainer,
          start_date: startDate,
          end_date:
            status === 'ended'
              ? new Date(
                  startDate.getTime() +
                    Math.random() * 365 * 24 * 60 * 60 * 1000,
                )
              : null,
          status: status,
        });
      }
    }

    const savedAssignments =
      await memberTrainerAssignmentRepository.save(assignments);
    console.log(`Seeded ${savedAssignments.length} member trainer assignments`);
    return savedAssignments;
  }

  private async seedAttendance(
    members: Member[],
    trainers: Trainer[],
    branches: Branch[],
  ): Promise<Attendance[]> {
    console.log('Seeding attendance records...');
    const attendanceRepository = this.dataSource.getRepository(Attendance);

    const today = new Date();
    const attendanceRecords: Attendance[] = [];

    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      for (let m = 0; m < Math.min(10, members.length); m++) {
        const memberIndex = (i * 10 + m) % members.length;
        const member = members[memberIndex];
        const checkInHour = 7 + Math.floor(Math.random() * 10);
        const checkInMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const workoutDuration = 60 + Math.floor(Math.random() * 60);

        // Calculate checkout time (checkIn + duration)
        const checkOutDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          checkInHour,
          checkInMinute,
        );
        checkOutDate.setMinutes(checkOutDate.getMinutes() + workoutDuration);

        const memberAttendance = await attendanceRepository.save({
          member: member,
          attendanceType: 'member',
          checkInTime: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            checkInHour,
            checkInMinute,
          ),
          checkOutTime: checkOutDate,
          date: date,
          branch: member.branch,
        } as any);
        attendanceRecords.push(memberAttendance);
      }

      for (let t = 0; t < Math.min(5, trainers.length); t++) {
        const trainerIndex = (i * 5 + t) % trainers.length;
        const trainer = trainers[trainerIndex];

        const trainerAttendance = await attendanceRepository.save({
          trainer: trainer,
          attendanceType: 'trainer',
          checkInTime: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            6,
            30,
          ),
          checkOutTime: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            20,
            0,
          ),
          date: date,
          branch: trainer.branch,
        } as any);
        attendanceRecords.push(trainerAttendance);
      }
    }

    console.log(`Seeded ${attendanceRecords.length} attendance records`);
    return attendanceRecords;
  }

  private async seedClasses(branches: Branch[]): Promise<Class[]> {
    console.log('Seeding classes...');
    const classRepository = this.dataSource.getRepository(Class);

    const classTemplates = [
      {
        name: 'Elite Morning Yoga',
        description:
          'Premium yoga session to start your day with mindfulness and strength',
        timings: 'morning',
        recurrence_type: 'weekly',
        days_of_week: [1, 3, 5],
      },
      {
        name: 'HIIT Elite Performance',
        description: 'High-intensity interval training for elite athletes',
        timings: 'evening',
        recurrence_type: 'weekly',
        days_of_week: [2, 4],
      },
      {
        name: 'Weekend Elite CrossFit',
        description: 'Intense CrossFit workout for weekend warriors',
        timings: 'both',
        recurrence_type: 'weekly',
        days_of_week: [6, 0],
      },
      {
        name: 'Elite Weight Training',
        description: 'Advanced weight training techniques and form correction',
        timings: 'morning',
        recurrence_type: 'daily',
        days_of_week: null,
      },
      {
        name: 'Ballet Fitness',
        description: 'Graceful dance-based workout inspired by ballet',
        timings: 'evening',
        recurrence_type: 'weekly',
        days_of_week: [1, 4],
      },
      {
        name: 'Elite Spin Class',
        description: 'High-energy cycling workout with premium equipment',
        timings: 'morning',
        recurrence_type: 'weekly',
        days_of_week: [3, 5],
      },
      {
        name: 'Pilates Premium',
        description: 'Core strengthening and flexibility with equipment',
        timings: 'evening',
        recurrence_type: 'weekly',
        days_of_week: [2, 4],
      },
      {
        name: 'Elite Boxing',
        description: 'Boxing fundamentals and fitness for all levels',
        timings: 'both',
        recurrence_type: 'weekly',
        days_of_week: [1, 3],
      },
    ];

    const classes: any[] = [];

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      for (let i = 0; i < 4; i++) {
        const template =
          classTemplates[(branchIndex * 4 + i) % classTemplates.length];
        classes.push({
          name: template.name,
          description: template.description,
          timings: template.timings,
          recurrence_type: template.recurrence_type,
          days_of_week: template.days_of_week,
          branch: branch,
        });
      }
    }

    const savedClasses = await classRepository.save(classes);
    console.log(`Seeded ${savedClasses.length} classes`);
    return savedClasses;
  }

  private async seedInquiries(branches: Branch[]): Promise<Inquiry[]> {
    console.log('Seeding inquiries...');
    const inquiryRepository = this.dataSource.getRepository(Inquiry);

    const firstNames = [
      'Victoria',
      'Adrian',
      'Sophia',
      'Marcus',
      'Isabella',
      'Alexander',
      'Emma',
      'David',
      'Olivia',
      'James',
      'Ava',
      'Michael',
      'Charlotte',
      'William',
      'Amelia',
      'Benjamin',
      'Harper',
      'Lucas',
      'Evelyn',
      'Henry',
    ];
    const lastNames = [
      'Pembroke',
      'Kingsley',
      'Wellington',
      'Rutherford',
      'Chamberlain',
      'Fairfax',
      'Sinclair',
      'Armstrong',
      'Winchester',
      'Marlowe',
      'Cavendish',
      'Beaumont',
      'Sterling',
      'Valentine',
      'Blackwood',
      'Montgomery',
      'Harrington',
      'Ashworth',
      'Sterling',
      'Valentine',
    ];

    const occupations = [
      'Investment Banker',
      'Tech Executive',
      'Real Estate Developer',
      'Entertainment Producer',
      'Fashion Designer',
      'Business Consultant',
      'Architect',
      'Interior Designer',
      'Software Engineer',
      'Marketing Director',
      'Attorney',
      'Doctor',
      'Surgeon',
      'Psychologist',
      'Financial Advisor',
      'Entrepreneur',
      'Artist',
      'Chef',
    ];
    const fitnessGoals = [
      'Elite athletic performance',
      'Muscle building and definition',
      'Weight management and toning',
      'Cardiovascular health optimization',
      'Strength and power development',
      'Flexibility and mobility improvement',
      'Endurance training for competitions',
      'Overall wellness and stress relief',
      'Posture correction and injury prevention',
      'Functional fitness for daily activities',
    ];

    const inquiries: any[] = [];
    let inquiryIndex = 0;

    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      for (let i = 0; i < 15; i++) {
        const firstName = firstNames[inquiryIndex % firstNames.length];
        const lastName = lastNames[inquiryIndex % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${inquiryIndex}@inquiry.com`;
        const phone = `+1-555-${String(10000 + inquiryIndex).padStart(4, '0')}`;

        const statuses = [
          InquiryStatus.NEW,
          InquiryStatus.NEW,
          InquiryStatus.NEW,
          InquiryStatus.NEW,
          InquiryStatus.CONTACTED,
          InquiryStatus.CONTACTED,
          InquiryStatus.CONTACTED,
          InquiryStatus.CONTACTED,
          InquiryStatus.QUALIFIED,
          InquiryStatus.QUALIFIED,
          InquiryStatus.QUALIFIED,
          InquiryStatus.CONVERTED,
          InquiryStatus.CONVERTED,
        ];
        const status = statuses[i % statuses.length];

        const sources = [
          InquirySource.WALK_IN,
          InquirySource.REFERRAL,
          InquirySource.SOCIAL_MEDIA,
          InquirySource.WEBSITE,
          InquirySource.GOOGLE_ADS,
        ];
        const source = sources[Math.floor(Math.random() * sources.length)];

        const membershipTypes = [
          PreferredMembershipType.PREMIUM,
          PreferredMembershipType.VIP,
          PreferredMembershipType.PREMIUM,
          PreferredMembershipType.VIP,
          PreferredMembershipType.VIP,
          PreferredMembershipType.BASIC,
          PreferredMembershipType.CORPORATE,
        ];
        const preferredMembershipType =
          membershipTypes[Math.floor(Math.random() * membershipTypes.length)];

        const city = branch.location;
        const state = 'California';
        const postalCode = String(90000 + inquiryIndex).padStart(5, '0');
        const dateOfBirth = new Date(
          1980 + (inquiryIndex % 25),
          inquiryIndex % 12,
          1 + (inquiryIndex % 28),
        );
        const occupation = occupations[inquiryIndex % occupations.length];
        const fitnessGoal = fitnessGoals[inquiryIndex % fitnessGoals.length];
        const hasPreviousGymExperience = Math.random() > 0.3;
        const wantsPersonalTraining = Math.random() > 0.4;
        const referralCode = `FFE${String(1000 + inquiryIndex).padStart(4, '0')}`;

        const inquiry: any = {
          fullName,
          email,
          phone,
          status,
          source,
          preferredMembershipType,
          preferredContactMethod: Math.random() > 0.5 ? 'email' : 'phone',
          notes: `Elite inquiry about ${preferredMembershipType.toLowerCase()} membership`,
          addressLine1: `${String(200 + inquiryIndex)} Luxury Lane`,
          city,
          state,
          postalCode,
          dateOfBirth,
          occupation,
          fitnessGoals: fitnessGoal,
          hasPreviousGymExperience,
          wantsPersonalTraining,
          referralCode,
          branch: branch,
        };

        // Generate realistic timeline dates based on status
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days

        if (
          status === InquiryStatus.CONTACTED ||
          status === InquiryStatus.QUALIFIED ||
          status === InquiryStatus.CONVERTED
        ) {
          const contactedDate = new Date(baseDate);
          contactedDate.setDate(
            contactedDate.getDate() + Math.floor(Math.random() * 7) + 1,
          ); // 1-7 days after base
          inquiry.contactedAt = contactedDate;
        }
        if (
          status === InquiryStatus.QUALIFIED ||
          status === InquiryStatus.CONVERTED
        ) {
          const qualifiedDate = inquiry.contactedAt
            ? new Date(inquiry.contactedAt)
            : new Date(baseDate);
          qualifiedDate.setDate(
            qualifiedDate.getDate() + Math.floor(Math.random() * 7) + 1,
          ); // 1-7 days after contact
          inquiry.qualifiedAt = qualifiedDate;
        }
        if (status === InquiryStatus.CONVERTED) {
          const convertedDate = inquiry.qualifiedAt
            ? new Date(inquiry.qualifiedAt)
            : new Date(baseDate);
          convertedDate.setDate(
            convertedDate.getDate() + Math.floor(Math.random() * 7) + 1,
          ); // 1-7 days after qualified
          inquiry.convertedAt = convertedDate;
        }

        inquiries.push(inquiry);
        inquiryIndex++;
      }
    }

    const savedInquiries = await Promise.all(
      inquiries.map((inquiry) => inquiryRepository.save(inquiry)),
    );
    console.log(`Seeded ${savedInquiries.length} inquiries`);
    return savedInquiries;
  }

  private async seedInvoices(
    members: Member[],
    memberSubscriptions: MemberSubscription[],
  ): Promise<Invoice[]> {
    console.log('Seeding invoices...');
    const invoiceRepository = this.dataSource.getRepository(Invoice);

    // Generate invoices for all active subscriptions with realistic data
    const invoices: any[] = [];

    for (const subscription of memberSubscriptions) {
      if (subscription.isActive) {
        const billingCycle = this.determineBillingCycle(subscription);
        const dueDate = this.calculateDueDate(subscription);
        const status = this.determineInitialStatus();

        // Add realistic variation (±5%) to base amount while keeping it aligned with plan pricing
        const baseAmount = subscription.plan.price / 100; // Convert from cents
        const variationPercent = (Math.random() * 0.1) - 0.05; // ±5%
        const finalAmount = parseFloat(
          (baseAmount * (1 + variationPercent)).toFixed(2),
        );

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const randomMonth = months[Math.floor(Math.random() * months.length)];

        invoices.push({
          member: subscription.member,
          subscription: subscription,
          total_amount: parseFloat(finalAmount.toFixed(2)),
          description: `${subscription.plan.name} - ${this.getBillingPeriodDescription(billingCycle)} ${randomMonth}`,
          due_date: dueDate,
          status: status,
        });
      }
    }

    const savedInvoices = await invoiceRepository.save(invoices);
    console.log(`Seeded ${savedInvoices.length} invoices`);
    return savedInvoices;
  }

  private async seedPaymentTransactions(
    invoices: Invoice[],
  ): Promise<PaymentTransaction[]> {
    console.log('Seeding payment transactions...');
    const paymentTransactionRepository =
      this.dataSource.getRepository(PaymentTransaction);

    const transactions: any[] = [];
    const methods = ['card', 'online', 'bank_transfer', 'cash'];
    let refNumber = 1;

    for (const invoice of invoices) {
      // Only create payment for invoices with 'paid' or 'pending' status
      if (invoice.status === 'paid' || invoice.status === 'pending') {
        const isCompleted = invoice.status === 'paid';
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 30));

        transactions.push({
          invoice: invoice,
          amount: invoice.total_amount,
          method: methods[Math.floor(Math.random() * methods.length)],
          reference_number: `FFE${String(refNumber).padStart(3, '0')}`,
          notes: `Payment for ${invoice.description}`,
          status: isCompleted ? 'completed' : 'pending',
          payment_date: paymentDate,
        });
        refNumber++;
      }
    }

    const savedTransactions =
      await paymentTransactionRepository.save(transactions);
    console.log(`Seeded ${savedTransactions.length} payment transactions`);
    return savedTransactions;
  }

  private async seedMemberSubscriptions(
    members: Member[],
    membershipPlans: MembershipPlan[],
    classes: Class[],
  ): Promise<MemberSubscription[]> {
    console.log('Seeding member subscriptions...');
    const memberSubscriptionRepository =
      this.dataSource.getRepository(MemberSubscription);

    const subscriptions: any[] = [];

    for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
      const member = members[memberIndex];
      const branchPlans = membershipPlans.filter(
        (plan) =>
          plan.branch &&
          member.branch &&
          plan.branch.branchId === member.branch.branchId,
      );
      if (branchPlans.length > 0) {
        const randomPlan =
          branchPlans[Math.floor(Math.random() * branchPlans.length)];
        const startDate = new Date(2024, Math.floor(Math.random() * 12), 1);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + randomPlan.durationInDays);

        // Assign a class from the same branch
        const branchClasses = classes.filter(
          (cls) =>
            cls.branch &&
            member.branch &&
            cls.branch.branchId === member.branch.branchId,
        );
        const selectedClass =
          branchClasses.length > 0
            ? branchClasses[Math.floor(Math.random() * branchClasses.length)]
            : null;

        subscriptions.push({
          member: member,
          plan: randomPlan,
          selectedClass: selectedClass, // NEW: Class assignment during subscription
          startDate: startDate,
          endDate: endDate,
          isActive: true, // All subscriptions are active
        });
      }
    }

    const savedSubscriptions =
      await memberSubscriptionRepository.save(subscriptions);
    console.log(`Seeded ${savedSubscriptions.length} member subscriptions`);
    return savedSubscriptions;
  }

  private async seedUsers(
    gyms: Gym[],
    branches: Branch[],
    members: Member[],
    trainers: Trainer[],
    roles: Role[],
  ): Promise<User[]> {
    console.log('Seeding users...');
    const userRepository = this.dataSource.getRepository(User);

    // First, check for existing users and create a set of existing emails
    const existingUsers = await userRepository.find({
      where: { gym: { gymId: gyms[0].gymId } },
    });
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const createUserWithPassword = async (
      email: string,
      password: string,
      role: Role,
      gym?: Gym,
      branch?: Branch,
      memberId?: string,
      trainerId?: string,
    ): Promise<User | null> => {
      // Skip if email already exists
      if (existingEmails.has(email)) {
        console.log(`  Skipping existing user: ${email}`);
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      userCredentials.push({
        email,
        password,
        role: role.name,
        gymName: gym?.name,
        branchName: branch?.name,
      });

      return userRepository.create({
        email,
        passwordHash,
        role,
        gym,
        branch,
        memberId,
        trainerId,
      });
    };

    const users: any[] = [];

    // Create superadmin
    const superadmin = await createUserWithPassword(
      'superadmin@fitnessfirstelite.com',
      'SuperAdmin123!',
      roles.find((r) => r.name === 'SUPERADMIN')!,
    );
    if (superadmin) users.push(superadmin);

    // Create admin
    const mainBranch = branches.find((b) => b.mainBranch);
    const admin = await createUserWithPassword(
      'admin@fitnessfirstelite.com',
      'Admin123!',
      roles.find((r) => r.name === 'ADMIN')!,
      gyms[0],
      mainBranch,
    );
    if (admin) users.push(admin);

    // Create trainer users
    for (let i = 0; i < trainers.length; i++) {
      const trainer = trainers[i];
      const trainerUser = await createUserWithPassword(
        trainer.email,
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        trainer.branch.gym,
        trainer.branch,
        undefined,
        trainer.id.toString(),
      );
      if (trainerUser) users.push(trainerUser);
    }

    // Create member users
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const memberUser = await createUserWithPassword(
        member.email,
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        member.branch?.gym,
        member.branch,
        member.id.toString(),
      );
      if (memberUser) users.push(memberUser);
    }

    if (users.length > 0) {
      const savedUsers = await userRepository.save(users);
      console.log(`Seeded ${savedUsers.length} new users`);
      return savedUsers;
    } else {
      console.log('No new users to seed (all existing)');
      return [];
    }
  }

  private async seedNotifications(users: User[]): Promise<Notification[]> {
    console.log('Seeding notifications...');
    const notificationRepository = this.dataSource.getRepository(Notification);

    const notifications = [
      {
        user: users.find((u) => u.role.name === 'SUPERADMIN'),
        title: 'Elite System Upgrade',
        message:
          'Fitness First Elite system has been upgraded with new premium features.',
        is_read: false,
      },
      {
        user: users.find((u) => u.role.name === 'ADMIN'),
        title: 'New Elite Member Registration',
        message:
          'A new premium member has registered and is pending your approval.',
        is_read: true,
      },
      {
        user: users.find((u) => u.role.name === 'TRAINER'),
        title: 'Elite Class Schedule Update',
        message:
          'Your premium yoga class schedule has been updated for next week.',
        is_read: false,
      },
      {
        user: users.find((u) => u.role.name === 'MEMBER'),
        title: 'Elite Membership Renewal',
        message:
          'Your Elite membership expires in 5 days. Renew now for continued access to premium facilities.',
        is_read: false,
      },
    ].filter(Boolean);

    const savedNotifications = await notificationRepository.save(
      notifications as any,
    );
    console.log(`Seeded ${savedNotifications.length} notifications`);
    return savedNotifications;
  }

  private async seedAuditLogs(users: User[]): Promise<AuditLog[]> {
    console.log('Seeding audit logs...');
    const auditLogRepository = this.dataSource.getRepository(AuditLog);

    const auditLogs = [
      {
        user: users.find((u) => u.role.name === 'SUPERADMIN'),
        action: 'CREATE',
        entity_type: 'Gym',
        entity_id: 'gym-fitness-first-elite',
        previous_values: null,
        new_values: {
          name: 'Fitness First Elite',
          email: 'admin@fitnessfirstelite.com',
          type: 'Premium',
        },
      },
      {
        user: users.find((u) => u.role.name === 'ADMIN'),
        action: 'UPDATE',
        entity_type: 'Member',
        entity_id: 'member-elite-1',
        previous_values: { status: 'inactive' },
        new_values: { status: 'active', tier: 'VIP' },
      },
      {
        user: users.find((u) => u.role.name === 'TRAINER'),
        action: 'CREATE',
        entity_type: 'Class',
        entity_id: 'class-elite-yoga',
        previous_values: null,
        new_values: {
          name: 'Elite Morning Yoga',
          schedule: 'Monday, Wednesday, Friday 8:00 AM',
          type: 'Premium',
        },
      },
      {
        user: users.find((u) => u.role.name === 'MEMBER'),
        action: 'UPDATE',
        entity_type: 'Profile',
        entity_id: 'member-profile-elite',
        previous_values: { phone: '+1-555-8001' },
        new_values: { phone: '+1-555-8013', emergencyContact: 'Updated' },
      },
    ].filter(Boolean);

    const savedAuditLogs = await auditLogRepository.save(auditLogs as any);
    console.log(`Seeded ${savedAuditLogs.length} audit logs`);
    return savedAuditLogs;
  }

  private async seedWorkoutPlans(
    members: Member[],
    trainers: Trainer[],
  ): Promise<WorkoutPlan[]> {
    const planRepository = this.dataSource.getRepository(WorkoutPlan);

    const titles = [
      'Elite Strength Protocol',
      'Premium Cardio Performance',
      'Elite Flexibility Mastery',
      'Athletic Endurance Elite',
      'Elite Body Transformation',
    ];
    const planTypes = [
      'strength',
      'cardio',
      'flexibility',
      'endurance',
      'transformation',
    ];
    const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

    const plans: WorkoutPlan[] = [];
    for (const member of members) {
      if (!member.branch) continue;
      const numPlans = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numPlans; i++) {
        const planType = planTypes[i % planTypes.length];
        const difficulty =
          difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
        const title = titles[i % titles.length];
        const daysAgo = Math.floor(Math.random() * 90);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const duration = 30 + Math.floor(Math.random() * 60);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        const isCompleted = Math.random() < 0.8;

        const branchTrainers = trainers.filter(
          (t) => t.branch && t.branch.branchId === member.branch!.branchId,
        );
        const assignedTrainer =
          branchTrainers.length > 0
            ? branchTrainers[Math.floor(Math.random() * branchTrainers.length)]
            : null;

        plans.push({
          member: member,
          assigned_by_trainer: assignedTrainer,
          branch: member.branch,
          title: `${title} - ${difficulty}`,
          description: `Elite level ${difficulty} ${planType} program for premium results`,
          difficulty_level: difficulty,
          plan_type: planType,
          duration_days: duration,
          start_date: startDate,
          end_date: endDate,
          is_completed: isCompleted,
        } as any);
      }
    }

    const savedPlans = await planRepository.save(plans);
    console.log(`Seeded ${savedPlans.length} workout plans`);
    return savedPlans;
  }

  private async seedWorkoutPlanExercises(
    workoutPlans: WorkoutPlan[],
  ): Promise<WorkoutPlanExercise[]> {
    const exerciseRepository =
      this.dataSource.getRepository(WorkoutPlanExercise);

    const exerciseNames = [
      'Elite Bench Press',
      'Advanced Squats',
      'Power Lunges',
      'Plank Variations',
      'Elite Burpees',
      'Mountain Climbers Pro',
      'Deadlift Elite',
      'Shoulder Press Advanced',
      'Pull-ups Mastery',
      'Dips Progression',
      'Leg Press Elite',
      'Bicep Curls Premium',
      'Russian Twists Advanced',
      'Leg Raises Pro',
      'Elite Calf Raises',
      'Jump Rope Intervals',
      'High Knees Elite',
      'Box Jumps Advanced',
      'Kettlebell Swings Elite',
      'Battle Ropes Pro',
    ];

    const exercises: WorkoutPlanExercise[] = [];
    for (const plan of workoutPlans) {
      const numExercises = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numExercises; i++) {
        const exerciseName =
          exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
        const exerciseType = ['sets_reps', 'time', 'distance'][
          Math.floor(Math.random() * 3)
        ];
        const dayOfWeek = 1 + Math.floor(Math.random() * 7);

        const exercise: any = {
          workoutPlan: plan,
          exercise_name: exerciseName,
          exercise_type: exerciseType,
          day_of_week: dayOfWeek,
          is_active: true,
        };

        if (exerciseType === 'sets_reps') {
          exercise.sets = 4 + Math.floor(Math.random() * 3);
          exercise.reps = 10 + Math.floor(Math.random() * 10);
          exercise.weight_kg = 10 + Math.floor(Math.random() * 40);
          exercise.instructions = `${exercise.sets} sets of ${exercise.reps} reps with ${exercise.weight_kg}kg - Elite form required`;
        } else if (exerciseType === 'time') {
          exercise.duration_minutes = 15 + Math.floor(Math.random() * 25);
          exercise.instructions = `Perform for ${exercise.duration_minutes} minutes at Elite intensity`;
        } else {
          exercise.distance_km = parseFloat((Math.random() * 8 + 2).toFixed(2));
          exercise.instructions = `Cover ${exercise.distance_km}km at Elite pace`;
        }

        exercises.push(exercise);
      }
    }

    const savedExercises = await exerciseRepository.save(exercises);
    console.log(`Seeded ${savedExercises.length} workout plan exercises`);
    return savedExercises;
  }

  private async seedDietPlans(
    members: Member[],
    trainers: Trainer[],
  ): Promise<DietPlan[]> {
    const dietPlanRepository = this.dataSource.getRepository(DietPlan);

    const goalTypes = [
      'weight_loss',
      'muscle_gain',
      'maintenance',
      'cutting',
      'bulking',
    ];
    const titles = [
      'Elite Weight Management',
      'Premium Muscle Optimization',
      'Athletic Performance Nutrition',
      'Elite Cutting Protocol',
      'Premium Bulking Program',
    ];
    const calorieTargets: Record<string, number> = {
      weight_loss: 1800,
      muscle_gain: 2800,
      maintenance: 2500,
      cutting: 2000,
      bulking: 3200,
    };

    const plans: DietPlan[] = [];
    for (const member of members) {
      if (!member.branch) continue;
      const numPlans = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numPlans; i++) {
        const goalType = goalTypes[i % goalTypes.length];
        const title = titles[i % titles.length];
        const daysAgo = Math.floor(Math.random() * 90);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const duration = 30 + Math.floor(Math.random() * 60);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const branchTrainers = trainers.filter(
          (t) => t.branch && t.branch.branchId === member.branch!.branchId,
        );
        const assignedTrainer =
          branchTrainers.length > 0
            ? branchTrainers[Math.floor(Math.random() * branchTrainers.length)]
            : null;

        plans.push({
          member: member,
          assigned_by_trainer: assignedTrainer,
          branch: member.branch,
          title: title,
          description: `Elite nutrition plan for ${goalType.replace('_', ' ')}`,
          goal_type: goalType,
          target_calories: calorieTargets[goalType],
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        } as any);
      }
    }

    const savedPlans = await dietPlanRepository.save(plans);
    console.log(`Seeded ${savedPlans.length} diet plans`);
    return savedPlans;
  }

  private async seedDietPlanMeals(
    dietPlans: DietPlan[],
  ): Promise<DietPlanMeal[]> {
    const mealRepository = this.dataSource.getRepository(DietPlanMeal);

    const breakfastNames = [
      'Elite Protein Smoothie Bowl',
      'Premium Greek Yogurt Parfait',
      'Quinoa Power Breakfast',
      'Avocado Elite Toast',
      'Protein Pancakes Premium',
    ];
    const lunchNames = [
      'Grilled Salmon Elite Bowl',
      'Turkey Avocado Wrap Premium',
      'Quinoa Power Salad',
      'Elite Chicken Stir Fry',
      'Premium Buddha Bowl',
    ];
    const dinnerNames = [
      'Elite Grilled Fish',
      'Premium Lean Steak',
      'Organic Chicken Breast',
      'Elite Tofu Curry',
      'Premium Turkey Meatballs',
    ];

    const meals: DietPlanMeal[] = [];
    for (const plan of dietPlans) {
      for (let day = 1; day <= 7; day++) {
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const mealNameArrays = [breakfastNames, lunchNames, dinnerNames];

        for (let m = 0; m < 3; m++) {
          const mealType = mealTypes[m];
          const mealName =
            mealNameArrays[m][
              Math.floor(Math.random() * mealNameArrays[m].length)
            ];
          const calories =
            mealType === 'breakfast'
              ? 500 + Math.floor(Math.random() * 200)
              : mealType === 'lunch'
                ? 600 + Math.floor(Math.random() * 300)
                : 700 + Math.floor(Math.random() * 300);

          meals.push({
            dietPlan: plan,
            meal_type: mealType,
            meal_name: mealName,
            description: `Elite ${mealName} for day ${day}`,
            calories: calories,
            protein_g: parseFloat(((calories * 0.35) / 4).toFixed(2)),
            carbs_g: parseFloat(((calories * 0.35) / 4).toFixed(2)),
            fat_g: parseFloat(((calories * 0.3) / 9).toFixed(2)),
            day_of_week: day,
          } as any);
        }
      }
    }

    const savedMeals: DietPlanMeal[] = [];
    const batchSize = 100;

    // Use query runner for transaction safety
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < meals.length; i += batchSize) {
        const batch = meals.slice(i, i + batchSize);
        const batchSaved = await queryRunner.manager.save(DietPlanMeal, batch);
        savedMeals.push(...batchSaved);
      }

      await queryRunner.commitTransaction();
      console.log(`Seeded ${savedMeals.length} diet plan meals`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(
        'Failed to seed diet plan meals, rolled back:',
        error.message,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }

    return savedMeals;
  }

  private async seedExerciseLibrary(): Promise<ExerciseLibrary[]> {
    const exerciseLibraryRepository =
      this.dataSource.getRepository(ExerciseLibrary);

    const exercises = [
      {
        name: 'Elite Bench Press',
        bodyPart: 'upper_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced chest press with barbell for elite athletes',
        instructions:
          'Elite form: Lie on bench, grip bar wider than shoulder width, lower to chest with control, press up explosively',
        benefits: 'Elite chest, shoulders, triceps development',
        precautions:
          'Maintain perfect form, spotter required for heavy weights',
      },
      {
        name: 'Mastery Pull-ups',
        bodyPart: 'upper_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced bodyweight pull-up variations',
        instructions:
          'Elite technique: Full range motion, chest to bar, controlled descent',
        benefits: 'Elite back, biceps, grip strength development',
        precautions: 'Perfect form essential, avoid swinging or kipping',
      },
      {
        name: 'Elite Push-ups',
        bodyPart: 'upper_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced bodyweight chest press variations',
        instructions:
          'Elite push-up form: Perfect plank position, full range, controlled tempo',
        benefits: 'Elite chest, shoulders, triceps, core development',
        precautions: 'Maintain neutral spine throughout movement',
      },
      {
        name: 'Elite Dumbbell Press',
        bodyPart: 'upper_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced overhead press with dumbbells',
        instructions:
          'Elite press: Full overhead extension, controlled descent',
        benefits: 'Elite shoulder development and stability',
        precautions: 'Core stability essential, avoid lower back arch',
      },
      {
        name: 'Mastery Bicep Curls',
        bodyPart: 'upper_body',
        type: 'strength',
        level: 'intermediate',
        desc: 'Advanced arm flexion with progressive overload',
        instructions:
          'Elite curl technique: Full contraction, controlled negative',
        benefits: 'Elite bicep development and arm strength',
        precautions: 'Perfect form over heavy weight, avoid momentum',
      },
      {
        name: 'Elite Squats',
        bodyPart: 'lower_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced leg press with barbell for elite athletes',
        instructions: 'Elite squat: Full depth, perfect form, explosive drive',
        benefits: 'Elite leg and glute development',
        precautions: 'Knee tracking essential, depth requirement',
      },
      {
        name: 'Mastery Lunges',
        bodyPart: 'lower_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced single leg exercise with variations',
        instructions:
          'Elite lunge: Full range, perfect balance, controlled movement',
        benefits: 'Elite leg development and balance',
        precautions: 'Front knee tracking, maintain upright torso',
      },
      {
        name: 'Elite Deadlifts',
        bodyPart: 'lower_body',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced hip hinge with barbell for elite athletes',
        instructions:
          'Elite deadlift: Perfect hip hinge, bar path, explosive finish',
        benefits: 'Elite posterior chain development',
        precautions: 'Critical form - protect back, master technique first',
      },
      {
        name: 'Mastery Plank',
        bodyPart: 'core',
        type: 'strength',
        level: 'advanced',
        desc: 'Advanced core stability hold with variations',
        instructions:
          'Elite plank: Perfect alignment, controlled breathing, time under tension',
        benefits: 'Elite core strength and stability',
        precautions: 'Neutral spine, proper breathing pattern',
      },
      {
        name: 'Elite Mountain Climbers',
        bodyPart: 'core',
        type: 'cardio',
        level: 'advanced',
        desc: 'Advanced dynamic core cardio for elite conditioning',
        instructions:
          'Elite climbers: Explosive knee drive, perfect plank position',
        benefits: 'Elite core and cardiovascular conditioning',
        precautions: 'Maintain plank form, control explosive movement',
      },
      {
        name: 'Elite Running Protocol',
        bodyPart: 'cardio',
        type: 'cardio',
        level: 'advanced',
        desc: 'Advanced steady state cardio for elite endurance',
        instructions:
          'Elite running: Perfect form, controlled breathing, progressive intensity',
        benefits: 'Elite cardiovascular health and endurance',
        precautions: 'Proper footwear, gradual progression essential',
      },
      {
        name: 'Mastery Burpees',
        bodyPart: 'full_body',
        type: 'cardio',
        level: 'advanced',
        desc: 'Advanced full body cardio for elite conditioning',
        instructions:
          'Elite burpees: Perfect squat form, controlled push-up, explosive jump',
        benefits: 'Elite full body conditioning and mental toughness',
        precautions: 'High intensity - master individual components first',
      },
    ];

    const savedExercises = await exerciseLibraryRepository.save(
      exercises.map((e) => ({
        exercise_name: e.name,
        body_part: e.bodyPart,
        exercise_type: e.type,
        difficulty_level: e.level,
        description: e.desc,
        instructions: e.instructions,
        benefits: e.benefits,
        precautions: e.precautions,
        video_url: `https://example.com/videos/elite-${e.name.toLowerCase().replace(/ /g, '-')}.mp4`,
        image_url: `https://example.com/images/elite-${e.name.toLowerCase().replace(/ /g, '-')}.jpg`,
      })),
    );
    console.log(`Seeded ${savedExercises.length} exercise library entries`);
    return savedExercises;
  }

  private async seedProgressTracking(
    members: Member[],
    trainers: Trainer[],
  ): Promise<ProgressTracking[]> {
    const progressRepository = this.dataSource.getRepository(ProgressTracking);
    const records: ProgressTracking[] = [];
    const today = new Date();

    for (const member of members) {
      if (!member.branch) continue;
      for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
        const recordDate = new Date(today);
        recordDate.setMonth(recordDate.getMonth() - monthOffset);
        recordDate.setDate(1);

        const branchTrainers = trainers.filter(
          (t) => t.branch && t.branch.branchId === member.branch!.branchId,
        );
        const trainer =
          branchTrainers.length > 0
            ? branchTrainers[Math.floor(Math.random() * branchTrainers.length)]
            : null;

        const baseWeight = 65 + Math.random() * 25;
        const baseHeight = 165 + Math.random() * 20;
        const baseBodyFat = 10 + Math.random() * 10;
        const baseMuscle = 35 + Math.random() * 15;

        records.push({
          member: member,
          recorded_by_trainer: trainer,
          record_date: recordDate,
          weight_kg: parseFloat((baseWeight + monthOffset * -1.5).toFixed(2)),
          height_cm: parseFloat(baseHeight.toFixed(2)),
          body_fat_percentage: parseFloat(
            (baseBodyFat + monthOffset * -0.8).toFixed(2),
          ),
          muscle_mass_kg: parseFloat(
            (baseMuscle + monthOffset * 1.2).toFixed(2),
          ),
          bmi: parseFloat(
            (baseWeight / Math.pow(baseHeight / 100, 2)).toFixed(2),
          ),
          chest_cm: parseFloat((100 + Math.random() * 15).toFixed(2)),
          waist_cm: parseFloat((75 + Math.random() * 15).toFixed(2)),
          arms_cm: parseFloat((32 + Math.random() * 8).toFixed(2)),
          thighs_cm: parseFloat((55 + Math.random() * 10).toFixed(2)),
          notes: `Elite progress check month ${monthOffset + 1} - ${['Outstanding progress', 'Elite performance', 'Exceptional improvement'][Math.floor(Math.random() * 3)]}`,
        } as any);
      }
    }

    const savedRecords = await progressRepository.save(records);
    console.log(`Seeded ${savedRecords.length} progress tracking records`);
    return savedRecords;
  }

  private async seedGoals(
    members: Member[],
    trainers: Trainer[],
  ): Promise<Goal[]> {
    const goalRepository = this.dataSource.getRepository(Goal);

    const goalTypes = [
      'Elite Weight Management',
      'Muscle Optimization',
      'Athletic Performance',
      'Elite Strength',
      'Flexibility Mastery',
      'Cardiovascular Elite',
    ];
    const statuses = ['active', 'completed', 'abandoned'];

    const goals: Goal[] = [];
    for (const member of members) {
      if (!member.branch) continue;
      const numGoals = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numGoals; i++) {
        const goalType = goalTypes[i % goalTypes.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const branchTrainers = trainers.filter(
          (t) => t.branch && t.branch.branchId === member.branch!.branchId,
        );
        const trainer =
          branchTrainers.length > 0
            ? branchTrainers[Math.floor(Math.random() * branchTrainers.length)]
            : null;

        const targetValue =
          goalType === 'Elite Weight Management'
            ? 8 + Math.random() * 12
            : goalType === 'Muscle Optimization'
              ? 3 + Math.random() * 7
              : goalType === 'Athletic Performance'
                ? 40 + Math.random() * 60
                : goalType === 'Elite Strength'
                  ? 25 + Math.random() * 35
                  : goalType === 'Flexibility Mastery'
                    ? 15 + Math.random() * 25
                    : 60 + Math.random() * 60;

        const daysAhead = 45 + Math.floor(Math.random() * 90);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);

        const completion =
          status === 'completed'
            ? 100
            : status === 'abandoned'
              ? Math.floor(Math.random() * 60)
              : Math.floor(Math.random() * 90);

        goals.push({
          member: member,
          trainer: trainer,
          goal_type: goalType,
          target_value: parseFloat(targetValue.toFixed(2)),
          target_timeline: targetDate,
          milestone: {
            checkpoints: [
              { percent: 25, achieved: completion >= 25 },
              { percent: 50, achieved: completion >= 50 },
              { percent: 75, achieved: completion >= 75 },
              { percent: 100, achieved: completion >= 100 },
            ],
            notes:
              status === 'completed'
                ? 'Elite goal achieved!'
                : 'Elite progress ongoing',
          },
          status: status,
          completion_percent: completion,
        } as any);
      }
    }

    const savedGoals = await goalRepository.save(goals);
    console.log(`Seeded ${savedGoals.length} goals`);
    return savedGoals;
  }

  private async seedAttendanceGoals(
    members: Member[],
    branches: Branch[],
  ): Promise<AttendanceGoal[]> {
    const attendanceGoalRepository =
      this.dataSource.getRepository(AttendanceGoal);

    const goalTypes = ['daily', 'weekly', 'monthly'];
    const goals: AttendanceGoal[] = [];

    for (const member of members) {
      if (!member.branch) continue;
      const numGoals = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numGoals; i++) {
        const goalType = goalTypes[i % goalTypes.length];
        const targetCount =
          goalType === 'daily' ? 1 : goalType === 'weekly' ? 4 : 16;
        const currentCount = Math.floor(Math.random() * (targetCount + 1));
        const currentStreak =
          currentCount > 0 ? Math.floor(Math.random() * currentCount) : 0;
        const longestStreak = currentStreak + Math.floor(Math.random() * 8);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 45);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 45);

        goals.push({
          member: member,
          branch: member.branch,
          goal_type: goalType,
          target_count: targetCount,
          current_count: currentCount,
          start_date: startDate,
          end_date: endDate,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          is_active: true,
        } as any);
      }
    }

    const savedGoals = await attendanceGoalRepository.save(goals);
    console.log(`Seeded ${savedGoals.length} attendance goals`);
    return savedGoals;
  }

  private async seedWorkoutLogs(
    members: Member[],
    trainers: Trainer[],
  ): Promise<WorkoutLog[]> {
    const workoutLogRepository = this.dataSource.getRepository(WorkoutLog);

    const exerciseNames = [
      'Elite Bench Press',
      'Advanced Squats',
      'Mastery Deadlifts',
      'Elite Pull-ups',
      'Advanced Push-ups',
      'Power Lunges',
      'Elite Plank',
      'Mastery Shoulder Press',
      'Elite Bicep Curls',
      'Advanced Leg Press',
    ];
    const logs: WorkoutLog[] = [];
    const today = new Date();

    for (let day = 0; day < 45; day++) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - day);
      const numMembers = 8 + Math.floor(Math.random() * 12);

      for (let m = 0; m < numMembers; m++) {
        const memberIndex = Math.floor(Math.random() * members.length);
        const member = members[memberIndex];
        if (!member.branch) continue;
        const branchTrainers = trainers.filter(
          (t) => t.branch && t.branch.branchId === member.branch!.branchId,
        );
        const trainer =
          branchTrainers.length > 0
            ? branchTrainers[Math.floor(Math.random() * branchTrainers.length)]
            : null;
        const numExercises = 3 + Math.floor(Math.random() * 4);

        for (let e = 0; e < numExercises; e++) {
          const exerciseName =
            exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
          logs.push({
            member: member,
            trainer: trainer,
            exercise_name: exerciseName,
            sets: 4 + Math.floor(Math.random() * 3),
            reps: 10 + Math.floor(Math.random() * 10),
            weight: 25 + Math.floor(Math.random() * 85),
            duration: 45 + Math.floor(Math.random() * 75),
            notes:
              Math.random() < 0.4
                ? `Elite session - Felt ${['exceptional', 'powerful', 'strong', 'energized'][Math.floor(Math.random() * 4)]}`
                : null,
            date: logDate,
          } as any);
        }
      }
    }

    const batchSize = 500;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await workoutLogRepository.save(batch);
    }

    console.log(`Seeded ${logs.length} workout logs`);
    return logs;
  }

  private determineBillingCycle(subscription: MemberSubscription): string {
    const startDate = subscription.startDate;
    const endDate = subscription.endDate;
    const durationDays = subscription.plan.durationInDays;

    if (durationDays === 30) return 'monthly';
    if (durationDays === 90) return 'quarterly';
    if (durationDays === 180) return 'semi-annual';
    if (durationDays === 365) return 'annual';
    return 'custom';
  }

  private calculateDueDate(subscription: MemberSubscription): Date {
    const dueDate = new Date(subscription.startDate);
    dueDate.setDate(dueDate.getDate() + subscription.plan.durationInDays);
    return dueDate;
  }

  private determineInitialStatus(): string {
    const statuses = ['pending', 'paid', 'cancelled'];
    const weights = [0.5, 0.4, 0.1];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }

    return 'pending';
  }

  private getBillingPeriodDescription(billingCycle: string): string {
    const descriptions: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      'semi-annual': 'Semi-Annual',
      annual: 'Annual',
      custom: 'Custom',
    };

    return descriptions[billingCycle] || 'Custom';
  }

  private displayUserCredentials() {
    console.log('\n' + '='.repeat(80));
    console.log('FITNESS FIRST ELITE USER CREDENTIALS FOR LOGIN');
    console.log('='.repeat(80));

    const fitnessFirstCredentials = userCredentials.filter(
      (cred) => cred.gymName === 'Fitness First Elite',
    );

    fitnessFirstCredentials.forEach((cred, index) => {
      console.log(`\n${index + 1}. ${cred.role.toUpperCase()}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      if (cred.gymName) {
        console.log(`   Gym: ${cred.gymName}`);
      }
      if (cred.branchName) {
        console.log(`   Branch: ${cred.branchName}`);
      }
      console.log('-'.repeat(40));
    });

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY BY ROLE:');
    console.log('-'.repeat(40));

    const roleCount = fitnessFirstCredentials.reduce(
      (acc, cred) => {
        acc[cred.role] = (acc[cred.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`${role}: ${count} user(s)`);
    });

    console.log('='.repeat(80));
  }
}

// Run the Fitness First Elite seeder
const seeder = new FitnessFirstEliteSeeder();
seeder.seed().catch(console.error);
