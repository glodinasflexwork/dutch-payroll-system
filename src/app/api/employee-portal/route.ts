import { NextRequest, NextResponse } from "next/server"
import { getHRClient, getPayrollClient } from "@/lib/database-clients"

// GET /api/employee-portal - Get employee portal data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // For demo purposes, return mock data if using mock employee ID
    if (employeeId === 'mock-employee-id') {
      return NextResponse.json({
        success: true,
        employee: {
          id: 'mock-employee-id',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          position: 'Software Developer',
          department: 'Engineering',
          contractType: 'permanent',
          workingHours: 40
        },
        contracts: [
          {
            id: 'contract-1',
            title: 'Employment Contract',
            contractType: 'employment',
            fileName: 'employment-contract-2024.pdf',
            status: 'signed',
            signedAt: '2024-01-15T10:00:00Z',
            createdAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'contract-2',
            title: 'Salary Amendment',
            contractType: 'amendment',
            fileName: 'salary-amendment-2024.pdf',
            status: 'pending',
            createdAt: '2024-06-01T14:00:00Z'
          }
        ],
        leaveRequests: [
          {
            id: 'leave-1',
            startDate: '2024-08-15T00:00:00Z',
            endDate: '2024-08-19T00:00:00Z',
            days: 5,
            reason: 'Summer vacation',
            status: 'approved',
            createdAt: '2024-07-01T10:00:00Z',
            LeaveType: { name: 'Annual Leave', code: 'AL' }
          },
          {
            id: 'leave-2',
            startDate: '2024-12-23T00:00:00Z',
            endDate: '2024-12-30T00:00:00Z',
            days: 6,
            reason: 'Christmas holidays',
            status: 'pending',
            createdAt: '2024-07-20T15:00:00Z',
            LeaveType: { name: 'Annual Leave', code: 'AL' }
          }
        ],
        timeEntries: [
          {
            id: 'time-1',
            date: '2024-07-20T00:00:00Z',
            hoursWorked: 8,
            description: 'Frontend development work',
            projectCode: 'PROJ-001',
            isApproved: true,
            createdAt: '2024-07-20T18:00:00Z'
          },
          {
            id: 'time-2',
            date: '2024-07-19T00:00:00Z',
            hoursWorked: 7.5,
            description: 'Bug fixes and testing',
            projectCode: 'PROJ-001',
            isApproved: false,
            createdAt: '2024-07-19T18:00:00Z'
          }
        ],
        payslips: [
          {
            id: 'payslip-1',
            fileName: 'payslip-2024-06.pdf',
            status: 'generated',
            createdAt: '2024-07-01T09:00:00Z',
            PayrollRecord: {
              period: 'June 2024',
              netSalary: 3450.50,
              grossSalary: 4500.00
            }
          },
          {
            id: 'payslip-2',
            fileName: 'payslip-2024-05.pdf',
            status: 'generated',
            createdAt: '2024-06-01T09:00:00Z',
            PayrollRecord: {
              period: 'May 2024',
              netSalary: 3450.50,
              grossSalary: 4500.00
            }
          }
        ],
        leaveTypes: [
          {
            id: 'leave-type-1',
            name: 'Annual Leave',
            code: 'AL',
            description: 'Yearly vacation days',
            isPaid: true,
            maxDaysPerYear: 25
          },
          {
            id: 'leave-type-2',
            name: 'Sick Leave',
            code: 'SL',
            description: 'Medical leave',
            isPaid: true,
            maxDaysPerYear: null
          },
          {
            id: 'leave-type-3',
            name: 'Personal Leave',
            code: 'PL',
            description: 'Personal time off',
            isPaid: false,
            maxDaysPerYear: 5
          }
        ]
      })
    }

    // Get employee data
    const employee = await getHRClient().employee.findUnique({
      where: { id: employeeId },
      include: {
        contracts: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        LeaveRequest: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        TimeEntry: {
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Check if employee has portal access
    if (employee.portalAccessStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Portal access not enabled" }, { status: 403 })
    }

    // Get recent payslips
    const payslips = await getPayrollClient().payslipGeneration.findMany({
      where: { employeeId: employeeId },
      include: {
        PayrollRecord: true
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    })

    // Get leave types
    const leaveTypes = await getHRClient().leaveType.findMany({
      where: { 
        companyId: employee.companyId,
        isActive: true 
      }
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        contractType: employee.contractType,
        workingHours: employee.workingHours
      },
      contracts: employee.contracts,
      leaveRequests: employee.LeaveRequest,
      timeEntries: employee.TimeEntry,
      payslips: payslips,
      leaveTypes: leaveTypes
    })

  } catch (error) {
    console.error("Error fetching employee portal data:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

