import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTrialStatus } from '@/lib/trial';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trialStatus = await getTrialStatus(session.user.companyId);
    
    return NextResponse.json({
      trial: trialStatus,
      hasTrialAccess: trialStatus?.isActive ?? false
    });
  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trial status' },
      { status: 500 }
    );
  }
}

