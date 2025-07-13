// Test script to verify workflow integration
// This script fetches data from the actual API and tests the workflow data conversion

const API_BASE_URL = 'http://localhost:4000';

// Fetch data from the actual API
async function fetchTestData() {
  try {
    console.log('Fetching test data from API...');
    
    // First get the summary to find the latest result
    const summaryResponse = await fetch(`${API_BASE_URL}/qa-summary`);
    if (!summaryResponse.ok) {
      throw new Error(`Failed to fetch summary: ${summaryResponse.statusText}`);
    }
    
    const summaryData = await summaryResponse.json();
    if (!summaryData.success || !summaryData.summary || summaryData.summary.length === 0) {
      throw new Error('No test results available');
    }
    
    // Get the latest result
    const latestResult = summaryData.summary[summaryData.summary.length - 1];
    console.log(`Latest result ID: ${latestResult.id}`);
    
    const resultResponse = await fetch(`${API_BASE_URL}/qa-result/${latestResult.id}`);
    if (!resultResponse.ok) {
      throw new Error(`Failed to fetch result: ${resultResponse.statusText}`);
    }
    
    const resultData = await resultResponse.json();
    if (!resultData.success) {
      throw new Error(`Failed to get result data: ${resultData.error}`);
    }
    
    console.log('✅ Successfully fetched test data from API');
    return resultData.data;
    
  } catch (error) {
    console.error('❌ Error fetching test data:', error.message);
    console.log('\nTrying to read from local JSON file as fallback...');
    
    // Fallback to reading local JSON file
    try {
      const fs = require('fs');
      const path = require('path');
      const jsonPath = path.join(__dirname, '../testBrowserbase/stagehandtest/db/1.json');
      
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);
        console.log('✅ Successfully read from local JSON file');
        return data;
      } else {
        throw new Error('Local JSON file not found');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      return null;
    }
  }
}

// Simulate the workflow data conversion logic
function convertTestDataToWorkflow(testData) {
  const graph = testData.testResult.graph;
  const features = testData.testResult.features || [];
  
  if (!graph) {
    console.log('No graph data available in test result');
    return null;
  }
  
  console.log('Processing workflow data:', {
    graphNodes: graph.nodes.length,
    graphEdges: graph.edges.length,
    features: features.length
  });
  
  // Convert graph nodes to workflow format
  const nodes = graph.nodes.map((node, index) => {
    // Find corresponding feature for status
    const feature = features.find(f => 
      f.featureName.toLowerCase().includes(node.nodeText.toLowerCase()) ||
      node.nodeText.toLowerCase().includes(f.featureName.toLowerCase())
    );
    
    // Determine status based on feature status or default to completed
    let status = "completed";
    if (feature) {
      switch (feature.status) {
        case 'PASSED':
          status = 'completed';
          break;
        case 'FAILED':
          status = 'failed';
          break;
        case 'WARNING':
          status = 'pending';
          break;
        default:
          status = 'completed';
      }
    }
    
    // Calculate position (simple grid layout)
    const x = 50 + (index * 150);
    const y = 100 + (index % 2 * 100);
    
    // Find connections for this node
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

// Test the conversion
async function runTest() {
  console.log('Testing workflow data conversion...\n');
  
  const testData = await fetchTestData();
  
  if (!testData) {
    console.log('❌ Could not fetch test data');
    return;
  }
  
  console.log('Test data structure:');
  console.log('- ID:', testData.id);
  console.log('- URL:', testData.url);
  console.log('- Timestamp:', testData.timestamp);
  console.log('- Features:', testData.testResult.features?.length || 0);
  console.log('- Graph nodes:', testData.testResult.graph?.nodes?.length || 0);
  console.log('- Graph edges:', testData.testResult.graph?.edges?.length || 0);
  console.log('');
  
  const workflowData = convertTestDataToWorkflow(testData);
  
  if (workflowData) {
    console.log('✅ Workflow data conversion successful!');
    console.log('\nGenerated workflow nodes:');
    workflowData.nodes.forEach((node, index) => {
      console.log(`${index + 1}. ${node.name} (${node.status})`);
      console.log(`   Position: (${node.x}, ${node.y})`);
      console.log(`   Connections: ${node.connections.join(', ') || 'none'}`);
      if (node.description) {
        console.log(`   Description: ${node.description}`);
      }
      console.log('');
    });
  } else {
    console.log('❌ Workflow data conversion failed');
  }
  
  console.log('Test completed!');
}

// Run the test
runTest().catch(console.error); 