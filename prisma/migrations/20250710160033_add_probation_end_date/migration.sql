-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Netherlands',
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'Dutch',
ADD COLUMN     "probationEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TaxSettings" ADD COLUMN     "zvwRate" DOUBLE PRECISION NOT NULL DEFAULT 5.65;
