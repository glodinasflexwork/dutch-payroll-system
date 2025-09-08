const { PrismaClient } = require('@prisma/hr-client');

async function testHRConnection() {
  console.log('🔍 Testing HR Database Connection...');
  
  const hrClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    console.log('📡 Attempting to connect to HR database...');
    await hrClient.$connect();
    console.log('✅ HR Database connected successfully!');
    
    console.log('📊 Testing employee query...');
    const employeeCount = await hrClient.employee.count();
    console.log(`✅ Found ${employeeCount} employees in HR database`);
    
    console.log('📋 Testing employee data...');
    const employees = await hrClient.employee.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        isActive: true
      }
    });
    console.log('✅ Employee data:', employees);
    
  } catch (error) {
    console.error('❌ HR Database connection failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await hrClient.$disconnect();
    console.log('🔌 HR Database connection closed');
  }
}

testHRConnection();
