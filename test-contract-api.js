// Test script for the contract API
const fetch = require('node-fetch');

async function testContractAPI() {
  try {
    console.log('Testing Contract API with working days fields...');
    
    // Get auth token (this is a simplified example, in production you'd use proper auth)
    const authToken = 'test-token';
    
    // Test creating a contract with working days
    const createResponse = await fetch('http://localhost:3002/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        employeeId: 'test-employee-id', // Replace with a real employee ID
        contractType: 'employment',
        title: 'Test Contract with Working Days',
        description: 'Testing contract creation with working days fields',
        workingHoursPerWeek: 32,
        workingDaysPerWeek: 4,
        workSchedule: 'Monday-Thursday'
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Create contract result:', createResult);
    
    if (createResult.success) {
      const contractId = createResult.contract.id;
      
      // Test getting the contract
      const getResponse = await fetch(`http://localhost:3002/api/contracts?employeeId=test-employee-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const getResult = await getResponse.json();
      console.log('Get contracts result:', getResult);
      
      // Test updating the contract
      const updateResponse = await fetch(`http://localhost:3002/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          workingDaysPerWeek: 3,
          workSchedule: 'Monday-Wednesday'
        })
      });
      
      const updateResult = await updateResponse.json();
      console.log('Update contract result:', updateResult);
    }
    
    console.log('Contract API tests completed');
  } catch (error) {
    console.error('Error testing contract API:', error);
  }
}

testContractAPI();

