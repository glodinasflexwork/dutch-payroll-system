import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRClient, getAuthClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { ensureHRInitialized } from "@/lib/lazy-initialization"
import { withCache, cacheKeys, invalidateCache } from "@/lib/cache-utils"

/**
 * Generate a unique employee number for a company using a robust approach
 * This function handles race conditions and ensures uniqueness within the company
 */
async function generateUniqueEmployeeNumber(companyId: string, maxRetries: number = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get all existing employee numbers for this company to find gaps
      const existingEmployees = await getHRClient().employee.findMany({
        where: { companyId },
        select: { employeeNumber: true },
        orderBy: { employeeNumber: 'asc' }
      })
      
      // Extract numeric parts and find the next available number
      const existingNumbers = new Set<number>()
      
      for (const emp of existingEmployees) {
        const match = emp.employeeNumber.match(/EMP0*(\d+)/)
        if (match) {
          existingNumbers.add(parseInt(match[1]))
        }
      }
      
      // Find the first available number starting from 1
      let nextNumber = 1
      while (existingNumbers.has(nextNumber)) {
        nextNumber++
      }
      
      // Generate the employee number with proper padding
      const employeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`
      
      console.log(`Generated employee number: ${employeeNumber} for company: ${companyId}`)
      
      // Double-check that this number doesn't exist (handles race conditions)
      const existing = await getHRClient().employee.findFirst({
        where: { 
          employeeNumber,
          companyId 
        }
      })
      
      if (!existing) {
        return employeeNumber
      }
      
      // If it exists, log and try again
      console.log(`Employee number ${employeeNumber} already exists, retrying...`)
      
    } catch (error) {
      console.error(`Error generating employee number (attempt ${attempt + 1}):`, error)
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed to generate unique employee number after ${maxRetries} attempts`)
      }
      
      // Wait a bit before retrying to reduce race condition likelihood
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
    }
  }
  
  throw new Error(`Failed to generate unique employee number after ${maxRetries} attempts`)
}

// GET /api/employees - Get all employees for the current company
export async function GET(request: NextRequest) {
  try {
    console.log('=== EMPLOYEES GET API START ===')
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({
        success: false,
        error: "No company selected"
      }, { status: 400 })
    }

    const companyId = session.user.companyId
    console.log('Authentication successful, fetching employees for company:', companyId)

    // Validate subscription (with error handling)
    try {
      const subscriptionValidation = await validateSubscription(companyId)
      console.log("Subscription validation:", subscriptionValidation)
      if (!subscriptionValidation.isValid) {
        return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
      }
    } catch (subError) {
      console.log("Subscription validation error (continuing):", subError)
      // Continue without subscription validation for now
    }

    // Ensure HR database is initialized AFTER subscription validation
    await ensureHRInitialized(companyId)

    // Use cache wrapper for employee data
    const cacheKey = cacheKeys.employeeList(companyId)
    const result = await withCache(cacheKey, async () => {
      // Use robust HR client connection with optimized query
      const hrClientInstance = await getHRClient()
      const employees = await hrClientInstance.employee.findMany({
        where: {
          companyId: companyId,
          isActive: true
        },
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          position: true,
          department: true,
          employmentType: true,
          salary: true,
          hourlyRate: true,
          startDate: true,
          isActive: true,
          bsn: true,
          taxTable: true,
          // Only select fields needed for employee list
          // Exclude heavy fields like addresses, emergency contacts, etc.
        },
        orderBy: {
          employeeNumber: 'asc'
        }
      })

      return {
        employees,
        count: employees.length
      }
    }, 3) // Cache for 3 minutes

    console.log('Found employees:', result.count)

    return NextResponse.json({
      success: true,
      employees: result.employees,
      Company: {
        id: companyId,
        name: session.user.companyName || "Your Company"
      },
      subscription: {
        plan: subscriptionValidation?.subscription?.plan?.name,
        limits: subscriptionValidation?.limits
      }
    })
  } catch (error) {
    console.error("=== EMPLOYEES GET API ERROR ===")
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create a new employee with comprehensive Dutch payroll fields
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({
        success: false,
        error: "No company selected"
      }, { status: 400 })
    }

    const companyId = session.user.companyId
    const userId = session.user.id

    // STEP 1: Validate subscription FIRST before any resource allocation
    console.log('Validating subscription for company:', companyId)
    const subscriptionValidation = await validateSubscription(companyId)
    
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ 
        error: subscriptionValidation.message || 'Invalid subscription' 
      }, { status: 403 })
    }

    // STEP 2: Validate feature access for employee management
    if (!subscriptionValidation.limits?.features.employees) {
      return NextResponse.json({ 
        error: 'Employee management not included in your subscription plan' 
      }, { status: 403 })
    }

    // STEP 3: Check employee limits before proceeding
    const currentEmployeeCount = await getHRClient().employee.count({
      where: { companyId: companyId, isActive: true }
    })

    if (currentEmployeeCount >= (subscriptionValidation.limits?.maxEmployees || 0)) {
      return NextResponse.json({ 
        error: `Employee limit reached (${subscriptionValidation.limits?.maxEmployees}). Please upgrade your subscription.` 
      }, { status: 403 })
    }

    // STEP 4: NOW ensure HR database is initialized (after subscription validation)
    console.log('Ensuring HR database is initialized for company:', companyId)
    await ensureHRInitialized(companyId)
    console.log('HR database initialization complete')

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'bsn', 'startDate', 'position', 'employmentType', 'contractType']
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        const errorMsg = `Missing or empty required field: ${field}`
        return NextResponse.json({
          success: false,
          error: errorMsg
        }, { status: 400 })
      }
    }
    
    // Validate BSN format (basic validation - 9 digits)
    if (!/^\d{9}$/.test(data.bsn)) {
      return NextResponse.json({
        success: false,
        error: 'BSN must be exactly 9 digits'
      }, { status: 400 })
    }
    
    // Check if BSN already exists in this company
    const existingBSN = await getHRClient().employee.findFirst({
      where: { 
        bsn: data.bsn,
        companyId: companyId
      }
    })
    
    if (existingBSN) {
      return NextResponse.json({
        success: false,
        error: 'Employee with this BSN already exists in your company'
      }, { status: 400 })
    }
    
    // Check if email already exists in this company
    const existingEmail = await getHRClient().employee.findFirst({
      where: { 
        email: data.email,
        companyId: companyId
      }
    })
    
    if (existingEmail) {
      return NextResponse.json({
        success: false,
        error: 'Employee with this email already exists in your company'
      }, { status: 400 })
    }
    
    // Generate unique employee number using a more robust approach
    let employeeNumber = data.employeeNumber
    
    if (!employeeNumber) {
      employeeNumber = await generateUniqueEmployeeNumber(companyId)
    } else {
      // If employee number is provided, validate it's unique within the company
      const existingEmployeeNumber = await getHRClient().employee.findFirst({
        where: { 
          employeeNumber: employeeNumber,
          companyId: companyId
        }
      })
      
      if (existingEmployeeNumber) {
        return NextResponse.json({
          success: false,
          error: 'Employee number already exists in your company'
        }, { status: 400 })
      }
    }
    
    // Parse dates
    const startDate = new Date(data.startDate)
    const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('1990-01-01')
    const probationEndDate = data.probationEndDate ? new Date(data.probationEndDate) : null
    
    // Validate dates
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start date format'
      }, { status: 400 })
    }
    
    if (data.dateOfBirth && isNaN(dateOfBirth.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date of birth format'
      }, { status: 400 })
    }
    
    // Validate salary information
    const salary = parseFloat(data.salary) || 0
    const hourlyRate = parseFloat(data.hourlyRate) || 0
    
    if (data.salaryType === 'monthly' && salary <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Monthly salary must be greater than 0'
      }, { status: 400 })
    }
    
    if (data.salaryType === 'hourly' && hourlyRate <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Hourly rate must be greater than 0'
      }, { status: 400 })
    }
    
    // Create new employee using a transaction for better consistency
    const employee = await getHRClient().$transaction(async (tx) => {
      // Final check for employee number uniqueness within the transaction
      const existingEmployee = await tx.employee.findFirst({
        where: { 
          employeeNumber,
          companyId: companyId
        }
      })
      
      if (existingEmployee) {
        throw new Error('Employee number already exists in your company')
      }
      
      // Create the employee
      return await tx.employee.create({
        data: {
          // Basic identification
          employeeNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          
          // Personal information
          phone: data.phone || null,
          streetName: data.streetName || null,
          houseNumber: data.houseNumber || null,
          houseNumberAddition: data.houseNumberAddition || null,
          city: data.city || null,
          postalCode: data.postalCode || null,
          country: data.country || 'Netherlands',
          bsn: data.bsn,
          nationality: data.nationality || 'Dutch',
          dateOfBirth: dateOfBirth,
          
          // Employment information
          startDate: startDate,
          probationEndDate: probationEndDate,
          position: data.position,
          department: data.department || null,
          
          // Contract information
          employmentType: data.employmentType,
          contractType: data.contractType,
          workingHours: parseFloat(data.workingHours) || 40,
          
          // Salary information
          salary: salary,
          salaryType: data.salaryType || 'monthly',
          hourlyRate: hourlyRate > 0 ? hourlyRate : null,
          
          // Dutch payroll compliance fields (individual-level only)
          taxTable: data.taxTable || 'wit',
          taxCredit: parseFloat(data.taxCredit) || 0,
          isDGA: data.isDGA || false,
          
          // Banking information
          bankAccount: data.bankAccount || null,
          bankName: data.bankName || null,
          
          // Emergency contact
          emergencyContact: data.emergencyContact || null,
          emergencyPhone: data.emergencyPhone || null,
          emergencyRelation: data.emergencyRelation || null,
          
          // Employment status
          isActive: true,
          
          // System fields
          companyId: companyId,
          createdBy: userId,
          portalAccessStatus: "NO_ACCESS", // Default to no portal access
        }
      })
    })
    
    // Handle portal invitation if requested
    if (data.sendInvitation) {
      try {
        // Update employee status to INVITED before sending invitation
        await getHRClient().employee.update({
          where: { id: employee.id },
          data: {
            portalAccessStatus: "INVITED",
            invitedAt: new Date()
          }
        });
        
        // Call the invite API
        const inviteResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/employees/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '' // Forward auth cookies
          },
          body: JSON.stringify({ employeeId: employee.id })
        });
        
        if (!inviteResponse.ok) {
          console.warn('Failed to send employee invitation, but employee was created successfully');
          // Revert the status if invitation failed
          await getHRClient().employee.update({
            where: { id: employee.id },
            data: {
              portalAccessStatus: "NO_ACCESS",
              invitedAt: null
            }
          });
        } else {
          console.log(`Portal invitation sent successfully to ${employee.email}`);
        }
      } catch (inviteError) {
        console.error('Error sending employee invitation:', inviteError);
        // Revert the status if invitation failed
        await getHRClient().employee.update({
          where: { id: employee.id },
          data: {
            portalAccessStatus: "NO_ACCESS",
            invitedAt: null
          }
        });
      }
    }
    
    console.log(`Employee created successfully: ${employee.firstName} ${employee.lastName} with ID: ${employee.id}`)
    
    // Invalidate relevant caches
    invalidateCache.employee(companyId, employee.id)
    
    return NextResponse.json({
      success: true,
      employee: employee,
      message: 'Employee created successfully with Dutch payroll compliance fields'
    }, { status: 201 })
    
  } catch (error) {
    const errorMsg = `Error creating employee: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error("Exception:", errorMsg)
    console.error(error)
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
}

// PUT /api/employees/[id] - Update employee information
export async function PUT(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const url = new URL(request.url)
    const employeeId = url.pathname.split('/').pop()
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    const data = await request.json()
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await getHRClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    // Validate BSN if being updated
    if (data.bsn && data.bsn !== existingEmployee.bsn) {
      if (!/^\d{9}$/.test(data.bsn)) {
        return NextResponse.json({
          success: false,
          error: 'BSN must be exactly 9 digits'
        }, { status: 400 })
      }
      
      const existingBSN = await getHRClient().employee.findFirst({
        where: { 
          bsn: data.bsn,
          companyId: context.companyId,
          id: { not: employeeId }
        }
      })
      
      if (existingBSN) {
        return NextResponse.json({
          success: false,
          error: 'Another employee with this BSN already exists'
        }, { status: 400 })
      }
    }
    
    // Parse dates if provided
    const updateData: any = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.probationEndDate) updateData.probationEndDate = new Date(data.probationEndDate)
    
    // Convert numeric fields that exist in the schema
    if (data.salary !== undefined) updateData.salary = parseFloat(data.salary) || 0
    if (data.hourlyRate !== undefined) updateData.hourlyRate = parseFloat(data.hourlyRate) || null
    if (data.workingHours !== undefined) updateData.workingHours = parseFloat(data.workingHours) || 40
    
    // Update employee
    const updatedEmployee = await getHRClient().employee.update({
      where: { id: employeeId },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
      message: 'Employee updated successfully'
    })
    
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update employee"
    }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - Soft delete employee
export async function DELETE(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const url = new URL(request.url)
    const employeeId = url.pathname.split('/').pop()
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await getHRClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    // Soft delete by setting isActive to false and endDate to now
    const updatedEmployee = await getHRClient().employee.update({
      where: { id: employeeId },
      data: {
        isActive: false,
        endDate: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Employee deactivated successfully'
    })
    
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete employee"
    }, { status: 500 })
  }
}

