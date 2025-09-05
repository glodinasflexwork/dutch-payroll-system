import { NextRequest, NextResponse } from "next/server"
import { getHRClient } from "@/lib/database-clients"

// GET /api/employee-portal/leave-requests - Get employee leave requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await getHRClient().employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get leave requests
    const leaveRequests = await getHRClient().leaveRequest.findMany({
      where: { employeeId: employeeId },
      include: {
        LeaveType: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get available leave types
    const leaveTypes = await getHRClient().leaveType.findMany({
      where: { 
        companyId: employee.companyId,
        isActive: true 
      }
    })

    return NextResponse.json({
      success: true,
      leaveRequests: leaveRequests,
      leaveTypes: leaveTypes
    })

  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// POST /api/employee-portal/leave-requests - Submit a leave request
export async function POST(request: NextRequest) {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = await request.json()
    
    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: "Employee ID, leave type, start date, and end date are required" 
      }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await getHRClient().employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Verify leave type exists and is active
    const leaveType = await getHRClient().leaveType.findFirst({
      where: { 
        id: leaveTypeId,
        companyId: employee.companyId,
        isActive: true 
      }
    })

    if (!leaveType) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 })
    }

    // Parse dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    // Calculate days (simple calculation - could be enhanced for business days)
    const timeDiff = end.getTime() - start.getTime()
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

    // Check for overlapping leave requests
    const overlapping = await getHRClient().leaveRequest.findFirst({
      where: {
        employeeId: employeeId,
        status: { in: ['pending', 'approved'] },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({ 
        error: "You already have a leave request for overlapping dates" 
      }, { status: 400 })
    }

    // Create leave request
    const leaveRequest = await getHRClient().leaveRequest.create({
      data: {
        employeeId: employeeId,
        leaveTypeId: leaveTypeId,
        startDate: start,
        endDate: end,
        days: days,
        reason: reason || null,
        status: 'pending',
        companyId: employee.companyId
      },
      include: {
        LeaveType: true
      }
    })

    return NextResponse.json({
      success: true,
      leaveRequest: leaveRequest,
      message: 'Leave request submitted successfully'
    })

  } catch (error) {
    console.error("Error creating leave request:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

