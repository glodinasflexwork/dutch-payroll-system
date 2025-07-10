/**
 * Lazy Initialization Utilities for Three-Database Architecture
 * 
 * This module provides utilities to initialize HR and Payroll database records
 * only when they are actually needed, following the lazy initialization pattern.
 */

import { hrClient, payrollClient } from './database-clients'

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
 * Initialize Payroll database for a company when first payroll is processed
 */
export async function initializePayrollDatabase(companyId: string) {
  try {
    // Check if Payroll company record already exists
    const existingPayrollCompany = await payrollClient.company.findUnique({
      where: { id: companyId }
    })

    if (existingPayrollCompany) {
      console.log(`Payroll database already initialized for company ${companyId}`)
      return existingPayrollCompany
    }

    // Create Payroll company record with 2025 Dutch social security settings
    const payrollCompany = await payrollClient.company.create({
      data: {
        id: companyId,
        // Default payroll settings
        payrollFrequency: "MONTHLY",
        payrollDayOfMonth: 25, // Standard Dutch payroll day
        // Create default tax settings for 2025
        taxSettings: {
          create: {
            year: 2025,
            // Social Security Contributions Only (NO income tax)
            // Employee contributions
            aowRate: 17.90, // AOW (State Pension)
            wlzRate: 9.65,  // WLZ (Long-term Care)
            wwRate: 2.70,   // WW (Unemployment Insurance) 
            wiaRate: 0.60,  // WIA (Disability Insurance)
            
            // Maximum contribution bases for 2025
            aowMaxBase: 40000,   // AOW maximum base
            wlzMaxBase: 40000,   // WLZ maximum base  
            wwMaxBase: 69000,    // WW maximum base
            wiaMaxBase: 69000,   // WIA maximum base
            
            // Employer contributions (additional to employee contributions)
            employerAowRate: 17.90,  // Employer AOW
            employerWlzRate: 9.65,   // Employer WLZ
            employerWwRate: 2.70,    // Employer WW
            employerWiaRate: 0.60,   // Employer WIA
            employerAwfRate: 0.58,   // AWF (Unemployment Fund)
            employerAofRate: 0.17,   // AOF (Occupational Disability Fund)
            employerZvwRate: 6.75,   // ZVW (Health Insurance Employer Contribution)
            
            // Holiday allowance
            holidayAllowanceRate: 8.33, // Standard 8.33%
            
            isActive: true
          }
        }
      },
      include: {
        taxSettings: true
      }
    })

    console.log(`Payroll database initialized for company ${companyId}`)
    return payrollCompany

  } catch (error) {
    console.error(`Error initializing Payroll database for company ${companyId}:`, error)
    throw new Error(`Failed to initialize Payroll database: ${error}`)
  }
}

/**
 * Ensure HR database is initialized before HR operations
 */
export async function ensureHRInitialized(companyId: string) {
  return await initializeHRDatabase(companyId)
}

/**
 * Ensure Payroll database is initialized before payroll operations  
 */
export async function ensurePayrollInitialized(companyId: string) {
  return await initializePayrollDatabase(companyId)
}

/**
 * Get company initialization status across all databases
 */
export async function getCompanyInitializationStatus(companyId: string) {
  try {
    const [hrInitialized, payrollInitialized] = await Promise.all([
      hrClient.company.findUnique({ where: { id: companyId } }).then(c => !!c),
      payrollClient.company.findUnique({ where: { id: companyId } }).then(c => !!c)
    ])

    return {
      companyId,
      hrInitialized,
      payrollInitialized,
      fullyInitialized: hrInitialized && payrollInitialized
    }
  } catch (error) {
    console.error(`Error checking initialization status for company ${companyId}:`, error)
    return {
      companyId,
      hrInitialized: false,
      payrollInitialized: false,
      fullyInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

