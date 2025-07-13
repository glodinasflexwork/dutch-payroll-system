import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a production environment debug request
    const debugKey = request.nextUrl.searchParams.get('key');
    
    // Simple security check - only allow with specific debug key
    if (debugKey !== 'debug-auth-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check environment variables
    const envCheck = {
      AUTH_DATABASE_URL: {
        exists: !!process.env.AUTH_DATABASE_URL,
        format: process.env.AUTH_DATABASE_URL ? 
          (process.env.AUTH_DATABASE_URL.startsWith('postgresql://') ? 'correct' : 'incorrect') : 'missing',
        length: process.env.AUTH_DATABASE_URL?.length || 0,
        preview: process.env.AUTH_DATABASE_URL ? 
          `${process.env.AUTH_DATABASE_URL.substring(0, 20)}...${process.env.AUTH_DATABASE_URL.substring(process.env.AUTH_DATABASE_URL.length - 10)}` : 'N/A'
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'N/A'
      },
      NODE_ENV: process.env.NODE_ENV || 'N/A'
    };

    // Test database connection
    let dbTest = { status: 'unknown', error: null };
    
    try {
      // Import Prisma client
      const { PrismaClient } = await import('@prisma/client');
      
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.AUTH_DATABASE_URL
          }
        }
      });

      // Test connection
      await prisma.$queryRaw`SELECT 1`;
      dbTest.status = 'connected';
      
      // Test user lookup
      const userCount = await prisma.user.count();
      dbTest = { ...dbTest, userCount };
      
      await prisma.$disconnect();
    } catch (error: any) {
      dbTest = { 
        status: 'failed', 
        error: error.message,
        code: error.code || 'unknown'
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbTest,
      deployment: {
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'unknown'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

