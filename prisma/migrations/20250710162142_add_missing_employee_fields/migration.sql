/*
  Warnings:

  - Added the required column `contractType` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "contractType" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "holidayAllowance" DOUBLE PRECISION NOT NULL DEFAULT 8.33,
ADD COLUMN     "holidayDays" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "isDGA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payrollTaxNumber" TEXT,
ADD COLUMN     "pensionScheme" TEXT,
ADD COLUMN     "salaryType" TEXT NOT NULL DEFAULT 'monthly',
ADD COLUMN     "taxCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "workingDays" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "workingHours" DOUBLE PRECISION NOT NULL DEFAULT 40;
