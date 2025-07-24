require('dotenv').config();

async function testEmployeeUpdate() {
  try {
    console.log('🔍 Testing employee update functionality with correct field mapping...');
    
    // Use the same import structure as the app
    const { hrClient } = require('./src/lib/database-clients.ts');
    
    // First, let's find an existing employee
    const employees = await hrClient.employee.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' }
    });
    
    if (employees.length === 0) {
      console.log('❌ No employees found in database');
      return;
    }
    
    const employee = employees[0];
    console.log(`✅ Found employee: ${employee.firstName} ${employee.lastName} (ID: ${employee.id})`);
    console.log('Current data:', {
      phone: employee.phone,
      emergencyPhone: employee.emergencyPhone,
      streetName: employee.streetName
    });
    
    // Test a simple update using the correct field names
    console.log('🔄 Attempting to update employee with correct field names...');
    
    const updateData = {
      phone: '+31 6 87654321'  // Using 'phone' instead of 'phoneNumber'
    };
    
    const updatedEmployee = await hrClient.employee.update({
      where: { id: employee.id },
      data: updateData
    });
    
    console.log('✅ Employee updated successfully!');
    console.log('New phone number:', updatedEmployee.phone);
    
  } catch (error) {
    console.error('❌ Error during employee update test:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  }
}

testEmployeeUpdate();
