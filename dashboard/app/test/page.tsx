"use client"

import { useState, useEffect } from "react"

interface QASummary {
  id: number
  url: string
  timestamp: string
  totalFeatures: number
  failedFeatures: number
  screenshots: number
  warningFeatures?: number
}

interface QAResult {
  success: boolean
  fileNumber: number
  fileName: string
  data: any
}

export default function TestPage() {
  const [summaryData, setSummaryData] = useState<QASummary[]>([])
  const [selectedResult, setSelectedResult] = useState<QAResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { fetchWithFallback } = require('../../lib/api-config');

  // Debug state changes
  useEffect(() => {
    console.log('Summary data changed:', summaryData)
  }, [summaryData])

  useEffect(() => {
    console.log('Error changed:', error)
  }, [error])

  useEffect(() => {
    console.log('Loading changed:', loading)
  }, [loading])

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching summary from:', 'http://localhost:4000/qa-summary')
      const response = await fetchWithFallback('/qa-summary')
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      
      if (data.success) {
        if (data.summary && Array.isArray(data.summary)) {
          setSummaryData(data.summary)
          console.log('Set summary data:', data.summary)
        } else {
          console.error('Invalid data structure:', data)
          setError('Invalid data structure received from server')
        }
      } else {
        setError('Failed to fetch summary data: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Error fetching summary data: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchFullResult = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchWithFallback(`/qa-result/${id}`)
      const data = await response.json()
      if (data.success) {
        setSelectedResult(data)
      } else {
        setError('Failed to fetch result data')
      }
    } catch (err) {
      setError('Error fetching result data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (failedFeatures: number, totalFeatures: number) => {
    if (failedFeatures === 0) return 'bg-green-100 border-green-500 text-green-800'
    if (failedFeatures === totalFeatures) return 'bg-red-100 border-red-500 text-red-800'
    return 'bg-yellow-100 border-yellow-500 text-yellow-800'
  }

  const getStatusText = (failedFeatures: number, totalFeatures: number) => {
    if (failedFeatures === 0) return 'All Passed'
    if (failedFeatures === totalFeatures) return 'All Failed'
    return 'Partial Success'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">QA Test Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze your website testing results</p>
        </div>
        
        <div className="text-center mb-6">
          <button 
            onClick={fetchSummary}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load QA Summary'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {summaryData.length > 0 && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{summaryData.length}</div>
                <div className="text-gray-600">Total Tests</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summaryData.reduce((sum, item) => sum + (item.totalFeatures - item.failedFeatures), 0)}
                </div>
                <div className="text-gray-600">Features Passed</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {summaryData.reduce((sum, item) => sum + item.failedFeatures, 0)}
                </div>
                <div className="text-gray-600">Features Failed</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {summaryData.reduce((sum, item) => sum + item.screenshots, 0)}
                </div>
                <div className="text-gray-600">Screenshots</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {summaryData.reduce((sum, item) => sum + (item.warningFeatures || 0), 0)}
                </div>
                <div className="text-gray-600">Features Warning</div>
              </div>
            </div>

            {/* Test Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {summaryData.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => fetchFullResult(item.id)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {item.id}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Test #{item.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.failedFeatures, item.totalFeatures)}`}>
                        {getStatusText(item.failedFeatures, item.totalFeatures)}
                      </div>
                    </div>

                    {/* URL */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Website</p>
                      <p className="text-blue-600 font-medium truncate">{item.url}</p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{item.totalFeatures}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{item.totalFeatures - item.failedFeatures - (item.warningFeatures || 0)}</div>
                        <div className="text-xs text-gray-500">Passed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">{item.warningFeatures || 0}</div>
                        <div className="text-xs text-gray-500">Warning</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{item.failedFeatures}</div>
                        <div className="text-xs text-gray-500">Failed</div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    {item.screenshots > 0 && (
                      <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg p-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{item.screenshots} Screenshot{item.screenshots !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Time */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedResult && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Full Result for Test #{selectedResult.fileNumber}</h2>
              <button 
                onClick={() => setSelectedResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(selectedResult.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 