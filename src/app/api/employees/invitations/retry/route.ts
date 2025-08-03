import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hrClient, authClient } from '@/lib/database-clients'
import { sendEmployeeInvitationEmail } from '@/lib/email-service'
import crypto from 'crypto'

interface RetryRequest {
  companyId: string
  employeeIds?: string[]
  maxRetries?: number
  retryDelay?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      companyId,
      employeeIds,
      maxRetries = 3,
      retryDelay = 300000 // 5 minutes in milliseconds
    }: RetryRequest = await request.json()

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

    // Find employees with failed or expired invitations
    let whereClause: any = {
      companyId,
      isActive: true,
      email: {
        not: null
      },
      OR: [
        {
          portalAccessStatus: 'NO_ACCESS',
          invitedAt: {
            not: null // Previously invited but failed
          }
        },
        {
          portalAccessStatus: 'INVITED',
          invitedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Invited more than 7 days ago
          }
        }
      ]
    }

    if (employeeIds && employeeIds.length > 0) {
      whereClause.id = {
        in: employeeIds
      }
    }

    const employees = await hrClient.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeNumber: true,
        portalAccessStatus: true,
        invitedAt: true
      }
    })

    if (employees.length === 0) {
      return NextResponse.json({
        message: 'No employees found needing retry',
        results: []
      })
    }

    const retryId = crypto.randomUUID()
    const results = []

    console.log(`[RETRY ${retryId}] Starting retry process for ${employees.length} employees`)

    for (const employee of employees) {
      try {
        if (!employee.email) {
          results.push({
            employeeId: employee.id,
            status: 'skipped',
            reason: 'No email address'
          })
          continue
        }

        // Check if there's an active invitation token
        const existingToken = await authClient.verificationToken.findFirst({
          where: {
            identifier: employee.email,
            expires: {
              gt: new Date()
            }
          }
        })

        let invitationToken = existingToken?.token

        // If no active token, create a new one
        if (!existingToken) {
          invitationToken = crypto.randomBytes(32).toString('hex')
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

          await authClient.verificationToken.create({
            data: {
              identifier: employee.email,
              token: invitationToken,
              expires: expires,
            },
          })
        }

        // Create invitation link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`

        // Send retry invitation email
        await sendEmployeeInvitationEmail(
          employee.email,
          employee.firstName,
          invitationLink,
          true // isRetry flag
        )

        // Update employee status
        await hrClient.employee.update({
          where: { id: employee.id },
          data: {
            portalAccessStatus: 'INVITED',
            invitedAt: new Date(),
          },
        })

        results.push({
          employeeId: employee.id,
          email: employee.email,
          name: `${employee.firstName} ${employee.lastName}`,
          status: 'success',
          action: existingToken ? 'resent_existing' : 'created_new'
        })

        console.log(`[RETRY ${retryId}] Successfully retried invitation for ${employee.email}`)

      } catch (error) {
        console.error(`[RETRY ${retryId}] Error retrying invitation for employee ${employee.id}:`, error)
        
        results.push({
          employeeId: employee.id,
          email: employee.email || '',
          name: `${employee.firstName} ${employee.lastName}`,
          status: 'failed',
          reason: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Add delay between retries to avoid overwhelming the email service
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(retryDelay, 5000))) // Max 5 second delay
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(`[RETRY ${retryId}] Completed: ${successCount} successful, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      retryId,
      summary: {
        total: employees.length,
        successful: successCount,
        failed: failedCount
      },
      results
    })

  } catch (error) {
    console.error('Error in retry invitation process:', error)
    return NextResponse.json(
      { error: 'Failed to retry invitations' },
      { status: 500 }
    )
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

    // Find employees that might need retry
    const employeesNeedingRetry = await hrClient.employee.findMany({
      where: {
        companyId,
        isActive: true,
        email: {
          not: null
        },
        OR: [
          {
            // Previously invited but still no access (possibly failed)
            portalAccessStatus: 'NO_ACCESS',
            invitedAt: {
              not: null
            }
          },
          {
            // Invited more than 7 days ago but still not active
            portalAccessStatus: 'INVITED',
            invitedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeNumber: true,
        portalAccessStatus: true,
        invitedAt: true
      },
      orderBy: {
        invitedAt: 'asc'
      }
    })

    // Check for expired tokens
    const expiredInvitations = []
    for (const employee of employeesNeedingRetry) {
      if (employee.email) {
        const token = await authClient.verificationToken.findFirst({
          where: {
            identifier: employee.email,
            expires: {
              lt: new Date()
            }
          }
        })
        
        if (token) {
          expiredInvitations.push({
            ...employee,
            tokenExpired: true,
            expiredAt: token.expires
          })
        }
      }
    }

    return NextResponse.json({
      employeesNeedingRetry,
      expiredInvitations,
      statistics: {
        totalNeedingRetry: employeesNeedingRetry.length,
        expiredTokens: expiredInvitations.length
      }
    })

  } catch (error) {
    console.error('Error fetching retry candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retry candidates' },
      { status: 500 }
    )
  }
}

