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

    if (!userCompany || !['owner', 'admin', 'hr'].includes(userCompany.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get or create portal access quota for the company
    let quota = await authClient.portalAccessQuota.findUnique({
      where: { companyId }
    })

    if (!quota) {
      // Create default quota based on subscription
      const subscription = await authClient.subscription.findUnique({
        where: { companyId },
        include: { Plan: true }
      })

      const maxPortalUsers = getMaxPortalUsersFromPlan(subscription?.Plan)

      quota = await authClient.portalAccessQuota.create({
        data: {
          companyId,
          maxPortalUsers,
          currentActiveUsers: 0,
          currentPendingUsers: 0
        }
      })
    }

    // Get current active portal access billing records
    const activePortalUsers = await authClient.portalAccessBilling.count({
      where: {
        companyId,
        status: 'active'
      }
    })

    // Get pending invitations
    const pendingInvitations = await authClient.portalAccessBilling.count({
      where: {
        companyId,
        status: 'pending'
      }
    })

    // Update quota with current counts
    await authClient.portalAccessQuota.update({
      where: { companyId },
      data: {
        currentActiveUsers: activePortalUsers,
        currentPendingUsers: pendingInvitations,
        lastUpdated: new Date()
      }
    })

    const availableSlots = quota.maxPortalUsers - activePortalUsers - pendingInvitations
    const canAddEmployee = availableSlots > 0

    // Get pricing from plan or default
    const subscription = await authClient.subscription.findUnique({
      where: { companyId },
      include: { Plan: true }
    })

    const portalAccessCost = getPortalAccessCostFromPlan(subscription?.Plan)

    return NextResponse.json({
      canAddEmployee,
      currentActiveUsers: activePortalUsers,
      currentPendingUsers: pendingInvitations,
      maxAllowed: quota.maxPortalUsers,
      availableSlots,
      cost: portalAccessCost,
      currency: 'EUR',
      quota: {
        totalInvitationsSent: quota.totalInvitationsSent,
        totalAcceptances: quota.totalAcceptances,
        monthlyRevenue: quota.monthlyRevenue,
        totalRevenue: quota.totalRevenue
      }
    })

  } catch (error) {
    console.error('Error checking portal access billing:', error)
    return NextResponse.json(
      { error: 'Failed to check portal access billing' },
      { status: 500 }
    )
  }
}

function getMaxPortalUsersFromPlan(plan: any): number {
  if (!plan) return 5 // Default for no plan
  
  // Extract from plan features or use defaults based on plan name
  if (plan.features?.maxPortalUsers) {
    return plan.features.maxPortalUsers
  }
  
  // Default based on plan name/price
  if (plan.price <= 50) return 5      // Starter plan
  if (plan.price <= 150) return 25    // Professional plan
  return 100                          // Enterprise plan
}

function getPortalAccessCostFromPlan(plan: any): number {
  if (!plan) return 5.00 // Default cost
  
  // Extract from plan features or use defaults based on plan tier
  if (plan.features?.portalAccessCost) {
    return plan.features.portalAccessCost
  }
  
  // Tiered pricing based on plan
  if (plan.price <= 50) return 5.00   // Starter: €5/month
  if (plan.price <= 150) return 4.00  // Professional: €4/month  
  return 3.00                         // Enterprise: €3/month
}

