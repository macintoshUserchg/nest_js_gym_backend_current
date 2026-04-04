import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokens1775267189474 implements MigrationInterface {
    name = 'AddRefreshTokens1775267189474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "replacedByToken" character varying, "ipAddress" character varying, "userAgent" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userUserId" uuid NOT NULL, CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_token_user_revoked" ON "refresh_tokens" ("userUserId", "isRevoked") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerifiedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationTokenExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_da6f731627474661222cac88bd9" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_da6f731627474661222cac88bd9"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationTokenExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerifiedAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_refresh_token_user_revoked"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
