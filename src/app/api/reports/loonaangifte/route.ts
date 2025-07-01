import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateSubscription } from "@/lib/subscription"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 })
    }

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        name: true,
        address: true,
        city: true,
        postalCode: true,
        loonheffingsnummer: true,
        kvkNumber: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Calculate date range for the specified month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Fetch payroll records for the period
    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        companyId: session.user.companyId,
        payPeriodStart: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      }
    })

    // Get employee counts
    const activeEmployees = await prisma.employee.count({
      where: {
        companyId: session.user.companyId,
        isActive: true
      }
    })

    // Calculate wage totals
    const wageTotals = payrollRecords.reduce((acc, record) => {
      // Wages subject to income tax and social insurance
      acc.loonLoonbelasting += record.grossPay || 0
      
      // Wages subject to employee insurance (WW, WIA, etc.)
      acc.loonWerknemersverzekeringen += record.grossPay || 0
      
      // Tax withholdings
      acc.ingehoudenloonbelasting += record.totalDeductions || 0
      
      // Social insurance contributions
      acc.aowContribution += record.aowContribution || 0
      acc.wlzContribution += record.wlzContribution || 0
      acc.wwContribution += record.wwContribution || 0
      acc.wiaContribution += record.wiaContribution || 0
      
      return acc
    }, {
      loonLoonbelasting: 0,
      loonWerknemersverzekeringen: 0,
      ingehoudenloonbelasting: 0,
      aowContribution: 0,
      wlzContribution: 0,
      wwContribution: 0,
      wiaContribution: 0
    })

    // Calculate payment deadline (28th of next month)
    const paymentDeadline = new Date(year, month, 28)
    
    // Generate message reference (simplified version)
    const messageReference = `${company.loonheffingsnummer || 'UNKNOWN'}_${Date.now().toString().slice(-6)}`
    
    // Generate payment reference (simplified version)
    const paymentReference = company.loonheffingsnummer 
      ? `${company.loonheffingsnummer.slice(0, 4)} ${company.loonheffingsnummer.slice(4, 8)} ${company.loonheffingsnummer.slice(8)} ${month.toString().padStart(2, '0')}${year.toString().slice(-2)}`
      : 'UNKNOWN'

    // Format period name
    const monthNames = [
      "Januari", "Februari", "Maart", "April", "Mei", "Juni",
      "Juli", "Augustus", "September", "Oktober", "November", "December"
    ]
    const periodName = `${monthNames[month - 1]} ${year}`

    // Calculate total amount due
    const totalAmountDue = wageTotals.ingehoudenloonbelasting

    // Prepare response data
    const loonaangifteData = {
      company: {
        name: company.name,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        loonheffingsnummer: company.loonheffingsnummer || 'UNKNOWN'
      },
      period: periodName,
      messageReference,
      paymentReference,
      paymentDeadline: paymentDeadline.toLocaleDateString('nl-NL'),
      bankDetails: {
        account: "NL86INGB0002445588",
        bank: "ING"
      },
      wageInformation: {
        loonLoonbelasting: wageTotals.loonLoonbelasting,
        loonWerknemersverzekeringen: wageTotals.loonWerknemersverzekeringen
      },
      taxWithholdings: {
        ingehoudenloonbelasting: wageTotals.ingehoudenloonbelasting,
        total: wageTotals.ingehoudenloonbelasting
      },
      insurancePremiums: {
        gedifferentieerdePremieWhk: 0, // Simplified - would need sector-specific calculation
        total: 0
      },
      paymentSpecification: {
        saldoAangifte: totalAmountDue,
        total: totalAmountDue
      },
      keyFigures: {
        aantalWerknemersInitieel: activeEmployees,
        aantalWerknemersIntrekking: 0,
        aantalWerknemersCorrectie: 0
      },
      socialInsuranceBreakdown: {
        aow: wageTotals.aowContribution,
        wlz: wageTotals.wlzContribution,
        ww: wageTotals.wwContribution,
        wia: wageTotals.wiaContribution,
        zvw: wageTotals.zvwContribution
      },
      payrollSummary: {
        numberOfRecords: payrollRecords.length,
        totalGrossWages: wageTotals.loonLoonbelasting,
        totalDeductions: wageTotals.ingehoudenloonbelasting,
        netWages: wageTotals.loonLoonbelasting - wageTotals.ingehoudenloonbelasting
      }
    }

    return NextResponse.json({
      success: true,
      data: loonaangifteData
    })

  } catch (error) {
    console.error("Error generating Loonaangifte:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate Loonaangifte"
    }, { status: 500 })
  }
}

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

    const body = await request.json()
    const { year, month, format = 'json' } = body

    // Get the loonaangifte data
    const loonaangifteResponse = await GET(request)
    const loonaangifteData = await loonaangifteResponse.json()

    if (!loonaangifteData.success) {
      return loonaangifteData
    }

    if (format === 'pdf') {
      // TODO: Implement PDF generation
      return NextResponse.json({
        success: false,
        error: "PDF generation not yet implemented"
      }, { status: 501 })
    }

    return NextResponse.json(loonaangifteData)

  } catch (error) {
    console.error("Error processing Loonaangifte request:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 })
  }
}

