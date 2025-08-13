import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Define correct plans with proper pricing
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        price: 2900, // €29.00 in cents
        stripeProductId: 'prod_starter',
        stripePriceId: 'price_starter_monthly',
        maxEmployees: 10,
        maxPayrolls: -1, // Unlimited
        isActive: true,
        features: [
          'Up to 10 employees',
          'Perfect for DGA and small business owners',
          'Complete payroll processing',
          'Dutch tax compliance & reporting',
          'Employee self-service portal',
          'BSN validation & IBAN formatting',
          'Payslip generation & distribution',
          'Email support',
          'Mobile app access'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 9900, // €99.00 in cents
        stripeProductId: 'prod_professional',
        stripePriceId: 'price_professional_monthly',
        maxEmployees: 50,
        maxPayrolls: -1, // Unlimited
        isActive: true,
        features: [
          'Up to 50 employees',
          'Designed for MKB (mid-market businesses)',
          'Everything in Starter plan',
          'Advanced reporting & analytics',
          'Bulk employee management',
          'Custom payroll schedules',
          'API access for integrations',
          'Priority email support',
          'Advanced compliance features',
          'Multi-location support'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 200, // €2.00 per payroll run in cents
        stripeProductId: 'prod_enterprise',
        stripePriceId: 'price_enterprise_usage',
        maxEmployees: -1, // Unlimited
        maxPayrolls: -1, // Unlimited
        isActive: true,
        features: [
          'Unlimited employees across multiple companies',
          'Designed for Accounting & Administration bureaus',
          'Multi-company management dashboard',
          'Pay-per-payslip pricing (€3 per payslip)',
          'White-label client portals',
          'Dedicated account manager',
          'Custom integrations & API access',
          'Advanced reporting for all clients',
          'Bulk operations across companies',
          '24/7 priority support',
          'Custom compliance workflows',
          'Reseller/partner program access'
        ]
      }
    ];

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

