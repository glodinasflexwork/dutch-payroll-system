import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for employee updates
const updateEmployeeSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required").optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  bsn: z.string().min(8, "BSN must be at least 8 characters").max(9, "BSN must be at most 9 characters").optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  position: z.string().min(1, "Position is required").optional(),
  department: z.string().optional().nullable(),
  employmentType: z.enum(["monthly", "hourly"]).optional(),
  salary: z.number().positive("Salary must be positive").optional(),
  taxTable: z.enum(["wit", "groen"]).optional(),
  bankAccount: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET /api/employees/[id] - Get a specific employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update a specific employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = updateEmployeeSchema.parse(body)

    // Check if employee exists and belongs to the user's company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Check if employee number already exists (if being updated)
    if (validatedData.employeeNumber && validatedData.employeeNumber !== existingEmployee.employeeNumber) {
      const existingEmployeeNumber = await prisma.employee.findUnique({
        where: { employeeNumber: validatedData.employeeNumber }
      })

      if (existingEmployeeNumber) {
        return NextResponse.json(
          { error: "Employee number already exists" },
          { status: 400 }
        )
      }
    }

    // Check if BSN already exists (if being updated)
    if (validatedData.bsn && validatedData.bsn !== existingEmployee.bsn) {
      const existingBSN = await prisma.employee.findUnique({
        where: { bsn: validatedData.bsn }
      })

      if (existingBSN) {
        return NextResponse.json(
          { error: "BSN already exists" },
          { status: 400 }
        )
      }
    }

    // Update the employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id] - Delete (deactivate) a specific employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if employee exists and belongs to the user's company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        endDate: new Date()
      }
    })

    return NextResponse.json({ message: "Employee deactivated successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

