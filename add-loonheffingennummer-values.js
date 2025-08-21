#!/usr/bin/env node

/**
 * Script: Add Loonheffingennummer Values for Existing Companies
 * Updates existing companies with appropriate loonheffingennummer values
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');

/**
 * Generate a loonheffingennummer based on company data
 * Priority: 1) Convert from existing taxNumber, 2) Generate from KvK, 3) Generate random
 */
function generateLoonheffingennummer(company) {
  // Method 1: If company has a taxNumber in old format, convert it
  if (company.taxNumber && company.taxNumber.match(/^\d{9}B\d{2}$/)) {
    const baseNumber = company.taxNumber.replace(/B\d+$/, '');
    return `${baseNumber}L01`;
  }
  
  // Method 2: If company has KvK number, use it as base
  if (company.kvkNumber && company.kvkNumber.match(/^\d{8}$/)) {
    // Pad KvK to 9 digits and add L01
    const paddedKvK = company.kvkNumber.padStart(9, '0');
    return `${paddedKvK}L01`;
  }
  
  // Method 3: Generate based on company name hash (deterministic)
  const nameHash = company.name.split('').reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  // Convert to positive 9-digit number
  const baseNumber = Math.abs(nameHash).toString().padStart(9, '1').substring(0, 9);
  return `${baseNumber}L01`;
}

/**
 * Validate loonheffingennummer format
 */
function isValidLoonheffingennummer(value) {
  return /^\d{9}L\d{2}$/.test(value);
}

async function addLoonheffingennummerValues() {
  const hrClient = new HRClient();
  
  try {
    console.log('🔄 Adding Loonheffingennummer Values for Existing Companies...');
    
    // Get all companies
    const companies = await hrClient.company.findMany({
      select: {
        id: true,
        name: true,
        kvkNumber: true,
        loonheffingennummer: true,
        vatNumber: true,
        // Include taxNumber if it still exists in database
        ...(await hrClient.company.findFirst().then(c => c && 'taxNumber' in c ? { taxNumber: true } : {}))
      }
    });
    
    console.log(`📊 Found ${companies.length} companies to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const company of companies) {
      console.log(`\n🏢 Processing: ${company.name}`);
      
      // Skip if already has valid loonheffingennummer
      if (company.loonheffingennummer && isValidLoonheffingennummer(company.loonheffingennummer)) {
        console.log(`   ✅ Already has valid loonheffingennummer: ${company.loonheffingennummer}`);
        skippedCount++;
        continue;
      }
      
      // Generate loonheffingennummer
      const newLoonheffingennummer = generateLoonheffingennummer(company);
      
      console.log(`   📋 Company data:`);
      console.log(`      - KvK Number: ${company.kvkNumber || 'Not set'}`);
      console.log(`      - VAT Number: ${company.vatNumber || 'Not set'}`);
      if (company.taxNumber) {
        console.log(`      - Old Tax Number: ${company.taxNumber}`);
      }
      console.log(`   🎯 Generated loonheffingennummer: ${newLoonheffingennummer}`);
      
      try {
        // Update the company
        await hrClient.company.update({
          where: { id: company.id },
          data: {
            loonheffingennummer: newLoonheffingennummer
          }
        });
        
        console.log(`   ✅ Successfully updated with loonheffingennummer: ${newLoonheffingennummer}`);
        updatedCount++;
        
      } catch (updateError) {
        console.error(`   ❌ Failed to update company: ${updateError.message}`);
        errorCount++;
      }
    }
    
    console.log('\n✅ Loonheffingennummer Addition Completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Companies processed: ${companies.length}`);
    console.log(`   - Successfully updated: ${updatedCount}`);
    console.log(`   - Already had valid values: ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
    if (updatedCount > 0) {
      console.log('\n🎯 Updated Companies:');
      
      // Show final status of all companies
      const finalCompanies = await hrClient.company.findMany({
        select: {
          name: true,
          kvkNumber: true,
          loonheffingennummer: true,
          vatNumber: true
        }
      });
      
      finalCompanies.forEach(company => {
        console.log(`\n   🏢 ${company.name}:`);
        console.log(`      - KvK: ${company.kvkNumber || 'Not set'}`);
        console.log(`      - Loonheffingennummer: ${company.loonheffingennummer || 'Not set'}`);
        console.log(`      - VAT: ${company.vatNumber || 'Not set'}`);
      });
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Review the generated loonheffingennummer values');
    console.log('   2. Replace with actual values from Belastingdienst if available');
    console.log('   3. Test payslip generation with new values');
    console.log('   4. Clean up any duplicate company entries');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addLoonheffingennummerValues()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addLoonheffingennummerValues };

