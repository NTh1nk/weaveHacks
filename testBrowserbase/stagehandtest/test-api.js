// Test script for QA Testing API

const testQAAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/qa-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://weave-demo-sable.vercel.app/',
        promptContent: 'Test login feature with username "admin" and password "password". Also test a feature that should fail like "test non-existent contact form"'
      })
    });

    const result = await response.json();
    console.log('QA Test Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ QA Test Status:', result.status);
      console.log('📊 Agent Analysis:', result.data.agentAnalysis.rawResult.message);
      
      // Check for screenshots of failed features
      if (result.data.screenshots && result.data.screenshots.length > 0) {
        console.log('\n📸 Failed Feature Screenshots:');
        result.data.screenshots.forEach((screenshot, index) => {
          console.log(`${index + 1}. Feature: ${screenshot.featureName}`);
          console.log(`   Reason: ${screenshot.reason}`);
          console.log(`   Screenshot Path: ${screenshot.screenshotPath}`);
          console.log(`   Base64 Available: ${screenshot.screenshotBase64 ? 'Yes' : 'No'}`);
          
          // You could save the base64 screenshot to a file if needed
          if (screenshot.screenshotBase64) {
            console.log(`   Base64 Length: ${screenshot.screenshotBase64.length} characters`);
          }
        });
      } else {
        console.log('\n✅ No failed features - no screenshots needed');
      }
      
    } else {
      console.log('\n❌ QA Test Failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error calling QA API:', error);
  }
};

// Test health endpoint
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const result = await response.json();
    console.log('Health Check:', result);
  } catch (error) {
    console.error('Health check failed:', error);
  }
};

// Run tests
console.log('🧪 Testing QA API...\n');

testHealth().then(() => {
  console.log('\n🚀 Running QA Test with potential failures...\n');
  testQAAPI();
});

export { testQAAPI, testHealth }; 