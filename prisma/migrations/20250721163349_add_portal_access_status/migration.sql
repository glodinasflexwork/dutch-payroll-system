/*
  Warnings:

  - You are about to drop the `EmployeePortalAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmployeePortalAccess" DROP CONSTRAINT "EmployeePortalAccess_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePortalAccess" DROP CONSTRAINT "EmployeePortalAccess_employeeId_fkey";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "portalAccessStatus" TEXT NOT NULL DEFAULT 'NO_ACCESS';

-- DropTable
DROP TABLE "EmployeePortalAccess";
