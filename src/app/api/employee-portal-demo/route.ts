import { NextRequest, NextResponse } from "next/server"

// GET /api/employee-portal-demo - Get employee portal data (demo version without auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Return mock data for demo purposes
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
        },
        {
          id: 'time-3',
          date: '2024-07-18T00:00:00Z',
          hoursWorked: 8.5,
          description: 'Database optimization',
          projectCode: 'PROJ-002',
          isApproved: true,
          createdAt: '2024-07-18T18:00:00Z'
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
        },
        {
          id: 'payslip-3',
          fileName: 'payslip-2024-04.pdf',
          status: 'generated',
          createdAt: '2024-05-01T09:00:00Z',
          PayrollRecord: {
            period: 'April 2024',
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

  } catch (error) {
    console.error("Error fetching employee portal data:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

