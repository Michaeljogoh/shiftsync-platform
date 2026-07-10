import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuth1773770000000 implements MigrationInterface {
  name = 'AddGoogleOAuth1773770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL`,
    );

    await queryRunner.query(`
      CREATE TABLE "auth_identities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "provider" character varying(32) NOT NULL,
        "providerAccountId" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        CONSTRAINT "PK_auth_identities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auth_identities_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_auth_identities_provider_account" ON "auth_identities" ("provider", "providerAccountId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_identities_userId" ON "auth_identities" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_auth_identities_userId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_auth_identities_provider_account"`,
    );
    await queryRunner.query(`DROP TABLE "auth_identities"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL`,
    );
  }
}
