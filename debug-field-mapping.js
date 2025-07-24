require('dotenv').config();

async function testFieldMapping() {
  try {
    console.log('🔍 Testing field mapping for employee updates...');
    
    const { hrClient } = require('./src/lib/database-clients.ts');
    
    // Get the employee we've been testing with
    const employee = await hrClient.employee.findFirst({
      where: { id: 'cmdhitnen0001pi2609esa0v4' }
    });
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log('✅ Current employee data:');
    console.log(JSON.stringify(employee, null, 2));
    
    // Test what fields are actually available in the schema
    console.log('\n🔍 Testing individual field updates...');
    
    // Test phone field (we know this works)
    try {
      await hrClient.employee.update({
        where: { id: employee.id },
        data: { phone: '+31 6 11111111' }
      });
      console.log('✅ phone field update: SUCCESS');
    } catch (error) {
      console.log('❌ phone field update: FAILED -', error.message);
    }
    
    // Test other common fields that might be causing issues
    const fieldsToTest = [
      { field: 'firstName', value: 'Test' },
      { field: 'lastName', value: 'Employee' },
      { field: 'email', value: 'test@example.com' },
      { field: 'department', value: 'Engineering' },
      { field: 'position', value: 'Test Engineer' },
      { field: 'salary', value: 4500 },
      { field: 'emergencyContact', value: 'Test Contact' },
      { field: 'emergencyPhone', value: '+31 6 22222222' }
    ];
    
    for (const { field, value } of fieldsToTest) {
      try {
        const updateData = { [field]: value };
        await hrClient.employee.update({
          where: { id: employee.id },
          data: updateData
        });
        console.log(`✅ ${field} field update: SUCCESS`);
      } catch (error) {
        console.log(`❌ ${field} field update: FAILED - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during field mapping test:', error);
  }
}

testFieldMapping();
