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

    // Get user's company
    const userCompany = await authClient.userCompany.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        Company: {
          include: {
            CompanyPoints: {
              include: {
                PointsTransaction: {
                  orderBy: { createdAt: 'desc' },
                  take: 10 // Last 10 transactions
                }
              }
            }
          }
        }
      }
    });

    if (!userCompany?.Company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyPoints = userCompany.Company.CompanyPoints;

    if (!companyPoints) {
      // Create initial points record if it doesn't exist
      const newCompanyPoints = await authClient.companyPoints.create({
        data: {
          companyId: userCompany.Company.id,
          pointsBalance: 0,
          totalPurchased: 0,
          totalUsed: 0
        },
        include: {
          PointsTransaction: true
        }
      });

      return NextResponse.json({
        pointsBalance: newCompanyPoints.pointsBalance,
        totalPurchased: newCompanyPoints.totalPurchased,
        totalUsed: newCompanyPoints.totalUsed,
        transactions: []
      });
    }

    return NextResponse.json({
      pointsBalance: companyPoints.pointsBalance,
      totalPurchased: companyPoints.totalPurchased,
      totalUsed: companyPoints.totalUsed,
      transactions: companyPoints.PointsTransaction
    });

  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await authClient.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, description, payrollRunId } = await request.json();

    // Get user's company
    const userCompany = await authClient.userCompany.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        Company: {
          include: {
            CompanyPoints: true
          }
        }
      }
    });

    if (!userCompany?.Company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    let companyPoints = userCompany.Company.CompanyPoints;

    // Create points record if it doesn't exist
    if (!companyPoints) {
      companyPoints = await authClient.companyPoints.create({
        data: {
          companyId: userCompany.Company.id,
          pointsBalance: 0,
          totalPurchased: 0,
          totalUsed: 0
        }
      });
    }

    // Validate transaction
    if (type === 'usage' && companyPoints.pointsBalance < Math.abs(amount)) {
      return NextResponse.json({ 
        error: 'Insufficient points balance' 
      }, { status: 400 });
    }

    // Calculate new balances
    const pointsChange = type === 'usage' ? -Math.abs(amount) : Math.abs(amount);
    const newBalance = companyPoints.pointsBalance + pointsChange;
    const newTotalPurchased = type === 'purchase' ? 
      companyPoints.totalPurchased + Math.abs(amount) : 
      companyPoints.totalPurchased;
    const newTotalUsed = type === 'usage' ? 
      companyPoints.totalUsed + Math.abs(amount) : 
      companyPoints.totalUsed;

    // Update points balance and create transaction
    const result = await authClient.$transaction(async (tx) => {
      // Update company points
      const updatedPoints = await tx.companyPoints.update({
        where: { id: companyPoints.id },
        data: {
          pointsBalance: newBalance,
          totalPurchased: newTotalPurchased,
          totalUsed: newTotalUsed
        }
      });

      // Create transaction record
      const transaction = await tx.pointsTransaction.create({
        data: {
          companyPointsId: companyPoints.id,
          type,
          amount: pointsChange,
          description,
          payrollRunId
        }
      });

      return { updatedPoints, transaction };
    });

    return NextResponse.json({
      pointsBalance: result.updatedPoints.pointsBalance,
      totalPurchased: result.updatedPoints.totalPurchased,
      totalUsed: result.updatedPoints.totalUsed,
      transaction: result.transaction
    });

  } catch (error) {
    console.error('Error processing points transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await authClient.$disconnect();
  }
}

