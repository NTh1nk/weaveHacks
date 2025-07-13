// Quick test to verify screenshot functionality

console.log('🧪 Quick Screenshot Test\n');

const quickTest = async () => {
  try {
    console.log('📞 Calling QA API...');
    
    const response = await fetch('http://localhost:3000/qa-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://weave-demo-sable.vercel.app/',
        promptContent: 'Test these features: Login functionality, Advanced search filters (non-existent), File upload system (non-existent)'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ API Response received');
    console.log('📊 Success:', result.success);
    console.log('📊 Status:', result.status);
    
    if (result.success && result.data) {
      console.log('\n📋 Test Summary:');
      console.log('   Features parsed:', result.data.features?.length || 0);
      console.log('   Failed features:', result.data.failedFeatures?.length || 0);
      console.log('   Screenshots:', result.data.screenshots?.length || 0);
      
      if (result.data.features && result.data.features.length > 0) {
        console.log('\n🧪 Features Tested:');
        result.data.features.forEach((feature, i) => {
          console.log(`   ${i + 1}. ${feature.featureName}: ${feature.status}`);
        });
      }
      
      if (result.data.failedFeatures && result.data.failedFeatures.length > 0) {
        console.log('\n❌ Failed Features:');
        result.data.failedFeatures.forEach((feature, i) => {
          console.log(`   ${i + 1}. ${feature.featureName}`);
          console.log(`      Reason: ${feature.reason}`);
        });
      }
      
      if (result.data.screenshots && result.data.screenshots.length > 0) {
        console.log('\n📸 Screenshots Captured:');
        result.data.screenshots.forEach((screenshot, i) => {
          console.log(`   ${i + 1}. ${screenshot.featureName}`);
          console.log(`      Path: ${screenshot.screenshotPath}`);
          console.log(`      Base64: ${screenshot.screenshotBase64 ? 'Available' : 'Missing'}`);
          if (screenshot.screenshotBase64) {
            console.log(`      Size: ${screenshot.screenshotBase64.length} characters`);
          }
        });
        
        console.log(`\n✅ SUCCESS: ${result.data.screenshots.length} screenshots captured!`);
      } else {
        console.log('\n❌ FAILURE: No screenshots were captured');
      }
      
    } else {
      console.log('\n❌ API call failed:', result.error);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
};

// Check if server is running first
const checkHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    const result = await response.json();
    console.log('✅ Server is running:', result.message);
    return true;
  } catch (error) {
    console.log('❌ Server not running. Start it with: npm start');
    return false;
  }
};

// Run the test
checkHealth().then(isRunning => {
  if (isRunning) {
    console.log('\n🚀 Starting quick test...\n');
    quickTest();
  }
});

export default quickTest; 