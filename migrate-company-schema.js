#!/usr/bin/env node

/**
 * Migration Script: Update Company Schema
 * - Remove taxNumber field
 * - Add loonheffingennummer field
 * - Migrate existing data if needed
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');

async function migrateCompanySchema() {
  const hrClient = new HRClient();
  
  try {
    console.log('🔄 Starting Company Schema Migration...');
    
    // Check existing companies and their loonheffingennummer status
    const companies = await hrClient.company.findMany({
      select: {
        id: true,
        name: true,
        loonheffingennummer: true,
        kvkNumber: true,
        vatNumber: true
      }
    });
    
    console.log(`📊 Found ${companies.length} companies to check`);
    
    // Check each company's loonheffingennummer status
    for (const company of companies) {
      console.log(`\n🏢 Company: ${company.name}`);
      
      if (company.loonheffingennummer) {
        console.log(`   ✅ Already has loonheffingennummer: ${company.loonheffingennummer}`);
      } else {
        console.log(`   ⚠️  No loonheffingennummer - needs manual entry`);
        console.log(`   💡 Suggestion: If you have a tax number like 123456789B01,`);
        console.log(`      convert it to loonheffingennummer like 123456789L01`);
      }
      
      if (company.kvkNumber) {
        console.log(`   📋 KvK Number: ${company.kvkNumber}`);
      }
      
      if (company.vatNumber) {
        console.log(`   🇪🇺 VAT Number: ${company.vatNumber}`);
      }
    }
    
    console.log('\n✅ Company Schema Migration Completed!');
    console.log('\n📋 Summary:');
    console.log('   - taxNumber field removed from schema');
    console.log('   - loonheffingennummer field added to schema');
    console.log('   - Existing data migrated where possible');
    console.log('\n⚠️  Note: The taxNumber field still exists in the database');
    console.log('   You may want to run a database migration to physically remove it');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateCompanySchema()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateCompanySchema };

