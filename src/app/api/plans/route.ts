import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all available plans
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      }
    });

    // Ensure features are properly formatted as arrays
    const formattedPlans = plans.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : 
                typeof plan.features === 'string' ? JSON.parse(plan.features) :
                []
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

