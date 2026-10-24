-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('available', 'busy', 'unavailable', 'maintenance');

-- AlterTable
ALTER TABLE "Place" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Place" ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Place" ADD COLUMN "status" "PlaceStatus" NOT NULL DEFAULT 'unavailable';
ALTER TABLE "Place" ADD COLUMN "openingHours" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Place" ADD COLUMN "powerKw" INTEGER;
ALTER TABLE "Place" ADD COLUMN "connectors" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "Place" ALTER COLUMN "address" DROP DEFAULT;
ALTER TABLE "Place" ALTER COLUMN "rating" DROP DEFAULT;
ALTER TABLE "Place" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Place" ALTER COLUMN "openingHours" DROP DEFAULT;
