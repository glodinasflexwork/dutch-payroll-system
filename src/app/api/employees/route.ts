import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for employee data - updated to match frontend
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  bsn: z.string().min(8, "BSN must be at least 8 characters").max(9, "BSN must be at most 9 characters"),
  startDate: z.string().min(1, "Start date is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  employmentType: z.enum(["monthly", "hourly"]),
  salary: z.string().optional().or(z.literal("")),
  hourlyRate: z.string().optional().or(z.literal("")),
  taxTable: z.enum(["wit", "groen"]),
  bankAccount: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  emergencyPhone: z.string().optional().or(z.literal("")),
})

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

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received employee data:", body) // Debug log
    
    // Validate the request body
    const validatedData = employeeSchema.parse(body)

    // Generate employee number
    const employeeCount = await prisma.employee.count({
      where: { companyId: session.user.companyId }
    })
    const employeeNumber = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    // Check if BSN already exists
    const existingBSN = await prisma.employee.findFirst({
      where: { 
        bsn: validatedData.bsn,
        companyId: session.user.companyId
      }
    })

    if (existingBSN) {
      return NextResponse.json(
        { error: "BSN already exists in your company" },
        { status: 400 }
      )
    }

    // Convert salary/hourly rate to number
    const salaryValue = validatedData.employmentType === 'monthly' 
      ? parseFloat(validatedData.salary || '0')
      : parseFloat(validatedData.hourlyRate || '0')

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        employeeNumber,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || null,
        phone: validatedData.phoneNumber || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        bsn: validatedData.bsn,
        dateOfBirth: new Date('1990-01-01'), // Default date, can be updated later
        startDate: new Date(validatedData.startDate),
        endDate: null,
        position: validatedData.position,
        department: validatedData.department,
        employmentType: validatedData.employmentType,
        salary: salaryValue,
        taxTable: validatedData.taxTable,
        bankAccount: validatedData.bankAccount || null,
        emergencyContact: validatedData.emergencyContact || null,
        emergencyPhone: validatedData.emergencyPhone || null,
        companyId: session.user.companyId,
        isActive: true
      }
    })

    console.log("Employee created successfully:", employee.id) // Debug log
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors) // Debug log
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

