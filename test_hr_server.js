require('dotenv').config();

async function testHRServer() {
  try {
    console.log('🔍 Testing HR database server connection...');
    
    // Extract connection details
    const url = process.env.HR_DATABASE_URL;
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)\?/);
    
    if (match) {
      const [, user, password, host, database] = match;
      console.log('📊 Connection details:');
      console.log(`  Host: ${host}`);
      console.log(`  User: ${user}`);
      console.log(`  Database: ${database}`);
      console.log(`  Password: ${password.substring(0, 8)}...`);
    }

    // Try to connect with raw PostgreSQL client
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.HR_DATABASE_URL
    });

    await client.connect();
    console.log('✅ Raw PostgreSQL connection successful');

    // Check if database exists
    const result = await client.query('SELECT current_database()');
    console.log('📊 Connected to database:', result.rows[0].current_database);

    // List all databases
    const databases = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('📊 Available databases:');
    databases.rows.forEach(db => console.log(`  - ${db.datname}`));

    await client.end();

  } catch (error) {
    console.error('❌ HR server connection failed:', error.message);
    
    if (error.code === '28P01') {
      console.log('🔧 Authentication failed - password is incorrect');
    } else if (error.code === '3D000') {
      console.log('🔧 Database does not exist');
    } else {
      console.log('🔧 Error code:', error.code);
    }
  }
}

testHRServer();
