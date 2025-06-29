import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/employees/[id] - Get specific employee details
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
      },
      include: {
        payrollRecords: {
          orderBy: { payPeriodStart: 'desc' },
          take: 5 // Last 5 payroll records
        },
        employeeAllowances: true,
        employeeDeductions: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      employee: employee
    })
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update specific employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
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
      
      const existingBSN = await prisma.employee.findFirst({
        where: { 
          bsn: data.bsn,
          companyId: session.user.companyId,
          id: { not: params.id }
        }
      })
      
      if (existingBSN) {
        return NextResponse.json({
          success: false,
          error: 'Another employee with this BSN already exists'
        }, { status: 400 })
      }
    }
    
    // Validate employee number if being updated
    if (data.employeeNumber && data.employeeNumber !== existingEmployee.employeeNumber) {
      const existingEmployeeNumber = await prisma.employee.findFirst({
        where: { 
          employeeNumber: data.employeeNumber,
          companyId: session.user.companyId,
          id: { not: params.id }
        }
      })
      
      if (existingEmployeeNumber) {
        return NextResponse.json({
          success: false,
          error: 'Employee number already exists'
        }, { status: 400 })
      }
    }
    
    // Parse dates if provided
    const updateData: any = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.probationEndDate) updateData.probationEndDate = new Date(data.probationEndDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    
    // Convert numeric fields
    if (data.salary !== undefined) updateData.salary = parseFloat(data.salary) || 0
    if (data.hourlyRate !== undefined) updateData.hourlyRate = parseFloat(data.hourlyRate) || null
    if (data.workingHours !== undefined) updateData.workingHours = parseFloat(data.workingHours) || 40
    if (data.workingDays !== undefined) updateData.workingDays = parseFloat(data.workingDays) || 5
    if (data.taxCredit !== undefined) updateData.taxCredit = parseFloat(data.taxCredit) || 0
    if (data.holidayAllowance !== undefined) updateData.holidayAllowance = parseFloat(data.holidayAllowance) || 8.33
    if (data.holidayDays !== undefined) updateData.holidayDays = parseInt(data.holidayDays) || 25
    
    // Remove undefined values to avoid overwriting with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    // Check if employee has payroll records
    const payrollCount = await prisma.payrollRecord.count({
      where: { employeeId: params.id }
    })
    
    if (payrollCount > 0) {
      // Soft delete by setting isActive to false and endDate to now
      await prisma.employee.update({
        where: { id: params.id },
        data: {
          isActive: false,
          endDate: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Employee deactivated successfully (payroll history preserved)'
      })
    } else {
      // Hard delete if no payroll records exist
      await prisma.employee.delete({
        where: { id: params.id }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Employee deleted successfully'
      })
    }
    
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete employee"
    }, { status: 500 })
  }
}

