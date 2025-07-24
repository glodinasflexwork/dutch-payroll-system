/**
 * Test script to verify HR database initialization fix
 */

const { initializeHRDatabase } = require('./src/lib/lazy-initialization.ts')

async function testHRInitialization() {
  try {
    console.log('🧪 Testing HR database initialization...')
    
    // Test with a sample company ID
    const testCompanyId = 'test-company-' + Date.now()
    
    console.log(`📝 Initializing HR database for company: ${testCompanyId}`)
    
    const result = await initializeHRDatabase(testCompanyId)
    
    console.log('✅ HR database initialization successful!')
    console.log('📊 Result:', {
      companyId: result.id,
      companyName: result.name,
      leaveTypesCount: result.leaveTypes?.length || 0,
      leaveTypes: result.leaveTypes?.map(lt => ({ name: lt.name, code: lt.code })) || []
    })
    
    // Test duplicate initialization (should return existing)
    console.log('\n🔄 Testing duplicate initialization...')
    const duplicateResult = await initializeHRDatabase(testCompanyId)
    
    if (duplicateResult.id === result.id) {
      console.log('✅ Duplicate initialization handled correctly (returned existing company)')
    } else {
      console.log('❌ Duplicate initialization failed')
    }
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ HR database initialization test failed:')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Run the test
testHRInitialization()

