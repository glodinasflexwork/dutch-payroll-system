// This script will be run in the browser console to force a session update

async function forceSessionUpdate() {
  console.log('🔄 Forcing session update...');
  
  try {
    // Get the current session
    const sessionResponse = await fetch('/api/auth/session');
    const currentSession = await sessionResponse.json();
    console.log('📋 Current session:', currentSession);
    
    // Force a session update by calling the NextAuth update endpoint
    const updateResponse = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'update'
      })
    });
    
    if (updateResponse.ok) {
      const updatedSession = await updateResponse.json();
      console.log('✅ Updated session:', updatedSession);
      
      // Reload the page to apply the new session
      console.log('🔄 Reloading page...');
      window.location.reload();
    } else {
      console.error('❌ Failed to update session:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error updating session:', error);
  }
}

// Run the function
forceSessionUpdate();

