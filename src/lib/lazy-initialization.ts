/**
 * Lazy Initialization Utilities for Three-Database Architecture
 * 
 * This module provides utilities to initialize HR and Payroll database records
 * only when they are actually needed, following the lazy initialization pattern.
 */

import { hrClient } from './database-clients'

/**
 * Initialize HR database for a company when first employee is added
 */
export async function initializeHRDatabase(companyId: string) {
  try {
    // Check if HR company record already exists
    const existingHRCompany = await hrClient.company.findUnique({
      where: { id: companyId }
    })

    if (existingHRCompany) {
      console.log(`HR database already initialized for company ${companyId}`)
      return existingHRCompany
    }

    // Create HR company record with default settings
    const hrCompany = await hrClient.company.create({
      data: {
        id: companyId,
        // Default HR settings
        workingHoursPerWeek: 40,
        holidayAllowancePercentage: 8.33, // Standard Dutch holiday allowance
        probationPeriodMonths: 2,
        noticePeriodDays: 30,
        // Leave settings
        annualLeaveEntitlement: 25, // Standard Dutch annual leave
        sickLeavePolicy: "STATUTORY", // Follow Dutch statutory sick leave
        // Default leave types
        leaveTypes: {
          create: [
            {
              name: "Annual Leave",
              code: "ANNUAL",
              isPaid: true,
              maxDaysPerYear: 25,
              carryOverDays: 5,
              isActive: true
            },
            {
              name: "Sick Leave", 
              code: "SICK",
              isPaid: true,
              maxDaysPerYear: 365,
              carryOverDays: 0,
              isActive: true
            },
            {
              name: "Maternity Leave",
              code: "MATERNITY", 
              isPaid: true,
              maxDaysPerYear: 112, // 16 weeks
              carryOverDays: 0,
              isActive: true
            },
            {
              name: "Paternity Leave",
              code: "PATERNITY",
              isPaid: true, 
              maxDaysPerYear: 35, // 5 weeks
              carryOverDays: 0,
              isActive: true
            }
          ]
        }
      },
      include: {
        leaveTypes: true
      }
    })

    console.log(`HR database initialized for company ${companyId}`)
    return hrCompany

  } catch (error) {
    console.error(`Error initializing HR database for company ${companyId}:`, error)
    throw new Error(`Failed to initialize HR database: ${error}`)
  }
}

/**
 * Ensure HR database is initialized before HR operations
 */
export async function ensureHRInitialized(companyId: string) {
  return await initializeHRDatabase(companyId)
}

/**
 * Get company initialization status for HR database
 */
export async function getCompanyInitializationStatus(companyId: string) {
  try {
    const hrInitialized = await hrClient.company.findUnique({ where: { id: companyId } }).then(c => !!c)

    return {
      companyId,
      hrInitialized,
      fullyInitialized: hrInitialized
    }
  } catch (error) {
    console.error(`Error checking initialization status for company ${companyId}:`, error)
    return {
      companyId,
      hrInitialized: false,
      fullyInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

