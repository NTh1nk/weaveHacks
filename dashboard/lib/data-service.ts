import fs from 'fs';
import path from 'path';
const { fetchWithFallback } = require('./api-config');

// Interface for the test system's JSON format
export interface TestSystemResult {
  id: number;
  timestamp: string;
  url: string;
  promptContent: string;
  testResult: {
    agentAnalysis: {
      status: string;
      rawResult?: string;
      summary?: string;
    };
    features: Array<{
      featureName: string;
      status: string;
      whatHappened: string;
    }>;
    graph?: {
      nodes: Array<{
        nodeId: string;
        nodeText: string;
      }>;
      edges: Array<{
        source: string;
        target: string;
      }>;
    };
    screenshots: Array<{
      featureName: string;
      reason: string;
      screenshotPath: string;
      screenshotBase64: string;
    }>;
  };
}

export interface QATestResult {
  testUrl: string;
  testTimestamp: string;
  overallStatus: 'passed' | 'failed' | 'warning';
  userExperienceScore: number;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    userBlockingIssues: number;
    usabilityIssues: number;
  };
  errors: Array<{
    type: 'error' | 'warning';
    category: string;
    message: string;
    location: string;
    userImpact: 'low' | 'medium' | 'high';
    problemType: string;
    screenshot?: string;
    timestamp: string;
  }>;
}

export interface DashboardMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  userBlockingIssues: number;
  usabilityIssues: number;
  userExperienceScore: number;
  successRate: number;
  errorBreakdown: {
    [category: string]: number;
  };
  impactBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  recentErrors: Array<{
    type: string;
    category: string;
    message: string;
    location: string;
    userImpact: string;
    timestamp: string;
  }>;
}

class DataService {
  private apiBaseUrl: string;

  constructor() {
    // API base URL for the test system
    this.apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:4000';
    console.log('Using test API at:', this.apiBaseUrl);
    
    // Test API connectivity on startup
    this.testApiConnectivity();
  }

  // Test API connectivity
  private async testApiConnectivity() {
    try {
      const response = await fetchWithFallback('/health');
      if (response.ok) {
        console.log('✅ Test API is accessible');
      } else {
        console.warn('⚠️ Test API responded with status:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Test API is not accessible:', error instanceof Error ? error.message : 'Unknown error');
      console.log('Dashboard will show fallback data when API is unavailable');
    }
  }

  // Convert test system format to dashboard format
  private convertTestSystemToDashboard(testSystemData: TestSystemResult): QATestResult {
    const features = testSystemData.testResult.features || [];
    const screenshots = testSystemData.testResult.screenshots || [];
    const totalFeatures = features.length;
    const passedFeatures = features.filter(f => f.status === 'PASSED').length;
    const failedFeatures = features.filter(f => f.status === 'FAILED').length;
    const warningFeatures = features.filter(f => f.status === 'WARNING').length;
    
    // Calculate overall status
    let overallStatus: 'passed' | 'failed' | 'warning' = 'passed';
    if (failedFeatures > 0) {
      overallStatus = failedFeatures === totalFeatures ? 'failed' : 'warning';
    } else if (warningFeatures > 0) { 
      overallStatus = 'warning';
    }
    
    // Calculate user experience score (0-100)
    const userExperienceScore = totalFeatures > 0 ? (passedFeatures / totalFeatures) * 100 : 0;
    
    // Convert features to errors format and include screenshots
    const errors = features
      .filter(f => f.status === 'FAILED')
      .map(f => {
        // Find matching screenshot for this feature
        const matchingScreenshot = screenshots.find(s => s.featureName === f.featureName);
        return {
          type: 'error' as const,
          category: 'Feature Test',
          message: f.whatHappened,
          location: f.featureName,
          userImpact: 'medium' as const, // Default to medium impact
          problemType: 'Functional Issue',
          screenshot: matchingScreenshot?.screenshotBase64,
          timestamp: testSystemData.timestamp
        }
      });
    
    // Add warnings for any issues
    const warnings = features
      .filter(f => f.status === 'WARNING')
      .map(f => {
        // Find matching screenshot for this feature
        const matchingScreenshot = screenshots.find(s => s.featureName === f.featureName);
        return {
          type: 'warning' as const,
          category: 'Feature Test',
          message: f.whatHappened,
          location: f.featureName,
          userImpact: 'low' as const,
          problemType: 'Usability Issue',
          screenshot: matchingScreenshot?.screenshotBase64,
          timestamp: testSystemData.timestamp
        };
      });
    
    const allErrors = [...errors, ...warnings];
    
    return {
      testUrl: testSystemData.url,
      testTimestamp: testSystemData.timestamp,
      overallStatus,
      userExperienceScore,
      summary: {
        totalTests: totalFeatures,
        passed: passedFeatures,
        failed: failedFeatures,
        warnings: warningFeatures,
        userBlockingIssues: failedFeatures,
        usabilityIssues: warningFeatures
      },
      errors: allErrors
    };
  }

  async getQATestResults(): Promise<QATestResult | null> {
    try {
      // Get the latest result from the test system
      const summaryResponse = await fetchWithFallback('/qa-summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch summary:', summaryResponse.statusText);
        return null;
      }
      
      const summaryData = await summaryResponse.json();
      if (!summaryData.success || !summaryData.summary || summaryData.summary.length === 0) {
        console.log('No test results available');
        return null;
      }
      
      // Get the latest result
      const latestResult = summaryData.summary[summaryData.summary.length - 1];
      const resultResponse = await fetchWithFallback(`/qa-result/${latestResult.id}`);
      
      if (!resultResponse.ok) {
        console.error('Failed to fetch latest result:', resultResponse.statusText);
        return null;
      }
      
      const resultData = await resultResponse.json();
      if (!resultData.success) {
        console.error('Failed to get result data:', resultData.error);
        return null;
      }
      
      // Convert the test system format to dashboard format
      const dashboardData = this.convertTestSystemToDashboard(resultData.data);
      console.log('Successfully loaded QA test results from API');
      return dashboardData;
      
    } catch (error) {
      console.error('Error reading QA test results from API:', error);
      return null;
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const qaResults = await this.getQATestResults();
    
    if (!qaResults) {
      // Return default metrics if no data is available
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warningTests: 0,
        userBlockingIssues: 0,
        usabilityIssues: 0,
        userExperienceScore: 0,
        successRate: 0,
        errorBreakdown: {},
        impactBreakdown: { low: 0, medium: 0, high: 0 },
        recentErrors: []
      };
    }

    // Calculate error breakdown by category
    const errorBreakdown: { [category: string]: number } = {};
    const impactBreakdown = { low: 0, medium: 0, high: 0 };

    qaResults.errors.forEach(error => {
      // Count by category
      errorBreakdown[error.category] = (errorBreakdown[error.category] || 0) + 1;
      
      // Count by impact
      impactBreakdown[error.userImpact]++;
    });

    console.log('Processed error breakdown:', errorBreakdown);
    console.log('Processed impact breakdown:', impactBreakdown);

    // Calculate success rate
    const successRate = qaResults.summary.totalTests > 0 
      ? (qaResults.summary.passed / qaResults.summary.totalTests) * 100 
      : 0;

    // Get recent errors (last 10)
    const recentErrors = qaResults.errors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(error => ({
        type: error.type,
        category: error.category,
        message: error.message,
        location: error.location,
        userImpact: error.userImpact,
        timestamp: error.timestamp
      }));

    const metrics = {
      totalTests: qaResults.summary.totalTests,
      passedTests: qaResults.summary.passed,
      failedTests: qaResults.summary.failed,
      warningTests: qaResults.summary.warnings,
      userBlockingIssues: qaResults.summary.userBlockingIssues,
      usabilityIssues: qaResults.summary.usabilityIssues,
      userExperienceScore: qaResults.userExperienceScore,
      successRate,
      errorBreakdown,
      impactBreakdown,
      recentErrors
    };

    console.log('Final metrics:', metrics);
    return metrics;
  }

  async getTestHistory(): Promise<Array<{ timestamp: string; status: string; score: number }>> {
    try {
      // Get all results from the test system
      const summaryResponse = await fetchWithFallback('/qa-summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch summary for history:', summaryResponse.statusText);
        return [];
      }
      
      const summaryData = await summaryResponse.json();
      if (!summaryData.success || !summaryData.summary) {
        return [];
      }
      
      // Convert summary data to history format
      const history = summaryData.summary.map((item: any) => {
        const totalFeatures = item.totalFeatures || 0;
        const failedFeatures = item.failedFeatures || 0;
        const warningFeatures = item.warningFeatures || 0;
        const passedFeatures = totalFeatures - failedFeatures - warningFeatures;
        const score = totalFeatures > 0 ? (passedFeatures / totalFeatures) * 100 : 0;
        
        let status: string;
        if (failedFeatures === 0 && warningFeatures === 0) status = 'passed';
        else if (failedFeatures === totalFeatures) status = 'failed';
        else status = 'warning';
        
        return {
          timestamp: item.timestamp,
          status,
          score
        };
      });
      
      return history;
      
    } catch (error) {
      console.error('Error getting test history:', error);
      return [];
    }
  }

  async getErrorDetails(): Promise<Array<{
    id: string;
    type: string;
    category: string;
    message: string;
    location: string;
    userImpact: string;
    problemType: string;
    timestamp: string;
    screenshot?: string;
  }>> {
    const qaResults = await this.getQATestResults();
    
    if (!qaResults) {
      return [];
    }

    return qaResults.errors.map((error, index) => ({
      id: `error-${index}`,
      type: error.type,
      category: error.category,
      message: error.message,
      location: error.location,
      userImpact: error.userImpact,
      problemType: error.problemType,
      timestamp: error.timestamp,
      screenshot: error.screenshot
    }));
  }

  async getScreenshots(): Promise<Array<{
    id: string;
    featureName: string;
    reason: string;
    screenshotBase64: string;
    status: string;
    timestamp: string;
  }>> {
    try {
      // Get the latest result from the test system
      const summaryResponse = await fetchWithFallback('/qa-summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch summary for screenshots:', summaryResponse.statusText);
        return [];
      }
      
      const summaryData = await summaryResponse.json();
      if (!summaryData.success || !summaryData.summary || summaryData.summary.length === 0) {
        return [];
      }
      
      // Get the latest result
      const latestResult = summaryData.summary[summaryData.summary.length - 1];
      const resultResponse = await fetchWithFallback(`/qa-result/${latestResult.id}`);
      
      if (!resultResponse.ok) {
        console.error('Failed to fetch latest result for screenshots:', resultResponse.statusText);
        return [];
      }
      
      const resultData = await resultResponse.json();
      if (!resultData.success) {
        console.error('Failed to get result data for screenshots:', resultData.error);
        return [];
      }
      
      const screenshots = resultData.data.testResult.screenshots || [];
      const features = resultData.data.testResult.features || [];
      
      console.log('Raw screenshots data:', screenshots);
      console.log('Raw features data:', features);
      
      // Combine screenshots with feature status
      return screenshots.map((screenshot: any, index: number) => {
        const feature = features.find((f: any) => f.featureName === screenshot.featureName);
        const screenshotData = {
          id: `screenshot-${index}`,
          featureName: screenshot.featureName,
          reason: screenshot.reason,
          screenshotBase64: screenshot.screenshotBase64 || '',
          status: feature?.status || 'UNKNOWN',
          timestamp: resultData.data.timestamp
        };
        
        console.log(`Screenshot ${index}:`, {
          featureName: screenshotData.featureName,
          hasBase64: !!screenshotData.screenshotBase64,
          base64Length: screenshotData.screenshotBase64?.length || 0
        });
        
        return screenshotData;
      });
      
    } catch (error) {
      console.error('Error getting screenshots:', error);
      return [];
    }
  }

  // Convert test system graph data to workflow format
  async getWorkflowData(): Promise<{
    nodes: Array<{
      id: string;
      name: string;
      status: "completed" | "running" | "pending" | "failed";
      duration: string;
      x: number;
      y: number;
      connections: string[];
      description?: string;
      screenshotBase64?: string; // <-- add this line
    }>;
  } | null> {
    try {
      // Get the latest result from the test system
      const summaryResponse = await fetchWithFallback('/qa-summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch summary:', summaryResponse.statusText);
        return null;
      }
      
      const summaryData = await summaryResponse.json();
      if (!summaryData.success || !summaryData.summary || summaryData.summary.length === 0) {
        console.log('No test results available for workflow');
        return null;
      }
      
      // Get the latest result
      const latestResult = summaryData.summary[summaryData.summary.length - 1];
      const resultResponse = await fetchWithFallback(`/qa-result/${latestResult.id}`);
      
      if (!resultResponse.ok) {
        console.error('Failed to fetch latest result:', resultResponse.statusText);
        return null;
      }
      
      const resultData = await resultResponse.json();
      if (!resultData.success || !resultData.data.testResult.graph) {
        console.log('No graph data available in test result');
        return null;
      }
      
      const graph = resultData.data.testResult.graph;
      const features = resultData.data.testResult.features || [];
      
      console.log('Processing workflow data:', {
        graphNodes: graph.nodes.length,
        graphEdges: graph.edges.length,
        features: features.length
      });
      
      // Convert graph nodes to workflow format
      const nodes = graph.nodes.map((node: { nodeId: string; nodeText: string, screenshotBase64?: string }, index: number) => {
        // Find corresponding feature for status
        const feature = features.find((f: { featureName: string; status: string; whatHappened: string }) => 
          f.featureName.toLowerCase().includes(node.nodeText.toLowerCase()) ||
          node.nodeText.toLowerCase().includes(f.featureName.toLowerCase())
        );
        
        // Determine status based on feature status or default to completed
        let status: "completed" | "running" | "pending" | "failed" = "completed";
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
          .filter((edge: { source: string; target: string }) => edge.source === node.nodeId)
          .map((edge: { source: string; target: string }) => edge.target);
        
        return {
          id: node.nodeId,
          name: node.nodeText,
          status,
          duration: feature ? "0.5s" : "0.1s",
          x,
          y,
          connections,
          description: feature?.whatHappened,
          screenshotBase64: node.screenshotBase64 || null, // <-- add this line
        };
      });
      
      console.log('Generated workflow nodes:', nodes.length);
      return { nodes };
      
    } catch (error) {
      console.error('Error getting workflow data:', error);
      return null;
    }
  }

  // Get all available test sessions
  async getAllSessions(): Promise<Array<{
    id: number;
    url: string;
    timestamp: string;
    promptContent: string;
    totalFeatures: number;
    failedFeatures: number;
    screenshots: number;
  }>> {
    try {
      const summaryResponse = await fetchWithFallback('/qa-summary');
      if (!summaryResponse.ok) {
        console.error('Failed to fetch sessions summary:', summaryResponse.statusText);
        return [];
      }
      
      const summaryData = await summaryResponse.json();
      if (!summaryData.success || !summaryData.summary) {
        console.log('No sessions available');
        return [];
      }
      
      // Sort sessions by timestamp (newest first)
      const sessions = summaryData.summary
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((session: any) => ({
          id: session.id,
          url: session.url,
          timestamp: session.timestamp,
          promptContent: session.promptContent || 'No prompt content',
          totalFeatures: session.totalFeatures || 0,
          failedFeatures: session.failedFeatures || 0,
          screenshots: session.screenshots || 0
        }));
      
      console.log(`Found ${sessions.length} test sessions`);
      return sessions;
      
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  // Get specific session by ID
  async getSessionById(sessionId: number): Promise<QATestResult | null> {
    try {
      const resultResponse = await fetchWithFallback(`/qa-result/${sessionId}`);
      
      if (!resultResponse.ok) {
        console.error('Failed to fetch session:', resultResponse.statusText);
        return null;
      }
      
      const resultData = await resultResponse.json();
      if (!resultData.success) {
        console.error('Failed to get session data:', resultData.error);
        return null;
      }
      
      // Convert the test system format to dashboard format
      const dashboardData = this.convertTestSystemToDashboard(resultData.data);
      console.log(`Successfully loaded session ${sessionId} from API`);
      return dashboardData;
      
    } catch (error) {
      console.error('Error getting session by ID:', error);
      return null;
    }
  }

  // Get workflow data for specific session
  async getWorkflowDataForSession(sessionId: number): Promise<{
    nodes: Array<{
      id: string;
      name: string;
      status: "completed" | "running" | "pending" | "failed";
      duration: string;
      x: number;
      y: number;
      connections: string[];
      description?: string;
    }>;
  } | null> {
    try {
      const resultResponse = await fetchWithFallback(`/qa-result/${sessionId}`);
      
      if (!resultResponse.ok) {
        console.error('Failed to fetch session for workflow:', resultResponse.statusText);
        return null;
      }
      
      const resultData = await resultResponse.json();
      if (!resultData.success || !resultData.data.testResult.graph) {
        console.log(`No graph data available in session ${sessionId}`);
        return null;
      }
      
      const graph = resultData.data.testResult.graph;
      const features = resultData.data.testResult.features || [];
      
      console.log(`Processing workflow data for session ${sessionId}:`, {
        graphNodes: graph.nodes.length,
        graphEdges: graph.edges.length,
        features: features.length
      });
      
      // Convert graph nodes to workflow format
      const nodes = graph.nodes.map((node: { nodeId: string; nodeText: string }, index: number) => {
        // Find corresponding feature for status
        const feature = features.find((f: { featureName: string; status: string; whatHappened: string }) => 
          f.featureName.toLowerCase().includes(node.nodeText.toLowerCase()) ||
          node.nodeText.toLowerCase().includes(f.featureName.toLowerCase())
        );
        
        // Determine status based on feature status or default to completed
        let status: "completed" | "running" | "pending" | "failed" = "completed";
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
          .filter((edge: { source: string; target: string }) => edge.source === node.nodeId)
          .map((edge: { source: string; target: string }) => edge.target);
        
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
      
      console.log(`Generated ${nodes.length} workflow nodes for session ${sessionId}`);
      return { nodes };
      
    } catch (error) {
      console.error('Error getting workflow data for session:', error);
      return null;
    }
  }
}

export const dataService = new DataService(); 