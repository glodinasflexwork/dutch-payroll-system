import { hrClient } from "@/lib/database-clients"

export interface WorkingSchedule {
  workingHoursPerWeek: number
  workingDaysPerWeek: number
  workSchedule: string
  contractId?: string
  effectiveFrom?: Date
}

export interface EmployeeWorkingSchedule extends WorkingSchedule {
  employeeId: string
  employeeName: string
  isCurrentContract: boolean
}

/**
 * Get the current working schedule for an employee based on their active contract
 */
export async function getCurrentWorkingSchedule(employeeId: string, companyId: string): Promise<WorkingSchedule | null> {
  try {
    // Get the most recent active employment contract
    const contract = await hrClient.contract.findFirst({
      where: {
        employeeId,
        companyId,
        contractType: 'employment',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!contract) {
      // Fallback to company defaults if no contract found
      const company = await hrClient.company.findUnique({
        where: { id: companyId }
      })

      if (!company) return null

      return {
        workingHoursPerWeek: company.workingHoursPerWeek,
        workingDaysPerWeek: 5, // Default assumption
        workSchedule: 'Monday-Friday'
      }
    }

    return {
      workingHoursPerWeek: contract.workingHoursPerWeek || 40,
      workingDaysPerWeek: contract.workingDaysPerWeek || 5,
      workSchedule: contract.workSchedule || 'Monday-Friday',
      contractId: contract.id,
      effectiveFrom: contract.createdAt
    }
  } catch (error) {
    console.error('Error getting current working schedule:', error)
    return null
  }
}

/**
 * Get working schedule history for an employee
 */
export async function getWorkingScheduleHistory(employeeId: string, companyId: string): Promise<WorkingSchedule[]> {
  try {
    const contracts = await hrClient.contract.findMany({
      where: {
        employeeId,
        companyId,
        contractType: 'employment'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return contracts.map(contract => ({
      workingHoursPerWeek: contract.workingHoursPerWeek || 40,
      workingDaysPerWeek: contract.workingDaysPerWeek || 5,
      workSchedule: contract.workSchedule || 'Monday-Friday',
      contractId: contract.id,
      effectiveFrom: contract.createdAt
    }))
  } catch (error) {
    console.error('Error getting working schedule history:', error)
    return []
  }
}

/**
 * Get working schedules for all employees in a company
 */
export async function getCompanyWorkingSchedules(companyId: string): Promise<EmployeeWorkingSchedule[]> {
  try {
    const employees = await hrClient.employee.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: {
        contracts: {
          where: {
            contractType: 'employment',
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    const company = await hrClient.company.findUnique({
      where: { id: companyId }
    })

    return employees.map(employee => {
      const contract = employee.contracts[0]
      
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        workingHoursPerWeek: contract?.workingHoursPerWeek || company?.workingHoursPerWeek || 40,
        workingDaysPerWeek: contract?.workingDaysPerWeek || 5,
        workSchedule: contract?.workSchedule || 'Monday-Friday',
        contractId: contract?.id,
        effectiveFrom: contract?.createdAt,
        isCurrentContract: !!contract
      }
    })
  } catch (error) {
    console.error('Error getting company working schedules:', error)
    return []
  }
}

/**
 * Calculate total working hours for a period based on working schedule
 */
export function calculateWorkingHours(
  schedule: WorkingSchedule,
  startDate: Date,
  endDate: Date
): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay)
  const totalWeeks = totalDays / 7
  
  return totalWeeks * schedule.workingHoursPerWeek
}

/**
 * Calculate working days for a period based on working schedule
 */
export function calculateWorkingDays(
  schedule: WorkingSchedule,
  startDate: Date,
  endDate: Date
): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay)
  const totalWeeks = totalDays / 7
  
  return totalWeeks * schedule.workingDaysPerWeek
}

/**
 * Validate working schedule data
 */
export function validateWorkingSchedule(schedule: Partial<WorkingSchedule>): string[] {
  const errors: string[] = []

  if (schedule.workingHoursPerWeek !== undefined) {
    if (schedule.workingHoursPerWeek < 0 || schedule.workingHoursPerWeek > 60) {
      errors.push('Working hours per week must be between 0 and 60')
    }
  }

  if (schedule.workingDaysPerWeek !== undefined) {
    if (schedule.workingDaysPerWeek < 0 || schedule.workingDaysPerWeek > 7) {
      errors.push('Working days per week must be between 0 and 7')
    }
  }

  if (schedule.workingHoursPerWeek && schedule.workingDaysPerWeek) {
    const hoursPerDay = schedule.workingHoursPerWeek / schedule.workingDaysPerWeek
    if (hoursPerDay > 12) {
      errors.push('Working hours per day cannot exceed 12 hours (Dutch labor law)')
    }
  }

  return errors
}

/**
 * Get common working schedule presets for Dutch companies
 */
export function getWorkingSchedulePresets(): Array<{
  name: string
  description: string
  workingHoursPerWeek: number
  workingDaysPerWeek: number
  workSchedule: string
}> {
  return [
    {
      name: 'Full-time (40 hours)',
      description: 'Standard full-time employment',
      workingHoursPerWeek: 40,
      workingDaysPerWeek: 5,
      workSchedule: 'Monday-Friday'
    },
    {
      name: 'Part-time (32 hours)',
      description: '4-day work week',
      workingHoursPerWeek: 32,
      workingDaysPerWeek: 4,
      workSchedule: 'Monday-Thursday'
    },
    {
      name: 'Part-time (24 hours)',
      description: '3-day work week',
      workingHoursPerWeek: 24,
      workingDaysPerWeek: 3,
      workSchedule: 'Monday-Wednesday'
    },
    {
      name: 'Part-time (20 hours)',
      description: 'Half-time employment',
      workingHoursPerWeek: 20,
      workingDaysPerWeek: 2.5,
      workSchedule: 'Monday-Tuesday + Wednesday morning'
    },
    {
      name: 'Flexible (36 hours)',
      description: 'Flexible working arrangement',
      workingHoursPerWeek: 36,
      workingDaysPerWeek: 4.5,
      workSchedule: 'Flexible'
    }
  ]
}

