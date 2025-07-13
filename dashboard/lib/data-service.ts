import fs from 'fs';
import path from 'path';

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
  private qaResultsPath: string;

  constructor() {
    // Path to the QA test results file in testBrowserbase
    this.qaResultsPath = path.join(process.cwd(), '..', 'testBrowserbase', 'stagehandtest', 'qa-test-results.json');
    
    // Log the path for debugging
    console.log('Looking for QA results at:', this.qaResultsPath);
    console.log('Current working directory:', process.cwd());
  }

  async getQATestResults(): Promise<QATestResult | null> {
    try {
      console.log('Checking if file exists at:', this.qaResultsPath);
      if (!fs.existsSync(this.qaResultsPath)) {
        console.warn('QA test results file not found:', this.qaResultsPath);
        
        // Try alternative paths
        const alternativePaths = [
          path.join(process.cwd(), 'testBrowserbase', 'stagehandtest', 'qa-test-results.json'),
          path.join(process.cwd(), '..', '..', 'testBrowserbase', 'stagehandtest', 'qa-test-results.json'),
          path.join(process.cwd(), '..', '..', '..', 'testBrowserbase', 'stagehandtest', 'qa-test-results.json')
        ];
        
        for (const altPath of alternativePaths) {
          console.log('Trying alternative path:', altPath);
          if (fs.existsSync(altPath)) {
            console.log('Found file at alternative path:', altPath);
            this.qaResultsPath = altPath;
            break;
          }
        }
        
        if (!fs.existsSync(this.qaResultsPath)) {
          console.error('QA test results file not found at any location');
          return null;
        }
      }

      console.log('Reading file from:', this.qaResultsPath);
      const fileContent = fs.readFileSync(this.qaResultsPath, 'utf-8');
      const data = JSON.parse(fileContent) as QATestResult;
      console.log('Successfully loaded QA test results');
      return data;
    } catch (error) {
      console.error('Error reading QA test results:', error);
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
    const qaResults = await this.getQATestResults();
    
    if (!qaResults) {
      return [];
    }

    // For now, return the current test result as history
    // In a real scenario, you might have multiple test runs
    return [{
      timestamp: qaResults.testTimestamp,
      status: qaResults.overallStatus,
      score: qaResults.userExperienceScore
    }];
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
}

export const dataService = new DataService(); 