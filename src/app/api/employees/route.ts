import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for employee data
const employeeSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  bsn: z.string().min(8, "BSN must be at least 8 characters").max(9, "BSN must be at most 9 characters"),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional().nullable(),
  employmentType: z.enum(["monthly", "hourly"]),
  salary: z.number().positive("Salary must be positive"),
  taxTable: z.enum(["wit", "groen"]),
  bankAccount: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
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
    
    // Validate the request body
    const validatedData = employeeSchema.parse(body)

    // Check if employee number already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeNumber: validatedData.employeeNumber }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: "Employee number already exists" },
        { status: 400 }
      )
    }

    // Check if BSN already exists
    const existingBSN = await prisma.employee.findUnique({
      where: { bsn: validatedData.bsn }
    })

    if (existingBSN) {
      return NextResponse.json(
        { error: "BSN already exists" },
        { status: 400 }
      )
    }

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        ...validatedData,
        companyId: session.user.companyId,
        isActive: true
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

