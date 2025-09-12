require('dotenv').config({ path: '.env.local' });

async function testSessionRefresh() {
  try {
    console.log('🧪 Testing session refresh API...');
    
    // First, let's check what the current session API returns
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
    const sessionData = await sessionResponse.json();
    
    console.log('📋 Current session data:');
    console.log(JSON.stringify(sessionData, null, 2));
    
    // Now test the refresh endpoint
    const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔄 Refresh response status:', refreshResponse.status);
    
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Refresh response data:');
      console.log(JSON.stringify(refreshData, null, 2));
    } else {
      const errorData = await refreshResponse.text();
      console.log('❌ Refresh error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSessionRefresh();

