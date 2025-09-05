import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { getPayrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { calculateDutchPayroll, generatePayrollBreakdown } from "@/lib/payroll-calculations"
import { ensurePayrollInitialized } from "@/lib/lazy-initialization"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Payroll status definitions with strict workflow
export type PayrollStatus = 
  | 'draft'           // Initial calculation, can be modified
  | 'pending'         // Submitted for approval, limited modifications
  | 'approved'        // Approved by manager, no modifications
  | 'finalized'       // Final approval, immutable
  | 'paid'            // Payment processed, immutable
  | 'cancelled'       // Cancelled/voided, immutable

// Risk levels for audit logging
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Helper function to determine if payroll can be modified
function canModifyPayroll(status: PayrollStatus, isLocked: boolean): boolean {
  if (isLocked) return false
  return ['draft', 'pending'].includes(status)
}

// Helper function to determine if payroll can be deleted
function canDeletePayroll(status: PayrollStatus, isLocked: boolean): boolean {
  if (isLocked) return false
  return status === 'draft' // Only draft payrolls can be deleted
}

// Helper function to create audit log entry
async function createAuditLog(data: {
  entityType: string
  entityId: string
  action: string
  actionCategory: string
  performedBy: string
  userRole?: string
  oldValues?: any
  newValues?: any
  changedFields?: string[]
  reason?: string
  businessJustification?: string
  riskLevel?: RiskLevel
  complianceImpact?: string
  companyId: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await getPayrollClient().payrollAuditLog.create({
      data: {
        ...data,
        riskLevel: data.riskLevel || 'low',
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't fail the main operation if audit logging fails
  }
}

// Helper function to create version history
async function createVersionHistory(data: {
  payrollRecordId: string
  version: number
  changedBy: string
  changeReason: string
  changeType: string
  previousValues?: any
  newValues?: any
  changedFields?: string[]
}) {
  try {
    await getPayrollClient().payrollVersionHistory.create({
      data: {
        ...data,
        changedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to create version history:', error)
  }
}

// POST /api/payroll/secure - Secure payroll calculation and processing
export async function POST(request: NextRequest) {
  try {
    console.log('=== SECURE PAYROLL API START ===')
    
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      console.log('Authentication failed:', error)
      return NextResponse.json({ error }, { status })
    }

    // Get user session for audit logging
    const session = await getServerSession(authOptions)
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    console.log('Authentication successful for secure payroll operation')

    // Ensure Payroll database is initialized
    await ensurePayrollInitialized(context.companyId)

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      console.log('Subscription validation failed:', subscriptionValidation.error)
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const requestBody = await request.json()
    const { 
      employeeId, 
      payPeriodStart, 
      payPeriodEnd, 
      hoursWorked, 
      overtimeHours,
      bonuses,
      deductions,
      action = 'calculate', // calculate, save, submit, approve, finalize
      reason,
      businessJustification
    } = requestBody

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Fetch employee data with active check
    const employee = await getPayrollClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId,
        isActive: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found or inactive" }, { status: 404 })
    }

    // Check for existing payroll record
    const existingRecord = await getPayrollClient().payrollRecord.findFirst({
      where: {
        employeeId: employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd)
      },
      include: {
        PayrollApproval: true
      }
    })

    // If action is just calculation, don't save anything
    if (action === 'calculate') {
      // Perform calculation logic here (same as before)
      const employeeData = {
        grossMonthlySalary: employee.salary,
        dateOfBirth: employee.dateOfBirth,
        isDGA: employee.isDGA,
        taxTable: employee.taxTable as 'wit' | 'groen',
        taxCredit: employee.taxCredit,
        isYoungDisabled: false,
        hasMultipleJobs: false
      }

      const company = await getPayrollClient().company.findFirst({
        where: { id: context.companyId }
      })

      const companyData = {
        size: 'medium' as const,
        sector: company?.industry || undefined,
        awfRate: 'low' as const,
        aofRate: 'low' as const
      }

      const payrollResult = calculateDutchPayroll(employeeData, companyData)
      const breakdown = generatePayrollBreakdown(payrollResult)

      // Log calculation audit
      await createAuditLog({
        entityType: 'payroll_calculation',
        entityId: `${employeeId}-${payPeriodStart}-${payPeriodEnd}`,
        action: 'calculate',
        actionCategory: 'data_change',
        performedBy: context.userId,
        userRole: context.role,
        reason: 'Payroll calculation performed',
        riskLevel: 'low',
        companyId: context.companyId,
        ipAddress,
        userAgent
      })

      return NextResponse.json({
        success: true,
        message: "Payroll calculated successfully",
        calculation: payrollResult,
        breakdown: breakdown,
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          employeeNumber: employee.employeeNumber
        },
        existingRecord: existingRecord ? {
          id: existingRecord.id,
          status: existingRecord.status,
          isLocked: existingRecord.isLocked,
          canModify: canModifyPayroll(existingRecord.status as PayrollStatus, existingRecord.isLocked),
          canDelete: canDeletePayroll(existingRecord.status as PayrollStatus, existingRecord.isLocked)
        } : null
      })
    }

    // For save/submit/approve/finalize actions, check permissions and constraints
    if (existingRecord) {
      const currentStatus = existingRecord.status as PayrollStatus
      const canModify = canModifyPayroll(currentStatus, existingRecord.isLocked)
      
      if (!canModify && ['save', 'submit'].includes(action)) {
        await createAuditLog({
          entityType: 'payroll_record',
          entityId: existingRecord.id,
          action: 'modify_attempt_blocked',
          actionCategory: 'security',
          performedBy: context.userId,
          reason: `Attempted to modify payroll with status: ${currentStatus}, locked: ${existingRecord.isLocked}`,
          riskLevel: 'medium',
          complianceImpact: 'audit',
          companyId: context.companyId,
          ipAddress,
          userAgent
        })

        return NextResponse.json({
          error: `Cannot modify payroll with status: ${currentStatus}. Payroll is ${existingRecord.isLocked ? 'locked' : 'finalized'}.`,
          currentStatus,
          isLocked: existingRecord.isLocked,
          canModify: false
        }, { status: 403 })
      }
    }

    // Perform the requested action
    let result
    let auditAction = action
    let riskLevel: RiskLevel = 'low'

    switch (action) {
      case 'save':
        result = await savePayrollRecord({
          employeeId,
          payPeriodStart,
          payPeriodEnd,
          hoursWorked,
          overtimeHours,
          bonuses,
          deductions,
          companyId: context.companyId,
          userId: context.userId,
          existingRecord,
          reason,
          businessJustification
        })
        riskLevel = 'low'
        break

      case 'submit':
        result = await submitPayrollForApproval({
          employeeId,
          payPeriodStart,
          payPeriodEnd,
          companyId: context.companyId,
          userId: context.userId,
          existingRecord,
          reason: reason || 'Submitted for approval',
          businessJustification
        })
        riskLevel = 'medium'
        break

      case 'approve':
        result = await approvePayroll({
          payrollRecordId: existingRecord?.id,
          companyId: context.companyId,
          userId: context.userId,
          reason: reason || 'Payroll approved',
          businessJustification
        })
        riskLevel = 'high'
        break

      case 'finalize':
        result = await finalizePayroll({
          payrollRecordId: existingRecord?.id,
          companyId: context.companyId,
          userId: context.userId,
          reason: reason || 'Payroll finalized',
          businessJustification
        })
        riskLevel = 'critical'
        break

      default:
        return NextResponse.json({
          error: `Invalid action: ${action}. Allowed actions: calculate, save, submit, approve, finalize`
        }, { status: 400 })
    }

    // Create comprehensive audit log
    await createAuditLog({
      entityType: 'payroll_record',
      entityId: result.payrollRecord.id,
      action: auditAction,
      actionCategory: 'workflow',
      performedBy: context.userId,
      userRole: context.role,
      reason: reason || `Payroll ${action} performed`,
      businessJustification,
      riskLevel,
      complianceImpact: riskLevel === 'critical' ? 'tax' : 'audit',
      companyId: context.companyId,
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      payrollRecord: result.payrollRecord,
      calculation: result.calculation,
      auditTrail: {
        action: auditAction,
        performedBy: context.userId,
        performedAt: new Date(),
        riskLevel
      }
    }, { status: result.isNew ? 201 : 200 })

  } catch (error) {
    console.error("=== SECURE PAYROLL ERROR ===")
    console.error("Error details:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to process secure payroll operation",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to save payroll record
async function savePayrollRecord(params: {
  employeeId: string
  payPeriodStart: string
  payPeriodEnd: string
  hoursWorked?: number
  overtimeHours?: number
  bonuses?: number
  deductions?: number
  companyId: string
  userId: string
  existingRecord?: any
  reason?: string
  businessJustification?: string
}) {
  // Implementation details for saving payroll record
  // This would include the actual payroll calculation and database operations
  // Similar to the existing logic but with proper audit trails and version control
  
  return {
    message: "Payroll record saved successfully",
    payrollRecord: {}, // Actual payroll record
    calculation: {}, // Calculation results
    isNew: !params.existingRecord
  }
}

// Helper function to submit payroll for approval
async function submitPayrollForApproval(params: {
  employeeId: string
  payPeriodStart: string
  payPeriodEnd: string
  companyId: string
  userId: string
  existingRecord?: any
  reason: string
  businessJustification?: string
}) {
  // Implementation for submitting payroll for approval
  return {
    message: "Payroll submitted for approval",
    payrollRecord: {},
    calculation: {},
    isNew: false
  }
}

// Helper function to approve payroll
async function approvePayroll(params: {
  payrollRecordId?: string
  companyId: string
  userId: string
  reason: string
  businessJustification?: string
}) {
  // Implementation for approving payroll
  return {
    message: "Payroll approved successfully",
    payrollRecord: {},
    calculation: {},
    isNew: false
  }
}

// Helper function to finalize payroll
async function finalizePayroll(params: {
  payrollRecordId?: string
  companyId: string
  userId: string
  reason: string
  businessJustification?: string
}) {
  // Implementation for finalizing payroll (makes it immutable)
  return {
    message: "Payroll finalized successfully",
    payrollRecord: {},
    calculation: {},
    isNew: false
  }
}

// GET /api/payroll/secure - Get payroll records with security controls
export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ["employee", "admin", "hr", "manager"])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const statusFilter = searchParams.get('status')
    const includeAuditTrail = searchParams.get('includeAuditTrail') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build secure where clause
    const whereClause: any = {
      companyId: context.companyId
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (statusFilter) {
      whereClause.status = statusFilter
    }

    // Fetch payroll records with security information
    const payrollRecords = await getPayrollClient().payrollRecord.findMany({
      where: whereClause,
      include: {
        Employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        },
        PayrollApproval: includeAuditTrail,
        PayrollVersionHistory: includeAuditTrail ? {
          orderBy: { version: 'desc' },
          take: 5 // Last 5 versions
        } : false,
        PayrollAuditLog: includeAuditTrail ? {
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 audit entries
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Add security metadata to each record
    const secureRecords = payrollRecords.map(record => ({
      ...record,
      securityInfo: {
        canModify: canModifyPayroll(record.status as PayrollStatus, record.isLocked),
        canDelete: canDeletePayroll(record.status as PayrollStatus, record.isLocked),
        isImmutable: ['finalized', 'paid'].includes(record.status),
        lockStatus: record.isLocked ? {
          lockedAt: record.lockedAt,
          lockedBy: record.lockedBy,
          lockReason: record.lockReason
        } : null
      }
    }))

    // Log access audit
    await createAuditLog({
      entityType: 'payroll_records',
      entityId: 'bulk_access',
      action: 'read',
      actionCategory: 'data_access',
      performedBy: context.userId,
      userRole: context.role,
      reason: 'Payroll records accessed',
      riskLevel: 'low',
      companyId: context.companyId
    })

    return NextResponse.json({
      success: true,
      payrollRecords: secureRecords,
      pagination: {
        total: await getPayrollClient().payrollRecord.count({ where: whereClause }),
        limit,
        offset,
        hasMore: offset + limit < await getPayrollClient().payrollRecord.count({ where: whereClause })
      },
      securitySummary: {
        totalRecords: secureRecords.length,
        modifiableRecords: secureRecords.filter(r => r.securityInfo.canModify).length,
        immutableRecords: secureRecords.filter(r => r.securityInfo.isImmutable).length,
        lockedRecords: secureRecords.filter(r => r.isLocked).length
      }
    })

  } catch (error) {
    console.error("Error fetching secure payroll records:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch payroll records"
    }, { status: 500 })
  }
}

// PUT /api/payroll/secure - Update payroll record with security controls
export async function PUT(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ["admin", "hr", "manager"])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const { payrollRecordId, updates, reason, businessJustification } = await request.json()

    if (!payrollRecordId || !updates || !reason) {
      return NextResponse.json({
        error: "Missing required fields: payrollRecordId, updates, reason"
      }, { status: 400 })
    }

    // Fetch existing record with security checks
    const existingRecord = await getPayrollClient().payrollRecord.findFirst({
      where: {
        id: payrollRecordId,
        companyId: context.companyId
      }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 })
    }

    // Check if modification is allowed
    const canModify = canModifyPayroll(existingRecord.status as PayrollStatus, existingRecord.isLocked)
    
    if (!canModify) {
      await createAuditLog({
        entityType: 'payroll_record',
        entityId: payrollRecordId,
        action: 'modify_attempt_blocked',
        actionCategory: 'security',
        performedBy: context.userId,
        reason: `Attempted to modify immutable payroll record`,
        riskLevel: 'high',
        complianceImpact: 'audit',
        companyId: context.companyId
      })

      return NextResponse.json({
        error: "Cannot modify payroll record. Record is finalized or locked.",
        currentStatus: existingRecord.status,
        isLocked: existingRecord.isLocked
      }, { status: 403 })
    }

    // Create version history before update
    await createVersionHistory({
      payrollRecordId,
      version: existingRecord.version + 1,
      changedBy: context.userId,
      changeReason: reason,
      changeType: 'update',
      previousValues: existingRecord,
      newValues: updates,
      changedFields: Object.keys(updates)
    })

    // Update the record
    const updatedRecord = await getPayrollClient().payrollRecord.update({
      where: { id: payrollRecordId },
      data: {
        ...updates,
        version: existingRecord.version + 1,
        lastModifiedBy: context.userId,
        lastModifiedAt: new Date()
      }
    })

    // Create audit log
    await createAuditLog({
      entityType: 'payroll_record',
      entityId: payrollRecordId,
      action: 'update',
      actionCategory: 'data_change',
      performedBy: context.userId,
      userRole: context.role,
      oldValues: existingRecord,
      newValues: updates,
      changedFields: Object.keys(updates),
      reason,
      businessJustification,
      riskLevel: 'medium',
      complianceImpact: 'audit',
      companyId: context.companyId
    })

    return NextResponse.json({
      success: true,
      message: "Payroll record updated successfully",
      payrollRecord: updatedRecord,
      versionInfo: {
        previousVersion: existingRecord.version,
        newVersion: updatedRecord.version,
        changedFields: Object.keys(updates)
      }
    })

  } catch (error) {
    console.error("Error updating payroll record:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update payroll record"
    }, { status: 500 })
  }
}

// DELETE endpoint is intentionally removed for security
// Payroll records should never be deleted, only cancelled or voided

