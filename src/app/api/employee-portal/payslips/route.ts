import { NextRequest, NextResponse } from "next/server"
import { getHRClient, getPayrollClient } from "@/lib/database-clients"
import fs from 'fs'
import path from 'path'

// GET /api/employee-portal/payslips - Get employee payslips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const payslipId = searchParams.get('payslipId')
    const download = searchParams.get('download') === 'true'
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await getHRClient().employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee || employee.portalAccessStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (payslipId) {
      // Get specific payslip for download
      const payslip = await getPayrollClient().payslipGeneration.findFirst({
        where: { 
          id: payslipId,
          employeeId: employeeId 
        },
        include: {
          PayrollRecord: true
        }
      })

      if (!payslip) {
        return NextResponse.json({ error: "Payslip not found" }, { status: 404 })
      }

      if (download && payslip.filePath) {
        // Update download timestamp
        await getPayrollClient().payslipGeneration.update({
          where: { id: payslipId },
          data: { downloadedAt: new Date() }
        })

        // Return file for download
        try {
          const fileBuffer = fs.readFileSync(payslip.filePath)
          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${payslip.fileName}"`
            }
          })
        } catch (fileError) {
          return NextResponse.json({ error: "File not found" }, { status: 404 })
        }
      }

      return NextResponse.json({
        success: true,
        payslip: payslip
      })
    }

    // Get all payslips for employee
    const payslips = await getPayrollClient().payslipGeneration.findMany({
      where: { employeeId: employeeId },
      include: {
        PayrollRecord: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      payslips: payslips
    })

  } catch (error) {
    console.error("Error fetching payslips:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

