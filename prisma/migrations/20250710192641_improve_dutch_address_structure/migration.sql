/*
  Warnings:

  - You are about to drop the `ComplianceReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CostCenter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialAudit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayslipGeneration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxCalculation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PayrollRecord" DROP CONSTRAINT "PayrollRecord_batchId_fkey";

-- DropForeignKey
ALTER TABLE "PayslipGeneration" DROP CONSTRAINT "PayslipGeneration_payrollRecordId_fkey";

-- DropForeignKey
ALTER TABLE "TaxCalculation" DROP CONSTRAINT "TaxCalculation_payrollRecordId_fkey";

-- DropTable
DROP TABLE "ComplianceReport";

-- DropTable
DROP TABLE "CostCenter";

-- DropTable
DROP TABLE "FinancialAudit";

-- DropTable
DROP TABLE "PayrollAnalytics";

-- DropTable
DROP TABLE "PayrollBatch";

-- DropTable
DROP TABLE "PayrollRecord";

-- DropTable
DROP TABLE "PayslipGeneration";

-- DropTable
DROP TABLE "TaxCalculation";

-- DropTable
DROP TABLE "TaxSettings";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "streetName" TEXT,
    "houseNumber" TEXT,
    "houseNumberAddition" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "nationality" TEXT NOT NULL DEFAULT 'Dutch',
    "bsn" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "probationEndDate" TIMESTAMP(3),
    "position" TEXT NOT NULL,
    "department" TEXT,
    "employmentType" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "workingHours" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "workingDays" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "level" TEXT,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "maxDays" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "breakTime" DOUBLE PRECISION DEFAULT 0,
    "totalHours" DOUBLE PRECISION,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "goals" JSONB,
    "achievements" JSONB,
    "feedback" TEXT,
    "rating" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_bsn_key" ON "Employee"("companyId", "bsn");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_employeeNumber_key" ON "Employee"("companyId", "employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_companyId_name_key" ON "Department"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_companyId_title_key" ON "Position"("companyId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_companyId_name_key" ON "LeaveType"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_employeeId_date_key" ON "TimeEntry"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeHistory" ADD CONSTRAINT "EmployeeHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
