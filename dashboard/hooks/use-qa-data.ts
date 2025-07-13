import { useState, useEffect } from 'react';
import { DashboardMetrics } from '@/lib/data-service';

interface QAData {
  metrics: DashboardMetrics;
  testHistory: Array<{ timestamp: string; status: string; score: number }>;
  errorDetails: Array<{
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
  screenshots: Array<{
    id: string;
    featureName: string;
    reason: string;
    screenshotBase64: string;
    status: string;
    timestamp: string;
  }>;
  workflowData?: {
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
  timestamp: string;
}

interface Session {
  id: number;
  url: string;
  timestamp: string;
  promptContent: string;
  totalFeatures: number;
  failedFeatures: number;
  screenshots: number;
}

export function useQAData(selectedSessionId?: number) {
  const [data, setData] = useState<QAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedSessionId 
        ? `/api/qa-data?sessionId=${selectedSessionId}`
        : '/api/qa-data';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch QA data');
      }
      
      const qaData = await response.json();
      setData(qaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching QA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Removed automatic refresh - data will only refresh on manual refetch
  }, [selectedSessionId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const sessionsData = await response.json();
      if (sessionsData.success) {
        setSessions(sessionsData.sessions);
      } else {
        throw new Error(sessionsData.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Removed automatic refresh - sessions will only refresh on manual refetch
  }, []);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions
  };
} 