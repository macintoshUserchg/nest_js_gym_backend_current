import { DataSource } from 'typeorm';
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

class DatabaseSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource(pgConfig);
  }

  async seed() {
    try {
      await this.dataSource.initialize();
      console.log('Database connection established');

      // Clear existing data (except roles)
      await this.clearExistingData();

      // Seed data in proper order
      const gyms = await this.seedGyms();
      const branches = await this.seedBranches(gyms);
      const membershipPlans = await this.seedMembershipPlans(branches);
      const trainers = await this.seedTrainers(branches);
      const members = await this.seedMembers(branches);
      const memberSubscriptions = await this.seedMemberSubscriptions(
        members,
        membershipPlans,
      );
      const memberTrainerAssignments = await this.seedMemberTrainerAssignments(
        members,
        trainers,
      );
      const classes = await this.seedClasses(branches);
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

      console.log('\n=== SEEDING COMPLETED ===');
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
    } catch (error) {
      console.error('Error during seeding:', error);
    } finally {
      await this.dataSource.destroy();
    }
  }

  private async clearExistingData() {
    console.log('Clearing existing data...');

    // Clear in reverse dependency order to handle foreign key constraints
    const tableNames = [
      'audit_logs',
      'notifications',
      'attendance',
      'payment_transactions',
      'invoices',
      'member_trainer_assignments',
      'member_subscriptions',
      'classes',
      'inquiries',
      'users',
      'members',
      'trainers',
      'membership_plans',
      'branches',
      'gyms',
    ];

    for (const tableName of tableNames) {
      try {
        // Use CASCADE to handle foreign key constraints
        await this.dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        console.log(`Cleared ${tableName}`);
      } catch (error) {
        console.log(
          `Could not clear ${tableName}, table might not exist:`,
          error.message,
        );
      }
    }
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
    console.log('Seeding gyms...');
    const gymRepository = this.dataSource.getRepository(Gym);

    const gyms = [
      {
        name: 'Fitness First Elite',
        email: 'admin@fitnessfirst.com',
        phone: '+1-555-0101',
        address: '123 Fitness Street, Health City, HC 12345',
        location: 'Downtown',
        state: 'California',
      },
      {
        name: 'Iron Paradise Gym',
        email: 'contact@ironparadise.com',
        phone: '+1-555-0202',
        address: '456 Muscle Avenue, Strength Town, ST 67890',
        location: 'Uptown',
        state: 'New York',
      },
      {
        name: 'Peak Performance Center',
        email: 'info@peakperformance.com',
        phone: '+1-555-0303',
        address: '789 Victory Road, Champion City, CC 11111',
        location: 'Business District',
        state: 'Texas',
      },
      {
        name: 'Urban Fitness Hub',
        email: 'contact@urbanfitness.com',
        phone: '+1-555-0404',
        address: '101 City Center Mall, Metro City, MC 22222',
        location: 'City Center',
        state: 'Illinois',
      },
      {
        name: 'Elite Performance Gym',
        email: 'info@eliteperformance.com',
        phone: '+1-555-0505',
        address: '202 Performance Plaza, Athlete Town, AT 33333',
        location: 'Plaza District',
        state: 'Florida',
      },
      {
        name: 'Stronghold Fitness',
        email: 'admin@strongholdfitness.com',
        phone: '+1-555-0606',
        address: '303 Strength Boulevard, Power City, PC 44444',
        location: 'Boulevard',
        state: 'Georgia',
      },
      {
        name: 'Vitality Wellness Center',
        email: 'contact@vitalitywellness.com',
        phone: '+1-555-0707',
        address: '404 Wellness Way, Healthy Village, HV 55555',
        location: 'Wellness District',
        state: 'Washington',
      },
      {
        name: 'Titan Gym & Fitness',
        email: 'info@titanfitness.com',
        phone: '+1-555-0808',
        address: '505 Titan Tower, Strong City, SC 66666',
        location: 'Tower District',
        state: 'Arizona',
      },
      {
        name: 'Apex Fitness Club',
        email: 'admin@apexfitness.com',
        phone: '+1-555-0909',
        address: '606 Apex Avenue, Summit Town, ST 77777',
        location: 'Summit Area',
        state: 'Colorado',
      },
      {
        name: 'Powerhouse Gym Network',
        email: 'contact@powerhouse.com',
        phone: '+1-555-1010',
        address: '707 Power Street, Energy City, EC 88888',
        location: 'Energy District',
        state: 'Nevada',
      },
      {
        name: 'Champion Fitness Arena',
        email: 'info@championarena.com',
        phone: '+1-555-1111',
        address: '808 Champion Lane, Winner City, WC 99999',
        location: 'Arena District',
        state: 'Oregon',
      },
      {
        name: 'Victory Performance Center',
        email: 'admin@victorycenter.com',
        phone: '+1-555-1212',
        address: '909 Victory Road, Success Town, ST 101010',
        location: 'Success Area',
        state: 'Virginia',
      },
    ];

    const savedGyms = await gymRepository.save(gyms);
    console.log(`Seeded ${savedGyms.length} gyms`);
    return savedGyms;
  }

  private async seedBranches(gyms: Gym[]): Promise<Branch[]> {
    console.log('Seeding branches...');
    const branchRepository = this.dataSource.getRepository(Branch);

    const branches = [
      // Fitness First Elite branches (3 branches)
      {
        name: 'Fitness First - Downtown',
        email: 'downtown@fitnessfirst.com',
        phone: '+1-555-0101',
        address: '123 Fitness Street, Health City, HC 12345',
        location: 'Downtown',
        state: 'California',
        gym: gyms[0],
        mainBranch: true,
      },
      {
        name: 'Fitness First - Westside',
        email: 'westside@fitnessfirst.com',
        phone: '+1-555-0102',
        address: '321 Wellness Blvd, Health City, HC 12346',
        location: 'Westside',
        state: 'California',
        gym: gyms[0],
        mainBranch: false,
      },
      {
        name: 'Fitness First - Northridge',
        email: 'northridge@fitnessfirst.com',
        phone: '+1-555-0103',
        address: '555 Northridge Ave, Health City, HC 12347',
        location: 'Northridge',
        state: 'California',
        gym: gyms[0],
        mainBranch: false,
      },

      // Iron Paradise Gym branches (3 branches)
      {
        name: 'Iron Paradise - Main',
        email: 'main@ironparadise.com',
        phone: '+1-555-0201',
        address: '456 Muscle Avenue, Strength Town, ST 67890',
        location: 'Uptown',
        state: 'New York',
        gym: gyms[1],
        mainBranch: true,
      },
      {
        name: 'Iron Paradise - Brooklyn',
        email: 'brooklyn@ironparadise.com',
        phone: '+1-555-0202',
        address: '654 Strength Street, Brooklyn, NY 11201',
        location: 'Brooklyn',
        state: 'New York',
        gym: gyms[1],
        mainBranch: false,
      },
      {
        name: 'Iron Paradise - Queens',
        email: 'queens@ironparadise.com',
        phone: '+1-555-0203',
        address: '777 Empire Blvd, Queens, NY 11301',
        location: 'Queens',
        state: 'New York',
        gym: gyms[1],
        mainBranch: false,
      },

      // Peak Performance Center branches (2 branches)
      {
        name: 'Peak Performance - Houston',
        email: 'houston@peakperformance.com',
        phone: '+1-555-0301',
        address: '789 Victory Road, Champion City, CC 11111',
        location: 'Downtown Houston',
        state: 'Texas',
        gym: gyms[2],
        mainBranch: true,
      },
      {
        name: 'Peak Performance - Austin',
        email: 'austin@peakperformance.com',
        phone: '+1-555-0302',
        address: '888 Texan Way, Austin, TX 73301',
        location: 'Downtown Austin',
        state: 'Texas',
        gym: gyms[2],
        mainBranch: false,
      },

      // Urban Fitness Hub branches (2 branches)
      {
        name: 'Urban Fitness - City Center',
        email: 'citycenter@urbanfitness.com',
        phone: '+1-555-0401',
        address: '101 City Center Mall, Metro City, MC 22222',
        location: 'City Center',
        state: 'Illinois',
        gym: gyms[3],
        mainBranch: true,
      },
      {
        name: 'Urban Fitness - Suburb',
        email: 'suburb@urbanfitness.com',
        phone: '+1-555-0402',
        address: '222 Suburb Mall, Metro Suburb, MS 22223',
        location: 'Suburb',
        state: 'Illinois',
        gym: gyms[3],
        mainBranch: false,
      },

      // Elite Performance Gym branches (2 branches)
      {
        name: 'Elite Performance - Plaza',
        email: 'plaza@eliteperformance.com',
        phone: '+1-555-0501',
        address: '202 Performance Plaza, Athlete Town, AT 33333',
        location: 'Plaza District',
        state: 'Florida',
        gym: gyms[4],
        mainBranch: true,
      },
      {
        name: 'Elite Performance - Beach',
        email: 'beach@eliteperformance.com',
        phone: '+1-555-0502',
        address: '333 Ocean Drive, Beach City, BC 33334',
        location: 'Beach',
        state: 'Florida',
        gym: gyms[4],
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

    const membershipPlans = [
      // Fitness First Elite Plans
      {
        name: 'Fitness First Basic',
        price: 4999, // in cents ($49.99)
        durationInDays: 30,
        description: 'Access to gym facilities during basic hours',
        branch: branches[0],
      },
      {
        name: 'Fitness First Standard',
        price: 7999, // in cents ($79.99)
        durationInDays: 30,
        description: 'Access to all facilities including group classes',
        branch: branches[0],
      },
      {
        name: 'Fitness First Premium',
        price: 12999, // in cents ($129.99)
        durationInDays: 30,
        description: 'Full access plus personal training sessions',
        branch: branches[0],
      },
      {
        name: 'Fitness First Family',
        price: 14999, // in cents ($149.99)
        durationInDays: 30,
        description: 'Family membership for up to 4 members',
        branch: branches[0],
      },

      // Iron Paradise Gym Plans
      {
        name: 'Iron Paradise Basic',
        price: 4499, // in cents ($44.99)
        durationInDays: 30,
        description: 'Basic gym access',
        branch: branches[1],
      },
      {
        name: 'Iron Paradise CrossFit',
        price: 8999, // in cents ($89.99)
        durationInDays: 30,
        description: 'Includes all CrossFit classes',
        branch: branches[1],
      },
      {
        name: 'Iron Paradise VIP',
        price: 19999, // in cents ($199.99)
        durationInDays: 30,
        description: 'Premium access with unlimited personal training',
        branch: branches[1],
      },

      // Peak Performance Center Plans
      {
        name: 'Peak Basic',
        price: 3999, // in cents ($39.99)
        durationInDays: 30,
        description: 'Corporate discount plan - Basic access',
        branch: branches[2],
      },
      {
        name: 'Peak Performance',
        price: 8999, // in cents ($89.99)
        durationInDays: 30,
        description: 'Corporate discount plan - Full access',
        branch: branches[2],
      },
      {
        name: 'Peak Elite',
        price: 15999, // in cents ($159.99)
        durationInDays: 30,
        description: 'Elite performance coaching included',
        branch: branches[2],
      },

      // Urban Fitness Hub Plans
      {
        name: 'Urban Basic',
        price: 3499, // in cents ($34.99)
        durationInDays: 30,
        description: 'City center basic access',
        branch: branches[3],
      },
      {
        name: 'Urban All-Access',
        price: 6999, // in cents ($69.99)
        durationInDays: 30,
        description: 'All facilities and classes included',
        branch: branches[3],
      },

      // Elite Performance Gym Plans
      {
        name: 'Elite Basic',
        price: 5999, // in cents ($59.99)
        durationInDays: 30,
        description: 'Performance training access',
        branch: branches[4],
      },
      {
        name: 'Elite Athlete',
        price: 11999, // in cents ($119.99)
        durationInDays: 30,
        description: 'Athlete performance program',
        branch: branches[4],
      },

      // General Plans (no branch)
      {
        name: 'Student Discount',
        price: 2999, // in cents ($29.99)
        durationInDays: 30,
        description: 'Special pricing for students with valid ID',
      },
      {
        name: 'Senior Citizen',
        price: 3499, // in cents ($34.99)
        durationInDays: 30,
        description: 'Special pricing for seniors aged 65+',
      },
      {
        name: 'Day Pass',
        price: 2500, // in cents ($25.00)
        durationInDays: 1,
        description: 'Single day access to facilities',
      },
      {
        name: 'Week Pass',
        price: 7999, // in cents ($79.99)
        durationInDays: 7,
        description: 'Weekly access pass',
      },
      {
        name: '3-Month Commitment',
        price: 29997, // in cents ($299.97)
        durationInDays: 90,
        description: '3-month commitment with 10% discount',
      },
      {
        name: 'Annual Membership',
        price: 49999, // in cents ($499.99)
        durationInDays: 365,
        description: 'Full year access with 2 months free',
      },
    ];

    const savedMembershipPlans =
      await membershipPlanRepository.save(membershipPlans);
    console.log(`Seeded ${savedMembershipPlans.length} membership plans`);
    return savedMembershipPlans;
  }

  private async seedTrainers(branches: Branch[]): Promise<Trainer[]> {
    console.log('Seeding trainers...');
    const trainerRepository = this.dataSource.getRepository(Trainer);

    const trainers = [
      // Fitness First Elite Trainers (4 trainers)
      {
        fullName: 'John Smith',
        email: 'john.smith@fitnessfirst.com',
        phone: '+1-555-1001',
        specialization: 'Weight Training, Strength Conditioning',
        avatarUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
        branch: branches[0],
      },
      {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@fitnessfirst.com',
        phone: '+1-555-1002',
        specialization: 'Yoga, Pilates, Flexibility',
        avatarUrl:
          'https://images.unsplash.com/photo-1594736797933-d0f02ba1a7c5?w=150',
        branch: branches[0],
      },
      {
        fullName: 'Chris Thompson',
        email: 'chris.thompson@fitnessfirst.com',
        phone: '+1-555-1003',
        specialization: 'Cardio, Running, Endurance',
        avatarUrl:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150',
        branch: branches[1],
      },
      {
        fullName: 'Emily Davis',
        email: 'emily.davis@fitnessfirst.com',
        phone: '+1-555-1004',
        specialization: 'Functional Training, Mobility',
        avatarUrl:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150',
        branch: branches[2],
      },

      // Iron Paradise Gym Trainers (3 trainers)
      {
        fullName: 'Mike Wilson',
        email: 'mike.wilson@ironparadise.com',
        phone: '+1-555-2001',
        specialization: 'CrossFit, HIIT, Cardio',
        avatarUrl:
          'https://images.unsplash.com/photo-1567019371791-6f7f0e1b7c1a?w=150',
        branch: branches[3],
      },
      {
        fullName: 'Emma Davis',
        email: 'emma.davis@ironparadise.com',
        phone: '+1-555-2002',
        specialization: 'Personal Training, Nutrition Coaching',
        avatarUrl:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150',
        branch: branches[3],
      },
      {
        fullName: 'Alex Rodriguez',
        email: 'alex.rodriguez@ironparadise.com',
        phone: '+1-555-2003',
        specialization: 'Olympic Lifting, Powerlifting',
        avatarUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
        branch: branches[5],
      },

      // Peak Performance Center Trainers (3 trainers)
      {
        fullName: 'David Brown',
        email: 'david.brown@peakperformance.com',
        phone: '+1-555-3001',
        specialization: 'Bodybuilding, Powerlifting',
        avatarUrl:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150',
        branch: branches[6],
      },
      {
        fullName: 'Lisa Garcia',
        email: 'lisa.garcia@peakperformance.com',
        phone: '+1-555-3002',
        specialization: 'Dance Fitness, Zumba, Aerobics',
        avatarUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
        branch: branches[6],
      },
      {
        fullName: 'Ryan Taylor',
        email: 'ryan.taylor@peakperformance.com',
        phone: '+1-555-3003',
        specialization: 'Sports Performance, Agility',
        avatarUrl:
          'https://images.unsplash.com/photo-1567019371791-6f7f0e1b7c1a?w=150',
        branch: branches[7],
      },

      // Urban Fitness Hub Trainers (2 trainers)
      {
        fullName: 'Jessica Moore',
        email: 'jessica.moore@urbanfitness.com',
        phone: '+1-555-4001',
        specialization: 'Group Fitness, Bootcamp',
        avatarUrl:
          'https://images.unsplash.com/photo-1594736797933-d0f02ba1a7c5?w=150',
        branch: branches[8],
      },
      {
        fullName: 'Tom Anderson',
        email: 'tom.anderson@urbanfitness.com',
        phone: '+1-555-4002',
        specialization: 'Martial Arts, Self-Defense',
        avatarUrl:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150',
        branch: branches[9],
      },
    ];

    const savedTrainers = await trainerRepository.save(trainers);
    console.log(`Seeded ${savedTrainers.length} trainers`);
    return savedTrainers;
  }

  private async seedMembers(branches: Branch[]): Promise<Member[]> {
    console.log('Seeding members...');
    const memberRepository = this.dataSource.getRepository(Member);

    const members = [
      // Fitness First Elite Members (3 members)
      {
        fullName: 'Alice Cooper',
        email: 'alice.cooper@email.com',
        phone: '+1-555-5001',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1990-05-15'),
        addressLine1: '123 Member Street',
        city: 'Health City',
        state: 'California',
        postalCode: '12345',
        emergencyContactName: 'Bob Cooper',
        emergencyContactPhone: '+1-555-5002',
        branch: branches[0],
      },
      {
        fullName: 'James Taylor',
        email: 'james.taylor@email.com',
        phone: '+1-555-5007',
        gender: Gender.MALE,
        dateOfBirth: new Date('1988-03-18'),
        addressLine1: '321 Gym Lane',
        city: 'Health City',
        state: 'California',
        postalCode: '12346',
        emergencyContactName: 'Mary Taylor',
        emergencyContactPhone: '+1-555-5008',
        branch: branches[1],
      },
      {
        fullName: 'Sophia Anderson',
        email: 'sophia.anderson@email.com',
        phone: '+1-555-5009',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1995-07-10'),
        addressLine1: '654 Muscle Road',
        city: 'Strength Town',
        state: 'New York',
        postalCode: '67891',
        emergencyContactName: 'Tom Anderson',
        emergencyContactPhone: '+1-555-5010',
        branch: branches[3],
      },
      {
        fullName: 'Christopher Lee',
        email: 'christopher.lee@email.com',
        phone: '+1-555-5013',
        gender: Gender.MALE,
        dateOfBirth: new Date('1991-09-25'),
        addressLine1: '789 Active Ave',
        city: 'Health City',
        state: 'California',
        postalCode: '12347',
        emergencyContactName: 'Jessica Lee',
        emergencyContactPhone: '+1-555-5014',
        branch: branches[2],
      },
      {
        fullName: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+1-555-5015',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1989-12-08'),
        addressLine1: '456 Fit Street',
        city: 'Metro City',
        state: 'Illinois',
        postalCode: '22222',
        emergencyContactName: 'Mark Thompson',
        emergencyContactPhone: '+1-555-5016',
        branch: branches[5],
      },
      {
        fullName: 'Ryan Martinez',
        email: 'ryan.martinez@email.com',
        phone: '+1-555-5017',
        gender: Gender.MALE,
        dateOfBirth: new Date('1993-03-14'),
        addressLine1: '321 Performance Blvd',
        city: 'Athlete Town',
        state: 'Florida',
        postalCode: '33333',
        emergencyContactName: 'Laura Martinez',
        emergencyContactPhone: '+1-555-5018',
        branch: branches[7],
      },
      {
        fullName: 'Olivia Davis',
        email: 'olivia.davis@email.com',
        phone: '+1-555-5019',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1987-06-30'),
        addressLine1: '555 Strength Way',
        city: 'Power City',
        state: 'Georgia',
        postalCode: '44444',
        emergencyContactName: 'David Davis',
        emergencyContactPhone: '+1-555-5020',
        branch: branches[9],
      },
      {
        fullName: 'William Wilson',
        email: 'william.wilson@email.com',
        phone: '+1-555-5021',
        gender: Gender.MALE,
        dateOfBirth: new Date('1994-01-22'),
        addressLine1: '777 Wellness Lane',
        city: 'Healthy Village',
        state: 'Washington',
        postalCode: '55555',
        emergencyContactName: 'Susan Wilson',
        emergencyContactPhone: '+1-555-5022',
        branch: branches[8],
      },
      {
        fullName: 'Ava Brown',
        email: 'ava.brown@email.com',
        phone: '+1-555-5023',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1992-08-18'),
        addressLine1: '888 Fitness Tower',
        city: 'Strong City',
        state: 'Arizona',
        postalCode: '66666',
        emergencyContactName: 'John Brown',
        emergencyContactPhone: '+1-555-5024',
        branch: branches[10],
      },
      {
        fullName: 'Liam Garcia',
        email: 'liam.garcia@email.com',
        phone: '+1-555-5025',
        gender: Gender.MALE,
        dateOfBirth: new Date('1985-11-05'),
        addressLine1: '999 Performance Ave',
        city: 'Summit Town',
        state: 'Colorado',
        postalCode: '77777',
        emergencyContactName: 'Maria Garcia',
        emergencyContactPhone: '+1-555-5026',
        branch: branches[11],
      },
      {
        fullName: 'Isabella Rodriguez',
        email: 'isabella.rodriguez@email.com',
        phone: '+1-555-5027',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1988-04-12'),
        addressLine1: '111 Energy Street',
        city: 'Energy City',
        state: 'Nevada',
        postalCode: '88888',
        emergencyContactName: 'Carlos Rodriguez',
        emergencyContactPhone: '+1-555-5028',
        branch: branches[6],
      },
      {
        fullName: 'Ethan Taylor',
        email: 'ethan.taylor@email.com',
        phone: '+1-555-5029',
        gender: Gender.MALE,
        dateOfBirth: new Date('1990-10-03'),
        addressLine1: '222 Champion Lane',
        city: 'Winner City',
        state: 'Oregon',
        postalCode: '99999',
        emergencyContactName: 'Mia Taylor',
        emergencyContactPhone: '+1-555-5030',
        branch: branches[12],
      },
    ];

    const savedMembers = await memberRepository.save(members);
    console.log(`Seeded ${savedMembers.length} members`);
    return savedMembers;
  }

  private async seedMemberSubscriptions(
    members: Member[],
    membershipPlans: MembershipPlan[],
  ): Promise<MemberSubscription[]> {
    console.log('Seeding member subscriptions...');
    const memberSubscriptionRepository =
      this.dataSource.getRepository(MemberSubscription);

    const subscriptions = [
      {
        member: members[0],
        plan: membershipPlans[1], // Standard Membership
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        isActive: true,
      },
      {
        member: members[1],
        plan: membershipPlans[2], // Premium Membership
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        isActive: true,
      },
      {
        member: members[2],
        plan: membershipPlans[0], // Basic Membership
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-31'),
        isActive: false,
      },
      {
        member: members[3],
        plan: membershipPlans[3], // VIP Membership
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-03'),
        isActive: true,
      },
      {
        member: members[4],
        plan: membershipPlans[4], // Corporate Basic
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-20'),
        isActive: true,
      },
      {
        member: members[5],
        plan: membershipPlans[5], // Corporate Premium
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-02-10'),
        isActive: true,
      },
    ];

    const savedSubscriptions =
      await memberSubscriptionRepository.save(subscriptions);
    console.log(`Seeded ${savedSubscriptions.length} member subscriptions`);
    return savedSubscriptions;
  }

  private async seedMemberTrainerAssignments(
    members: Member[],
    trainers: Trainer[],
  ): Promise<MemberTrainerAssignment[]> {
    console.log('Seeding member trainer assignments...');
    const memberTrainerAssignmentRepository = this.dataSource.getRepository(
      MemberTrainerAssignment,
    );

    const assignments = [
      {
        member: members[0],
        trainer: trainers[0],
        start_date: new Date('2024-01-01'),
        status: 'active',
      },
      {
        member: members[1],
        trainer: trainers[2],
        start_date: new Date('2024-01-15'),
        status: 'active',
      },
      {
        member: members[2],
        trainer: trainers[4],
        start_date: new Date('2023-12-01'),
        end_date: new Date('2023-12-31'),
        status: 'ended',
      },
      {
        member: members[3],
        trainer: trainers[1],
        start_date: new Date('2024-02-01'),
        status: 'active',
      },
      {
        member: members[4],
        trainer: trainers[3],
        start_date: new Date('2024-01-20'),
        status: 'active',
      },
      {
        member: members[5],
        trainer: trainers[5],
        start_date: new Date('2024-01-10'),
        status: 'active',
      },
    ];

    const savedAssignments =
      await memberTrainerAssignmentRepository.save(assignments);
    console.log(`Seeded ${savedAssignments.length} member trainer assignments`);
    return savedAssignments;
  }

  private async seedClasses(branches: Branch[]): Promise<Class[]> {
    console.log('Seeding classes...');
    const classRepository = this.dataSource.getRepository(Class);

    const classes = [
      {
        name: 'Morning Yoga',
        description: 'Relaxing yoga session to start your day',
        timings: 'morning',
        recurrence_type: 'weekly',
        days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
        branch: branches[0],
      },
      {
        name: 'Evening HIIT',
        description: 'High-intensity interval training',
        timings: 'evening',
        recurrence_type: 'weekly',
        days_of_week: [2, 4], // Tuesday, Thursday
        branch: branches[0],
      },
      {
        name: 'Weekend CrossFit',
        description: 'Intense CrossFit workout for weekends',
        timings: 'both',
        recurrence_type: 'weekly',
        days_of_week: [6, 0], // Saturday, Sunday
        branch: branches[2],
      },
      {
        name: 'Weight Training Basics',
        description: 'Learn proper weight training techniques',
        timings: 'morning',
        recurrence_type: 'daily',
        branch: branches[2],
      },
      {
        name: 'Dance Fitness',
        description: 'Fun dance-based workout',
        timings: 'evening',
        recurrence_type: 'weekly',
        days_of_week: [1, 4], // Monday, Thursday
        branch: branches[4],
      },
    ];

    const savedClasses = await classRepository.save(classes);
    console.log(`Seeded ${savedClasses.length} classes`);
    return savedClasses;
  }

  private async seedInquiries(branches: Branch[]): Promise<Inquiry[]> {
    console.log('Seeding inquiries...');
    const inquiryRepository = this.dataSource.getRepository(Inquiry);

    const inquiries = [
      {
        fullName: 'Jennifer Lee',
        email: 'jennifer.lee@email.com',
        phone: '+1-555-6001',
        alternatePhone: '+1-555-6002',
        status: InquiryStatus.NEW,
        source: InquirySource.WEBSITE,
        preferredMembershipType: PreferredMembershipType.BASIC,
        preferredContactMethod: 'email',
        notes: 'Interested in basic membership',
        addressLine1: '123 Inquiry Street',
        city: 'Health City',
        state: 'California',
        postalCode: '12345',
        dateOfBirth: new Date('1993-04-12'),
        occupation: 'Teacher',
        fitnessGoals: 'Weight loss and toning',
        hasPreviousGymExperience: false,
        wantsPersonalTraining: false,
        referralCode: 'REF001',
        branch: branches[0],
      },
      {
        fullName: 'Kevin Martinez',
        email: 'kevin.martinez@email.com',
        phone: '+1-555-6003',
        status: InquiryStatus.CONTACTED,
        source: InquirySource.REFERRAL,
        preferredMembershipType: PreferredMembershipType.PREMIUM,
        preferredContactMethod: 'phone',
        notes: 'Referred by existing member',
        addressLine1: '456 Prospect Ave',
        city: 'Strength Town',
        state: 'New York',
        postalCode: '67890',
        dateOfBirth: new Date('1989-09-20'),
        occupation: 'Engineer',
        fitnessGoals: 'Muscle building',
        hasPreviousGymExperience: true,
        wantsPersonalTraining: true,
        referralCode: 'REF002',
        branch: branches[2],
        contactedAt: new Date('2024-01-15'),
      },
      {
        fullName: 'Rachel Green',
        email: 'rachel.green@email.com',
        phone: '+1-555-6004',
        status: InquiryStatus.QUALIFIED,
        source: InquirySource.GOOGLE_ADS,
        preferredMembershipType: PreferredMembershipType.VIP,
        preferredContactMethod: 'email',
        notes: 'High-value prospect',
        addressLine1: '789 Qualified Lane',
        city: 'Champion City',
        state: 'Texas',
        postalCode: '11111',
        dateOfBirth: new Date('1987-06-30'),
        occupation: 'Business Owner',
        fitnessGoals: 'Overall fitness and wellness',
        hasPreviousGymExperience: true,
        wantsPersonalTraining: true,
        referralCode: 'REF003',
        branch: branches[4],
        contactedAt: new Date('2024-01-10'),
        preferredContactTime: 'evenings',
      },
    ];

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

    const invoices = [
      {
        member: members[0],
        subscription: memberSubscriptions[0],
        total_amount: 79.99,
        description: 'Standard Membership - January 2024',
        due_date: new Date('2024-01-31'),
        status: 'paid',
      },
      {
        member: members[1],
        subscription: memberSubscriptions[1],
        total_amount: 129.99,
        description: 'Premium Membership - January 2024',
        due_date: new Date('2024-02-15'),
        status: 'paid',
      },
      {
        member: members[2],
        subscription: memberSubscriptions[2],
        total_amount: 49.99,
        description: 'Basic Membership - December 2023',
        due_date: new Date('2023-12-31'),
        status: 'pending',
      },
      {
        member: members[3],
        subscription: memberSubscriptions[3],
        total_amount: 199.99,
        description: 'VIP Membership - February 2024',
        due_date: new Date('2024-03-03'),
        status: 'pending',
      },
      {
        member: members[4],
        subscription: memberSubscriptions[4],
        total_amount: 39.99,
        description: 'Corporate Basic - January 2024',
        due_date: new Date('2024-02-20'),
        status: 'paid',
      },
      {
        member: members[5],
        subscription: memberSubscriptions[5],
        total_amount: 89.99,
        description: 'Corporate Premium - January 2024',
        due_date: new Date('2024-02-10'),
        status: 'paid',
      },
    ];

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

    const transactions = [
      {
        invoice: invoices[0],
        amount: 79.99,
        method: 'card',
        reference_number: 'TXN001',
        notes: 'Payment for January membership',
        status: 'completed',
      },
      {
        invoice: invoices[1],
        amount: 129.99,
        method: 'online',
        reference_number: 'TXN002',
        notes: 'Premium membership payment',
        status: 'completed',
      },
      {
        invoice: invoices[3],
        amount: 199.99,
        method: 'bank_transfer',
        reference_number: 'TXN003',
        notes: 'VIP membership payment',
        status: 'pending',
      },
      {
        invoice: invoices[4],
        amount: 39.99,
        method: 'cash',
        reference_number: 'TXN004',
        notes: 'Corporate membership payment',
        status: 'completed',
      },
      {
        invoice: invoices[5],
        amount: 89.99,
        method: 'card',
        reference_number: 'TXN005',
        notes: 'Corporate premium payment',
        status: 'completed',
      },
    ];

    const savedTransactions =
      await paymentTransactionRepository.save(transactions);
    console.log(`Seeded ${savedTransactions.length} payment transactions`);
    return savedTransactions;
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

    // Create attendance for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Create member attendance records
      const memberAttendance1 = await attendanceRepository.save({
        member: members[0],
        attendanceType: 'member',
        checkInTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          8,
          30,
        ),
        checkOutTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          10,
          0,
        ),
        date: date,
        branch: members[0].branch,
      } as any);
      attendanceRecords.push(memberAttendance1);

      const memberAttendance2 = await attendanceRepository.save({
        member: members[1],
        attendanceType: 'member',
        checkInTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          18,
          0,
        ),
        checkOutTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          19,
          30,
        ),
        date: date,
        branch: members[1].branch,
      } as any);
      attendanceRecords.push(memberAttendance2);

      const memberAttendance3 = await attendanceRepository.save({
        member: members[3],
        attendanceType: 'member',
        checkInTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          7,
          0,
        ),
        checkOutTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          8,
          45,
        ),
        date: date,
        branch: members[3].branch,
      } as any);
      attendanceRecords.push(memberAttendance3);

      // Create trainer attendance records
      const trainerAttendance1 = await attendanceRepository.save({
        trainer: trainers[0],
        attendanceType: 'trainer',
        checkInTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          8,
          0,
        ),
        checkOutTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          17,
          0,
        ),
        date: date,
        branch: trainers[0].branch,
      } as any);
      attendanceRecords.push(trainerAttendance1);

      const trainerAttendance2 = await attendanceRepository.save({
        trainer: trainers[2],
        attendanceType: 'trainer',
        checkInTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          9,
          0,
        ),
        checkOutTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          18,
          0,
        ),
        date: date,
        branch: trainers[2].branch,
      } as any);
      attendanceRecords.push(trainerAttendance2);
    }

    console.log(`Seeded ${attendanceRecords.length} attendance records`);
    return attendanceRecords;
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

    // Helper function to hash password and track credentials
    const createUserWithPassword = async (
      email: string,
      password: string,
      role: Role,
      gym?: Gym,
      branch?: Branch,
      memberId?: string,
      trainerId?: string,
    ): Promise<User> => {
      const passwordHash = await bcrypt.hash(password, 10);

      // Track user credentials
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

    // Create users
    const users = [
      // Super Admin
      await createUserWithPassword(
        'superadmin@gymsystem.com',
        'SuperAdmin123!',
        roles.find((r) => r.name === 'SUPERADMIN')!,
        gyms[0],
      ),

      // Gym Admins
      await createUserWithPassword(
        'admin@fitnessfirst.com',
        'Admin123!',
        roles.find((r) => r.name === 'ADMIN')!,
        gyms[0],
        branches[0],
      ),
      await createUserWithPassword(
        'admin@ironparadise.com',
        'Admin123!',
        roles.find((r) => r.name === 'ADMIN')!,
        gyms[1],
        branches[2],
      ),
      await createUserWithPassword(
        'admin@peakperformance.com',
        'Admin123!',
        roles.find((r) => r.name === 'ADMIN')!,
        gyms[2],
        branches[4],
      ),

      // Trainer Users
      await createUserWithPassword(
        'john.smith@fitnessfirst.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[0],
        branches[0],
        undefined,
        trainers[0].id.toString(),
      ),
      await createUserWithPassword(
        'sarah.johnson@fitnessfirst.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[0],
        branches[0],
        undefined,
        trainers[1].id.toString(),
      ),
      await createUserWithPassword(
        'mike.wilson@ironparadise.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[1],
        branches[2],
        undefined,
        trainers[2].id.toString(),
      ),
      await createUserWithPassword(
        'emma.davis@ironparadise.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[1],
        branches[2],
        undefined,
        trainers[3].id.toString(),
      ),
      await createUserWithPassword(
        'david.brown@peakperformance.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[2],
        branches[4],
        undefined,
        trainers[4].id.toString(),
      ),
      await createUserWithPassword(
        'lisa.garcia@peakperformance.com',
        'Trainer123!',
        roles.find((r) => r.name === 'TRAINER')!,
        gyms[2],
        branches[4],
        undefined,
        trainers[5].id.toString(),
      ),

      // Member Users
      await createUserWithPassword(
        'alice.cooper@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[0],
        branches[0],
        members[0].id.toString(),
      ),
      await createUserWithPassword(
        'robert.miller@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[1],
        branches[2],
        members[1].id.toString(),
      ),
      await createUserWithPassword(
        'maria.rodriguez@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[2],
        branches[4],
        members[2].id.toString(),
      ),
      await createUserWithPassword(
        'james.taylor@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[0],
        branches[1],
        members[3].id.toString(),
      ),
      await createUserWithPassword(
        'sophia.anderson@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[1],
        branches[3],
        members[4].id.toString(),
      ),
      await createUserWithPassword(
        'michael.white@email.com',
        'Member123!',
        roles.find((r) => r.name === 'MEMBER')!,
        gyms[2],
        branches[4],
        members[5].id.toString(),
      ),
    ];

    const savedUsers = await userRepository.save(users);
    console.log(`Seeded ${savedUsers.length} users`);
    return savedUsers;
  }

  private async seedNotifications(users: User[]): Promise<Notification[]> {
    console.log('Seeding notifications...');
    const notificationRepository = this.dataSource.getRepository(Notification);

    const notifications = [
      {
        user: users[0], // Super Admin
        title: 'System Maintenance',
        message:
          'Scheduled system maintenance on January 15th, 2024 from 2:00 AM to 4:00 AM EST.',
        is_read: false,
      },
      {
        user: users[1], // Gym Admin
        title: 'New Member Registration',
        message:
          'A new member has registered at your branch and is pending approval.',
        is_read: true,
      },
      {
        user: users[4], // Trainer
        title: 'Class Schedule Updated',
        message:
          'Your evening HIIT class schedule has been updated for next week.',
        is_read: false,
      },
      {
        user: users[10], // Member
        title: 'Membership Renewal Reminder',
        message:
          'Your membership expires in 5 days. Renew now to continue enjoying our services.',
        is_read: false,
      },
      {
        user: users[11], // Member
        title: 'Payment Processed',
        message:
          'Your monthly membership payment of $79.99 has been processed successfully.',
        is_read: true,
      },
    ];

    const savedNotifications = await notificationRepository.save(notifications);
    console.log(`Seeded ${savedNotifications.length} notifications`);
    return savedNotifications;
  }

  private async seedAuditLogs(users: User[]): Promise<AuditLog[]> {
    console.log('Seeding audit logs...');
    const auditLogRepository = this.dataSource.getRepository(AuditLog);

    const auditLogs = [
      {
        user: users[0], // Super Admin
        action: 'CREATE',
        entity_type: 'Gym',
        entity_id: 'gym-1',
        previous_values: null,
        new_values: {
          name: 'Fitness First Elite',
          email: 'admin@fitnessfirst.com',
        },
      },
      {
        user: users[1], // Gym Admin
        action: 'UPDATE',
        entity_type: 'Member',
        entity_id: 'member-1',
        previous_values: { status: 'inactive' },
        new_values: { status: 'active' },
      },
      {
        user: users[4], // Trainer
        action: 'CREATE',
        entity_type: 'Class',
        entity_id: 'class-1',
        previous_values: null,
        new_values: {
          name: 'Morning Yoga',
          schedule: 'Monday, Wednesday, Friday 8:00 AM',
        },
      },
      {
        user: users[10], // Member
        action: 'UPDATE',
        entity_type: 'Profile',
        entity_id: 'user-profile-10',
        previous_values: { phone: '+1-555-5007' },
        new_values: { phone: '+1-555-5013' },
      },
      {
        user: users[2], // Another Gym Admin
        action: 'DELETE',
        entity_type: 'Invoice',
        entity_id: 'invoice-3',
        previous_values: { total_amount: 49.99, status: 'pending' },
        new_values: null,
      },
    ];

    const savedAuditLogs = await auditLogRepository.save(auditLogs);
    console.log(`Seeded ${savedAuditLogs.length} audit logs`);
    return savedAuditLogs;
  }

  private displayUserCredentials() {
    console.log('\n' + '='.repeat(80));
    console.log('USER CREDENTIALS FOR LOGIN');
    console.log('='.repeat(80));

    userCredentials.forEach((cred, index) => {
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

    const roleCount = userCredentials.reduce(
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

// Run the seeder
const seeder = new DatabaseSeeder();
seeder.seed().catch(console.error);
