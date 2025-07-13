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
        promptContent: 'Test login feature with username "admin" and password "password"'
      })
    });

    const result = await response.json();
    console.log('QA Test Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ QA Test Status:', result.status);
      console.log('📊 Agent Analysis:', result.data);
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
  console.log('\n🚀 Running QA Test...\n');
  testQAAPI();
});

export { testQAAPI, testHealth }; 