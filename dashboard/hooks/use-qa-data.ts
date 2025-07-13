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
  timestamp: string;
}

export function useQAData() {
  const [data, setData] = useState<QAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/qa-data');
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
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
} 