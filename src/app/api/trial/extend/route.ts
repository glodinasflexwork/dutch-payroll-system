import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { extendTrial } from '@/lib/trial';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to add proper admin role checking)
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { companyId, additionalDays = 7 } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    await extendTrial(companyId, additionalDays);
    
    return NextResponse.json({ 
      success: true,
      message: `Trial extended by ${additionalDays} days`
    });
  } catch (error) {
    console.error('Error extending trial:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extend trial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

