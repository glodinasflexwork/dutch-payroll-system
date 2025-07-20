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

    // Fetch available points packages
    const packages = await authClient.pointsPackage.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        points: 'asc'
      }
    });

    return NextResponse.json(packages);

  } catch (error) {
    console.error('Error fetching points packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await authClient.$disconnect();
  }
}

