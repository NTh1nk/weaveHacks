// Test script for database functionality

console.log('🗄️ Testing Database Functionality\n');

const testDbFunctionality = async () => {
  try {
    // Step 1: Run a QA test to create a database entry
    console.log('📝 Step 1: Running QA test to create database entry...');
    
    const testResponse = await fetch('http://localhost:3000/qa-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://weave-demo-sable.vercel.app/',
        promptContent: 'Test login feature and non-existent advanced search filters'
      })
    });

    const testResult = await testResponse.json();
    
    if (testResult.success) {
      console.log('✅ QA test completed successfully');
      console.log('📁 Local DB file:', testResult.localDbFile);
      
      // Step 2: List all available results
      console.log('\n📋 Step 2: Listing all available results...');
      
      const listResponse = await fetch('http://localhost:3000/qa-results');
      const listResult = await listResponse.json();
      
      if (listResult.success) {
        console.log(`✅ Found ${listResult.totalResults} results:`);
        listResult.results.forEach(result => {
          console.log(`   ${result.number}. ${result.fileName}`);
        });
        
        // Step 3: Fetch the latest result
        if (listResult.results.length > 0) {
          const latestNumber = listResult.results[listResult.results.length - 1].number;
          console.log(`\n📖 Step 3: Fetching result ${latestNumber}...`);
          
          const fetchResponse = await fetch(`http://localhost:3000/qa-result/${latestNumber}`);
          const fetchResult = await fetchResponse.json();
          
          if (fetchResult.success) {
            console.log('✅ Result fetched successfully');
            console.log('📊 File number:', fetchResult.fileNumber);
            console.log('📄 File name:', fetchResult.fileName);
            console.log('📋 Data summary:');
            console.log(`   URL: ${fetchResult.data.url}`);
            console.log(`   Features: ${fetchResult.data.testResult.features?.length || 0}`);
            console.log(`   Failed Features: ${fetchResult.data.testResult.failedFeatures?.length || 0}`);
            console.log(`   Screenshots: ${fetchResult.data.testResult.screenshots?.length || 0}`);
            console.log(`   Screenshot Base64: ${fetchResult.data.testResult.screenshots?.[0]?.screenshotBase64 ? 'Available' : 'Not available'}`);
            
            if (fetchResult.data.testResult.screenshots?.[0]?.screenshotBase64) {
              console.log(`   Base64 Length: ${fetchResult.data.testResult.screenshots[0].screenshotBase64.length} characters`);
            }
          } else {
            console.log('❌ Failed to fetch result:', fetchResult.error);
          }
        }
        
        // Step 4: Test fetching non-existent result
        console.log('\n🧪 Step 4: Testing non-existent result...');
        
        const nonExistentResponse = await fetch('http://localhost:3000/qa-result/999');
        const nonExistentResult = await nonExistentResponse.json();
        
        if (!nonExistentResult.success) {
          console.log('✅ Correctly handled non-existent result');
          console.log('📋 Available files:', nonExistentResult.availableFiles);
        } else {
          console.log('❌ Unexpected success for non-existent result');
        }
        
      } else {
        console.log('❌ Failed to list results:', listResult.error);
      }
      
    } else {
      console.log('❌ QA test failed:', testResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
    console.log('\n🚀 Starting database functionality test...\n');
    testDbFunctionality();
  }
});

export default testDbFunctionality; 