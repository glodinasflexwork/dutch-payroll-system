import { NextRequest, NextResponse } from "next/server"
import { getHRClient } from "@/lib/database-clients"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const whereClause: any = {
      companyId,
      year: parseInt(year)
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    const leaveBalances = await getHRClient().leaveBalance.findMany({
      where: whereClause,
      include: {
        Employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        leaveType: {
          select: {
            name: true,
            nameNl: true,
            color: true,
            code: true
          }
        }
      },
      orderBy: [
        { Employee: { firstName: 'asc' } },
        { leaveType: { name: 'asc' } }
      ]
    })

    return NextResponse.json(leaveBalances)
  } catch (error) {
    console.error("Error fetching leave balances:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      employeeId,
      companyId,
      leaveTypeId,
      year,
      totalEntitled,
      carriedOver
    } = await request.json()

    if (!employeeId || !companyId || !leaveTypeId || !year || totalEntitled === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if balance already exists
    const existingBalance = await getHRClient().leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year: parseInt(year)
        }
      }
    })

    if (existingBalance) {
      return NextResponse.json(
        { error: "Leave balance already exists for this employee, leave type, and year" },
        { status: 400 }
      )
    }

    const carried = carriedOver || 0
    const available = totalEntitled + carried

    const leaveBalance = await getHRClient().leaveBalance.create({
      data: {
        employeeId,
        companyId,
        leaveTypeId,
        year: parseInt(year),
        totalEntitled,
        carriedOver: carried,
        available,
        used: 0,
        pending: 0
      },
      include: {
        Employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        leaveType: {
          select: {
            name: true,
            nameNl: true,
            color: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(leaveBalance)
  } catch (error) {
    console.error("Error creating leave balance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Initialize leave balances for all employees
export async function PUT(request: NextRequest) {
  try {
    const { companyId, year } = await request.json()

    if (!companyId || !year) {
      return NextResponse.json(
        { error: "Company ID and year are required" },
        { status: 400 }
      )
    }

    // Get all active employees for the company
    const employees = await getHRClient().employee.findMany({
      where: {
        companyId,
        isActive: true
      }
    })

    // Get all active leave types for the company
    const leaveTypes = await getHRClient().leaveType.findMany({
      where: {
        companyId,
        isActive: true
      }
    })

    const balancesToCreate = []

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        // Check if balance already exists
        const existingBalance = await getHRClient().leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: employee.id,
              leaveTypeId: leaveType.id,
              year: parseInt(year)
            }
          }
        })

        if (!existingBalance) {
          // Calculate default entitlement based on leave type
          let defaultEntitlement = 25 // Default vacation days
          
          if (leaveType.code === 'SICK') {
            defaultEntitlement = 0 // Sick leave typically unlimited
          } else if (leaveType.maxDaysPerYear) {
            defaultEntitlement = leaveType.maxDaysPerYear
          }

          balancesToCreate.push({
            employeeId: employee.id,
            companyId,
            leaveTypeId: leaveType.id,
            year: parseInt(year),
            totalEntitled: defaultEntitlement,
            carriedOver: 0,
            available: defaultEntitlement,
            used: 0,
            pending: 0
          })
        }
      }
    }

    if (balancesToCreate.length > 0) {
      await getHRClient().leaveBalance.createMany({
        data: balancesToCreate
      })
    }

    return NextResponse.json({
      message: `Initialized ${balancesToCreate.length} leave balances`,
      created: balancesToCreate.length
    })
  } catch (error) {
    console.error("Error initializing leave balances:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

