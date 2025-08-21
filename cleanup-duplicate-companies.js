#!/usr/bin/env node

/**
 * Script: Clean Up Duplicate Company Entries
 * Removes duplicate Glodinas Finance B.V. entries, keeping the most recent one
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');

async function cleanupDuplicateCompanies() {
  const hrClient = new HRClient();
  
  try {
    console.log('🧹 Cleaning Up Duplicate Company Entries...');
    
    // Find all companies with the same name
    const allCompanies = await hrClient.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        kvkNumber: true,
        loonheffingennummer: true,
        vatNumber: true,
        employees: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📊 Found ${allCompanies.length} total companies`);
    
    // Group companies by name
    const companiesByName = {};
    allCompanies.forEach(company => {
      if (!companiesByName[company.name]) {
        companiesByName[company.name] = [];
      }
      companiesByName[company.name].push(company);
    });
    
    // Find duplicates
    const duplicateGroups = Object.entries(companiesByName).filter(([name, companies]) => companies.length > 1);
    
    console.log(`🔍 Found ${duplicateGroups.length} company names with duplicates:`);
    
    let totalDeleted = 0;
    
    for (const [companyName, duplicates] of duplicateGroups) {
      console.log(`\n🏢 Processing duplicates for: ${companyName}`);
      console.log(`   Found ${duplicates.length} duplicate entries`);
      
      // Show all duplicates
      duplicates.forEach((company, index) => {
        console.log(`   ${index + 1}. ID: ${company.id.substring(0, 8)}... | Created: ${company.createdAt.toISOString().split('T')[0]} | Employees: ${company.employees.length}`);
      });
      
      // Determine which one to keep (most recent with most data or employees)
      const companyToKeep = duplicates.reduce((best, current) => {
        // Priority 1: Company with employees
        if (current.employees.length > best.employees.length) return current;
        if (current.employees.length < best.employees.length) return best;
        
        // Priority 2: Company with more complete data
        const currentDataScore = [current.kvkNumber, current.loonheffingennummer, current.vatNumber].filter(Boolean).length;
        const bestDataScore = [best.kvkNumber, best.loonheffingennummer, best.vatNumber].filter(Boolean).length;
        
        if (currentDataScore > bestDataScore) return current;
        if (currentDataScore < bestDataScore) return best;
        
        // Priority 3: Most recently updated
        return current.updatedAt > best.updatedAt ? current : best;
      });
      
      console.log(`   ✅ Keeping: ID ${companyToKeep.id.substring(0, 8)}... (${companyToKeep.employees.length} employees)`);
      
      // Delete the others
      const toDelete = duplicates.filter(company => company.id !== companyToKeep.id);
      
      for (const company of toDelete) {
        try {
          // Check if company has any employees (safety check)
          if (company.employees.length > 0) {
            console.log(`   ⚠️  Skipping deletion of ${company.id.substring(0, 8)}... - has ${company.employees.length} employees`);
            console.log(`   💡 You may need to manually merge employee data before deletion`);
            continue;
          }
          
          await hrClient.company.delete({
            where: { id: company.id }
          });
          
          console.log(`   🗑️  Deleted: ID ${company.id.substring(0, 8)}...`);
          totalDeleted++;
          
        } catch (deleteError) {
          console.error(`   ❌ Failed to delete ${company.id.substring(0, 8)}...: ${deleteError.message}`);
        }
      }
    }
    
    // Show final company list
    console.log('\n📋 Final Company List:');
    const finalCompanies = await hrClient.company.findMany({
      select: {
        id: true,
        name: true,
        kvkNumber: true,
        loonheffingennummer: true,
        vatNumber: true,
        employees: {
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    finalCompanies.forEach((company, index) => {
      console.log(`\n   ${index + 1}. 🏢 ${company.name}`);
      console.log(`      - ID: ${company.id.substring(0, 8)}...`);
      console.log(`      - KvK: ${company.kvkNumber || 'Not set'}`);
      console.log(`      - Loonheffingennummer: ${company.loonheffingennummer || 'Not set'}`);
      console.log(`      - VAT: ${company.vatNumber || 'Not set'}`);
      console.log(`      - Employees: ${company.employees.length}`);
    });
    
    console.log('\n✅ Duplicate Cleanup Completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Total companies before: ${allCompanies.length}`);
    console.log(`   - Total companies after: ${finalCompanies.length}`);
    console.log(`   - Companies deleted: ${totalDeleted}`);
    console.log(`   - Duplicate groups found: ${duplicateGroups.length}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  cleanupDuplicateCompanies()
    .then(() => {
      console.log('\n🎉 Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDuplicateCompanies };

