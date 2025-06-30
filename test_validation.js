const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Copy the validateSubscription function
async function validateSubscription(companyId) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscriptions: {
          include: { plan: true }
        }
      }
    })

    console.log('Company found:', company?.name);
    console.log('Subscriptions:', company?.subscriptions);

    if (!company?.subscriptions || company.subscriptions.length === 0) {
      console.log('No subscription found - returning trial access');
      return { 
        isValid: true, 
        subscription: null,
        limits: {
          maxEmployees: 10,
          maxPayrolls: 5,
          features: {
            employees: true,
            payroll: true,
            leave_management: true,
            time_tracking: false,
            reporting: false,
            multi_company: false
          }
        },
        isTrial: true,
        isExpired: false
      }
    }

    // Get the active subscription
    const subscription = company.subscriptions[0]; // Assuming first subscription
    console.log('Subscription status:', subscription.status);
    console.log('Plan:', subscription.plan);
    
    const isActive = subscription.status === 'active'
    const isTrialing = subscription.status === 'trialing' || subscription.isTrialActive
    
    console.log('Is Active:', isActive);
    console.log('Is Trialing:', isTrialing);

    const now = new Date()
    const trialValid = subscription.trialEnd ? now <= subscription.trialEnd : true
    const isExpired = !isActive && (!isTrialing || !trialValid)

    console.log('Trial Valid:', trialValid);
    console.log('Is Expired:', isExpired);

    if (isExpired) {
      console.log('Subscription expired - returning basic access');
      return { 
        isValid: true,
        subscription,
        limits: {
          maxEmployees: 999,
          maxPayrolls: 0,
          features: {
            employees: true,
            payroll: false,
            leave_management: true,
            time_tracking: false,
            reporting: false,
            multi_company: false
          }
        },
        isTrial: false,
        isExpired: true,
        message: 'Subscription expired - upgrade to access premium features'
      }
    }

    if (isTrialing && trialValid) {
      console.log('Trial active - returning trial access');
      return { 
        isValid: true, 
        subscription,
        limits: {
          maxEmployees: 50,
          maxPayrolls: 100,
          features: {
            employees: true,
            payroll: true,
            leave_management: true,
            time_tracking: true,
            reporting: true,
            multi_company: false
          }
        },
        isTrial: true,
        isExpired: false
      }
    }

    console.log('Active subscription - returning full access');
    const limits = {
      maxEmployees: subscription.plan?.maxEmployees || 999,
      maxPayrolls: subscription.plan?.maxPayrolls || 999,
      features: subscription.plan?.features || {
        employees: true,
        payroll: true,
        leave_management: true,
        time_tracking: true,
        reporting: true,
        multi_company: true
      }
    }

    console.log('Final limits:', limits);

    return { 
      isValid: true, 
      subscription, 
      limits, 
      isTrial: false,
      isExpired: false
    }
  } catch (error) {
    console.error('Subscription validation error:', error)
    return { 
      isValid: true, 
      subscription: null,
      limits: {
        maxEmployees: 999,
        maxPayrolls: 0,
        features: {
          employees: true,
          payroll: false,
          leave_management: true,
          time_tracking: false,
          reporting: false,
          multi_company: false
        }
      },
      isTrial: false,
      isExpired: false,
      error: 'Validation error - using safe fallback limits'
    }
  }
}

async function testValidation() {
  console.log('=== TESTING SUBSCRIPTION VALIDATION ===');
  
  // Test Glodinas Finance (has subscription)
  console.log('\n--- Testing Glodinas Finance B.V. ---');
  const result1 = await validateSubscription('cmcd8s2zn0004rpkc8y8bnoda');
  console.log('Result:', JSON.stringify(result1, null, 2));
  
  // Test Glodinas Holding (no subscription)
  console.log('\n--- Testing Glodinas Holding B.V. ---');
  const result2 = await validateSubscription('cmcgh3l2n0000ky0bxq6x7o5v');
  console.log('Result:', JSON.stringify(result2, null, 2));
  
  await prisma.$disconnect();
}

testValidation();
