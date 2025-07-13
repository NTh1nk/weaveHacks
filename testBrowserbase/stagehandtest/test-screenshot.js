// Test script specifically for screenshot functionality

const testScreenshotFunctionality = async () => {
  console.log('🧪 Testing Screenshot Functionality...\n');
  
  try {
    const response = await fetch('http://localhost:3000/qa-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://weave-demo-sable.vercel.app/',
        promptContent: 'Test login feature AND test a non-existent feature like "advanced search filters" which should fail'
      })
    });

    const result = await response.json();
    
    console.log('✅ API Response received');
    console.log('📊 Status:', result.status);
    console.log('✅ Success:', result.success);
    
    if (result.success && result.data) {
      console.log('\n📋 Test Results:');
      console.log('Agent Status:', result.data.agentAnalysis.status);
      console.log('Message Length:', result.data.agentAnalysis.rawResult.message.length);
      
      console.log('\n❌ Failed Features:');
      if (result.data.failedFeatures && result.data.failedFeatures.length > 0) {
        result.data.failedFeatures.forEach((feature, index) => {
          console.log(`${index + 1}. ${feature.featureName}: ${feature.reason}`);
        });
      } else {
        console.log('No failed features detected');
      }
      
      console.log('\n📸 Screenshots:');
      if (result.data.screenshots && result.data.screenshots.length > 0) {
        result.data.screenshots.forEach((screenshot, index) => {
          console.log(`${index + 1}. Feature: ${screenshot.featureName}`);
          console.log(`   Reason: ${screenshot.reason}`);
          console.log(`   File: ${screenshot.screenshotPath}`);
          console.log(`   Base64: ${screenshot.screenshotBase64 ? 'Available' : 'Missing'} (${screenshot.screenshotBase64 ? screenshot.screenshotBase64.length : 0} chars)`);
          console.log('');
        });
        
        console.log(`✅ SUCCESS: ${result.data.screenshots.length} screenshots captured and included!`);
      } else {
        console.log('❌ NO SCREENSHOTS: This should not happen - screenshots should be forced');
      }
      
    } else {
      console.log('❌ Test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing screenshot functionality:', error);
  }
};

// Also test with a scenario that should definitely have failures
const testWithDefiniteFailures = async () => {
  console.log('\n🎯 Testing with Definite Failures...\n');
  
  try {
    const response = await fetch('http://localhost:3000/qa-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://weave-demo-sable.vercel.app/',
        promptContent: 'Test these features: 1) Admin panel access without login (should fail), 2) Upload large files feature (should fail), 3) Advanced filtering system (should fail)'
      })
    });

    const result = await response.json();
    
    console.log('📊 Definite Failures Test - Status:', result.status);
    
    if (result.success && result.data && result.data.screenshots) {
      console.log(`✅ Screenshots for definite failures: ${result.data.screenshots.length}`);
      result.data.screenshots.forEach((screenshot, index) => {
        console.log(`${index + 1}. ${screenshot.featureName} - ${screenshot.reason.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in definite failures test:', error);
  }
};

// Run both tests
console.log('🚀 Starting Screenshot Functionality Tests...\n');

setTimeout(() => {
  testScreenshotFunctionality().then(() => {
    setTimeout(() => {
      testWithDefiniteFailures();
    }, 2000);
  });
}, 1000);

export { testScreenshotFunctionality, testWithDefiniteFailures }; 