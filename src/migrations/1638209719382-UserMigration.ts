import {MigrationInterface, QueryRunner} from "typeorm";

export class UserMigration1638209719382 implements MigrationInterface {
    name = 'UserMigration1638209719382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'pending')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "image" character varying NOT NULL DEFAULT '', "refreshtoken" character varying, "refreshtokenexp" date, "confirmationcode" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_64325f4a9756f81d2be2c4263da" UNIQUE ("confirmationcode"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }

}
