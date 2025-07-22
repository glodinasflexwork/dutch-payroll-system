-- AlterTable: Add working days fields to Contract model
ALTER TABLE "Contract" ADD COLUMN "workingHoursPerWeek" FLOAT;
ALTER TABLE "Contract" ADD COLUMN "workingDaysPerWeek" FLOAT;
ALTER TABLE "Contract" ADD COLUMN "workSchedule" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Contract"."workingHoursPerWeek" IS 'Override company default working hours';
COMMENT ON COLUMN "Contract"."workingDaysPerWeek" IS 'Number of working days per week (e.g., 5.0, 4.5, 3.0)';
COMMENT ON COLUMN "Contract"."workSchedule" IS 'Working schedule description (e.g., "Monday-Friday", "Flexible")';

