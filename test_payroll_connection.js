require('dotenv').config();

async function testPayrollConnection() {
  try {
    console.log('🔍 Testing Payroll database connection...');
    console.log('PAYROLL_DATABASE_URL:', process.env.PAYROLL_DATABASE_URL?.substring(0, 50) + '...');
    
    // Try to connect with raw PostgreSQL client first
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.PAYROLL_DATABASE_URL
    });

    await client.connect();
    console.log('✅ Payroll database connection successful');

    // Check if database exists
    const result = await client.query('SELECT current_database()');
    console.log('📊 Connected to database:', result.rows[0].current_database);

    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables in Payroll database:', tables.rows.length);
    tables.rows.forEach(table => console.log(`  - ${table.table_name}`));

    // Check specifically for Company table
    const companyTable = tables.rows.find(table => 
      table.table_name.toLowerCase() === 'company'
    );
    
    if (companyTable) {
      console.log('🎯 FOUND: Company table exists in Payroll database!');
      
      // Get Company table structure
      const companyStructure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'Company' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Company table structure:');
      companyStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } else {
      console.log('❌ Company table NOT found in Payroll database');
    }

    await client.end();

  } catch (error) {
    console.error('❌ Payroll database connection failed:', error.message);
    console.log('🔧 Error code:', error.code);
  }
}

testPayrollConnection();
