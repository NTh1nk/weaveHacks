// Test script to verify session selector functionality
// This script tests the session-related API endpoints

const { fetchWithFallback, LOCAL_API_BASE_URL, REMOTE_API_BASE_URL } = require('./lib/api-config');

async function testSessionSelector() {
  console.log('🧪 Testing Session Selector Functionality...\n');
  
  try {
    // Test 1: Get all sessions
    console.log('1. Testing sessions endpoint...');
    const sessionsResponse = await fetchWithFallback('/qa-summary');
    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      if (sessionsData.success) {
        console.log('✅ Sessions endpoint working');
        console.log(`   Total sessions: ${sessionsData.totalResults}`);
        
        if (sessionsData.summary && sessionsData.summary.length > 0) {
          console.log('\n   Available sessions:');
          sessionsData.summary.forEach((session, index) => {
            console.log(`   ${index + 1}. Session ${session.id}`);
            console.log(`      URL: ${session.url}`);
            console.log(`      Timestamp: ${new Date(session.timestamp).toLocaleString()}`);
            console.log(`      Features: ${session.totalFeatures || 0} total, ${session.failedFeatures || 0} failed`);
            console.log(`      Screenshots: ${session.screenshots || 0}`);
            console.log('');
          });
          
          // Test 2: Get specific session
          const latestSession = sessionsData.summary[0];
          console.log(`2. Testing specific session endpoint (Session ${latestSession.id})...`);
          
          const sessionResponse = await fetchWithFallback(`/qa-result/${latestSession.id}`);
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            if (sessionData.success) {
              console.log('✅ Specific session endpoint working');
              console.log(`   Session ID: ${sessionData.data.id}`);
              console.log(`   URL: ${sessionData.data.url}`);
              console.log(`   Features: ${sessionData.data.testResult.features?.length || 0}`);
              console.log(`   Graph nodes: ${sessionData.data.testResult.graph?.nodes?.length || 0}`);
              console.log(`   Graph edges: ${sessionData.data.testResult.graph?.edges?.length || 0}`);
              
              // Test 3: Test dashboard API with session parameter
              console.log('\n3. Testing dashboard API with session parameter...');
              const dashboardResponse = await fetch(`http://localhost:3000/api/qa-data?sessionId=${latestSession.id}`);
              if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                console.log('✅ Dashboard API with session parameter working');
                console.log(`   Metrics: ${dashboardData.metrics ? 'Available' : 'Missing'}`);
                console.log(`   Test History: ${dashboardData.testHistory?.length || 0} entries`);
                console.log(`   Error Details: ${dashboardData.errorDetails?.length || 0} entries`);
                console.log(`   Screenshots: ${dashboardData.screenshots?.length || 0} entries`);
                console.log(`   Workflow Data: ${dashboardData.workflowData ? 'Available' : 'Missing'}`);
              } else {
                console.log('❌ Dashboard API with session parameter failed:', dashboardResponse.status);
              }
              
            } else {
              console.log('❌ Specific session endpoint returned error:', sessionData.error);
            }
          } else {
            console.log('❌ Specific session endpoint failed:', sessionResponse.status);
          }
          
        } else {
          console.log('⚠️ No sessions available for testing');
        }
      } else {
        console.log('❌ Sessions endpoint returned error:', sessionsData.error);
      }
    } else {
      console.log('❌ Sessions endpoint failed:', sessionsResponse.status);
    }
    
    // Test 4: Test sessions API endpoint
    console.log('\n4. Testing sessions API endpoint...');
    const sessionsApiResponse = await fetch('http://localhost:3000/api/sessions');
    if (sessionsApiResponse.ok) {
      const sessionsApiData = await sessionsApiResponse.json();
      if (sessionsApiData.success) {
        console.log('✅ Sessions API endpoint working');
        console.log(`   Sessions returned: ${sessionsApiData.sessions.length}`);
        console.log(`   Total sessions: ${sessionsApiData.totalSessions}`);
      } else {
        console.log('❌ Sessions API endpoint returned error:', sessionsApiData.error);
      }
    } else {
      console.log('❌ Sessions API endpoint failed:', sessionsApiResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Session selector test failed:', error.message);
    console.log('\n💡 Make sure both servers are running:');
    console.log('   Test server: cd testBrowserbase/stagehandtest && npm run dev');
    console.log('   Dashboard: cd dashboard && npm run dev');
  }
  
  console.log('\n🏁 Session selector test completed!');
}

// Run the test
testSessionSelector().catch(console.error); 