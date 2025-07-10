/*
  Warnings:

  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRecord" DROP CONSTRAINT "PayrollRecord_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRecord" DROP CONSTRAINT "PayrollRecord_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "TaxSettings" DROP CONSTRAINT "TaxSettings_companyId_fkey";

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "PayrollRecord";

-- DropTable
DROP TABLE "TaxSettings";
