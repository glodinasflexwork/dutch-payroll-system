-- Cleanup script for duplicate PayslipGeneration records
-- This script removes duplicate PayslipGeneration records, keeping only the oldest one for each PayrollRecord

-- Step 1: Identify and delete duplicate PayslipGeneration records
WITH ranked_payslips AS (
  SELECT 
    id,
    "payrollRecordId",
    "createdAt",
    ROW_NUMBER() OVER (
      PARTITION BY "payrollRecordId" 
      ORDER BY "createdAt" ASC
    ) as rn
  FROM "PayslipGeneration"
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_payslips 
  WHERE rn > 1
)
DELETE FROM "PayslipGeneration" 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE "PayslipGeneration" 
ADD CONSTRAINT "PayslipGeneration_payrollRecordId_key" 
UNIQUE ("payrollRecordId");

-- Step 3: Verify cleanup
SELECT 
  "payrollRecordId",
  COUNT(*) as record_count
FROM "PayslipGeneration"
GROUP BY "payrollRecordId"
HAVING COUNT(*) > 1;

-- If the above query returns no rows, cleanup was successful

