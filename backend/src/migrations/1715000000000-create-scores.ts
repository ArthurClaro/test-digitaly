import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScores1715000000000 implements MigrationInterface {
  name = 'CreateScores1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "scores_board_size_enum" AS ENUM ('9x9', '16x16', '30x16')`,
    );

    await queryRunner.query(`
      CREATE TABLE "scores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" varchar NOT NULL,
        "user_name" varchar,
        "user_avatar" varchar,
        "board_size" "scores_board_size_enum" NOT NULL,
        "time_ms" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_scores_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_scores_board_time" ON "scores" ("board_size", "time_ms" ASC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_scores_board_time"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scores"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "scores_board_size_enum"`);
  }
}
