import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { hrClient } from "@/lib/database-clients"

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

    const { id } = await params

    // CRITICAL FIX: Add debug logging to help diagnose issues
    console.log('🔍 Employee detail request:');
    console.log('- Employee ID:', id);
    console.log('- User Company ID:', session.user.companyId);

    // First try to find the employee with the exact company match
    let employee = await hrClient.employee.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      },
      include: {
        LeaveRequest: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Last 5 leave requests
        },
        TimeEntry: {
          orderBy: { date: 'desc' },
          take: 10 // Last 10 time entries
        },
        EmployeeHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Last 5 history records
        },
        Company: true
      }
    })

    // If not found, check if the employee exists at all (for development/testing)
    if (!employee) {
      console.log('⚠️ Employee not found with company match, checking without company filter');
      
      // In development, be more lenient and allow viewing any employee
      if (process.env.NODE_ENV !== 'production') {
        employee = await hrClient.employee.findUnique({
          where: { id: id },
          include: {
            LeaveRequest: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            TimeEntry: {
              orderBy: { date: 'desc' },
              take: 10
            },
            EmployeeHistory: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            Company: true
          }
        })
        
        if (employee) {
          console.log('✅ Found employee without company filter:', employee.firstName, employee.lastName);
          console.log('- Employee Company ID:', employee.companyId);
        }
      }
    } else {
      console.log('✅ Found employee with company match:', employee.firstName, employee.lastName);
    }

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

    const { id } = await params
    const data = await request.json()
    
    // Debug logging
    console.log('🔍 Employee update request received:');
    console.log('Employee ID:', id);
    console.log('Request data:', JSON.stringify(data, null, 2));
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await hrClient.employee.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    console.log('✅ Existing employee found:', existingEmployee.firstName, existingEmployee.lastName);
    
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
          companyId: session.user.companyId,
          id: { not: id }
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
      const existingEmployeeNumber = await hrClient.employee.findFirst({
        where: { 
          employeeNumber: data.employeeNumber,
          companyId: session.user.companyId,
          id: { not: id }
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
    // Map frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      'phoneNumber': 'phone',
      'address': 'streetName'
    }
    
    // Define allowed fields for update (exclude relational and system fields)
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'streetName', 'houseNumber', 
      'houseNumberAddition', 'city', 'postalCode', 'country', 'nationality', 
      'bsn', 'dateOfBirth', 'startDate', 'endDate', 'position', 'department', 'employmentType', 
      'contractType', 'workingHours', 'salary', 'salaryType', 'hourlyRate', 
      'taxTable', 'taxCredit', 'isDGA', 'bankAccount', 'bankName', 
      'emergencyContact', 'emergencyPhone', 'emergencyRelation', 'isActive',
      'holidayAllowance', 'holidayDays', 'employeeNumber'
    ]
    
    // Filter and map form data to database fields
    const updateData: any = {}
    
    Object.keys(data).forEach(key => {
      const dbField = fieldMapping[key] || key
      
      // Skip relational fields that cannot be updated directly
      if (['LeaveRequest', 'TimeEntry', 'EmployeeHistory', 'Company', 'id', 'companyId', 'createdAt', 'updatedAt'].includes(key)) {
        console.log(`🚫 Skipping relational/system field: ${key}`)
        return
      }
      
      // Only allow specific fields to be updated
      if (!allowedFields.includes(dbField)) {
        console.log(`🚫 Skipping field: ${key} -> ${dbField} (not in allowed list)`)
        return
      }
      
      // Skip undefined values
      if (data[key] === undefined || data[key] === null) {
        return
      }
      
      // Handle date fields
      if (['dateOfBirth', 'startDate', 'endDate'].includes(dbField) && data[key]) {
        updateData[dbField] = new Date(data[key])
        console.log(`✅ Including date field: ${key} -> ${dbField} = ${data[key]}`)
        return
      }
      
      // Handle numeric fields
      if (['salary', 'workingHours', 'taxCredit', 'hourlyRate'].includes(dbField) && data[key] !== undefined) {
        updateData[dbField] = parseFloat(data[key]) || 0
        console.log(`✅ Including numeric field: ${key} -> ${dbField} = ${data[key]}`)
        return
      }
      
      if (['holidayAllowance'].includes(dbField) && data[key] !== undefined) {
        updateData[dbField] = parseFloat(data[key]) || 8.33
        console.log(`✅ Including holiday allowance field: ${key} -> ${dbField} = ${data[key]}`)
        return
      }
      
      if (['holidayDays'].includes(dbField) && data[key] !== undefined) {
        updateData[dbField] = parseInt(data[key]) || 25
        console.log(`✅ Including holiday days field: ${key} -> ${dbField} = ${data[key]}`)
        return
      }
      
      // Handle boolean fields
      if (['isActive', 'isDGA'].includes(dbField)) {
        updateData[dbField] = Boolean(data[key])
        console.log(`✅ Including boolean field: ${key} -> ${dbField} = ${data[key]}`)
        return
      }
      
      // Handle string fields
      updateData[dbField] = data[key]
      console.log(`✅ Including string field: ${key} -> ${dbField} = ${data[key]}`)
    })
    
    console.log('🔄 Attempting to update employee with data:', JSON.stringify(updateData, null, 2));
    
    // Update employee
    const updatedEmployee = await hrClient.employee.update({
      where: { id: id },
      data: updateData
    })
    
    console.log('✅ Employee updated successfully:', updatedEmployee.firstName, updatedEmployee.lastName);
    
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

    const { id } = await params
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await hrClient.employee.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    // Since we don't have payroll records in the current schema, just soft delete
    // Soft delete by setting isActive to false and endDate to now
    await hrClient.employee.update({
      where: { id: id },
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

