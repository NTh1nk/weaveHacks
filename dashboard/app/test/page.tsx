"use client"

import { useQAData } from "@/hooks/use-qa-data"

export default function TestPage() {
  const { data, loading, error, refetch } = useQAData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QA Data Test Page</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Data loaded successfully
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Metrics:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data.metrics, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Test History:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data.testHistory, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Error Details (first 3):</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data.errorDetails.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <button 
        onClick={refetch}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  )
} 