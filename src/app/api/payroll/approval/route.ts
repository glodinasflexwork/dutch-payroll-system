import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateSubscription } from "@/lib/subscription"

export type PayrollStatus = 
  | 'draft'           // Initial calculation, not submitted
  | 'pending'         // Submitted for approval
  | 'approved'        // Approved by manager
  | 'rejected'        // Rejected, needs revision
  | 'finalized'       // Final approval, ready for payment
  | 'paid'            // Payment processed
  | 'cancelled'       // Cancelled/voided

interface ApprovalRequest {
  payrollRecordIds: string[];
  action: 'submit' | 'approve' | 'reject' | 'finalize' | 'cancel';
  comments?: string;
  rejectionReason?: string;
}

interface ApprovalWorkflow {
  id: string;
  payrollRecordId: string;
  status: PayrollStatus;
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  finalizedBy?: string;
  finalizedAt?: Date;
  comments?: string;
  rejectionReason?: string;
  history: ApprovalHistoryEntry[];
}

interface ApprovalHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  comments?: string;
  previousStatus: PayrollStatus;
  newStatus: PayrollStatus;
}

// POST /api/payroll/approval - Submit payroll for approval or perform approval actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const {
      payrollRecordIds,
      action,
      comments,
      rejectionReason
    }: ApprovalRequest = await request.json()

    if (!payrollRecordIds || payrollRecordIds.length === 0 || !action) {
      return NextResponse.json({
        error: "Missing required fields: payrollRecordIds, action"
      }, { status: 400 })
    }

    // Verify payroll records belong to the company
    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        id: { in: payrollRecordIds },
        companyId: session.user.companyId
      },
      include: {
        Employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      }
    })

    if (payrollRecords.length !== payrollRecordIds.length) {
      return NextResponse.json({
        error: "Some payroll records not found or access denied"
      }, { status: 404 })
    }

    // Process each payroll record
    const results = []
    
    for (const payrollRecord of payrollRecords) {
      try {
        // Get or create approval workflow
        let approval = await prisma.payrollApproval.findFirst({
          where: { payrollRecordId: payrollRecord.id }
        })

        const currentStatus = approval?.status || 'draft'
        let newStatus: PayrollStatus = currentStatus

        // Determine new status based on action and current status
        switch (action) {
          case 'submit':
            if (currentStatus === 'draft' || currentStatus === 'rejected') {
              newStatus = 'pending'
            } else {
              throw new Error(`Cannot submit payroll with status: ${currentStatus}`)
            }
            break

          case 'approve':
            if (currentStatus === 'pending') {
              newStatus = 'approved'
            } else {
              throw new Error(`Cannot approve payroll with status: ${currentStatus}`)
            }
            break

          case 'reject':
            if (currentStatus === 'pending' || currentStatus === 'approved') {
              newStatus = 'rejected'
            } else {
              throw new Error(`Cannot reject payroll with status: ${currentStatus}`)
            }
            break

          case 'finalize':
            if (currentStatus === 'approved') {
              newStatus = 'finalized'
            } else {
              throw new Error(`Cannot finalize payroll with status: ${currentStatus}`)
            }
            break

          case 'cancel':
            if (['draft', 'pending', 'rejected'].includes(currentStatus)) {
              newStatus = 'cancelled'
            } else {
              throw new Error(`Cannot cancel payroll with status: ${currentStatus}`)
            }
            break

          default:
            throw new Error(`Invalid action: ${action}`)
        }

        // Create or update approval record
        if (!approval) {
          approval = await prisma.payrollApproval.create({
            data: {
              payrollRecordId: payrollRecord.id,
              companyId: session.user.companyId,
              status: newStatus,
              submittedBy: session.user.id,
              submittedAt: new Date(),
              comments: comments,
              rejectionReason: action === 'reject' ? rejectionReason : undefined,
              ...(action === 'approve' && {
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
                approvedBy: session.user.id,
                approvedAt: new Date()
              }),
              ...(action === 'finalize' && {
                finalizedBy: session.user.id,
                finalizedAt: new Date()
              })
            }
          })
        } else {
          approval = await prisma.payrollApproval.update({
            where: { id: approval.id },
            data: {
              status: newStatus,
              comments: comments || approval.comments,
              rejectionReason: action === 'reject' ? rejectionReason : approval.rejectionReason,
              ...(action === 'approve' && {
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
                approvedBy: session.user.id,
                approvedAt: new Date()
              }),
              ...(action === 'finalize' && {
                finalizedBy: session.user.id,
                finalizedAt: new Date()
              })
            }
          })
        }

        // Create history entry
        await prisma.payrollApprovalHistory.create({
          data: {
            payrollApprovalId: approval.id,
            action: action,
            performedBy: session.user.id,
            performedAt: new Date(),
            comments: comments,
            previousStatus: currentStatus,
            newStatus: newStatus
          }
        })

        results.push({
          payrollRecordId: payrollRecord.id,
          employeeName: `${payrollRecord.employee.firstName} ${payrollRecord.employee.lastName}`,
          employeeNumber: payrollRecord.employee.employeeNumber,
          status: 'success',
          previousStatus: currentStatus,
          newStatus: newStatus
        })

      } catch (error) {
        console.error(`Error processing approval for payroll ${payrollRecord.id}:`, error)
        
        results.push({
          payrollRecordId: payrollRecord.id,
          employeeName: `${payrollRecord.employee.firstName} ${payrollRecord.employee.lastName}`,
          employeeNumber: payrollRecord.employee.employeeNumber,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      success: errorCount === 0,
      message: `Processed ${successCount} payroll records, ${errorCount} errors`,
      results: results
    }, {
      status: errorCount > 0 ? 207 : 200
    })

  } catch (error) {
    console.error("Error in payroll approval:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process payroll approval"
    }, { status: 500 })
  }
}

// GET /api/payroll/approval - Get payroll approval workflows
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as PayrollStatus | null
    const payPeriodStart = searchParams.get('payPeriodStart')
    const payPeriodEnd = searchParams.get('payPeriodEnd')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for payroll records
    const payrollWhere: any = {
      companyId: session.user.companyId
    }

    if (payPeriodStart && payPeriodEnd) {
      payrollWhere.payPeriodStart = {
        gte: new Date(payPeriodStart),
        lte: new Date(payPeriodEnd)
      }
    }

    // Build where clause for approvals
    const approvalWhere: any = {
      companyId: session.user.companyId
    }

    if (status) {
      approvalWhere.status = status
    }

    // Fetch approval workflows
    const approvals = await prisma.payrollApproval.findMany({
      where: approvalWhere,
      include: {
        payrollRecord: {
          where: payrollWhere,
          include: {
            Employee: {
              select: {
                id: true,
                employeeNumber: true,
                firstName: true,
                lastName: true,
                position: true
              }
            }
          }
        },
        history: {
          orderBy: { performedAt: 'desc' },
          include: {
            performedByUser: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        submittedByUser: {
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
        },
        finalizedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Filter out approvals where payroll record doesn't match criteria
    const filteredApprovals = approvals.filter(approval => approval.payrollRecord)

    // Get total count
    const totalCount = await prisma.payrollApproval.count({
      where: {
        ...approvalWhere,
        payrollRecord: payrollWhere
      }
    })

    // Get status summary
    const statusSummary = await prisma.payrollApproval.groupBy({
      by: ['status'],
      where: {
        ...approvalWhere,
        payrollRecord: payrollWhere
      },
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      approvals: filteredApprovals,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount
      },
      statusSummary: statusSummary.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<PayrollStatus, number>)
    })

  } catch (error) {
    console.error("Error fetching payroll approvals:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch payroll approvals"
    }, { status: 500 })
  }
}

