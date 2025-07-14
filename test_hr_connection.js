require('dotenv').config();

async function testHRConnection() {
  try {
    console.log('🔍 Testing HR database connection...');
    console.log('HR_DATABASE_URL:', process.env.HR_DATABASE_URL?.substring(0, 50) + '...');
    
    const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client');
    const hrPrisma = new HRPrismaClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    });

    // Test basic connection
    await hrPrisma.$connect();
    console.log('✅ HR database connection successful');

    // Test if tables exist
    try {
      const result = await hrPrisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      console.log('📊 Tables in HR database:', result.length);
      result.forEach(table => console.log(`  - ${table.table_name}`));
    } catch (error) {
      console.log('❌ Could not query tables:', error.message);
    }

    await hrPrisma.$disconnect();

  } catch (error) {
    console.error('❌ HR database connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('🔧 Possible solutions:');
      console.log('  1. Check if HR database exists');
      console.log('  2. Verify database credentials');
      console.log('  3. Check if user has access to the database');
    }
  }
}

testHRConnection();
