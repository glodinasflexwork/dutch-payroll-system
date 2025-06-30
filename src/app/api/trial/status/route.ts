import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== TRIAL STATUS API DEBUG ===');
    console.log('User ID:', session.user.id);
    console.log('Company ID:', session.user.companyId);

    // Get company with subscriptions
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        subscriptions: {
          include: { plan: true }
        }
      }
    });

    console.log('Company found:', company?.name);
    console.log('Subscriptions:', company?.subscriptions);

    if (!company) {
      return NextResponse.json({ 
        trial: { isActive: false, daysRemaining: 0, isExpired: true },
        hasSubscription: false
      });
    }

    // Check if company has active subscription
    const activeSubscription = company.subscriptions.find(sub => sub.status === 'active');
    
    console.log('Looking for active subscription...');
    console.log('All subscriptions:', company.subscriptions.map(sub => ({
      id: sub.id,
      status: sub.status,
      planName: sub.plan?.name
    })));
    console.log('Active subscription found:', activeSubscription ? {
      id: activeSubscription.id,
      status: activeSubscription.status,
      planName: activeSubscription.plan?.name
    } : null);
    
    if (activeSubscription) {
      console.log('Active subscription found:', activeSubscription.plan?.name);
      return NextResponse.json({
        trial: { isActive: false, daysRemaining: 0, isExpired: false },
        hasSubscription: true,
        subscription: activeSubscription
      });
    }

    // Check trial status based on company creation date
    const trialDays = 14;
    const createdAt = new Date(company.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, trialDays - daysSinceCreation);
    const isActive = daysRemaining > 0;
    const isExpired = daysSinceCreation >= trialDays;

    console.log('Trial calculation:', {
      createdAt: createdAt.toISOString(),
      daysSinceCreation,
      daysRemaining,
      isActive,
      isExpired
    });

    return NextResponse.json({
      trial: {
        isActive,
        daysRemaining,
        isExpired
      },
      hasSubscription: false
    });

  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

