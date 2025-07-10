import { NextRequest, NextResponse } from 'next/server'
import { validateCompanyAccess, auditLog, createCompanyFilter } from '@/lib/company-context'
import { hrClient } from '@/lib/database-clients'

export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateCompanyAccess(request, ['employee'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const leaveRequests = await hrClient.leaveRequest.findMany({
      where: createCompanyFilter(context.companyId),
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
            nameEn: true,
            color: true
          }
        },
        requestedBy: {
          select: {
            name: true
          }
        },
        reviewedBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Audit log
    await auditLog(context, 'READ', 'leave_requests', undefined, { count: leaveRequests.length })

    return NextResponse.json({
      success: true,
      leaveRequests,
      Company: {
        id: context.companyId,
        name: context.companyName
      }
    })

  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { context, error, status } = await validateCompanyAccess(request, ['employee'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      isHalfDay = false,
      halfDayPeriod
    } = await request.json()

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify employee belongs to the same company
    const employee = await hrClient.employee.findFirst({
      where: {
        id: employeeId,
        ...createCompanyFilter(context.companyId)
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 })
    }

    // Verify leave type belongs to the same company
    const leaveType = await hrClient.leaveType.findFirst({
      where: {
        id: leaveTypeId,
        ...createCompanyFilter(context.companyId)
      }
    })

    if (!leaveType) {
      return NextResponse.json({ error: 'Leave type not found or access denied' }, { status: 404 })
    }

    // Calculate working days
    const start = new Date(startDate)
    const end = new Date(endDate)
    let workingDays = 0
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++
      }
    }

    if (isHalfDay) {
      workingDays = 0.5
    }

    // Create leave request
    const leaveRequest = await hrClient.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        companyId: context.companyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workingDays,
        reason,
        isHalfDay,
        halfDayPeriod,
        status: 'pending',
        requestedById: context.userId
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
            nameEn: true,
            color: true
          }
        }
      }
    })

    // Audit log
    await auditLog(context, 'CREATE', 'leave_request', leaveRequest.id, {
      employeeId,
      leaveTypeId,
      workingDays,
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      leaveRequest,
      message: 'Leave request created successfully'
    })

  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}

