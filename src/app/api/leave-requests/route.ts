import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const whereClause: any = {
      companyId
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (status) {
      whereClause.status = status
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
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
        },
        requestedByUser: {
          select: {
            name: true,
            email: true
          }
        },
        reviewedByUser: {
          select: {
            name: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error("Error fetching leave requests:", error)
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
      startDate,
      endDate,
      reason,
      requestedBy
    } = await request.json()

    if (!employeeId || !companyId || !leaveTypeId || !startDate || !endDate || !requestedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Calculate days requested (excluding weekends)
    const timeDiff = end.getTime() - start.getTime()
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    // Simple weekday calculation (can be enhanced later)
    let workingDays = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays++
      }
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        companyId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        daysRequested: workingDays,
        reason: reason || "",
        status: "pending",
        requestedBy,
        requestedAt: new Date()
      },
      include: {
        employee: {
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
            requiresApproval: true
          }
        }
      }
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error creating leave request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

