import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1747046355120 implements MigrationInterface {
    name = 'Test1747046355120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.039Z"'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.039Z"'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.052Z"'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.052Z"'`);
        await queryRunner.query(`ALTER TABLE "teachers" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.087Z"'`);
        await queryRunner.query(`ALTER TABLE "teachers" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.087Z"'`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.128Z"'`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.128Z"'`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.170Z"'`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.170Z"'`);
        await queryRunner.query(`ALTER TYPE "public"."student_batch_status_enum" RENAME TO "student_batch_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."student_batch_status_enum" AS ENUM('ongoing', 'suspended', 'removed')`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" TYPE "public"."student_batch_status_enum" USING "status"::"text"::"public"."student_batch_status_enum"`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" SET DEFAULT 'ongoing'`);
        await queryRunner.query(`DROP TYPE "public"."student_batch_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "assignments" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.323Z"'`);
        await queryRunner.query(`ALTER TABLE "assignments" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.324Z"'`);
        await queryRunner.query(`ALTER TABLE "bank_detail" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.372Z"'`);
        await queryRunner.query(`ALTER TABLE "compensation_batch_history" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.392Z"'`);
        await queryRunner.query(`ALTER TABLE "compensation_batch_history" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.392Z"'`);
        await queryRunner.query(`ALTER TABLE "compensation_student_history" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.405Z"'`);
        await queryRunner.query(`ALTER TABLE "compensation_student_history" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.405Z"'`);
        await queryRunner.query(`ALTER TABLE "enquiry_type" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.468Z"'`);
        await queryRunner.query(`ALTER TABLE "enquiry_type" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.468Z"'`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "date" SET DEFAULT '"2025-05-12T10:39:17.486Z"'`);
        await queryRunner.query(`ALTER TABLE "batch_activity" ALTER COLUMN "created_at" SET DEFAULT '"2025-05-12T10:39:17.511Z"'`);
        await queryRunner.query(`ALTER TABLE "batch_activity" ALTER COLUMN "updated_at" SET DEFAULT '"2025-05-12T10:39:17.511Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_activity" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.668'`);
        await queryRunner.query(`ALTER TABLE "batch_activity" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.668'`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "date" SET DEFAULT '2025-05-12 03:15:03.65'`);
        await queryRunner.query(`ALTER TABLE "enquiry_type" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.641'`);
        await queryRunner.query(`ALTER TABLE "enquiry_type" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.641'`);
        await queryRunner.query(`ALTER TABLE "compensation_student_history" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.608'`);
        await queryRunner.query(`ALTER TABLE "compensation_student_history" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.608'`);
        await queryRunner.query(`ALTER TABLE "compensation_batch_history" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.598'`);
        await queryRunner.query(`ALTER TABLE "compensation_batch_history" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.598'`);
        await queryRunner.query(`ALTER TABLE "bank_detail" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.585'`);
        await queryRunner.query(`ALTER TABLE "assignments" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.557'`);
        await queryRunner.query(`ALTER TABLE "assignments" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.557'`);
        await queryRunner.query(`CREATE TYPE "public"."student_batch_status_enum_old" AS ENUM('ongoing', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" TYPE "public"."student_batch_status_enum_old" USING "status"::"text"::"public"."student_batch_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "student_batch" ALTER COLUMN "status" SET DEFAULT 'ongoing'`);
        await queryRunner.query(`DROP TYPE "public"."student_batch_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."student_batch_status_enum_old" RENAME TO "student_batch_status_enum"`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.476'`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.476'`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.45'`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.45'`);
        await queryRunner.query(`ALTER TABLE "teachers" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.426'`);
        await queryRunner.query(`ALTER TABLE "teachers" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.426'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.405'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.405'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 03:15:03.396'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 03:15:03.396'`);
    }

}
