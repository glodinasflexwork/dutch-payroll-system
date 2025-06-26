import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTrials, getExpiringTrials } from '@/lib/trial';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up expired trials
    const expiredCount = await cleanupExpiredTrials();
    
    // Get trials expiring in 3 days (for notifications)
    const expiringTrials = await getExpiringTrials(3);
    
    // Get trials expiring in 1 day (for urgent notifications)
    const urgentExpiringTrials = await getExpiringTrials(1);

    return NextResponse.json({
      success: true,
      expiredTrialsProcessed: expiredCount,
      trialsExpiringIn3Days: expiringTrials.length,
      trialsExpiringIn1Day: urgentExpiringTrials.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in trial cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Trial cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    const expiringTrials = await getExpiringTrials(3);
    const urgentExpiringTrials = await getExpiringTrials(1);

    return NextResponse.json({
      trialsExpiringIn3Days: expiringTrials.length,
      trialsExpiringIn1Day: urgentExpiringTrials.length,
      expiringTrialIds: expiringTrials,
      urgentExpiringTrialIds: urgentExpiringTrials
    });
  } catch (error) {
    console.error('Error checking expiring trials:', error);
    return NextResponse.json(
      { error: 'Failed to check expiring trials' },
      { status: 500 }
    );
  }
}

