import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reviewedBy, comments } = await request.json()
    const leaveRequestId = params.id

    if (!action || !reviewedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    // Check if leave request exists
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: true,
        leaveType: true
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      )
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json(
        { error: "Leave request has already been processed" },
        { status: 400 }
      )
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy,
      reviewedAt: new Date(),
      comments: comments || null
    }

    if (action === 'approve') {
      updateData.approvedBy = reviewedBy
      updateData.approvedAt = new Date()
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: updateData,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        leaveType: {
          select: {
            name: true,
            nameNl: true,
            color: true
          }
        },
        reviewedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // If approved, update leave balance
    if (action === 'approve') {
      try {
        await prisma.leaveBalance.updateMany({
          where: {
            employeeId: existingRequest.employeeId,
            leaveTypeId: existingRequest.leaveTypeId,
            year: new Date().getFullYear()
          },
          data: {
            used: {
              increment: existingRequest.daysRequested
            },
            available: {
              decrement: existingRequest.daysRequested
            }
          }
        })
      } catch (balanceError) {
        console.error("Error updating leave balance:", balanceError)
        // Don't fail the approval if balance update fails
      }
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Error processing leave request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

