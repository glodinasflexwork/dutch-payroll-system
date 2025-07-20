import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { authClient } from "@/lib/database-clients";



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch only active plans excluding Free Trial (which is auto-assigned)
    const plans = await authClient.plan.findMany({
      where: {
        isActive: true,
        NOT: {
          name: 'Free Trial' // Hide Free Trial from user selection
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Define the correct order for user-selectable plans
    const planOrder = ['Starter', 'Professional', 'Enterprise'];
    
    // Sort plans according to the defined order
    const sortedPlans = plans.sort((a, b) => {
      const aIndex = planOrder.indexOf(a.name);
      const bIndex = planOrder.indexOf(b.name);
      return aIndex - bIndex;
    });

    // Ensure features are properly formatted as arrays
    const formattedPlans = sortedPlans.map(plan => ({
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
    await authClient.$disconnect();
  }
}

