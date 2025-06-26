import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/employees - Get all employees for the user's company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employees = await prisma.employee.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true
      },
      orderBy: {
        employeeNumber: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      employees: employees
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create a new employee (restored working logic)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log("Received employee data:", data) // Debug logging
    
    // Validate required fields
    const required_fields = ['firstName', 'lastName', 'email', 'bsn', 'startDate', 'position', 'department', 'employmentType']
    for (const field of required_fields) {
      if (!data[field] || data[field] === '') {
        const error_msg = `Missing or empty required field: ${field}`
        console.log("Validation error:", error_msg)
        return NextResponse.json({
          success: false,
          error: error_msg
        }, { status: 400 })
      }
    }
    
    // Check if BSN already exists in this company
    const existingBSN = await prisma.employee.findFirst({
      where: { 
        bsn: data.bsn,
        companyId: session.user.companyId
      }
    })
    
    if (existingBSN) {
      const error_msg = 'Employee with this BSN already exists'
      console.log("BSN conflict:", error_msg)
      return NextResponse.json({
        success: false,
        error: error_msg
      }, { status: 400 })
    }
    
    // Check if email already exists in this company
    const existingEmail = await prisma.employee.findFirst({
      where: { 
        email: data.email,
        companyId: session.user.companyId
      }
    })
    
    if (existingEmail) {
      const error_msg = 'Employee with this email already exists'
      console.log("Email conflict:", error_msg)
      return NextResponse.json({
        success: false,
        error: error_msg
      }, { status: 400 })
    }
    
    // Parse hire date (start date)
    let hireDate: Date
    try {
      hireDate = new Date(data.startDate)
      if (isNaN(hireDate.getTime())) {
        throw new Error("Invalid date")
      }
    } catch (e) {
      const error_msg = `Invalid date format: ${data.startDate}. Use YYYY-MM-DD format`
      console.log("Date parsing error:", error_msg)
      return NextResponse.json({
        success: false,
        error: error_msg
      }, { status: 400 })
    }
    
    // Validate salary data based on employment type
    let salaryAmount = 0
    if (data.employmentType === 'monthly') {
      if (!data.salary || (typeof data.salary === 'string' && data.salary === '') || Number(data.salary) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Monthly salary is required and must be greater than 0 for monthly employees'
        }, { status: 400 })
      }
      salaryAmount = Number(data.salary)
    } else if (data.employmentType === 'hourly') {
      if (!data.hourlyRate || (typeof data.hourlyRate === 'string' && data.hourlyRate === '') || Number(data.hourlyRate) <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Hourly rate is required and must be greater than 0 for hourly employees'
        }, { status: 400 })
      }
      salaryAmount = Number(data.hourlyRate)
    }
    
    // Generate unique employee number
    const lastEmployee = await prisma.employee.findFirst({
      where: { companyId: session.user.companyId },
      orderBy: { employeeNumber: 'desc' }
    })
    
    let nextNumber = 1
    if (lastEmployee && lastEmployee.employeeNumber) {
      // Extract number from employeeNumber (e.g., "EMP0001" -> 1)
      const match = lastEmployee.employeeNumber.match(/EMP(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    const employeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`
    
    // Create new employee with proper field mapping
    const employee = await prisma.employee.create({
      data: {
        employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phoneNumber || null, // Map phoneNumber to phone
        address: data.address || null,
        postalCode: data.postalCode || null,
        city: data.city || null,
        bsn: data.bsn,
        dateOfBirth: new Date('1990-01-01'), // Default, can be updated later
        startDate: hireDate,
        endDate: null,
        position: data.position,
        department: data.department,
        employmentType: data.employmentType,
        salary: salaryAmount,
        taxTable: data.taxTable || 'wit',
        bankAccount: data.bankAccount || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        companyId: session.user.companyId,
        isActive: true
      }
    })
    
    console.log(`Employee created successfully: ${employee.firstName} ${employee.lastName} with ID: ${employee.id}`)
    
    return NextResponse.json({
      success: true,
      employee: employee,
      message: 'Employee created successfully'
    }, { status: 201 })
    
  } catch (error) {
    const error_msg = `Error creating employee: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error("Exception:", error_msg)
    console.error(error)
    return NextResponse.json({
      success: false,
      error: error_msg
    }, { status: 500 })
  }
}

