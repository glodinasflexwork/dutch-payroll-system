import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'
import { EmailService } from '@/lib/email-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, email, role = 'employee' } = await request.json()

    if (!companyId || !email) {
      return NextResponse.json({ error: 'Company ID and email are required' }, { status: 400 })
    }

    // Verify user has permission to invite to this company
    const userCompany = await authClient.userCompany.findUnique({
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

    if (!userCompany || !['owner', 'admin'].includes(userCompany.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to invite users' }, { status: 403 })
    }

    // Check if user is already part of the company
    const existingUser = await authClient.user.findUnique({
      where: { email },
      include: {
        companies: {
          where: { companyId }
        }
      }
    })

    if (existingUser?.companies.length > 0) {
      return NextResponse.json({ error: 'User is already part of this company' }, { status: 400 })
    }

    // Check for existing invitation
    const existingInvitation = await authClient.companyInvitation.findFirst({
      where: {
        companyId,
        email,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation
    const invitation = await authClient.companyInvitation.create({
      data: {
        companyId,
        email,
        role,
        token,
        expiresAt,
        invitedBy: session.user.id
      }
    })

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/invite?token=${token}`
    
    await EmailService.sendEmail({
      to: email,
      subject: `Invitation to join ${userCompany.company.name} on SalarySync`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're invited to join ${userCompany.company.name}</h2>
          <p>Hello,</p>
          <p>${session.user.name} has invited you to join <strong>${userCompany.company.name}</strong> on SalarySync as a <strong>${role}</strong>.</p>
          <p>SalarySync is a professional Dutch payroll management platform that helps companies manage their payroll, employees, and compliance efficiently.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days. If you don't have a SalarySync account, you'll be able to create one during the process.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">SalarySync - Professional Dutch Payroll Management</p>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error sending company invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

