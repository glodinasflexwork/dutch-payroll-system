// Using native fetch API (Node.js 18+)

async function testEmployeeDeactivationAPI() {
  try {
    console.log('🧪 Testing Employee Deactivation API');
    console.log('=' .repeat(50));
    
    // Test employee ID (Test Employee)
    const testEmployeeId = 'cm2xqgqzb0000o4lmq3wm34wn'; // This might need to be updated with actual ID
    
    // Test data for deactivation
    const deactivationData = {
      reason: "Employee Resignation",
      effectiveDate: "2025-07-24"
    };
    
    console.log('🎯 Testing employee deactivation...');
    console.log('Employee ID:', testEmployeeId);
    console.log('Deactivation data:', deactivationData);
    
    // Test the toggle status API endpoint
    const response = await fetch(`http://localhost:3000/api/employees/${testEmployeeId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need proper authentication headers
      },
      body: JSON.stringify(deactivationData)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response successful!');
      console.log('Response data:', JSON.stringify(result, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ API Response failed');
      console.log('Error status:', response.status);
      console.log('Error data:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 401) {
        console.log('💡 Note: 401 Unauthorized is expected without proper session authentication');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Test the API endpoint structure
async function testAPIEndpointStructure() {
  console.log('\n🔍 Testing API Endpoint Structure');
  console.log('=' .repeat(50));
  
  try {
    // Test if the endpoint exists by making a request
    const response = await fetch('http://localhost:3000/api/employees/test-id/toggle-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'test', effectiveDate: '2025-07-24' })
    });
    
    console.log('📡 Endpoint response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Endpoint exists (401 Unauthorized - authentication required)');
    } else if (response.status === 404) {
      console.log('❌ Endpoint not found (404)');
    } else {
      console.log('📊 Endpoint responded with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
  }
}

// Run the tests
console.log('🚀 Starting Employee Deactivation API Tests\n');
testAPIEndpointStructure().then(() => {
  return testEmployeeDeactivationAPI();
}).then(() => {
  console.log('\n🏁 Tests completed');
});

