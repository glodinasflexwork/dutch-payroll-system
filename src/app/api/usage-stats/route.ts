import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getHRClient, getPayrollClient } from "@/lib/database-clients";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;

    // Fetch employee count
    const employeeCount = await getHRClient().employee.count({
      where: {
        companyId: companyId,
        isActive: true
      }
    });

    // Fetch payroll count for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const payrollCount = await getPayrollClient().payrollRun.count({
      where: {
        companyId: companyId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Calculate storage usage (simplified - you can enhance this)
    const storageUsage = 0.5; // Default small usage for now

    // Get plan limits (you can fetch this from subscription data)
    const planLimits = {
      employees: 50, // Default to Professional plan limits
      payrolls: -1,  // Unlimited
      storage: 10    // 10GB
    };

    const usageStats = {
      employees: { 
        current: employeeCount, 
        limit: planLimits.employees 
      },
      payrolls: { 
        current: payrollCount, 
        limit: planLimits.payrolls 
      },
      storage: { 
        current: storageUsage, 
        limit: planLimits.storage 
      }
    };

    return NextResponse.json({ usageStats });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  } finally {
    await getHRClient().$disconnect();
    await getPayrollClient().$disconnect();
  }
}

