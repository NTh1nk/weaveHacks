import { NextResponse } from 'next/server';
import { dataService, DashboardMetrics } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    let metrics: DashboardMetrics;
    let testHistory: Array<{ timestamp: string; status: string; score: number }>;
    let errorDetails: Array<{
      id: string;
      type: string;
      category: string;
      message: string;
      location: string;
      userImpact: string;
      problemType: string;
      timestamp: string;
      screenshot?: string;
    }>;
    let screenshots: Array<{
      id: string;
      featureName: string;
      reason: string;
      screenshotBase64: string;
      status: string;
      timestamp: string;
    }>;
    let workflowData: {
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
    } | null;
    
    if (sessionId) {
      // Get data for specific session
      const sessionData = await dataService.getSessionById(parseInt(sessionId));
      if (!sessionData) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      // Convert session data to metrics format
      metrics = {
        totalTests: sessionData.summary.totalTests,
        passedTests: sessionData.summary.passed,
        failedTests: sessionData.summary.failed,
        warningTests: sessionData.summary.warnings,
        userBlockingIssues: sessionData.summary.userBlockingIssues,
        usabilityIssues: sessionData.summary.usabilityIssues,
        userExperienceScore: sessionData.userExperienceScore,
        successRate: sessionData.summary.totalTests > 0 
          ? (sessionData.summary.passed / sessionData.summary.totalTests) * 100 
          : 0,
        errorBreakdown: {},
        impactBreakdown: { low: 0, medium: 0, high: 0 },
        recentErrors: sessionData.errors.slice(0, 10).map(error => ({
          type: error.type,
          category: error.category,
          message: error.message,
          location: error.location,
          userImpact: error.userImpact,
          timestamp: error.timestamp
        }))
      };
      
      // Calculate error breakdown
      sessionData.errors.forEach(error => {
        metrics.errorBreakdown[error.category] = (metrics.errorBreakdown[error.category] || 0) + 1;
        metrics.impactBreakdown[error.userImpact]++;
      });
      
      testHistory = [{
        timestamp: sessionData.testTimestamp,
        status: sessionData.overallStatus,
        score: sessionData.userExperienceScore
      }];
      
      errorDetails = sessionData.errors.map((error, index) => ({
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
      
      screenshots = sessionData.errors
        .filter(error => error.screenshot)
        .map((error, index) => ({
          id: `screenshot-${index}`,
          featureName: error.location,
          reason: error.message,
          screenshotBase64: error.screenshot!,
          status: error.type,
          timestamp: error.timestamp
        }));
      
      workflowData = await dataService.getWorkflowDataForSession(parseInt(sessionId));
      
    } else {
      // Get latest data (default behavior)
      metrics = await dataService.getDashboardMetrics();
      testHistory = await dataService.getTestHistory();
      errorDetails = await dataService.getErrorDetails();
      screenshots = await dataService.getScreenshots();
      workflowData = await dataService.getWorkflowData();
    }
    
    return NextResponse.json({
      metrics,
      testHistory,
      errorDetails,
      screenshots,
      workflowData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching QA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QA data' },
      { status: 500 }
    );
  }
} 