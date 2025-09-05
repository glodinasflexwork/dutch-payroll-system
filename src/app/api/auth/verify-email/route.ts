import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/database-clients';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await getAuthClient().verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await getAuthClient().verificationToken.delete({
        where: { token }
      });
      
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Find the user by email (identifier in verification token)
    const user = await getAuthClient().user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user as verified
    await getAuthClient().user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Clean up the verification token
    await getAuthClient().verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate verification token
export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Clean up any existing tokens for this email
  await getAuthClient().verificationToken.deleteMany({
    where: { identifier: email }
  });

  // Create new verification token
  await getAuthClient().verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  });

  return token;
}

