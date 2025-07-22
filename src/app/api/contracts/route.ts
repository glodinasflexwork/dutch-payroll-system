import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { hrClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"

// GET /api/contracts - Get all contracts for the current company
export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const activeOnly = url.searchParams.get('activeOnly') === 'true'
    
    // Build filter
    const filter: any = {
      companyId: context.companyId
    }
    
    if (employeeId) {
      filter.employeeId = employeeId
    }
    
    if (activeOnly) {
      filter.isActive = true
    }

    // Get contracts
    const contracts = await hrClient.contract.findMany({
      where: filter,
      include: {
        Employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      contracts
    })
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['employeeId', 'contractType', 'title']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 })
      }
    }
    
    // Check if employee exists and belongs to the company
    const employee = await hrClient.employee.findFirst({
      where: {
        id: data.employeeId,
        companyId: context.companyId
      }
    })
    
    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found or does not belong to your company'
      }, { status: 404 })
    }
    
    // Get company defaults for working schedule
    const company = await hrClient.company.findUnique({
      where: { id: context.companyId }
    })

    // Parse working schedule data
    const workingHoursPerWeek = parseFloat(data.workingHoursPerWeek) || company?.workingHoursPerWeek || 40
    const workingDaysPerWeek = parseFloat(data.workingDaysPerWeek) || 5
    const workSchedule = data.workSchedule || 'Monday-Friday'
    
    // Create contract
    const contract = await hrClient.contract.create({
      data: {
        employeeId: data.employeeId,
        contractType: data.contractType,
        title: data.title,
        description: data.description || null,
        fileName: data.fileName || `contract_${employee.employeeNumber}_${Date.now()}.pdf`,
        filePath: data.filePath || `/contracts/${context.companyId}/${data.employeeId}/${data.contractType}_contract.pdf`,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || 'application/pdf',
        status: data.status || 'pending',
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        // Working schedule fields
        workingHoursPerWeek: workingHoursPerWeek,
        workingDaysPerWeek: workingDaysPerWeek,
        workSchedule: workSchedule,
        companyId: context.companyId
      }
    })
    
    // If this is a new employment contract and it's active, update employee's working hours
    if (data.contractType === 'employment' && data.isActive !== false) {
      await hrClient.employee.update({
        where: { id: data.employeeId },
        data: {
          workingHours: workingHoursPerWeek // Update for backward compatibility
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      contract
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating contract:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create contract"
    }, { status: 500 })
  }
}

// PUT /api/contracts/[id] - Update contract
export async function PUT(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'manager'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const url = new URL(request.url)
    const contractId = url.pathname.split('/').pop()
    
    if (!contractId) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    const data = await request.json()
    
    // Check if contract exists and belongs to the company
    const existingContract = await hrClient.contract.findFirst({
      where: {
        id: contractId,
        companyId: context.companyId
      }
    })
    
    if (!existingContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = { ...data }
    
    // Handle date fields
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt)
    if (data.signedAt) updateData.signedAt = new Date(data.signedAt)
    
    // Update contract
    const updatedContract = await hrClient.contract.update({
      where: { id: contractId },
      data: updateData
    })
    
    // If working hours changed and this is an active employment contract, update employee's working hours
    if (
      data.workingHoursPerWeek && 
      existingContract.contractType === 'employment' && 
      existingContract.isActive
    ) {
      await hrClient.employee.update({
        where: { id: existingContract.employeeId },
        data: {
          workingHours: parseFloat(data.workingHoursPerWeek) // Update for backward compatibility
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      contract: updatedContract
    })
    
  } catch (error) {
    console.error("Error updating contract:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update contract"
    }, { status: 500 })
  }
}

