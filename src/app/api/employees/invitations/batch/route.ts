import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getHRClient, getAuthClient } from '@/lib/database-clients'
import { sendEmployeeInvitationEmail } from '@/lib/email-service'
import crypto from 'crypto'

interface BatchInvitationRequest {
  companyId: string
  employeeIds?: string[]
  sendImmediately?: boolean
  batchSize?: number
  rateLimitDelay?: number
}

interface InvitationResult {
  employeeId: string
  email: string
  name: string
  status: 'success' | 'failed' | 'skipped'
  reason?: string
  invitationId?: string
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
      sendImmediately = true,
      batchSize = 10,
      rateLimitDelay = 1000
    }: BatchInvitationRequest = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify user has permission for this company
    const userCompany = await getAuthClient().userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      },
      include: {
        Company: true
      }
    })

    if (!userCompany || !['owner', 'admin', 'hr'].includes(userCompany.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get employees needing invitations
    let whereClause: any = {
      companyId,
      isActive: true,
      portalAccessStatus: 'NO_ACCESS',
      email: {
        not: null
      }
    }

    if (employeeIds && employeeIds.length > 0) {
      whereClause.id = {
        in: employeeIds
      }
    }

    const employees = await getHRClient().employee.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeNumber: true,
        position: true,
        department: true
      }
    })

    if (employees.length === 0) {
      return NextResponse.json({
        message: 'No employees found needing invitations',
        results: []
      })
    }

    const results: InvitationResult[] = []
    const batchId = crypto.randomUUID()

    // Log batch start
    await logBatchActivity(companyId, batchId, 'batch_started', {
      totalEmployees: employees.length,
      batchSize,
      initiatedBy: session.user.id
    })

    // Process employees in batches
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize)
      
      for (const employee of batch) {
        try {
          if (!employee.email) {
            results.push({
              employeeId: employee.id,
              email: '',
              name: `${employee.firstName} ${employee.lastName}`,
              status: 'skipped',
              reason: 'No email address'
            })
            continue
          }

          // Check for existing invitation
          const existingInvitation = await getAuthClient().verificationToken.findFirst({
            where: {
              identifier: employee.email,
              expires: {
                gt: new Date()
              }
            }
          })

          if (existingInvitation) {
            results.push({
              employeeId: employee.id,
              email: employee.email,
              name: `${employee.firstName} ${employee.lastName}`,
              status: 'skipped',
              reason: 'Active invitation already exists'
            })
            continue
          }

          // Generate invitation token
          const invitationToken = crypto.randomBytes(32).toString('hex')
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

          // Store invitation token
          const verificationToken = await getAuthClient().verificationToken.create({
            data: {
              identifier: employee.email,
              token: invitationToken,
              expires: expires,
            },
          })

          // Create invitation link
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`

          if (sendImmediately) {
            // Send invitation email
            await sendEmployeeInvitationEmail(
              employee.email,
              employee.firstName,
              invitationLink
            )

            // Update employee status
            await getHRClient().employee.update({
              where: { id: employee.id },
              data: {
                portalAccessStatus: 'INVITED',
                invitedAt: new Date(),
              },
            })

            // Log successful invitation
            await logInvitationActivity(companyId, employee.id, 'invitation_sent', {
              email: employee.email,
              batchId,
              invitationToken
            })
          } else {
            // Just create the token, don't send email yet
            await logInvitationActivity(companyId, employee.id, 'invitation_created', {
              email: employee.email,
              batchId,
              invitationToken
            })
          }

          results.push({
            employeeId: employee.id,
            email: employee.email,
            name: `${employee.firstName} ${employee.lastName}`,
            status: 'success',
            invitationId: verificationToken.token
          })

        } catch (error) {
          console.error(`Error processing invitation for employee ${employee.id}:`, error)
          
          results.push({
            employeeId: employee.id,
            email: employee.email || '',
            name: `${employee.firstName} ${employee.lastName}`,
            status: 'failed',
            reason: error instanceof Error ? error.message : 'Unknown error'
          })

          // Log failed invitation
          await logInvitationActivity(companyId, employee.id, 'invitation_failed', {
            email: employee.email,
            batchId,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Rate limiting delay between batches
      if (i + batchSize < employees.length && rateLimitDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay))
      }
    }

    // Log batch completion
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length
    const skippedCount = results.filter(r => r.status === 'skipped').length

    await logBatchActivity(companyId, batchId, 'batch_completed', {
      totalEmployees: employees.length,
      successCount,
      failedCount,
      skippedCount,
      results: results.map(r => ({
        employeeId: r.employeeId,
        status: r.status,
        reason: r.reason
      }))
    })

    return NextResponse.json({
      success: true,
      batchId,
      summary: {
        total: employees.length,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount
      },
      results
    })

  } catch (error) {
    console.error('Error in batch invitation process:', error)
    return NextResponse.json(
      { error: 'Failed to process batch invitations' },
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
    const userCompany = await getAuthClient().userCompany.findUnique({
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

    // Get employees needing invitations
    const employeesNeedingInvitations = await getHRClient().employee.findMany({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'NO_ACCESS',
        email: {
          not: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeNumber: true,
        position: true,
        department: true,
        startDate: true
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Get invitation statistics
    const totalEmployees = await getHRClient().employee.count({
      where: {
        companyId,
        isActive: true,
        email: {
          not: null
        }
      }
    })

    const invitedEmployees = await getHRClient().employee.count({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'INVITED'
      }
    })

    const activeEmployees = await getHRClient().employee.count({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'ACTIVE'
      }
    })

    return NextResponse.json({
      employeesNeedingInvitations,
      statistics: {
        total: totalEmployees,
        needingInvitations: employeesNeedingInvitations.length,
        invited: invitedEmployees,
        active: activeEmployees
      }
    })

  } catch (error) {
    console.error('Error fetching employees needing invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// Helper function to log batch activities
async function logBatchActivity(companyId: string, batchId: string, action: string, details: any) {
  try {
    // You can implement this based on your logging preferences
    // For now, we'll use console.log, but you might want to store in database
    console.log(`[BATCH ${batchId}] ${action}:`, {
      companyId,
      timestamp: new Date().toISOString(),
      details
    })
  } catch (error) {
    console.error('Error logging batch activity:', error)
  }
}

// Helper function to log invitation activities
async function logInvitationActivity(companyId: string, employeeId: string, action: string, details: any) {
  try {
    console.log(`[INVITATION] ${action}:`, {
      companyId,
      employeeId,
      timestamp: new Date().toISOString(),
      details
    })
  } catch (error) {
    console.error('Error logging invitation activity:', error)
  }
}

