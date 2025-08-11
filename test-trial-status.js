const fetch = require('node-fetch');

async function testTrialStatus() {
  console.log("🧪 TESTING TRIAL STATUS API");
  console.log("=".repeat(50));

  try {
    // Test the trial status endpoint
    const response = await fetch('http://localhost:3000/api/trial/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need proper session cookies
      }
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.text();
    console.log("Response:", data);

    if (response.status === 401) {
      console.log("❌ Unauthorized - Session required for testing");
    } else if (response.status === 200) {
      console.log("✅ Trial status API responding");
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testTrialStatus().catch(console.error);

