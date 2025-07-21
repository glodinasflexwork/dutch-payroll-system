import { NextRequest, NextResponse } from "next/server"
import { hrClient } from "@/lib/database-clients"

// GET /api/employee-portal/time-entries - Get employee time entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Build date filter
    let dateFilter: any = {}
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    // Get time entries
    const timeEntries = await hrClient.timeEntry.findMany({
      where: { 
        employeeId: employeeId,
        ...dateFilter
      },
      orderBy: { date: 'desc' },
      take: 100 // Limit to recent entries
    })

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0)
    const approvedHours = timeEntries
      .filter(entry => entry.isApproved)
      .reduce((sum, entry) => sum + entry.hoursWorked, 0)

    return NextResponse.json({
      success: true,
      timeEntries: timeEntries,
      summary: {
        totalHours: totalHours,
        approvedHours: approvedHours,
        pendingHours: totalHours - approvedHours,
        entriesCount: timeEntries.length
      }
    })

  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// POST /api/employee-portal/time-entries - Submit a time entry
export async function POST(request: NextRequest) {
  try {
    const { employeeId, date, hoursWorked, description, projectCode } = await request.json()
    
    if (!employeeId || !date || !hoursWorked) {
      return NextResponse.json({ 
        error: "Employee ID, date, and hours worked are required" 
      }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Validate hours
    const hours = parseFloat(hoursWorked)
    if (hours <= 0 || hours > 24) {
      return NextResponse.json({ error: "Hours worked must be between 0 and 24" }, { status: 400 })
    }

    // Parse date
    const workDate = new Date(date)
    if (isNaN(workDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    // Check if entry already exists for this date
    const existingEntry = await hrClient.timeEntry.findFirst({
      where: {
        employeeId: employeeId,
        date: workDate
      }
    })

    if (existingEntry) {
      return NextResponse.json({ 
        error: "Time entry already exists for this date. Please update the existing entry." 
      }, { status: 400 })
    }

    // Create time entry
    const timeEntry = await hrClient.timeEntry.create({
      data: {
        employeeId: employeeId,
        date: workDate,
        hoursWorked: hours,
        description: description || null,
        projectCode: projectCode || null,
        isApproved: false,
        companyId: employee.companyId
      }
    })

    return NextResponse.json({
      success: true,
      timeEntry: timeEntry,
      message: 'Time entry submitted successfully'
    })

  } catch (error) {
    console.error("Error creating time entry:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// PUT /api/employee-portal/time-entries - Update a time entry
export async function PUT(request: NextRequest) {
  try {
    const { timeEntryId, employeeId, hoursWorked, description, projectCode } = await request.json()
    
    if (!timeEntryId || !employeeId) {
      return NextResponse.json({ 
        error: "Time entry ID and employee ID are required" 
      }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get existing time entry
    const existingEntry = await hrClient.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        employeeId: employeeId
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
    }

    // Don't allow updates to approved entries
    if (existingEntry.isApproved) {
      return NextResponse.json({ 
        error: "Cannot update approved time entries" 
      }, { status: 400 })
    }

    // Validate hours if provided
    let hours = existingEntry.hoursWorked
    if (hoursWorked !== undefined) {
      hours = parseFloat(hoursWorked)
      if (hours <= 0 || hours > 24) {
        return NextResponse.json({ error: "Hours worked must be between 0 and 24" }, { status: 400 })
      }
    }

    // Update time entry
    const updatedEntry = await hrClient.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        hoursWorked: hours,
        description: description !== undefined ? description : existingEntry.description,
        projectCode: projectCode !== undefined ? projectCode : existingEntry.projectCode
      }
    })

    return NextResponse.json({
      success: true,
      timeEntry: updatedEntry,
      message: 'Time entry updated successfully'
    })

  } catch (error) {
    console.error("Error updating time entry:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

