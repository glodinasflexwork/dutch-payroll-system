// Test script for creating an employee with contract
const fetch = require('node-fetch');

async function testCreateEmployeeWithContract() {
  try {
    console.log('Testing Create Employee with Contract API...');
    
    // Get auth token (this is a simplified example, in production you'd use proper auth)
    const authToken = 'test-token';
    
    // Test creating an employee with contract
    const createResponse = await fetch('http://localhost:3002/api/employees/create-with-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        // Employee basic info
        firstName: 'Test',
        lastName: 'Employee',
        email: 'test.employee@example.com',
        bsn: '123456789',
        
        // Employment info
        startDate: new Date().toISOString(),
        position: 'Software Developer',
        department: 'Engineering',
        employmentType: 'monthly',
        contractType: 'permanent',
        
        // Salary info
        salary: 4500,
        salaryType: 'monthly',
        
        // Working schedule
        workingHoursPerWeek: 32,
        workingDaysPerWeek: 4,
        workSchedule: 'Monday-Thursday',
        
        // Portal access
        sendPortalInvitation: true
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Create employee with contract result:', createResult);
    
    if (createResult.success) {
      console.log('Employee created successfully with ID:', createResult.employee.id);
      console.log('Contract created with working schedule:');
      console.log('- Hours per week:', createResult.contract.workingHoursPerWeek);
      console.log('- Days per week:', createResult.contract.workingDaysPerWeek);
      console.log('- Schedule:', createResult.contract.workSchedule);
    }
    
    console.log('Create Employee with Contract API test completed');
  } catch (error) {
    console.error('Error testing create employee with contract API:', error);
  }
}

testCreateEmployeeWithContract();

