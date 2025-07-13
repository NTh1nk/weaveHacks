import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function GET() {
  try {
    const metrics = await dataService.getDashboardMetrics();
    const testHistory = await dataService.getTestHistory();
    const errorDetails = await dataService.getErrorDetails();
    
    return NextResponse.json({
      metrics,
      testHistory,
      errorDetails,
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