import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { hrClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { ensureHRInitialized } from "@/lib/lazy-initialization"

// POST /api/employees/create-with-contract - Create employee with contract including working days
export async function POST(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    // STEP 1: Validate subscription FIRST before any resource allocation
    console.log('Validating subscription for company:', context.companyId)
    const subscriptionValidation = await validateSubscription(context.companyId)
    
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
    const currentEmployeeCount = await hrClient.employee.count({
      where: { companyId: context.companyId, isActive: true }
    })

    if (currentEmployeeCount >= (subscriptionValidation.limits?.maxEmployees || 0)) {
      return NextResponse.json({ 
        error: `Employee limit reached (${subscriptionValidation.limits?.maxEmployees}). Please upgrade your subscription.` 
      }, { status: 403 })
    }

    // STEP 4: NOW ensure HR database is initialized (after subscription validation)
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

    // Get company defaults for working schedule
    const company = await hrClient.company.findUnique({
      where: { id: context.companyId }
    })

    // Parse working schedule data
    const workingHoursPerWeek = parseFloat(data.workingHoursPerWeek) || company?.workingHoursPerWeek || 40
    const workingDaysPerWeek = parseFloat(data.workingDaysPerWeek) || 5
    const workSchedule = data.workSchedule || 'Monday-Friday'
    
    // Create employee and contract in a transaction
    const result = await hrClient.$transaction(async (tx) => {
      // Create employee
      const employee = await tx.employee.create({
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
          
          // Contract information (basic)
          employmentType: data.employmentType,
          contractType: data.contractType,
          workingHours: workingHoursPerWeek, // Store for backward compatibility
          
          // Salary information
          salary: salary,
          salaryType: data.salaryType || 'monthly',
          hourlyRate: hourlyRate > 0 ? hourlyRate : null,
          
          // Dutch payroll compliance fields
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
          portalAccessStatus: data.sendPortalInvitation ? "INVITED" : "NO_ACCESS",
        }
      })

      // Create employment contract with working schedule
      const contract = await tx.contract.create({
        data: {
          employeeId: employee.id,
          companyId: context.companyId,
          contractType: 'employment',
          title: `Employment Contract - ${employee.firstName} ${employee.lastName}`,
          description: `Initial employment contract for ${data.position} position`,
          fileName: `contract_${employeeNumber}_${Date.now()}.pdf`,
          filePath: `/contracts/${context.companyId}/${employee.id}/employment_contract.pdf`,
          status: 'pending',
          // Working schedule fields
          workingHoursPerWeek: workingHoursPerWeek,
          workingDaysPerWeek: workingDaysPerWeek,
          workSchedule: workSchedule,
          isActive: true
        }
      })

      return { employee, contract }
    })
    
    console.log(`Employee created successfully: ${result.employee.firstName} ${result.employee.lastName} with ID: ${result.employee.id}`)
    console.log(`Contract created with working schedule: ${workingDaysPerWeek} days/week, ${workingHoursPerWeek} hours/week`)
    
    // Handle portal invitation if requested
    if (data.sendPortalInvitation) {
      // TODO: Send portal invitation email
      console.log(`Portal invitation should be sent to: ${data.email}`)
    }
    
    return NextResponse.json({
      success: true,
      employee: result.employee,
      contract: {
        id: result.contract.id,
        workingHoursPerWeek: result.contract.workingHoursPerWeek,
        workingDaysPerWeek: result.contract.workingDaysPerWeek,
        workSchedule: result.contract.workSchedule
      },
      message: 'Employee and contract created successfully with working schedule'
    }, { status: 201 })
    
  } catch (error) {
    const errorMsg = `Error creating employee with contract: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error("Exception:", errorMsg)
    console.error(error)
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
}

