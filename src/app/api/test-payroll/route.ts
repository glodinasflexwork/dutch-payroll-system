import { NextRequest, NextResponse } from "next/server"
import { getPayrollClient, getHRClient } from "@/lib/database-clients"
import { calculateDutchPayroll } from "@/lib/payroll-calculations"

// Test endpoint to verify payroll functionality without authentication
export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST PAYROLL ENDPOINT START ===")
    
    const requestBody = await request.json()
    console.log("Request body:", requestBody)
    
    const { 
      payPeriodStart, 
      payPeriodEnd,
      testMode = true
    } = requestBody

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    console.log("Testing payroll for period:", payPeriodStart, "to", payPeriodEnd)

    // Parse pay period dates to get year and month
    // Fix: Use proper date parsing to handle month correctly
    const payPeriodStartDate = new Date(payPeriodStart + 'T00:00:00.000Z')
    const year = payPeriodStartDate.getUTCFullYear()
    const month = payPeriodStartDate.getUTCMonth() + 1

    console.log("🗓️ Date parsing debug:")
    console.log("- Input payPeriodStart:", payPeriodStart)
    console.log("- Parsed date object:", payPeriodStartDate)
    console.log("- Extracted year:", year)
    console.log("- Extracted month:", month)
    console.log("- Expected for November: month should be 11")

    // Test database connections
    try {
      console.log("Testing database connections...")
      
      // Test HR database
      const hrTestResult = await getHRClient().$queryRaw`SELECT 1 as test`
      console.log("HR database test:", hrTestResult)
      
      // Test Payroll database
      const payrollTestResult = await getPayrollClient().$queryRaw`SELECT 1 as test`
      console.log("Payroll database test:", payrollTestResult)
      
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json({
        error: "Database connection failed",
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Test payroll calculation
    const testEmployeeData = {
      grossMonthlySalary: 3500,
      dateOfBirth: new Date('1990-01-01'),
      isDGA: false,
      taxTable: 'wit' as const,
      taxCredit: 3070,
      isYoungDisabled: false,
      hasMultipleJobs: false
    }

    const testCompanyData = {
      size: 'medium' as const,
      sector: 'technology',
      awfRate: 'low' as const,
      aofRate: 'low' as const
    }

    console.log("Testing payroll calculation...")
    const payrollResult = calculateDutchPayroll(testEmployeeData, testCompanyData)
    console.log("Payroll calculation result:", payrollResult)

    // Test creating a payroll record (if not in test mode)
    let testRecord = null
    if (!testMode) {
      try {
        console.log("Creating test payroll record...")
        
        // Use a unique employee ID for each test to avoid conflicts
        const uniqueEmployeeId = `test-employee-${Date.now()}`
        const uniqueEmployeeNumber = `TEST${Date.now().toString().slice(-6)}`
        
        testRecord = await getPayrollClient().payrollRecord.create({
          data: {
            employeeId: uniqueEmployeeId,
            employeeNumber: uniqueEmployeeNumber,
            firstName: 'Test',
            lastName: 'Employee',
            companyId: 'test-company-id',
            period: `${year}-${month.toString().padStart(2, '0')}`,
            year: year,
            month: month,
            grossSalary: payrollResult.grossMonthlySalary,
            netSalary: payrollResult.netMonthlySalary,
            taxDeduction: 0,
            socialSecurity: (payrollResult.aowContribution + payrollResult.wlzContribution) / 12,
            pensionDeduction: (payrollResult.wwContribution + payrollResult.wiaContribution) / 12,
            holidayAllowance: payrollResult.holidayAllowanceGross / 12,
            paymentDate: new Date(),
            status: 'processed'
          }
        })
        console.log("Test record created:", testRecord)
      } catch (recordError) {
        console.error("Error creating test record:", recordError)
        return NextResponse.json({
          error: "Failed to create test record",
          details: recordError instanceof Error ? recordError.message : 'Unknown error',
          calculation: payrollResult
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payroll test completed successfully",
      testData: {
        payPeriod: { start: payPeriodStart, end: payPeriodEnd },
        parsedDate: { year, month },
        calculation: payrollResult,
        testRecord: testRecord
      }
    })

  } catch (error) {
    console.error("=== TEST PAYROLL ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Test payroll endpoint failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for basic testing
export async function GET() {
  return NextResponse.json({
    message: "Test payroll endpoint is working",
    timestamp: new Date().toISOString()
  })
}

