// Test script to verify API connectivity and data loading
// This script tests the connection to the test system API

const API_BASE_URL = 'http://localhost:4000';

async function testApiConnectivity() {
  console.log('🔍 Testing API connectivity...\n');
  
  try {
    // Test health endpoint
    // console.log('1. Testing health endpoint...');
    // const healthResponse = await fetch(`${API_BASE_URL}/health`);
    // if (healthResponse.ok) {
    //   const healthData = await healthResponse.json();
    //   console.log('✅ Health check passed:', healthData);
    // } else {
    //   console.log('❌ Health check failed:', healthResponse.status);
    // }
    
    // Test summary endpoint
    console.log('\n2. Testing summary endpoint...');
    const summaryResponse = await fetch(`${API_BASE_URL}/qa-summary`);
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        console.log('✅ Summary endpoint working');
        console.log(`   Total results: ${summaryData.totalResults}`);
        if (summaryData.summary && summaryData.summary.length > 0) {
          console.log(`   Latest result ID: ${summaryData.summary[summaryData.summary.length - 1].id}`);
        }
      } else {
        console.log('❌ Summary endpoint returned error:', summaryData.error);
      }
    } else {
      console.log('❌ Summary endpoint failed:', summaryResponse.status);
    }
    
    // Test specific result endpoint if we have results
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      if (summaryData.success && summaryData.summary && summaryData.summary.length > 0) {
        const latestResult = summaryData.summary[summaryData.summary.length - 1];
        
        console.log('\n3. Testing result endpoint...');
        const resultResponse = await fetch(`${API_BASE_URL}/qa-result/${latestResult.id}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          if (resultData.success) {
            console.log('✅ Result endpoint working');
            console.log(`   Result ID: ${resultData.data.id}`);
            console.log(`   URL: ${resultData.data.url}`);
            console.log(`   Features: ${resultData.data.testResult.features?.length || 0}`);
            console.log(`   Graph nodes: ${resultData.data.testResult.graph?.nodes?.length || 0}`);
            console.log(`   Graph edges: ${resultData.data.testResult.graph?.edges?.length || 0}`);
            
            // Test workflow data conversion
            if (resultData.data.testResult.graph) {
              console.log('\n4. Testing workflow data conversion...');
              const workflowData = convertToWorkflowFormat(resultData.data);
              if (workflowData) {
                console.log('✅ Workflow conversion successful');
                console.log(`   Generated nodes: ${workflowData.nodes.length}`);
                workflowData.nodes.forEach((node, index) => {
                  console.log(`   Node ${index + 1}: ${node.name} (${node.status})`);
                });
              } else {
                console.log('❌ Workflow conversion failed');
              }
            } else {
              console.log('⚠️ No graph data available for workflow conversion');
            }
          } else {
            console.log('❌ Result endpoint returned error:', resultData.error);
          }
        } else {
          console.log('❌ Result endpoint failed:', resultResponse.status);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error.message);
    console.log('\n💡 Make sure the test server is running:');
    console.log('   cd testBrowserbase/stagehandtest && npm run dev');
  }
  
  console.log('\n🏁 API connectivity test completed!');
}

// Simple workflow conversion function for testing
function convertToWorkflowFormat(testData) {
  const graph = testData.testResult.graph;
  const features = testData.testResult.features || [];
  
  if (!graph) {
    return null;
  }
  
  const nodes = graph.nodes.map((node, index) => {
    const feature = features.find(f => 
      f.featureName.toLowerCase().includes(node.nodeText.toLowerCase()) ||
      node.nodeText.toLowerCase().includes(f.featureName.toLowerCase())
    );
    
    let status = "completed";
    if (feature) {
      switch (feature.status) {
        case 'PASSED': status = 'completed'; break;
        case 'FAILED': status = 'failed'; break;
        case 'WARNING': status = 'pending'; break;
        default: status = 'completed';
      }
    }
    
    const x = 50 + (index * 150);
    const y = 100 + (index % 2 * 100);
    
    const connections = graph.edges
      .filter(edge => edge.source === node.nodeId)
      .map(edge => edge.target);
    
    return {
      id: node.nodeId,
      name: node.nodeText,
      status,
      duration: feature ? "0.5s" : "0.1s",
      x,
      y,
      connections,
      description: feature?.whatHappened
    };
  });
  
  return { nodes };
}

// Run the test
testApiConnectivity().catch(console.error); 