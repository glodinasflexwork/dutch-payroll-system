-- Add Dutch payroll compliance fields to Employee model
-- Based on Dutch tax research 2025 and official Belastingdienst requirements

ALTER TABLE "Employee" ADD COLUMN "taxTable" TEXT DEFAULT 'wit';
ALTER TABLE "Employee" ADD COLUMN "taxCredit" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Employee" ADD COLUMN "payrollTaxNumber" TEXT;
ALTER TABLE "Employee" ADD COLUMN "holidayAllowance" DOUBLE PRECISION DEFAULT 8.33;
ALTER TABLE "Employee" ADD COLUMN "holidayDays" INTEGER DEFAULT 25;
ALTER TABLE "Employee" ADD COLUMN "pensionScheme" TEXT;
ALTER TABLE "Employee" ADD COLUMN "isDGA" BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN "Employee"."taxTable" IS 'Dutch tax table: wit (standard) or groen (reduced)';
COMMENT ON COLUMN "Employee"."taxCredit" IS 'Dutch tax credit amount in euros';
COMMENT ON COLUMN "Employee"."payrollTaxNumber" IS 'Dutch payroll tax number (loonheffingennummer)';
COMMENT ON COLUMN "Employee"."holidayAllowance" IS 'Holiday allowance percentage (8.33% Dutch legal requirement)';
COMMENT ON COLUMN "Employee"."holidayDays" IS 'Annual holiday days entitlement (25 days Dutch minimum)';
COMMENT ON COLUMN "Employee"."pensionScheme" IS 'Pension scheme information';
COMMENT ON COLUMN "Employee"."isDGA" IS 'Director-major shareholder flag (Directeur Grootaandeelhouder)';

