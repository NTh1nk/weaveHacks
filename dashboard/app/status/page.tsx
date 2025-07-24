"use client"

import { useQAData } from "@/hooks/use-qa-data"

export default function StatusPage() {
  const { data, loading, error, refetch } = useQAData();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard Status Check</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="font-medium">
                {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
              </span>
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
          {data ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Tests:</span>
                <span className="font-semibold">{data.metrics.totalTests}</span>
              </div>
              <div className="flex justify-between">
                <span>Passed:</span>
                <span className="font-semibold text-green-600">{data.metrics.passedTests}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="font-semibold text-red-600">{data.metrics.failedTests}</span>
              </div>
              <div className="flex justify-between">
                <span>Warnings:</span>
                <span className="font-semibold text-yellow-500">{data.metrics.warningTests}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-semibold">{data.metrics.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-semibold">{new Date(data.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Error Categories */}
      {data && data.metrics.errorBreakdown && (
        <div className="bg-white p-6 rounded-lg shadow border mt-6">
          <h2 className="text-xl font-semibold mb-4">Error Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.metrics.errorBreakdown).map(([category, count]) => (
              <div key={category} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {data && data.errorDetails.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Errors (First 3)</h2>
          <div className="space-y-3">
            {data.errorDetails.slice(0, 3).map((error, index) => (
              <div key={error.id} className="p-3 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{error.category}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    error.userImpact === 'high' ? 'bg-red-100 text-red-800' :
                    error.userImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {error.userImpact} impact
                  </span>
                </div>
                <p className="text-sm text-gray-600">{error.message.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button 
          onClick={refetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
} 