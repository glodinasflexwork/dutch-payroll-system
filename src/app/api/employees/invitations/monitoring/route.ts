import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hrClient, authClient } from '@/lib/database-clients'

interface MonitoringMetrics {
  overview: {
    totalEmployees: number
    needingInvitations: number
    invited: number
    active: number
    acceptanceRate: number
    avgResponseTime: number
  }
  recentActivity: {
    last24Hours: {
      invitationsSent: number
      acceptances: number
      failures: number
    }
    last7Days: {
      invitationsSent: number
      acceptances: number
      failures: number
    }
  }
  healthChecks: {
    stuckInvitations: number
    expiredTokens: number
    failureRate: number
    systemStatus: 'healthy' | 'warning' | 'critical'
    warnings: string[]
    errors: string[]
  }
  trends: {
    dailyInvitations: Array<{
      date: string
      sent: number
      accepted: number
    }>
    departmentBreakdown: Array<{
      department: string
      total: number
      invited: number
      active: number
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const days = parseInt(searchParams.get('days') || '30')

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

    // Calculate date ranges
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastNDays = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Overview metrics
    const totalEmployees = await hrClient.employee.count({
      where: {
        companyId,
        isActive: true,
        email: { not: null }
      }
    })

    const needingInvitations = await hrClient.employee.count({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'NO_ACCESS',
        email: { not: null }
      }
    })

    const invited = await hrClient.employee.count({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'INVITED'
      }
    })

    const active = await hrClient.employee.count({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'ACTIVE'
      }
    })

    const acceptanceRate = totalEmployees > 0 ? (active / (totalEmployees - needingInvitations)) * 100 : 0

    // Recent activity metrics
    const invitedLast24Hours = await hrClient.employee.count({
      where: {
        companyId,
        invitedAt: { gte: last24Hours }
      }
    })

    const invitedLast7Days = await hrClient.employee.count({
      where: {
        companyId,
        invitedAt: { gte: last7Days }
      }
    })

    // Health checks
    const stuckInvitations = await hrClient.employee.count({
      where: {
        companyId,
        portalAccessStatus: 'INVITED',
        invitedAt: {
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Invited more than 7 days ago
        }
      }
    })

    // Check for expired tokens
    const expiredTokensCount = await authClient.verificationToken.count({
      where: {
        expires: { lt: now },
        identifier: {
          in: await hrClient.employee.findMany({
            where: {
              companyId,
              portalAccessStatus: 'INVITED',
              email: { not: null }
            },
            select: { email: true }
          }).then(employees => employees.map(e => e.email).filter(Boolean) as string[])
        }
      }
    })

    // Calculate failure rate (employees invited but not active after reasonable time)
    const failedInvitations = await hrClient.employee.count({
      where: {
        companyId,
        portalAccessStatus: 'INVITED',
        invitedAt: {
          lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // Invited more than 14 days ago
        }
      }
    })

    const totalInvitationsSent = invited + active + failedInvitations
    const failureRate = totalInvitationsSent > 0 ? (failedInvitations / totalInvitationsSent) * 100 : 0

    // Determine system status and warnings
    const warnings: string[] = []
    const errors: string[] = []
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (stuckInvitations > 0) {
      warnings.push(`${stuckInvitations} invitations have been pending for more than 7 days`)
      systemStatus = 'warning'
    }

    if (expiredTokensCount > 0) {
      warnings.push(`${expiredTokensCount} invitation tokens have expired`)
      systemStatus = 'warning'
    }

    if (failureRate > 20) {
      errors.push(`High failure rate: ${failureRate.toFixed(1)}% of invitations are not being accepted`)
      systemStatus = 'critical'
    } else if (failureRate > 10) {
      warnings.push(`Elevated failure rate: ${failureRate.toFixed(1)}% of invitations are not being accepted`)
      if (systemStatus !== 'critical') systemStatus = 'warning'
    }

    if (needingInvitations > totalEmployees * 0.5) {
      warnings.push(`${needingInvitations} employees (${((needingInvitations/totalEmployees)*100).toFixed(1)}%) still need portal access`)
      if (systemStatus !== 'critical') systemStatus = 'warning'
    }

    // Daily trends for the last N days
    const dailyTrends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const sent = await hrClient.employee.count({
        where: {
          companyId,
          invitedAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      // For accepted, we need to check when they became active
      // This is a simplified approach - you might want to add an 'acceptedAt' field
      const accepted = await hrClient.employee.count({
        where: {
          companyId,
          portalAccessStatus: 'ACTIVE',
          updatedAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      dailyTrends.push({
        date: date.toISOString().split('T')[0],
        sent,
        accepted
      })
    }

    // Department breakdown
    const departmentBreakdown = await hrClient.employee.groupBy({
      by: ['department'],
      where: {
        companyId,
        isActive: true,
        email: { not: null }
      },
      _count: {
        id: true
      }
    })

    const departmentStats = await Promise.all(
      departmentBreakdown.map(async (dept) => {
        const invited = await hrClient.employee.count({
          where: {
            companyId,
            department: dept.department,
            portalAccessStatus: 'INVITED'
          }
        })

        const active = await hrClient.employee.count({
          where: {
            companyId,
            department: dept.department,
            portalAccessStatus: 'ACTIVE'
          }
        })

        return {
          department: dept.department || 'Unassigned',
          total: dept._count.id,
          invited,
          active
        }
      })
    )

    // Calculate average response time (simplified)
    const avgResponseTime = acceptanceRate > 0 ? 3.5 : 0 // Placeholder - you'd calculate this from actual data

    const metrics: MonitoringMetrics = {
      overview: {
        totalEmployees,
        needingInvitations,
        invited,
        active,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        avgResponseTime
      },
      recentActivity: {
        last24Hours: {
          invitationsSent: invitedLast24Hours,
          acceptances: 0, // Would need tracking
          failures: 0 // Would need tracking
        },
        last7Days: {
          invitationsSent: invitedLast7Days,
          acceptances: 0, // Would need tracking
          failures: 0 // Would need tracking
        }
      },
      healthChecks: {
        stuckInvitations,
        expiredTokens: expiredTokensCount,
        failureRate: Math.round(failureRate * 100) / 100,
        systemStatus,
        warnings,
        errors
      },
      trends: {
        dailyInvitations: dailyTrends,
        departmentBreakdown: departmentStats
      }
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Error fetching monitoring metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring metrics' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, action } = await request.json()

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

    switch (action) {
      case 'cleanup_expired':
        // Clean up expired tokens
        const deletedTokens = await authClient.verificationToken.deleteMany({
          where: {
            expires: { lt: new Date() }
          }
        })

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedTokens.count} expired tokens`
        })

      case 'mark_stuck_as_failed':
        // Mark stuck invitations as needing retry
        const stuckEmployees = await hrClient.employee.updateMany({
          where: {
            companyId,
            portalAccessStatus: 'INVITED',
            invitedAt: {
              lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
            }
          },
          data: {
            portalAccessStatus: 'NO_ACCESS'
          }
        })

        return NextResponse.json({
          success: true,
          message: `Marked ${stuckEmployees.count} stuck invitations for retry`
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error performing health check action:', error)
    return NextResponse.json(
      { error: 'Failed to perform health check action' },
      { status: 500 }
    )
  }
}

