-- Restructure Dutch payroll fields: Move company-level fields to Company model
-- and keep only individual-level fields in Employee model

-- Add company-level Dutch payroll fields to Company model
ALTER TABLE "Company" ADD COLUMN "payrollTaxNumber" TEXT;
ALTER TABLE "Company" ADD COLUMN "pensionScheme" TEXT;

-- Remove company-level fields from Employee model (keep individual fields)
ALTER TABLE "Employee" DROP COLUMN IF EXISTS "payrollTaxNumber";
ALTER TABLE "Employee" DROP COLUMN IF EXISTS "holidayAllowance";
ALTER TABLE "Employee" DROP COLUMN IF EXISTS "holidayDays";
ALTER TABLE "Employee" DROP COLUMN IF EXISTS "pensionScheme";

-- Keep individual-level fields in Employee model:
-- - taxTable (individual tax circumstances)
-- - taxCredit (individual tax credit)
-- - isDGA (individual director-major shareholder status)

-- Add comments for documentation
COMMENT ON COLUMN "Company"."payrollTaxNumber" IS 'Company payroll tax number (loonheffingennummer) - one per company';
COMMENT ON COLUMN "Company"."pensionScheme" IS 'Company pension scheme - applies to all employees';
COMMENT ON COLUMN "Company"."holidayAllowancePercentage" IS 'Company holiday allowance policy (default 8.33%)';
COMMENT ON COLUMN "Company"."annualLeaveEntitlement" IS 'Company annual leave policy (default 25 days)';

COMMENT ON COLUMN "Employee"."taxTable" IS 'Individual tax table: wit (standard) or groen (reduced)';
COMMENT ON COLUMN "Employee"."taxCredit" IS 'Individual tax credit amount in euros';
COMMENT ON COLUMN "Employee"."isDGA" IS 'Individual Director-major shareholder status (Directeur Grootaandeelhouder)';

