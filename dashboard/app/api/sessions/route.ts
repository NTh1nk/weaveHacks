import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function GET() {
  try {
    const sessions = await dataService.getAllSessions();
    
    return NextResponse.json({
      success: true,
      sessions,
      totalSessions: sessions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch sessions',
        sessions: [],
        totalSessions: 0
      },
      { status: 500 }
    );
  }
} 