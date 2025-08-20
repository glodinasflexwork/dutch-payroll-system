import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { payrollClient } from "@/lib/database-clients"
import { withRetry } from "@/lib/database-retry"
import { 
  resolveCompanyFromSession, 
  handleCompanyResolutionError 
} from "@/lib/universal-company-resolver"
import fs from 'fs/promises'
import path from 'path'

// GET /api/payslips/download - Download pre-generated payslip
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PayslipDownload] Starting payslip download request with Universal Company Resolution')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    console.log(`🔍 [PayslipDownload] Resolving company for user: ${session.user.id}`)

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      console.log(`❌ [PayslipDownload] Company resolution failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ [PayslipDownload] Successfully resolved company: ${company.name}`)

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
    let payslipGeneration = await withRetry(async () => {
      return await payrollClient.payslipGeneration.findFirst({
        where: {
          employeeId: employeeId,
          companyId: companyId,
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

    // If no PayslipGeneration record exists, generate payslip on-demand
    if (!payslipGeneration) {
      console.log(`🔄 [PayslipDownload] No PayslipGeneration record found, generating payslip on-demand...`)
      
      // First, verify the PayrollRecord exists
      const payrollRecord = await withRetry(async () => {
        return await payrollClient.payrollRecord.findFirst({
          where: {
            employeeId: employeeId,
            companyId: companyId,
            year: yearNum,
            month: monthNum
          }
        })
      }, { maxRetries: 2, baseDelay: 500 })

      if (!payrollRecord) {
        console.log(`❌ [PayslipDownload] PayrollRecord not found for employee: ${employeeId}, period: ${yearNum}-${monthNum}`)
        return NextResponse.json({
          error: "Payslip not available - Please process payroll for this period first before downloading the payslip.",
          code: "PAYROLL_NOT_PROCESSED"
        }, { status: 404 })
      }

      console.log(`✅ [PayslipDownload] Found PayrollRecord, generating payslip on-demand...`)

      // Generate payslip using direct function call instead of HTTP fetch
      try {
        const { generatePayslip } = await import('@/lib/payslip-generator')
        
        const generationResult = await generatePayslip({
          employeeId: employeeId,
          year: yearNum,
          month: monthNum,
          companyId: companyId
        })

        if (!generationResult.success) {
          console.error(`❌ [PayslipDownload] Failed to generate payslip on-demand: ${generationResult.error}`)
          return NextResponse.json({
            error: "Failed to generate payslip on-demand",
            code: "GENERATION_FAILED",
            details: generationResult.error
          }, { status: 500 })
        }

        console.log(`✅ [PayslipDownload] Successfully generated payslip on-demand`)
        
        // Return the generated payslip content directly
        return new NextResponse(generationResult.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="payslip-${employeeId}-${yearNum}-${String(monthNum).padStart(2, '0')}.html"`,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

      } catch (generationError) {
        console.error(`❌ [PayslipDownload] Error generating payslip on-demand:`, generationError)
        return NextResponse.json({
          error: "Failed to generate payslip on-demand",
          code: "GENERATION_ERROR",
          details: generationError.message
        }, { status: 500 })
      }
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
        companyId: companyId
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
    console.log('🔍 [PayslipDownload] Checking payslip availability with Universal Company Resolution')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    console.log(`🔍 [PayslipDownload] Resolving company for user: ${session.user.id}`)

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      console.log(`❌ [PayslipDownload] Company resolution failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ [PayslipDownload] Successfully resolved company: ${company.name}`)

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
          companyId: companyId,
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

