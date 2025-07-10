import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin?error=invalid-token", req.url))
    }

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin?error=invalid-token", req.url))
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(new URL("/auth/signin?message=already-verified", req.url))
    }

    // Verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null
      }
    })

    // Redirect to success page
    return NextResponse.redirect(new URL("/auth/verified", req.url))

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/auth/signin?error=verification-failed", req.url))
  }
}

