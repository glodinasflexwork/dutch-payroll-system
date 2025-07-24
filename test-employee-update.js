const fetch = require('node-fetch');

async function testEmployeeUpdate() {
  try {
    // First, get the list of employees to find a valid ID
    console.log('🔍 Fetching employees list...');
    const employeesResponse = await fetch('http://localhost:3000/api/employees', {
      headers: {
        'Cookie': 'next-auth.session-token=your-session-token-here' // This would need to be set
      }
    });
    
    if (!employeesResponse.ok) {
      console.log('❌ Cannot fetch employees - authentication required');
      console.log('Status:', employeesResponse.status);
      return;
    }
    
    const employeesData = await employeesResponse.json();
    console.log('✅ Employees fetched successfully');
    
    // Find the Test Employee or use the first employee
    const testEmployee = employeesData.employees?.find(emp => 
      emp.firstName?.includes('Test') || emp.email?.includes('test@example.com')
    ) || employeesData.employees?.[0];
    
    if (!testEmployee) {
      console.log('❌ No employees found to test with');
      return;
    }
    
    console.log('🎯 Testing with employee:', testEmployee.firstName, testEmployee.lastName);
    console.log('📧 Email:', testEmployee.email);
    console.log('🆔 ID:', testEmployee.id);
    
    // Test the update API with filtered data (excluding relational fields)
    const updateData = {
      firstName: testEmployee.firstName + ' (Updated)',
      lastName: testEmployee.lastName,
      email: testEmployee.email,
      phone: testEmployee.phone || '+31 6 12345678',
      position: testEmployee.position + ' (Updated)',
      salary: testEmployee.salary || 5000
    };
    
    console.log('🔄 Testing employee update with data:', updateData);
    
    const updateResponse = await fetch(`http://localhost:3000/api/employees/${testEmployee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=your-session-token-here'
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Employee update successful!');
      console.log('📊 Updated employee:', updateResult.employee?.firstName, updateResult.employee?.lastName);
    } else {
      console.log('❌ Employee update failed');
      console.log('Error:', updateResult.error);
      console.log('Status:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testEmployeeUpdate();

