// Test script to verify workflow integration
// This script simulates the API response and tests the workflow data conversion

const testData = {
  id: 1,
  timestamp: "2025-07-13T08:07:33.224Z",
  url: "https://weave-demo-sable.vercel.app/",
  promptContent: "Test this login in this app",
  testResult: {
    agentAnalysis: {
      status: "COMPLETED",
      summary: "Successfully tested the login feature of the application with provided demo credentials."
    },
    features: [
      {
        featureName: "User Login",
        status: "PASSED",
        whatHappened: "The user was able to log in successfully using provided demo credentials."
      }
    ],
    graph: {
      nodes: [
        {
          nodeId: "step1",
          nodeText: "Entered username"
        },
        {
          nodeId: "step2",
          nodeText: "Entered password"
        },
        {
          nodeId: "step3",
          nodeText: "Clicked on Sign In"
        },
        {
          nodeId: "step4",
          nodeText: "Login successful, redirected to Dashboard"
        }
      ],
      edges: [
        {
          source: "step1",
          target: "step2"
        },
        {
          source: "step2",
          target: "step3"
        },
        {
          source: "step3",
          target: "step4"
        }
      ]
    },
    screenshots: []
  },
  screenshotCount: 0
};

// Simulate the workflow data conversion logic
function convertTestDataToWorkflow(testData) {
  const graph = testData.testResult.graph;
  const features = testData.testResult.features || [];
  
  if (!graph) {
    console.log('No graph data available in test result');
    return null;
  }
  
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
console.log('Testing workflow data conversion...\n');

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