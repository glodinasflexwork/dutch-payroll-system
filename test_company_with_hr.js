require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client');
const hrPrisma = new HRPrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL
    }
  }
});

async function testCompanyWithHR() {
  try {
    console.log('🔍 Testing company creation with HR initialization...');
    
    // Step 1: Create company in auth database
    const authResult = await authPrisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: "Test HR Company B.V.",
          address: "HR Test Street 123",
          city: "Amsterdam",
          postalCode: "1012AB",
          kvkNumber: "87654321",
          industry: "Technology & Software"
        }
      });

      const trialPlan = await tx.plan.findFirst({
        where: { name: "Free Trial", isActive: true }
      });

      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: trialPlan.id,
          status: "trialing",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          isTrialActive: true,
          trialStart: new Date(),
          trialExtensions: 0
        }
      });

      return { company, subscription };
    });

    console.log('✅ Auth database company created:', authResult.company.name);

    // Step 2: Initialize HR database
    const hrCompany = await hrPrisma.company.create({
      data: {
        id: authResult.company.id, // Same ID as auth database
        name: authResult.company.name,
        address: authResult.company.address,
        city: authResult.company.city,
        postalCode: authResult.company.postalCode,
        kvkNumber: authResult.company.kvkNumber,
        industry: authResult.company.industry,
        // HR-specific defaults
        workingHoursPerWeek: 40,
        holidayAllowancePercentage: 8.33,
        probationPeriodMonths: 2,
        noticePeriodDays: 30,
        annualLeaveEntitlement: 25,
        sickLeavePolicy: "STATUTORY"
      }
    });

    console.log('✅ HR database company created:', hrCompany.name);

    // Step 3: Create default leave types
    const leaveTypes = await hrPrisma.leaveType.createMany({
      data: [
        {
          name: "Annual Leave",
          code: "ANNUAL",
          isPaid: true,
          maxDaysPerYear: 25,
          carryOverDays: 5,
          companyId: hrCompany.id,
          isActive: true
        },
        {
          name: "Sick Leave",
          code: "SICK", 
          isPaid: true,
          maxDaysPerYear: 365,
          carryOverDays: 0,
          companyId: hrCompany.id,
          isActive: true
        }
      ]
    });

    console.log('✅ Default leave types created:', leaveTypes.count);

    console.log('🎉 FULL COMPANY SETUP SUCCESSFUL!');
    console.log('- Auth Company ID:', authResult.company.id);
    console.log('- HR Company ID:', hrCompany.id);
    console.log('- Subscription Status:', authResult.subscription.status);

    // Clean up test data
    await hrPrisma.leaveType.deleteMany({ where: { companyId: hrCompany.id } });
    await hrPrisma.company.delete({ where: { id: hrCompany.id } });
    await authPrisma.subscription.delete({ where: { id: authResult.subscription.id } });
    await authPrisma.company.delete({ where: { id: authResult.company.id } });
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Company creation with HR test FAILED:', error);
  } finally {
    await authPrisma.$disconnect();
    await hrPrisma.$disconnect();
  }
}

testCompanyWithHR();
