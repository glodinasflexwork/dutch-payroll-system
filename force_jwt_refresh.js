// This script will be executed in the browser console to force JWT refresh

async function forceJWTRefresh() {
  console.log('🔄 Forcing JWT token refresh...');
  
  try {
    // Step 1: Sign out to clear the JWT token
    console.log('📤 Signing out to clear JWT token...');
    const signoutResponse = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    console.log('✅ Signed out, JWT token cleared');
    
    // Step 2: Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Redirect to signin page
    console.log('🔄 Redirecting to signin page...');
    window.location.href = '/auth/signin';
    
  } catch (error) {
    console.error('❌ Error during JWT refresh:', error);
  }
}

forceJWTRefresh();

