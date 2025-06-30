import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== TRIAL START API DEBUG ===');
    console.log('User ID:', session.user.id);
    console.log('Company ID:', session.user.companyId);

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        subscriptions: true
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if company already has an active subscription
    const activeSubscription = company.subscriptions.find(sub => sub.status === 'active');
    
    if (activeSubscription) {
      return NextResponse.json({ 
        error: 'Company already has an active subscription',
        hasSubscription: true
      }, { status: 400 });
    }

    // Check if trial is still valid (within 14 days of company creation)
    const trialDays = 14;
    const createdAt = new Date(company.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, trialDays - daysSinceCreation);
    
    if (daysRemaining <= 0) {
      return NextResponse.json({ 
        error: 'Trial period has expired',
        trialExpired: true
      }, { status: 400 });
    }

    // Trial is automatically active based on company creation date
    // No need to create a separate trial record
    console.log('Trial activated for company:', company.name);
    console.log('Days remaining:', daysRemaining);

    return NextResponse.json({
      success: true,
      trial: {
        isActive: true,
        daysRemaining,
        isExpired: false
      },
      message: `Trial activated! You have ${daysRemaining} days remaining.`
    });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

