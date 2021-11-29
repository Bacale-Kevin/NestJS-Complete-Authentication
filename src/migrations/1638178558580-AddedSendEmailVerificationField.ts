import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedSendEmailVerificationField1638178558580 implements MigrationInterface {
    name = 'AddedSendEmailVerificationField1638178558580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailConfirmed"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "confirmationcode" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_64325f4a9756f81d2be2c4263da" UNIQUE ("confirmationcode")`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'pending')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_64325f4a9756f81d2be2c4263da"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "confirmationcode"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailConfirmed" boolean NOT NULL DEFAULT false`);
    }

}
