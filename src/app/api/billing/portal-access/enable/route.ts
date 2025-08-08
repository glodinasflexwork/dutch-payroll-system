import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient, hrClient } from '@/lib/database-clients'
import { sendEmployeeInvitationEmail } from '@/lib/email-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, employeeId, sendInvitation = true } = await request.json()

    if (!companyId || !employeeId) {
      return NextResponse.json({ 
        error: 'Company ID and Employee ID are required' 
      }, { status: 400 })
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

    // Check if company can add more portal users
    const billingCheck = await fetch(`${process.env.NEXTAUTH_URL}/api/billing/portal-access/check?companyId=${companyId}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })
    
    if (!billingCheck.ok) {
      return NextResponse.json({ error: 'Failed to check billing limits' }, { status: 500 })
    }

    const { canAddEmployee, cost } = await billingCheck.json()

    if (!canAddEmployee) {
      return NextResponse.json({ 
        error: 'Portal access limit reached. Please upgrade your plan.',
        upgradeRequired: true
      }, { status: 402 })
    }

    // Get employee details from HR database
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        companyId: true,
        portalAccessStatus: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    if (employee.companyId !== companyId) {
      return NextResponse.json({ error: 'Employee does not belong to this company' }, { status: 403 })
    }

    if (!employee.email) {
      return NextResponse.json({ error: 'Employee has no email address' }, { status: 400 })
    }

    if (employee.portalAccessStatus !== 'NO_ACCESS') {
      return NextResponse.json({ 
        error: 'Employee already has portal access or invitation pending' 
      }, { status: 400 })
    }

    // Check if billing record already exists
    const existingBilling = await authClient.portalAccessBilling.findUnique({
      where: {
        companyId_employeeId: {
          companyId,
          employeeId
        }
      }
    })

    if (existingBilling) {
      return NextResponse.json({ 
        error: 'Portal access billing already exists for this employee' 
      }, { status: 400 })
    }

    // Create portal access billing record
    const startDate = new Date()
    const nextBillingDate = new Date(startDate)
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    const portalBilling = await authClient.portalAccessBilling.create({
      data: {
        companyId,
        employeeId,
        status: 'pending',
        startDate,
        nextBillingDate,
        monthlyRate: cost,
        currency: 'EUR'
      }
    })

    let invitationResult = null

    if (sendInvitation) {
      try {
        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Store invitation token
        await authClient.verificationToken.create({
          data: {
            identifier: employee.email,
            token: invitationToken,
            expires: expires,
          },
        })

        // Create invitation link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`

        // Send invitation email
        await sendEmployeeInvitationEmail(
          employee.email,
          employee.firstName,
          invitationLink
        )

        // Update employee status in HR database
        await hrClient.employee.update({
          where: { id: employeeId },
          data: {
            portalAccessStatus: 'INVITED',
            invitedAt: new Date(),
          },
        })

        // Update portal billing record
        await authClient.portalAccessBilling.update({
          where: { id: portalBilling.id },
          data: {
            invitationSentAt: new Date()
          }
        })

        // Update quota statistics
        await authClient.portalAccessQuota.update({
          where: { companyId },
          data: {
            totalInvitationsSent: {
              increment: 1
            },
            currentPendingUsers: {
              increment: 1
            },
            lastUpdated: new Date()
          }
        })

        invitationResult = {
          sent: true,
          email: employee.email,
          expiresAt: expires
        }

        console.log(`Portal access enabled and invitation sent for employee ${employeeId} (${employee.email})`)

      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        
        // Rollback the billing record if email fails
        await authClient.portalAccessBilling.delete({
          where: { id: portalBilling.id }
        })

        return NextResponse.json({ 
          error: 'Failed to send invitation email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Portal access enabled successfully',
      portalBilling: {
        id: portalBilling.id,
        status: portalBilling.status,
        monthlyRate: portalBilling.monthlyRate,
        startDate: portalBilling.startDate,
        nextBillingDate: portalBilling.nextBillingDate
      },
      invitation: invitationResult,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email
      }
    })

  } catch (error) {
    console.error('Error enabling portal access:', error)
    return NextResponse.json(
      { error: 'Failed to enable portal access' },
      { status: 500 }
    )
  }
}

