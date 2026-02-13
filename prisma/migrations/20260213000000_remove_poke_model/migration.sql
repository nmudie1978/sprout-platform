-- DropForeignKey
ALTER TABLE "Poke" DROP CONSTRAINT IF EXISTS "Poke_employerId_fkey";
ALTER TABLE "Poke" DROP CONSTRAINT IF EXISTS "Poke_youthId_fkey";
ALTER TABLE "Poke" DROP CONSTRAINT IF EXISTS "Poke_jobId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Poke";

-- DropEnum
DROP TYPE IF EXISTS "PokeStatus";
