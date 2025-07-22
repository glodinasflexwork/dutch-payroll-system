import { NextRequest, NextResponse } from "next/server"
import { validateAuth, createCompanyFilter } from "@/lib/auth-utils"
import { DatabaseClients, hrClient, authClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { ensureHRInitialized } from "@/lib/lazy-initialization"

// GET /api/employees - Get all employees for the current company
export async function GET(request: NextRequest) {
  try {
    console.log('=== EMPLOYEES GET API START ===')
    
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      console.log('Authentication failed:', error)
      return NextResponse.json({ error }, { status })
    }

    console.log('Authentication successful, fetching employees for company:', context.companyId)

    // Validate subscription - allow basic access even if expired
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      console.log('Subscription validation failed:', subscriptionValidation.error)
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const employees = await hrClient.employee.findMany({
      where: {
        companyId: context.companyId,
        isActive: true
      },
      orderBy: {
        employeeNumber: 'asc'
      }
    })

    console.log('Found employees:', employees.length)

    return NextResponse.json({
      success: true,
      employees: employees,
      Company: {
        id: context.companyId,
        name: context.companyName
      },
      subscription: {
        plan: subscriptionValidation.subscription?.plan?.name,
        limits: subscriptionValidation.limits
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
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    // Ensure HR database is initialized for this company (lazy initialization)
    console.log('Ensuring HR database is initialized for company:', context.companyId)
    await ensureHRInitialized(context.companyId)
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
    const existingBSN = await hrClient.employee.findFirst({
      where: { 
        bsn: data.bsn,
        companyId: context.companyId
      }
    })
    
    if (existingBSN) {
      return NextResponse.json({
        success: false,
        error: 'Employee with this BSN already exists in your company'
      }, { status: 400 })
    }
    
    // Check if email already exists in this company
    const existingEmail = await hrClient.employee.findFirst({
      where: { 
        email: data.email,
        companyId: context.companyId
      }
    })
    
    if (existingEmail) {
      return NextResponse.json({
        success: false,
        error: 'Employee with this email already exists in your company'
      }, { status: 400 })
    }
    
    // Generate unique employee number if not provided
    let employeeNumber = data.employeeNumber
    if (!employeeNumber) {
      const lastEmployee = await hrClient.employee.findFirst({
        where: { companyId: context.companyId },
        orderBy: { employeeNumber: 'desc' }
      })
      
      let nextNumber = 1
      if (lastEmployee && lastEmployee.employeeNumber) {
        const match = lastEmployee.employeeNumber.match(/EMP(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      employeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`
    }
    
    // Check if employee number already exists in this company
    const existingEmployeeNumber = await hrClient.employee.findFirst({
      where: { 
        employeeNumber: employeeNumber,
        companyId: context.companyId
      }
    })
    
    if (existingEmployeeNumber) {
      return NextResponse.json({
        success: false,
        error: 'Employee number already exists in your company'
      }, { status: 400 })
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
    
    // Create new employee with fields that exist in the current schema
    const employee = await hrClient.employee.create({
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
        companyId: context.companyId,
        createdBy: context.userId,
        portalAccessStatus: "NO_ACCESS", // Default to no portal access
      }
    })
    
    // Handle portal invitation if requested
    if (data.sendInvitation) {
      try {
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
        }
      } catch (inviteError) {
        console.error('Error sending employee invitation:', inviteError);
      }
    }
    
    console.log(`Employee created successfully: ${employee.firstName} ${employee.lastName} with ID: ${employee.id}`)
    
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
    const existingEmployee = await hrClient.employee.findFirst({
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
      
      const existingBSN = await hrClient.employee.findFirst({
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
    const updatedEmployee = await hrClient.employee.update({
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
    const existingEmployee = await hrClient.employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    // Soft delete by setting isActive to false and endDate to now
    const updatedEmployee = await hrClient.employee.update({
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

