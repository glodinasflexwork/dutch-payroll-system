import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { payrollClient } from "@/lib/database-clients"
import { withRetry } from "@/lib/database-retry"
import fs from 'fs/promises'
import path from 'path'

// GET /api/payslips/download - Download pre-generated payslip
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PayslipDownload] Starting payslip download request')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!employeeId || !year || !month) {
      return NextResponse.json({
        error: "Missing required parameters: employeeId, year, month",
        code: "INVALID_REQUEST"
      }, { status: 400 })
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)

    console.log(`🔍 [PayslipDownload] Looking for payslip: employee=${employeeId}, period=${yearNum}-${monthNum}`)

    // Find the PayslipGeneration record
    const payslipGeneration = await withRetry(async () => {
      return await payrollClient.payslipGeneration.findFirst({
        where: {
          employeeId: employeeId,
          companyId: session.user.companyId,
          PayrollRecord: {
            year: yearNum,
            month: monthNum
          }
        },
        include: {
          PayrollRecord: true
        }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    if (!payslipGeneration) {
      console.log(`❌ [PayslipDownload] Payslip not found for employee: ${employeeId}, period: ${yearNum}-${monthNum}`)
      return NextResponse.json({
        error: "Payslip not found. Please ensure payroll has been processed for this period.",
        code: "PAYSLIP_NOT_FOUND"
      }, { status: 404 })
    }

    console.log(`✅ [PayslipDownload] Found payslip: ${payslipGeneration.fileName}`)

    // Check if file exists in temporary storage
    const filePath = path.join('/tmp', 'payslips', payslipGeneration.fileName)
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      
      console.log(`✅ [PayslipDownload] Serving payslip file: ${payslipGeneration.fileName}`)
      
      // Update download timestamp
      await withRetry(async () => {
        await payrollClient.payslipGeneration.update({
          where: { id: payslipGeneration.id },
          data: { downloadedAt: new Date() }
        })
      }, { maxRetries: 1, baseDelay: 200 })

      // Return HTML content with proper headers
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${payslipGeneration.fileName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

    } catch (fileError) {
      console.error(`❌ [PayslipDownload] File not found in temporary storage: ${filePath}`)
      
      // File not found in temp storage, regenerate it
      console.log(`🔄 [PayslipDownload] Regenerating payslip file...`)
      
      // Import the payslip generator
      const { generatePayslip } = await import('@/lib/payslip-generator')
      
      const regenerationResult = await generatePayslip({
        employeeId: employeeId,
        year: yearNum,
        month: monthNum,
        companyId: session.user.companyId
      })

      if (!regenerationResult.success) {
        console.error(`❌ [PayslipDownload] Failed to regenerate payslip: ${regenerationResult.error}`)
        return NextResponse.json({
          error: "Failed to regenerate payslip file",
          code: "REGENERATION_FAILED",
          details: regenerationResult.error
        }, { status: 500 })
      }

      // Try to read the regenerated file
      try {
        const regeneratedContent = await fs.readFile(filePath, 'utf8')
        
        console.log(`✅ [PayslipDownload] Successfully regenerated and serving payslip: ${payslipGeneration.fileName}`)
        
        // Update download timestamp
        await withRetry(async () => {
          await payrollClient.payslipGeneration.update({
            where: { id: payslipGeneration.id },
            data: { downloadedAt: new Date() }
          })
        }, { maxRetries: 1, baseDelay: 200 })

        return new NextResponse(regeneratedContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="${payslipGeneration.fileName}"`,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

      } catch (regenerationError) {
        console.error(`❌ [PayslipDownload] Failed to read regenerated file: ${regenerationError}`)
        return NextResponse.json({
          error: "Failed to access regenerated payslip file",
          code: "FILE_ACCESS_ERROR"
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error("💥 [PayslipDownload] Error downloading payslip:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to download payslip",
      code: "DOWNLOAD_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/payslips/download - Check payslip availability
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [PayslipDownload] Checking payslip availability')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    const requestBody = await request.json()
    const { employeeId, year, month } = requestBody

    if (!employeeId || !year || !month) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, year, month",
        code: "INVALID_REQUEST"
      }, { status: 400 })
    }

    console.log(`🔍 [PayslipDownload] Checking availability: employee=${employeeId}, period=${year}-${month}`)

    // Check if PayslipGeneration record exists
    const payslipGeneration = await withRetry(async () => {
      return await payrollClient.payslipGeneration.findFirst({
        where: {
          employeeId: employeeId,
          companyId: session.user.companyId,
          PayrollRecord: {
            year: year,
            month: month
          }
        },
        include: {
          PayrollRecord: true
        }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    if (!payslipGeneration) {
      return NextResponse.json({
        available: false,
        message: "Payslip not available. Please process payroll for this period first.",
        code: "PAYSLIP_NOT_AVAILABLE"
      })
    }

    return NextResponse.json({
      available: true,
      payslip: {
        fileName: payslipGeneration.fileName,
        generatedAt: payslipGeneration.generatedAt,
        downloadedAt: payslipGeneration.downloadedAt,
        status: payslipGeneration.status
      },
      downloadUrl: `/api/payslips/download?employeeId=${employeeId}&year=${year}&month=${month}`
    })

  } catch (error) {
    console.error("💥 [PayslipDownload] Error checking payslip availability:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to check payslip availability",
      code: "AVAILABILITY_CHECK_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

