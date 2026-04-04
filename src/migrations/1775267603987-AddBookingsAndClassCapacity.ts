import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingsAndClassCapacity1775267603987 implements MigrationInterface {
    name = 'AddBookingsAndClassCapacity1775267603987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('confirmed', 'waitlist', 'cancelled', 'completed', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bookingDate" date NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'confirmed', "waitlistPosition" integer NOT NULL DEFAULT '0', "notes" text, "cancelledAt" TIMESTAMP, "cancelledBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "classClassId" uuid NOT NULL, "memberId" integer NOT NULL, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_booking_status" ON "bookings" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_booking_class_member_date" ON "bookings" ("classClassId", "memberId", "bookingDate") `);
        await queryRunner.query(`ALTER TABLE "classes" ADD "capacity" integer`);
        await queryRunner.query(`ALTER TABLE "classes" ADD "enrolledCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_d55b8a9d05b9b1db7a23cdce1c8" FOREIGN KEY ("classClassId") REFERENCES "classes"("class_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_2c921e060d199ff17c074178c32" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_2c921e060d199ff17c074178c32"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_d55b8a9d05b9b1db7a23cdce1c8"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "enrolledCount"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "capacity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_booking_class_member_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_booking_status"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    }

}
