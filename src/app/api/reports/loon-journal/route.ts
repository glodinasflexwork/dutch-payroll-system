import { getServerSession } from "next-auth/next"
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
        loonheffingsnummer: true
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
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Calculate totals
    const totals = payrollRecords.reduce((acc, record) => {
      acc.grossWages += record.grossPay || 0
      acc.totalDeductions += record.totalDeductions || 0
      acc.netWages += record.netPay || 0
      acc.aowContribution += record.aowContribution || 0
      acc.anwContribution += record.anwContribution || 0
      acc.wlzContribution += record.wlzContribution || 0
      acc.zvwContribution += (record.grossPay || 0) * 0.0565 // Calculate ZVW
      return acc
    }, {
      grossWages: 0,
      totalDeductions: 0,
      netWages: 0,
      aowContribution: 0,
      anwContribution: 0,
      wlzContribution: 0,
      zvwContribution: 0
    })

    // Generate journal entries
    const journalEntries = [
      {
        accountCode: "4000",
        accountName: "Brutolonen",
        debit: totals.grossWages,
        credit: 0
      },
      {
        accountCode: "1810",
        accountName: "Te betalen loonheffingen",
        debit: 0,
        credit: totals.totalDeductions
      },
      {
        accountCode: "1820",
        accountName: "Te betalen nettolonen",
        debit: 0,
        credit: totals.netWages
      }
    ]

    // Calculate totals for balancing
    const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0)
    const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0)

    // Format period name
    const monthNames = [
      "Januari", "Februari", "Maart", "April", "Mei", "Juni",
      "Juli", "Augustus", "September", "Oktober", "November", "December"
    ]
    const periodName = `${monthNames[month - 1]} ${year}`

    // Prepare response data
    const loonJournalData = {
      company: {
        name: company.name,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode
      },
      period: periodName,
      creationDate: new Date().toLocaleString('nl-NL'),
      journalEntries,
      totals: {
        debit: totalDebit,
        credit: totalCredit
      },
      payrollSummary: {
        numberOfEmployees: payrollRecords.length,
        grossWages: totals.grossWages,
        totalDeductions: totals.totalDeductions,
        netWages: totals.netWages,
        socialInsurance: {
          aow: totals.aowContribution,
          anw: totals.anwContribution,
          wlz: totals.wlzContribution,
          zvw: totals.zvwContribution
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: loonJournalData
    })

  } catch (error) {
    console.error("Error generating Loon Journal:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate Loon Journal"
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

    // Get the journal data
    const journalResponse = await GET(request)
    const journalData = await journalResponse.json()

    if (!journalData.success) {
      return journalData
    }

    if (format === 'pdf') {
      // TODO: Implement PDF generation
      return NextResponse.json({
        success: false,
        error: "PDF generation not yet implemented"
      }, { status: 501 })
    }

    return NextResponse.json(journalData)

  } catch (error) {
    console.error("Error processing Loon Journal request:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 })
  }
}

