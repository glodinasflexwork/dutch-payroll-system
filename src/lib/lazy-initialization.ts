/**
 * Lazy Initialization Utilities for Three-Database Architecture
 * 
 * This module provides utilities to initialize HR and Payroll database records
 * only when they are actually needed, following the lazy initialization pattern.
 * 
 * SYSTEM-WIDE FIX: Robust initialization that works for ALL companies
 */

import { getHRClient, getAuthClient } from './database-clients'

/**
 * System-wide robust HR database initialization
 * Handles all edge cases and ensures proper initialization for ANY company
 */
export async function initializeHRDatabase(companyId: string) {
  try {
    console.log(`🔄 Starting HR database initialization for company: ${companyId}`)

    // Step 1: Check if HR company record already exists
    const hrClient = await getHRClient()
    const existingHRCompany = await hrClient.company.findUnique({
      where: { id: companyId },
      include: {
        leaveTypes: true
      }
    })

    if (existingHRCompany) {
      console.log(`✅ HR database already initialized for company ${companyId}`)
      
      // Validate existing data and fix if needed
      const validationResult = await validateAndFixHRCompany(existingHRCompany)
      if (validationResult.fixed) {
        console.log(`🔧 Fixed HR database issues for company ${companyId}`)
        return validationResult.company
      }
      
      return existingHRCompany
    }

    // Step 2: Get company name from auth database for proper initialization
    let companyName = "Company" // Default fallback
    try {
      const authClient = await getAuthClient()
      const authCompany = await authClient.company.findUnique({
        where: { id: companyId },
        select: { name: true }
      })
      
      if (authCompany?.name) {
        companyName = authCompany.name
      }
    } catch (authError) {
      console.warn(`⚠️ Could not fetch company name from auth database: ${authError}`)
      // Continue with default name - this is not a critical failure
    }

    // Step 3: Create HR company record with comprehensive error handling
    console.log(`🏗️ Creating HR database record for company: ${companyName}`)
    
    const hrCompany = await createHRCompanyWithRetry(companyId, companyName)
    
    console.log(`✅ HR database successfully initialized for company ${companyId}`)
    return hrCompany

  } catch (error) {
    console.error(`❌ Critical error initializing HR database for company ${companyId}:`, error)
    
    // Enhanced error handling with recovery attempts
    const recoveryResult = await attemptHRDatabaseRecovery(companyId, error)
    if (recoveryResult.success) {
      console.log(`🔄 Successfully recovered HR database for company ${companyId}`)
      return recoveryResult.company
    }
    
    throw new Error(`Failed to initialize HR database for company ${companyId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Create HR company with retry logic and comprehensive error handling
 */
async function createHRCompanyWithRetry(companyId: string, companyName: string, maxRetries = 3) {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 HR company creation attempt ${attempt}/${maxRetries}`)
      
      // Use transaction to ensure atomicity
      const hrCompany = await getHRClient().$transaction(async (tx) => {
        // Create company with all required fields
        const company = await tx.company.create({
          data: {
            id: companyId,
            name: companyName,
            // Default HR settings
            workingHoursPerWeek: 40,
            holidayAllowancePercentage: 8.33, // Standard Dutch holiday allowance
            probationPeriodMonths: 2,
            noticePeriodDays: 30,
            // Leave settings
            annualLeaveEntitlement: 25, // Standard Dutch annual leave
            sickLeavePolicy: "STATUTORY", // Follow Dutch statutory sick leave
          }
        })

        // Create default leave types separately to avoid nested transaction issues
        const leaveTypes = await Promise.all([
          tx.leaveType.create({
            data: {
              name: "Annual Leave",
              code: "ANNUAL",
              isPaid: true,
              maxDaysPerYear: 25,
              carryOverDays: 5,
              isActive: true,
              companyId: companyId
            }
          }),
          tx.leaveType.create({
            data: {
              name: "Sick Leave", 
              code: "SICK",
              isPaid: true,
              maxDaysPerYear: 365,
              carryOverDays: 0,
              isActive: true,
              companyId: companyId
            }
          }),
          tx.leaveType.create({
            data: {
              name: "Maternity Leave",
              code: "MATERNITY", 
              isPaid: true,
              maxDaysPerYear: 112, // 16 weeks
              carryOverDays: 0,
              isActive: true,
              companyId: companyId
            }
          }),
          tx.leaveType.create({
            data: {
              name: "Paternity Leave",
              code: "PATERNITY",
              isPaid: true, 
              maxDaysPerYear: 35, // 5 weeks
              carryOverDays: 0,
              isActive: true,
              companyId: companyId
            }
          })
        ])

        return {
          ...company,
          leaveTypes
        }
      })

      console.log(`✅ HR company created successfully on attempt ${attempt}`)
      return hrCompany

    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️ HR company creation attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Failed to create HR company after all retries')
}

/**
 * Validate existing HR company data and fix issues
 */
async function validateAndFixHRCompany(hrCompany: any) {
  let needsFix = false
  const issues: string[] = []

  // Check for missing or invalid company name
  if (!hrCompany.name || hrCompany.name.trim() === '' || hrCompany.name === 'Company') {
    issues.push('Invalid company name')
    needsFix = true
  }

  // Check for missing leave types
  if (!hrCompany.leaveTypes || hrCompany.leaveTypes.length === 0) {
    issues.push('Missing leave types')
    needsFix = true
  }

  // Check for leave types without proper companyId
  const invalidLeaveTypes = hrCompany.leaveTypes?.filter((lt: any) => 
    !lt.companyId || lt.companyId !== hrCompany.id
  ) || []
  
  if (invalidLeaveTypes.length > 0) {
    issues.push(`${invalidLeaveTypes.length} leave types with invalid companyId`)
    needsFix = true
  }

  if (!needsFix) {
    return { fixed: false, company: hrCompany }
  }

  console.log(`🔧 Fixing HR company issues: ${issues.join(', ')}`)

  try {
    // Fix the issues
    const fixedCompany = await getHRClient().$transaction(async (tx) => {
      // Update company name if needed
      let updatedCompany = hrCompany
      if (issues.includes('Invalid company name')) {
        try {
          const authClient = await getAuthClient()
          const authCompany = await authClient.company.findUnique({
            where: { id: hrCompany.id },
            select: { name: true }
          })
          
          if (authCompany?.name) {
            updatedCompany = await tx.company.update({
              where: { id: hrCompany.id },
              data: { name: authCompany.name }
            })
          }
        } catch (error) {
          console.warn('Could not update company name:', error)
        }
      }

      // Fix or create missing leave types
      if (issues.includes('Missing leave types') || invalidLeaveTypes.length > 0) {
        // Delete invalid leave types
        if (invalidLeaveTypes.length > 0) {
          await tx.leaveType.deleteMany({
            where: {
              id: { in: invalidLeaveTypes.map((lt: any) => lt.id) }
            }
          })
        }

        // Ensure all required leave types exist
        const requiredLeaveTypes = [
          { name: "Annual Leave", code: "ANNUAL", maxDaysPerYear: 25, carryOverDays: 5 },
          { name: "Sick Leave", code: "SICK", maxDaysPerYear: 365, carryOverDays: 0 },
          { name: "Maternity Leave", code: "MATERNITY", maxDaysPerYear: 112, carryOverDays: 0 },
          { name: "Paternity Leave", code: "PATERNITY", maxDaysPerYear: 35, carryOverDays: 0 }
        ]

        const existingCodes = hrCompany.leaveTypes
          ?.filter((lt: any) => lt.companyId === hrCompany.id)
          ?.map((lt: any) => lt.code) || []

        for (const leaveType of requiredLeaveTypes) {
          if (!existingCodes.includes(leaveType.code)) {
            await tx.leaveType.create({
              data: {
                ...leaveType,
                isPaid: true,
                isActive: true,
                companyId: hrCompany.id
              }
            })
          }
        }
      }

      // Return updated company with leave types
      return await tx.company.findUnique({
        where: { id: hrCompany.id },
        include: { leaveTypes: true }
      })
    })

    return { fixed: true, company: fixedCompany }

  } catch (error) {
    console.error('Failed to fix HR company issues:', error)
    return { fixed: false, company: hrCompany }
  }
}

/**
 * Attempt to recover from HR database initialization errors
 */
async function attemptHRDatabaseRecovery(companyId: string, originalError: any) {
  console.log(`🔄 Attempting HR database recovery for company ${companyId}`)

  try {
    // Check if the company was partially created
    const hrClient = await getHRClient()
    const partialCompany = await hrClient.company.findUnique({
      where: { id: companyId },
      include: { leaveTypes: true }
    })

    if (partialCompany) {
      console.log(`🔧 Found partial company record, attempting to fix...`)
      const validationResult = await validateAndFixHRCompany(partialCompany)
      if (validationResult.fixed || validationResult.company) {
        return { success: true, company: validationResult.company }
      }
    }

    // If no partial record, try to clean up and recreate
    console.log(`🧹 Cleaning up any partial data and recreating...`)
    
    const hrClient2 = await getHRClient()
    // Clean up any orphaned leave types
    await hrClient2.leaveType.deleteMany({
      where: { companyId: companyId }
    })

    // Clean up partial company record
    await hrClient2.company.deleteMany({
      where: { id: companyId }
    })

    // Try to recreate
    const recoveredCompany = await createHRCompanyWithRetry(companyId, "Company", 1)
    return { success: true, company: recoveredCompany }

  } catch (recoveryError) {
    console.error(`❌ HR database recovery failed:`, recoveryError)
    return { success: false, error: recoveryError }
  }
}

/**
 * Ensure HR database is initialized before HR operations
 * This is the main entry point that should be called before any HR operations
 */
export async function ensureHRInitialized(companyId: string) {
  return await initializeHRDatabase(companyId)
}

/**
 * Get company initialization status for HR database
 */
export async function getCompanyInitializationStatus(companyId: string) {
  try {
    const hrClient = await getHRClient()
    const hrCompany = await hrClient.company.findUnique({ 
      where: { id: companyId },
      include: { leaveTypes: true }
    })

    const hrInitialized = !!hrCompany
    const hasValidLeaveTypes = hrCompany?.leaveTypes && hrCompany.leaveTypes.length >= 4
    const fullyInitialized = hrInitialized && hasValidLeaveTypes

    return {
      companyId,
      hrInitialized,
      hasValidLeaveTypes,
      fullyInitialized,
      leaveTypesCount: hrCompany?.leaveTypes?.length || 0
    }
  } catch (error) {
    console.error(`Error checking initialization status for company ${companyId}:`, error)
    return {
      companyId,
      hrInitialized: false,
      hasValidLeaveTypes: false,
      fullyInitialized: false,
      leaveTypesCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Initialize Payroll database for a company when first payroll is processed
 */
export async function initializePayrollDatabase(companyId: string) {
  try {
    console.log(`Payroll database initialization requested for company ${companyId}`)
    // For now, this is a placeholder since we don't have a separate payroll client
    // In a full implementation, this would initialize payroll-specific tables
    return { companyId, initialized: true }
  } catch (error) {
    console.error(`Error initializing Payroll database for company ${companyId}:`, error)
    throw new Error(`Failed to initialize Payroll database: ${error}`)
  }
}

/**
 * Ensure Payroll database is initialized before payroll operations
 */
export async function ensurePayrollInitialized(companyId: string) {
  return await initializePayrollDatabase(companyId)
}

