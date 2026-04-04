import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1743638400000 implements MigrationInterface {
  name = 'InitialSchema1743638400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUM TYPES ──────────────────────────────────────────────────────

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."member_subscription_status_enum" AS ENUM('active', 'expired', 'cancelled', 'frozen');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."invoice_status_enum" AS ENUM('pending', 'paid', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_method_enum" AS ENUM('cash', 'card', 'online', 'bank_transfer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'refund');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."workout_difficulty_enum" AS ENUM('beginner', 'intermediate', 'advanced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."workout_plan_type_enum" AS ENUM('strength', 'cardio', 'flexibility', 'endurance', 'general');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."chart_type_enum" AS ENUM('STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'COMPOUND');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."exercise_type_enum" AS ENUM('sets_reps', 'time', 'distance');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."equipment_enum" AS ENUM('BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'KETTLEBELL', 'MEDICINE_BALL', 'RESISTANCE_BAND', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."body_part_enum" AS ENUM('upper_body', 'lower_body', 'core', 'cardio', 'full_body');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."meal_type_enum" AS ENUM('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."diet_goal_enum" AS ENUM('weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."assignment_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."schedule_type_enum" AS ENUM('weekly', 'monthly', 'quarterly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."goal_schedule_status_enum" AS ENUM('active', 'completed', 'cancelled', 'paused');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."milestone_priority_enum" AS ENUM('high', 'medium', 'low');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."milestone_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'missed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."attendance_goal_type_enum" AS ENUM('daily', 'weekly', 'monthly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."attendance_type_enum" AS ENUM('member', 'trainer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."notification_type_enum" AS ENUM('SYSTEM', 'REMINDER', 'PAYMENT', 'ASSIGNMENT', 'WORKOUT', 'DIET', 'GOAL', 'ATTENDANCE', 'RENEWAL', 'INQUIRY', 'TEMPLATE', 'ANNOUNCEMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."inquiry_status_enum" AS ENUM('new', 'contacted', 'qualified', 'converted', 'closed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."inquiry_source_enum" AS ENUM('walk_in', 'phone', 'email', 'website', 'social_media', 'referral', 'google', 'facebook', 'instagram', 'twitter', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."membership_type_enum" AS ENUM('basic', 'premium', 'vip', 'family', 'corporate', 'student', 'senior');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."renewal_status_enum" AS ENUM('requested', 'invoiced', 'paid', 'activated', 'cancelled', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."reminder_type_enum" AS ENUM('subscription_expiry', 'due_payment', 'renewal_invoice', 'renewal_activated');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."reminder_channel_enum" AS ENUM('email', 'in_app');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."timing_enum" AS ENUM('morning', 'evening', 'both', 'either');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."recurrence_enum" AS ENUM('daily', 'weekly', 'monthly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."visibility_enum" AS ENUM('PRIVATE', 'GYM_PUBLIC');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."member_trainer_status_enum" AS ENUM('active', 'ended');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // ─── TABLES (in dependency order) ────────────────────────────────────

    // 1. roles (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    // 2. gyms (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gyms" (
        "gymId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "email" character varying(100),
        "phone" character varying(15),
        "logoUrl" character varying,
        "address" text,
        "location" character varying,
        "state" character varying,
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_gyms_email" UNIQUE ("email"),
        CONSTRAINT "PK_gyms" PRIMARY KEY ("gymId")
      )
    `);

    // 3. branches (depends on gyms)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "branches" (
        "branchId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "email" character varying,
        "phone" character varying,
        "address" text,
        "location" character varying,
        "state" character varying,
        "mainBranch" boolean NOT NULL DEFAULT false,
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "gymGymId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_branches" PRIMARY KEY ("branchId")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "branches" ADD CONSTRAINT "FK_branches_gymGymId"
        FOREIGN KEY ("gymGymId") REFERENCES "gyms"("gymId") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 4. users (depends on roles, gyms, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "userId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying,
        "memberId" character varying,
        "trainerId" character varying,
        "phoneNumber" character varying,
        "phoneVerifiedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "gymGymId" uuid,
        "branchBranchId" uuid,
        "roleId" uuid NOT NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phoneNumber" UNIQUE ("phoneNumber"),
        CONSTRAINT "PK_users" PRIMARY KEY ("userId")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_roleId"
        FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_gymGymId"
        FOREIGN KEY ("gymGymId") REFERENCES "gyms"("gymId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 5. trainers (depends on branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "trainers" (
        "id" SERIAL NOT NULL,
        "fullName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "specialization" character varying,
        "avatarUrl" character varying,
        "branchBranchId" uuid NOT NULL,
        CONSTRAINT "UQ_trainers_email" UNIQUE ("email"),
        CONSTRAINT "PK_trainers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "trainers" ADD CONSTRAINT "FK_trainers_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 6. classes (depends on branches, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classes" (
        "class_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "timings" "public"."timing_enum",
        "recurrence_type" "public"."recurrence_enum",
        "days_of_week" integer array,
        "branchBranchId" uuid NOT NULL,
        "trainerId" integer,
        CONSTRAINT "PK_classes" PRIMARY KEY ("class_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "classes" ADD CONSTRAINT "FK_classes_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "classes" ADD CONSTRAINT "FK_classes_trainerId"
        FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 7. membership_plans (depends on branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "membership_plans" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "price" integer NOT NULL,
        "durationInDays" integer NOT NULL,
        "description" character varying,
        "branchBranchId" uuid,
        CONSTRAINT "PK_membership_plans" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "membership_plans" ADD CONSTRAINT "FK_membership_plans_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 8. members (no FK deps at creation time, but has OneToOne to member_subscriptions)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "members" (
        "id" SERIAL NOT NULL,
        "userId" character varying,
        "fullName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "gender" "public"."gender_enum",
        "dateOfBirth" date,
        "addressLine1" character varying,
        "addressLine2" character varying,
        "city" character varying,
        "state" character varying,
        "postalCode" character varying,
        "avatarUrl" character varying,
        "attachmentUrl" character varying,
        "emergencyContactName" character varying,
        "emergencyContactPhone" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "freezeMember" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "subscriptionId" integer,
        "branchBranchId" uuid,
        "is_managed_by_member" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_members_email" UNIQUE ("email"),
        CONSTRAINT "UQ_members_subscriptionId" UNIQUE ("subscriptionId"),
        CONSTRAINT "PK_members" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "members" ADD CONSTRAINT "FK_members_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 9. member_subscriptions (depends on members, membership_plans)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "member_subscriptions" (
        "id" SERIAL NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "selectedClassIds" uuid array,
        "memberId" integer NOT NULL,
        "planId" integer NOT NULL,
        CONSTRAINT "UQ_member_subscriptions_memberId" UNIQUE ("memberId"),
        CONSTRAINT "PK_member_subscriptions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "member_subscriptions" ADD CONSTRAINT "FK_member_subscriptions_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "member_subscriptions" ADD CONSTRAINT "FK_member_subscriptions_planId"
        FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 10. Add FK from members.subscriptionId to member_subscriptions.id
    await queryRunner.query(`
      ALTER TABLE "members" ADD CONSTRAINT "FK_members_subscriptionId"
        FOREIGN KEY ("subscriptionId") REFERENCES "member_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 11. invoices (depends on members, member_subscriptions)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "invoice_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "total_amount" numeric(10,2) NOT NULL,
        "description" text,
        "due_date" date,
        "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'pending',
        "paid_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "subscriptionId" integer,
        CONSTRAINT "PK_invoices" PRIMARY KEY ("invoice_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_subscriptionId"
        FOREIGN KEY ("subscriptionId") REFERENCES "member_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 12. payment_transactions (depends on invoices, users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_transactions" (
        "transaction_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric(10,2) NOT NULL,
        "method" "public"."payment_method_enum" NOT NULL,
        "reference_number" character varying,
        "notes" text,
        "status" "public"."payment_status_enum" NOT NULL DEFAULT 'completed',
        "recorded_by_user_id" uuid,
        "verified_by_user_id" uuid,
        "verified_at" TIMESTAMP,
        "refund_reason" text,
        "original_transaction_id" uuid,
        "payment_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "invoiceInvoice_id" uuid NOT NULL,
        CONSTRAINT "PK_payment_transactions" PRIMARY KEY ("transaction_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_payment_transactions_invoice"
        FOREIGN KEY ("invoiceInvoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_payment_transactions_recorded_by"
        FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_payment_transactions_verified_by"
        FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_payment_transactions_original"
        FOREIGN KEY ("original_transaction_id") REFERENCES "payment_transactions"("transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 13. workout_plans (depends on members, trainers, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_plans" (
        "plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(100) NOT NULL,
        "description" text,
        "difficulty_level" "public"."workout_difficulty_enum" NOT NULL,
        "plan_type" "public"."workout_plan_type_enum" NOT NULL,
        "duration_days" integer NOT NULL DEFAULT 0,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_completed" boolean NOT NULL DEFAULT false,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "assigned_by_trainerId" integer,
        "branchBranchId" uuid,
        CONSTRAINT "PK_workout_plans" PRIMARY KEY ("plan_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plans" ADD CONSTRAINT "FK_workout_plans_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plans" ADD CONSTRAINT "FK_workout_plans_trainerId"
        FOREIGN KEY ("assigned_by_trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plans" ADD CONSTRAINT "FK_workout_plans_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 14. workout_templates (depends on trainers, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_templates" (
        "template_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trainerId" integer,
        "title" character varying(100) NOT NULL,
        "description" text,
        "visibility" "public"."visibility_enum" NOT NULL DEFAULT 'PRIVATE',
        "chart_type" "public"."chart_type_enum" NOT NULL,
        "difficulty_level" "public"."workout_difficulty_enum" NOT NULL,
        "plan_type" "public"."workout_plan_type_enum" NOT NULL DEFAULT 'general',
        "duration_days" integer NOT NULL DEFAULT 0,
        "is_shared_gym" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "version" integer NOT NULL DEFAULT 0,
        "parent_template_id" uuid,
        "usage_count" integer NOT NULL DEFAULT 0,
        "avg_rating" numeric(3,2),
        "rating_count" integer NOT NULL DEFAULT 0,
        "notes" text,
        "tags" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "branchBranchId" uuid,
        "trainerId_fk" integer,
        CONSTRAINT "PK_workout_templates" PRIMARY KEY ("template_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_templates" ADD CONSTRAINT "FK_workout_templates_trainerId"
        FOREIGN KEY ("trainerId_fk") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_templates" ADD CONSTRAINT "FK_workout_templates_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 15. workout_template_exercises (depends on workout_templates)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_template_exercises" (
        "exercise_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "exercise_name" character varying(100) NOT NULL,
        "description" text,
        "exercise_type" "public"."exercise_type_enum" NOT NULL,
        "equipment_required" "public"."equipment_enum",
        "sets" integer,
        "reps" integer,
        "weight_kg" integer,
        "duration_minutes" integer,
        "distance_km" numeric(5,2),
        "day_of_week" integer NOT NULL DEFAULT 1,
        "order_index" integer,
        "instructions" text,
        "alternatives" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "member_can_skip" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "templateTemplate_id" uuid NOT NULL,
        CONSTRAINT "PK_workout_template_exercises" PRIMARY KEY ("exercise_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "FK_wte_template"
        FOREIGN KEY ("templateTemplate_id") REFERENCES "workout_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 16. workout_plan_exercises (depends on workout_plans)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_plan_exercises" (
        "exercise_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "exercise_name" character varying(100) NOT NULL,
        "description" text,
        "exercise_type" "public"."exercise_type_enum" NOT NULL,
        "sets" integer,
        "reps" integer,
        "weight_kg" integer,
        "duration_minutes" integer,
        "distance_km" numeric(5,2),
        "day_of_week" integer NOT NULL DEFAULT 1,
        "instructions" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "workoutPlanPlan_id" uuid NOT NULL,
        CONSTRAINT "PK_workout_plan_exercises" PRIMARY KEY ("exercise_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plan_exercises" ADD CONSTRAINT "FK_wpe_plan"
        FOREIGN KEY ("workoutPlanPlan_id") REFERENCES "workout_plans"("plan_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 17. workout_plan_chart_assignments (depends on workout_templates, members, member_trainer_assignments, users)
    // Need member_trainer_assignments first
    // Will create after member_trainer_assignments

    // 18. workout_logs (depends on members, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_logs" (
        "id" SERIAL NOT NULL,
        "exercise_name" character varying(200) NOT NULL,
        "sets" integer,
        "reps" integer,
        "weight" numeric(10,2),
        "duration" integer,
        "notes" text,
        "date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "trainerId" integer,
        CONSTRAINT "PK_workout_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_logs" ADD CONSTRAINT "FK_workout_logs_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_logs" ADD CONSTRAINT "FK_workout_logs_trainerId"
        FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 19. exercise_library (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "exercise_library" (
        "exercise_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "exercise_name" character varying(100) NOT NULL,
        "body_part" "public"."body_part_enum" NOT NULL,
        "exercise_type" "public"."workout_plan_type_enum" NOT NULL,
        "difficulty_level" "public"."workout_difficulty_enum" NOT NULL,
        "description" text,
        "instructions" text,
        "benefits" text,
        "precautions" text,
        "video_url" text,
        "image_url" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exercise_library" PRIMARY KEY ("exercise_id")
      )
    `);

    // 20. diet_plans (depends on members, trainers, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diet_plans" (
        "plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(100) NOT NULL,
        "description" text,
        "goal_type" "public"."diet_goal_enum" NOT NULL,
        "target_calories" integer NOT NULL DEFAULT 0,
        "target_protein" integer,
        "target_carbs" integer,
        "target_fat" integer,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_completed" boolean NOT NULL DEFAULT false,
        "notes" text,
        "template_id" uuid,
        "is_template" boolean NOT NULL DEFAULT false,
        "usage_count" integer NOT NULL DEFAULT 0,
        "parent_template_id" uuid,
        "version" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "assigned_by_trainerId" integer,
        "branchBranchId" uuid,
        CONSTRAINT "PK_diet_plans" PRIMARY KEY ("plan_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plans" ADD CONSTRAINT "FK_diet_plans_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plans" ADD CONSTRAINT "FK_diet_plans_trainerId"
        FOREIGN KEY ("assigned_by_trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plans" ADD CONSTRAINT "FK_diet_plans_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 21. diet_templates (depends on trainers, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diet_templates" (
        "template_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trainerId" integer,
        "title" character varying(100) NOT NULL,
        "description" text,
        "goal_type" "public"."diet_goal_enum" NOT NULL,
        "target_calories" integer NOT NULL DEFAULT 0,
        "protein_g" numeric(5,2),
        "carbs_g" numeric(5,2),
        "fat_g" numeric(5,2),
        "is_shared_gym" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "version" integer NOT NULL DEFAULT 0,
        "parent_template_id" uuid,
        "usage_count" integer NOT NULL DEFAULT 0,
        "avg_rating" numeric(3,2),
        "rating_count" integer NOT NULL DEFAULT 0,
        "notes" text,
        "tags" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "branchBranchId" uuid,
        "trainerId_fk" integer,
        CONSTRAINT "PK_diet_templates" PRIMARY KEY ("template_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_templates" ADD CONSTRAINT "FK_diet_templates_trainerId"
        FOREIGN KEY ("trainerId_fk") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_templates" ADD CONSTRAINT "FK_diet_templates_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 22. diet_template_meals (depends on diet_templates)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diet_template_meals" (
        "meal_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_type" "public"."meal_type_enum" NOT NULL,
        "meal_name" character varying(100) NOT NULL,
        "description" text,
        "ingredients" text,
        "preparation" text,
        "calories" integer,
        "protein_g" numeric(5,2),
        "carbs_g" numeric(5,2),
        "fat_g" numeric(5,2),
        "day_of_week" integer NOT NULL DEFAULT 1,
        "order_index" integer,
        "notes" text,
        "alternatives" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "member_can_skip" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "templateTemplate_id" uuid NOT NULL,
        CONSTRAINT "PK_diet_template_meals" PRIMARY KEY ("meal_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_template_meals" ADD CONSTRAINT "FK_dtm_template"
        FOREIGN KEY ("templateTemplate_id") REFERENCES "diet_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 23. diet_plan_meals (depends on diet_plans)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diet_plan_meals" (
        "meal_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_type" "public"."meal_type_enum" NOT NULL,
        "meal_name" character varying(100) NOT NULL,
        "description" text,
        "ingredients" text,
        "preparation" text,
        "calories" integer,
        "protein_g" numeric(5,2),
        "carbs_g" numeric(5,2),
        "fat_g" numeric(5,2),
        "day_of_week" integer NOT NULL DEFAULT 1,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "dietPlanPlan_id" uuid NOT NULL,
        CONSTRAINT "PK_diet_plan_meals" PRIMARY KEY ("meal_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plan_meals" ADD CONSTRAINT "FK_dpm_plan"
        FOREIGN KEY ("dietPlanPlan_id") REFERENCES "diet_plans"("plan_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 24. meal_library (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meal_library" (
        "meal_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_name" character varying(100) NOT NULL,
        "meal_type" "public"."meal_type_enum" NOT NULL,
        "description" text,
        "ingredients" text,
        "preparation" text,
        "calories" integer,
        "protein_g" numeric(5,2),
        "carbs_g" numeric(5,2),
        "fat_g" numeric(5,2),
        "image_url" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_meal_library" PRIMARY KEY ("meal_id")
      )
    `);

    // 25. goals (depends on members, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "goals" (
        "id" SERIAL NOT NULL,
        "goal_type" character varying(100) NOT NULL,
        "target_value" numeric(10,2),
        "target_timeline" date,
        "milestone" jsonb,
        "status" character varying(50) NOT NULL DEFAULT 'active',
        "completion_percent" numeric(5,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "trainerId" integer,
        CONSTRAINT "PK_goals" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "goals" ADD CONSTRAINT "FK_goals_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "goals" ADD CONSTRAINT "FK_goals_trainerId"
        FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 26. goal_templates (depends on trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "goal_templates" (
        "template_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trainerId" integer,
        "title" character varying(100) NOT NULL,
        "description" text,
        "default_schedule_type" "public"."schedule_type_enum" NOT NULL,
        "default_goals" jsonb NOT NULL,
        "tags" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "usage_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "trainerId_fk" integer,
        CONSTRAINT "PK_goal_templates" PRIMARY KEY ("template_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "goal_templates" ADD CONSTRAINT "FK_goal_templates_trainerId"
        FOREIGN KEY ("trainerId_fk") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 27. goal_schedules (depends on trainers, members)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "goal_schedules" (
        "schedule_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "assigned_trainerId" integer,
        "title" character varying(100) NOT NULL,
        "description" text,
        "schedule_type" "public"."schedule_type_enum" NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "current_period" integer NOT NULL DEFAULT 1,
        "target_goals" jsonb NOT NULL,
        "period_progress" jsonb,
        "status" "public"."goal_schedule_status_enum" NOT NULL DEFAULT 'active',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_activity_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "assigned_trainerId_fk" integer,
        "memberId" integer NOT NULL,
        CONSTRAINT "PK_goal_schedules" PRIMARY KEY ("schedule_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "goal_schedules" ADD CONSTRAINT "FK_gs_trainerId"
        FOREIGN KEY ("assigned_trainerId_fk") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "goal_schedules" ADD CONSTRAINT "FK_gs_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 28. goal_schedule_milestones (depends on goal_schedules)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "goal_schedule_milestones" (
        "milestone_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "period_label" character varying(50) NOT NULL,
        "sequence_order" integer NOT NULL DEFAULT 1,
        "target_value" numeric(10,2) NOT NULL,
        "unit" character varying(50) NOT NULL,
        "description" text,
        "priority" "public"."milestone_priority_enum" NOT NULL DEFAULT 'medium',
        "status" "public"."milestone_status_enum" NOT NULL DEFAULT 'pending',
        "current_value" numeric(10,2),
        "completed_at" date,
        "due_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "scheduleSchedule_id" uuid NOT NULL,
        CONSTRAINT "PK_goal_schedule_milestones" PRIMARY KEY ("milestone_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "goal_schedule_milestones" ADD CONSTRAINT "FK_gsm_schedule"
        FOREIGN KEY ("scheduleSchedule_id") REFERENCES "goal_schedules"("schedule_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 29. attendance_goals (depends on members, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance_goals" (
        "goal_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "goal_type" "public"."attendance_goal_type_enum" NOT NULL,
        "target_count" integer NOT NULL,
        "current_count" integer NOT NULL DEFAULT 0,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "current_streak" integer NOT NULL DEFAULT 0,
        "longest_streak" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "branchBranchId" uuid,
        CONSTRAINT "PK_attendance_goals" PRIMARY KEY ("goal_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "attendance_goals" ADD CONSTRAINT "FK_ag_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "attendance_goals" ADD CONSTRAINT "FK_ag_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 30. member_trainer_assignments (depends on members, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "member_trainer_assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "start_date" date NOT NULL,
        "end_date" date,
        "status" "public"."member_trainer_status_enum" NOT NULL DEFAULT 'active',
        "assigned_workout_template_id" uuid,
        "assigned_diet_template_id" uuid,
        "workout_start_date" date,
        "workout_end_date" date,
        "diet_start_date" date,
        "diet_end_date" date,
        "auto_apply_templates" boolean NOT NULL DEFAULT true,
        "allow_member_substitutions" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "member_id" integer NOT NULL,
        "trainer_id" integer NOT NULL,
        CONSTRAINT "PK_member_trainer_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "member_trainer_assignments" ADD CONSTRAINT "FK_mta_member"
        FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "member_trainer_assignments" ADD CONSTRAINT "FK_mta_trainer"
        FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 31. template_shares (depends on trainers, users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "template_shares" (
        "share_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "template_id" uuid NOT NULL,
        "template_type" character varying(50) NOT NULL,
        "shared_with_trainerId" integer,
        "admin_note" text,
        "is_accepted" boolean NOT NULL DEFAULT false,
        "accepted_at" TIMESTAMP,
        "shared_at" TIMESTAMP NOT NULL DEFAULT now(),
        "shared_with_trainerId_fk" integer NOT NULL,
        "shared_by_adminUserId" uuid NOT NULL,
        CONSTRAINT "PK_template_shares" PRIMARY KEY ("share_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "template_shares" ADD CONSTRAINT "FK_ts_trainerId"
        FOREIGN KEY ("shared_with_trainerId_fk") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "template_shares" ADD CONSTRAINT "FK_ts_adminUserId"
        FOREIGN KEY ("shared_by_adminUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 32. template_assignments (depends on members, member_trainer_assignments)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "template_assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "template_id" uuid NOT NULL,
        "template_type" character varying(50) NOT NULL,
        "memberId" integer NOT NULL,
        "trainer_assignmentId" uuid,
        "start_date" date NOT NULL,
        "end_date" date,
        "status" character varying NOT NULL DEFAULT 'active',
        "completion_percent" integer NOT NULL DEFAULT 0,
        "member_substitutions" jsonb,
        "progress_log" jsonb,
        "last_activity_at" TIMESTAMP,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId_fk" integer NOT NULL,
        "trainer_assignmentAssignment_id" uuid,
        CONSTRAINT "PK_template_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "template_assignments" ADD CONSTRAINT "FK_ta_memberId"
        FOREIGN KEY ("memberId_fk") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "template_assignments" ADD CONSTRAINT "FK_ta_trainerAssignment"
        FOREIGN KEY ("trainer_assignmentAssignment_id") REFERENCES "member_trainer_assignments"("assignment_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 33. diet_plan_assignments (depends on diet_plans, members, users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diet_plan_assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "diet_plan_id" uuid NOT NULL,
        "memberId" integer NOT NULL,
        "assigned_by_user_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "status" "public"."assignment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "completion_percent" integer NOT NULL DEFAULT 0,
        "member_substitutions" jsonb,
        "progress_log" jsonb,
        "last_activity_at" TIMESTAMP,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "diet_planPlan_id" uuid NOT NULL,
        "memberId_fk" integer NOT NULL,
        "assigned_byUserId" uuid NOT NULL,
        CONSTRAINT "PK_diet_plan_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plan_assignments" ADD CONSTRAINT "FK_dpa_dietPlan"
        FOREIGN KEY ("diet_planPlan_id") REFERENCES "diet_plans"("plan_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plan_assignments" ADD CONSTRAINT "FK_dpa_memberId"
        FOREIGN KEY ("memberId_fk") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diet_plan_assignments" ADD CONSTRAINT "FK_dpa_assignedBy"
        FOREIGN KEY ("assigned_byUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 34. workout_plan_chart_assignments (depends on workout_templates, members, member_trainer_assignments, users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workout_plan_chart_assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "chart_id" uuid NOT NULL,
        "memberId" integer NOT NULL,
        "trainer_assignment_id" uuid,
        "assigned_by_user_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "status" "public"."assignment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "completion_percent" integer NOT NULL DEFAULT 0,
        "customizations" jsonb,
        "member_substitutions" jsonb,
        "last_activity_at" TIMESTAMP,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "chartTemplate_id" uuid NOT NULL,
        "memberId_fk" integer NOT NULL,
        "trainer_assignmentAssignment_id" uuid,
        "assigned_byUserId" uuid NOT NULL,
        CONSTRAINT "PK_workout_plan_chart_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plan_chart_assignments" ADD CONSTRAINT "FK_wpca_chart"
        FOREIGN KEY ("chartTemplate_id") REFERENCES "workout_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plan_chart_assignments" ADD CONSTRAINT "FK_wpca_memberId"
        FOREIGN KEY ("memberId_fk") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plan_chart_assignments" ADD CONSTRAINT "FK_wpca_trainerAssignment"
        FOREIGN KEY ("trainer_assignmentAssignment_id") REFERENCES "member_trainer_assignments"("assignment_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "workout_plan_chart_assignments" ADD CONSTRAINT "FK_wpca_assignedBy"
        FOREIGN KEY ("assigned_byUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 35. attendance (depends on members, trainers, branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "attendanceType" "public"."attendance_type_enum" NOT NULL,
        "checkInTime" TIMESTAMP NOT NULL,
        "checkOutTime" TIMESTAMP,
        "date" date NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer,
        "trainerId" integer,
        "branchBranchId" uuid NOT NULL,
        CONSTRAINT "PK_attendance" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_trainerId"
        FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "attendance" ADD CONSTRAINT "FK_attendance_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 36. audit_logs (depends on users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "log_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "entity_type" character varying NOT NULL,
        "entity_id" character varying NOT NULL,
        "previous_values" jsonb,
        "new_values" jsonb,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("log_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 37. notifications (depends on users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "notification_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "public"."notification_type_enum" NOT NULL DEFAULT 'SYSTEM',
        "title" character varying(200) NOT NULL,
        "message" text NOT NULL,
        "metadata" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "userId_fk" uuid NOT NULL,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("notification_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_userId"
        FOREIGN KEY ("userId_fk") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 38. inquiries (depends on branches)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inquiries" (
        "id" SERIAL NOT NULL,
        "fullName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "alternatePhone" character varying,
        "status" "public"."inquiry_status_enum" NOT NULL DEFAULT 'new',
        "source" "public"."inquiry_source_enum" NOT NULL,
        "preferredMembershipType" "public"."membership_type_enum",
        "preferredContactMethod" character varying,
        "notes" character varying,
        "addressLine1" character varying,
        "addressLine2" character varying,
        "city" character varying,
        "state" character varying,
        "postalCode" character varying,
        "dateOfBirth" date,
        "occupation" character varying,
        "fitnessGoals" character varying,
        "hasPreviousGymExperience" boolean NOT NULL DEFAULT false,
        "preferredContactTime" character varying,
        "wantsPersonalTraining" boolean NOT NULL DEFAULT false,
        "referralCode" character varying,
        "branchId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "contactedAt" TIMESTAMP,
        "convertedAt" TIMESTAMP,
        "closedAt" TIMESTAMP,
        "branchBranchId" uuid,
        CONSTRAINT "UQ_inquiries_email" UNIQUE ("email"),
        CONSTRAINT "PK_inquiries" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "inquiries" ADD CONSTRAINT "FK_inquiries_branchBranchId"
        FOREIGN KEY ("branchBranchId") REFERENCES "branches"("branchId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 39. renewal_requests (depends on members, membership_plans, member_subscriptions, invoices)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "renewal_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" "public"."renewal_status_enum" NOT NULL DEFAULT 'requested',
        "requestedStartDate" TIMESTAMP NOT NULL,
        "activatedAt" TIMESTAMP,
        "cancelledAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "requestedPlanId" integer NOT NULL,
        "currentSubscriptionId" integer,
        "invoiceInvoice_id" uuid,
        CONSTRAINT "UQ_renewal_requests_invoiceInvoice_id" UNIQUE ("invoiceInvoice_id"),
        CONSTRAINT "PK_renewal_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "renewal_requests" ADD CONSTRAINT "FK_rr_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "renewal_requests" ADD CONSTRAINT "FK_rr_planId"
        FOREIGN KEY ("requestedPlanId") REFERENCES "membership_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "renewal_requests" ADD CONSTRAINT "FK_rr_subscriptionId"
        FOREIGN KEY ("currentSubscriptionId") REFERENCES "member_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "renewal_requests" ADD CONSTRAINT "FK_rr_invoiceId"
        FOREIGN KEY ("invoiceInvoice_id") REFERENCES "invoices"("invoice_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 40. reminder_logs (no FK relations)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reminder_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "memberId" integer,
        "invoiceId" character varying,
        "renewalRequestId" character varying,
        "reminderType" "public"."reminder_type_enum" NOT NULL,
        "channel" "public"."reminder_channel_enum" NOT NULL,
        "referenceDate" date NOT NULL,
        "metadata" jsonb,
        "sentAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reminder_logs" PRIMARY KEY ("id")
      )
    `);

    // 41. body_progress (depends on members, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "body_progress" (
        "id" SERIAL NOT NULL,
        "weight" numeric(10,2),
        "body_fat" numeric(5,2),
        "bmi" numeric(5,2),
        "measurements" jsonb,
        "progress_photos" jsonb,
        "date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "trainerId" integer,
        CONSTRAINT "PK_body_progress" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "body_progress" ADD CONSTRAINT "FK_bp_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "body_progress" ADD CONSTRAINT "FK_bp_trainerId"
        FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 42. diets (depends on members, users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "diets" (
        "id" SERIAL NOT NULL,
        "calories" numeric(10,2),
        "protein" numeric(10,2),
        "carbs" numeric(10,2),
        "fat" numeric(10,2),
        "meals" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "assigned_byUserId" uuid,
        CONSTRAINT "PK_diets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "diets" ADD CONSTRAINT "FK_diets_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "diets" ADD CONSTRAINT "FK_diets_assignedBy"
        FOREIGN KEY ("assigned_byUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 43. progress_tracking (depends on members, trainers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "progress_tracking" (
        "progress_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "record_date" date NOT NULL,
        "weight_kg" numeric(5,2),
        "height_cm" numeric(5,2),
        "body_fat_percentage" numeric(5,2),
        "muscle_mass_kg" numeric(5,2),
        "bmi" numeric(5,2),
        "chest_cm" numeric(5,2),
        "waist_cm" numeric(5,2),
        "arms_cm" numeric(5,2),
        "thighs_cm" numeric(5,2),
        "notes" text,
        "achievements" text,
        "photo_url" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "memberId" integer NOT NULL,
        "recorded_by_trainerId" integer,
        CONSTRAINT "PK_progress_tracking" PRIMARY KEY ("progress_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "progress_tracking" ADD CONSTRAINT "FK_pt_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "progress_tracking" ADD CONSTRAINT "FK_pt_trainerId"
        FOREIGN KEY ("recorded_by_trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 44. password_reset_tokens (depends on users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "UQ_password_reset_tokens_token" UNIQUE ("token"),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_prt_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── INDEXES ─────────────────────────────────────────────────────────

    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_roleId" ON "users" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_members_email" ON "members" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_trainers_email" ON "trainers" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_memberId" ON "invoices" ("memberId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_transactions_invoice" ON "payment_transactions" ("invoiceInvoice_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attendance_date" ON "attendance" ("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId_fk")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_workout_logs_memberId" ON "workout_logs" ("memberId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_body_progress_memberId" ON "body_progress" ("memberId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_progress_tracking_memberId" ON "progress_tracking" ("memberId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reminder_logs_userId" ON "reminder_logs" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reminder_logs_referenceDate" ON "reminder_logs" ("referenceDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progress_tracking"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "body_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reminder_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "renewal_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inquiries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "workout_plan_chart_assignments"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_plan_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "template_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "template_shares"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "member_trainer_assignments"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance_goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goal_schedule_milestones"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goal_schedules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goal_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_library"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_plan_meals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_template_meals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exercise_library"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_plan_exercises"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "workout_template_exercises"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "member_subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trainers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gyms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."member_trainer_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."visibility_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."recurrence_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."timing_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reminder_channel_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reminder_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."renewal_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inquiry_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."inquiry_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."notification_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."attendance_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."attendance_goal_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."milestone_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."milestone_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."goal_schedule_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."schedule_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."assignment_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."diet_goal_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."meal_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."body_part_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."equipment_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."exercise_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."chart_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."workout_plan_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."workout_difficulty_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."invoice_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."member_subscription_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."gender_enum"`);
  }
}
