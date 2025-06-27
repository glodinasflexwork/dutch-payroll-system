import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        companyId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(leaveTypes)
  } catch (error) {
    console.error("Error fetching leave types:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      companyId, 
      name, 
      nameNl, 
      code, 
      color, 
      isPaid, 
      requiresApproval, 
      maxDaysPerYear, 
      carryOverDays 
    } = await request.json()

    if (!companyId || !name || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if code already exists for this company
    const existingType = await prisma.leaveType.findUnique({
      where: {
        companyId_code: {
          companyId,
          code
        }
      }
    })

    if (existingType) {
      return NextResponse.json(
        { error: "Leave type code already exists" },
        { status: 400 }
      )
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        companyId,
        name,
        nameNl: nameNl || name,
        code,
        color: color || "#3B82F6",
        isPaid: isPaid !== undefined ? isPaid : true,
        requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
        maxDaysPerYear,
        carryOverDays
      }
    })

    return NextResponse.json(leaveType)
  } catch (error) {
    console.error("Error creating leave type:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

