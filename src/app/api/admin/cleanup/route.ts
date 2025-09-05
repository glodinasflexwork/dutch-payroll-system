import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPayrollClient } from "@/lib/database-clients"
import { withRetry } from "@/lib/database-retry"

// POST /api/admin/cleanup - Clean up payroll and payslip records for testing
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 [AdminCleanup] Starting database cleanup for testing')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    const companyId = session.user.companyId

    console.log(`🧹 [AdminCleanup] Cleaning up records for company: ${companyId}`)

    // Step 1: Delete PayslipGeneration records first (due to foreign key constraints)
    const deletedPayslips = await withRetry(async () => {
      console.log('🗑️ [AdminCleanup] Deleting PayslipGeneration records...')
      return await getPayrollClient().payslipGeneration.deleteMany({
        where: {
          companyId: companyId
        }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    console.log(`✅ [AdminCleanup] Deleted ${deletedPayslips.count} PayslipGeneration records`)

    // Step 2: Delete PayrollRecord records
    const deletedPayrolls = await withRetry(async () => {
      console.log('🗑️ [AdminCleanup] Deleting PayrollRecord records...')
      return await getPayrollClient().payrollRecord.deleteMany({
        where: {
          companyId: companyId
        }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    console.log(`✅ [AdminCleanup] Deleted ${deletedPayrolls.count} PayrollRecord records`)

    // Step 3: Verify cleanup
    const remainingPayrolls = await getPayrollClient().payrollRecord.count({
      where: { companyId: companyId }
    })

    const remainingPayslips = await getPayrollClient().payslipGeneration.count({
      where: { companyId: companyId }
    })

    console.log(`✅ [AdminCleanup] Cleanup complete - Remaining: ${remainingPayrolls} payrolls, ${remainingPayslips} payslips`)

    return NextResponse.json({
      success: true,
      message: "Database cleanup completed successfully",
      deleted: {
        payrollRecords: deletedPayrolls.count,
        payslipRecords: deletedPayslips.count
      },
      remaining: {
        payrollRecords: remainingPayrolls,
        payslipRecords: remainingPayslips
      },
      nextSteps: [
        "Process new payroll for March 2026",
        "Verify auto-generation creates payslip",
        "Test download functionality"
      ]
    })

  } catch (error) {
    console.error("💥 [AdminCleanup] Error during database cleanup:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to cleanup database",
      code: "CLEANUP_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/admin/cleanup - Check current record counts
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [AdminCleanup] Checking current record counts')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    const companyId = session.user.companyId

    const payrollCount = await getPayrollClient().payrollRecord.count({
      where: { companyId: companyId }
    })

    const payslipCount = await getPayrollClient().payslipGeneration.count({
      where: { companyId: companyId }
    })

    // Get recent records for reference
    const recentPayrolls = await getPayrollClient().payrollRecord.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        year: true,
        month: true,
        createdAt: true
      }
    })

    const recentPayslips = await getPayrollClient().payslipGeneration.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        employeeId: true,
        fileName: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      counts: {
        payrollRecords: payrollCount,
        payslipRecords: payslipCount
      },
      recentRecords: {
        payrolls: recentPayrolls,
        payslips: recentPayslips
      }
    })

  } catch (error) {
    console.error("💥 [AdminCleanup] Error checking record counts:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to check record counts",
      code: "COUNT_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

