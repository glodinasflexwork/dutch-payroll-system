import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify user has permission for this company
    const userCompany = await authClient.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      }
    })

    if (!userCompany) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get portal access quota
    const quota = await authClient.portalAccessQuota.findUnique({
      where: { companyId }
    })

    // Get active portal access billing records
    const activeUsers = await authClient.portalAccessBilling.findMany({
      where: {
        companyId,
        status: 'active'
      },
      select: {
        id: true,
        employeeId: true,
        monthlyRate: true,
        startDate: true,
        totalBilled: true,
        totalPaid: true
      }
    })

    // Get pending invitations
    const pendingInvitations = await authClient.portalAccessBilling.findMany({
      where: {
        companyId,
        status: 'pending'
      },
      select: {
        id: true,
        employeeId: true,
        monthlyRate: true,
        invitationSentAt: true
      }
    })

    // Calculate monthly revenue
    const monthlyRevenue = activeUsers.reduce((sum, user) => sum + user.monthlyRate, 0)
    const pendingRevenue = pendingInvitations.reduce((sum, invitation) => sum + invitation.monthlyRate, 0)

    // Get recent billing transactions
    const recentTransactions = await authClient.portalBillingTransaction.findMany({
      where: {
        PortalAccessBilling: {
          companyId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        PortalAccessBilling: {
          select: {
            employeeId: true
          }
        }
      }
    })

    // Calculate statistics
    const totalBilled = activeUsers.reduce((sum, user) => sum + user.totalBilled, 0)
    const totalPaid = activeUsers.reduce((sum, user) => sum + user.totalPaid, 0)
    const outstandingAmount = totalBilled - totalPaid

    // Get subscription info for limits
    const subscription = await authClient.subscription.findUnique({
      where: { companyId },
      include: { Plan: true }
    })

    const maxPortalUsers = quota?.maxPortalUsers || 5
    const availableSlots = maxPortalUsers - activeUsers.length - pendingInvitations.length

    return NextResponse.json({
      summary: {
        activeUsers: activeUsers.length,
        pendingInvitations: pendingInvitations.length,
        maxPortalUsers,
        availableSlots,
        monthlyRevenue,
        pendingRevenue,
        totalRevenue: quota?.totalRevenue || 0,
        totalBilled,
        totalPaid,
        outstandingAmount
      },
      quota: quota ? {
        totalInvitationsSent: quota.totalInvitationsSent,
        totalAcceptances: quota.totalAcceptances,
        totalCancellations: quota.totalCancellations,
        lastUpdated: quota.lastUpdated
      } : null,
      activeUsers: activeUsers.map(user => ({
        id: user.id,
        employeeId: user.employeeId,
        monthlyRate: user.monthlyRate,
        startDate: user.startDate,
        totalBilled: user.totalBilled,
        totalPaid: user.totalPaid
      })),
      pendingInvitations: pendingInvitations.map(invitation => ({
        id: invitation.id,
        employeeId: invitation.employeeId,
        monthlyRate: invitation.monthlyRate,
        invitationSentAt: invitation.invitationSentAt
      })),
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        paymentStatus: transaction.paymentStatus,
        createdAt: transaction.createdAt,
        employeeId: transaction.PortalAccessBilling.employeeId
      })),
      subscription: subscription ? {
        planName: subscription.Plan.name,
        planPrice: subscription.Plan.price,
        status: subscription.status
      } : null
    })

  } catch (error) {
    console.error('Error fetching portal access billing summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing summary' },
      { status: 500 }
    )
  }
}

