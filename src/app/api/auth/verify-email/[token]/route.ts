import { NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/database-clients"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=invalid-token", request.url)
      )
    }

    // Find user by verification token
    const user = await authClient.user.findUnique({
      where: { emailVerificationToken: token },
      include: {
        UserCompany: {
          include: { Company: true }
        }
      }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=invalid-token", request.url)
      )
    }

    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL("/auth/signin?message=already-verified", request.url)
      )
    }

    // Activate user and company in transaction
    await authClient.$transaction(async (tx) => {
      // Activate user
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          emailVerificationToken: null
        }
      })

      // Update company timestamp (companies are created active by default)
      // This step is mainly for consistency and future extensibility
      if (user.UserCompany?.[0]?.Company) {
        await tx.company.update({
          where: { id: user.UserCompany[0].Company.id },
          data: {
            updatedAt: new Date()
          }
        })
      }
    })

    // Redirect to success page with company context
    const companyName = user.UserCompany?.[0]?.Company?.name || 'your company'
    return NextResponse.redirect(
      new URL(`/auth/verification-success?company=${encodeURIComponent(companyName)}`, request.url)
    )

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/signin?error=verification-failed", request.url)
    )
  }
}
