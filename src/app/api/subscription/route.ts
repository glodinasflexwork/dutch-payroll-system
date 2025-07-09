import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert feature array to boolean object (same as in subscription.ts)
function convertFeaturesToObject(features: any): Record<string, boolean> {
  if (Array.isArray(features)) {
    // Convert array of feature strings to boolean object
    const featureMap: Record<string, boolean> = {
      employees: false,
      payroll: false,
      leave_management: false,
      time_tracking: false,
      reporting: false,
      multi_company: false
    }
    
    features.forEach((feature: string) => {
      const lowerFeature = feature.toLowerCase()
      if (lowerFeature.includes('employee')) {
        featureMap.employees = true
      }
      if (lowerFeature.includes('payroll')) {
        featureMap.payroll = true
      }
      if (lowerFeature.includes('report') || lowerFeature.includes('analytic')) {
        featureMap.reporting = true
      }
      if (lowerFeature.includes('tax')) {
        featureMap.payroll = true // Tax calculations are part of payroll
      }
      if (lowerFeature.includes('leave') || lowerFeature.includes('time')) {
        featureMap.leave_management = true
        featureMap.time_tracking = true
      }
      if (lowerFeature.includes('support') || lowerFeature.includes('priority')) {
        // Support features don't map to specific functionality
      }
      if (lowerFeature.includes('self-service') || lowerFeature.includes('portal')) {
        featureMap.employees = true // Employee portal is part of employee management
      }
      if (lowerFeature.includes('schedule')) {
        featureMap.payroll = true // Custom schedules are part of payroll
      }
    })
    
    return featureMap
  } else if (typeof features === 'object' && features !== null) {
    // Already in correct format
    return features as Record<string, boolean>
  } else {
    // Fallback to basic features
    return {
      employees: true,
      payroll: false,
      leave_management: false,
      time_tracking: false,
      reporting: false,
      multi_company: false
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== SUBSCRIPTION API DEBUG ===');
    console.log('User ID:', session.user.id);
    console.log('Company ID:', session.user.companyId);

    // Fetch current subscription for the user's company using correct schema
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        subscriptions: {
          include: { Plan: true }
        }
      }
    });

    console.log('Company found:', company?.name);
    console.log('Subscriptions:', company?.subscriptions);

    if (!company?.subscriptions || company.subscriptions.length === 0) {
      console.log('No subscription found');
      return NextResponse.json({ 
        subscription: null,
        hasAccess: false,
        message: 'No active subscription found'
      });
    }

    // Get the active subscription
    const subscription = company.subscriptions.find(sub => sub.status === 'active') || company.subscriptions[0];
    
    console.log('Active subscription:', subscription);
    console.log('Plan features (raw):', subscription.plan?.features);

    if (!subscription) {
      console.log('No active subscription found');
      return NextResponse.json({ 
        subscription: null,
        hasAccess: false,
        message: 'No active subscription found'
      });
    }

    // Convert features to proper format
    const convertedFeatures = convertFeaturesToObject(subscription.plan?.features);
    console.log('Converted features:', convertedFeatures);

    // Return subscription with converted features
    const result = {
      subscription: {
        ...subscription,
        plan: subscription.plan ? {
          ...subscription.plan,
          features: convertedFeatures
        } : null
      },
      hasAccess: subscription.status === 'active',
      payrollAccess: convertedFeatures.payroll === true
    };

    console.log('Final result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

