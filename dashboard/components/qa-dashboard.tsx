"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Clock, Globe, CheckCircle, XCircle, ExternalLink, Play, Settings, Filter, DollarSign, Hash, ChevronDown, Video, Download, Trash2, AlertTriangle, AlertCircle, Code, Maximize2, RefreshCw } from "lucide-react"
import { WorkflowCanvas } from "@/components/workflow-canvas"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQAData } from "@/hooks/use-qa-data"
import { Skeleton } from "@/components/ui/skeleton"
import { RawJsonModal } from "@/components/ui/modal"



export function QADashboard() {
  const { data, loading, error, refetch } = useQAData();
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<{
    featureName: string;
    screenshotBase64: string;
    reason: string;
    timestamp: string;
  } | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:4000/health');
        setApiStatus(response.ok ? 'connected' : 'disconnected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };
    
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const testHistory = data?.testHistory || [];
  const errorDetails = data?.errorDetails || [];
  const screenshots = data?.screenshots || [];

  // Prepare chart data from real metrics
  const statusData = [
    { name: "Passed", value: metrics?.passedTests || 0, color: "#10b981" },
    { name: "Failed", value: metrics?.failedTests || 0, color: "#ef4444" },
    { name: "Warnings", value: metrics?.warningTests || 0, color: "#f59e0b" },
  ];

  const impactData = [
    { name: "High Impact", value: metrics?.impactBreakdown.high || 0, color: "#ef4444" },
    { name: "Medium Impact", value: metrics?.impactBreakdown.medium || 0, color: "#f59e0b" },
    { name: "Low Impact", value: metrics?.impactBreakdown.low || 0, color: "#10b981" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QA Testing Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze automated test results</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              Test API: {apiStatus === 'connected' ? 'Connected' : 
                        apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
            </span>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => setShowRawJson(true)} variant="outline" size="sm">
            <Code className="w-4 h-4 mr-1" />
            Raw Data
          </Button>
        </div>
      </div>

      {/* Session Recording Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Session Recordings
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <DropdownMenuLabel>Recent Sessions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">bb_session_123</p>
                    <p className="text-sm text-gray-500">4m 32s • US-East-1</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">bb_session_122</p>
                    <p className="text-sm text-gray-500">2m 15s • US-West-2</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-gray-100 text-gray-800">
                  Completed
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Video className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">bb_session_121</p>
                    <p className="text-sm text-gray-500">6m 48s • EU-West-1</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-gray-100 text-gray-800">
                  Completed
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download All Sessions
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Recording Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Sessions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Current Session:</span> bb_session_123 • 4m 32s
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-1" />
            Start New
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Success Rate</p>
                <p className="text-2xl font-bold">{metrics?.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-200" />
            </div>
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statusData}>
                  <Area type="monotone" dataKey="value" stroke="#ffffff" fill="#ffffff" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tests</p>
                <p className="text-xl font-bold">{metrics?.totalTests || 0}</p>
              </div>
              <Hash className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">User Experience Score</p>
                <p className="text-xl font-bold">{metrics?.userExperienceScore || 0}/10</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={impactData}>
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Blocking Issues</p>
                <p className="text-xl font-bold">{metrics?.userBlockingIssues || 0}</p>
              </div>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData}>
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Interactive Workflow Graph with Video */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Session Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              <video className="w-full h-full object-cover" controls poster="/placeholder.svg?height=200&width=300">
                <source src="#" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                Live Session
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">4:32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality:</span>
                <span className="font-semibold">1080p</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="default" className="bg-red-100 text-red-800">
                  Recording
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Workflow Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Test Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus === 'disconnected' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Test API Disconnected</h3>
                    <p className="text-gray-500 text-sm mb-4">Cannot load test workflow data.</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Start the test server: <code className="bg-gray-100 px-1 rounded">cd testBrowserbase/stagehandtest && npm run dev</code></p>
                      <p>• Ensure the server is running on port 4000</p>
                      <p>• Run a QA test to generate workflow data</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Showing example workflows instead:</p>
                  <WorkflowCanvas workflows={{}} />
                </div>
              </div>
            ) : data?.workflowData ? (
              <WorkflowCanvas 
                workflows={{ 
                  'test-workflow': data.workflowData.nodes 
                }} 
                defaultWorkflow="test-workflow"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Test Workflow Available</h3>
                    <p className="text-gray-500 text-sm mb-4">No test workflows are currently available to display.</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Start a QA test to generate workflow data</p>
                      <p>• Test API is connected but no results found</p>
                      <p>• Check that test results contain graph data</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Showing example workflows instead:</p>
                  <WorkflowCanvas workflows={{}} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution - Keep unchanged */}
        <Card>
          <CardHeader>
            <CardTitle>Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Screenshots and Test History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screenshots Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Test Screenshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {screenshots.length > 0 ? (
                screenshots.map((screenshot) => (
                  <div key={screenshot.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{screenshot.featureName}</h4>
                      <Badge 
                        variant={screenshot.status === 'PASSED' ? 'default' : screenshot.status === 'FAILED' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {screenshot.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{screenshot.reason}</p>
                    {screenshot.screenshotBase64 ? (
                      <div className="relative group cursor-pointer" onClick={() => setSelectedScreenshot({
                        featureName: screenshot.featureName,
                        screenshotBase64: screenshot.screenshotBase64,
                        reason: screenshot.reason,
                        timestamp: screenshot.timestamp
                      })}>
                        <img 
                          src={screenshot.screenshotBase64.startsWith('data:') ? screenshot.screenshotBase64 : `data:image/png;base64,${screenshot.screenshotBase64}`}
                          alt={`Screenshot for ${screenshot.featureName}`}
                          className="w-full h-auto rounded border transition-transform group-hover:scale-105"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          onError={(e) => {
                            console.error('Failed to load screenshot:', screenshot.featureName);
                            console.error('Base64 data length:', screenshot.screenshotBase64?.length);
                            console.error('Base64 data preview:', screenshot.screenshotBase64?.substring(0, 100));
                          }}
                          onLoad={() => {
                            console.log('Successfully loaded screenshot for:', screenshot.featureName);
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {new Date(screenshot.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded border p-4 text-center text-gray-500">
                        <p className="text-sm">No screenshot data available</p>
                        <p className="text-xs mt-1">Base64 data missing for this feature</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>No screenshots available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {errorDetails.slice(0, 5).map((error) => (
                <div key={error.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={error.type === 'error' ? "destructive" : "outline"} className="text-xs">
                        {error.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium truncate">{error.category}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{error.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span>Location: {error.location}</span>
                      <span>Impact: {error.userImpact}</span>
                    </div>
                  </div>
                  <Badge variant={error.userImpact === 'high' ? "destructive" : error.userImpact === 'medium' ? "default" : "outline"}>
                    {error.userImpact}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screenshot Modal */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedScreenshot?.featureName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Reason:</strong> {selectedScreenshot?.reason}</p>
              <p><strong>Timestamp:</strong> {selectedScreenshot?.timestamp ? new Date(selectedScreenshot.timestamp).toLocaleString() : 'Unknown'}</p>
            </div>
            {selectedScreenshot?.screenshotBase64 && (
              <div className="flex justify-center">
                <img 
                  src={selectedScreenshot.screenshotBase64.startsWith('data:') ? selectedScreenshot.screenshotBase64 : `data:image/png;base64,${selectedScreenshot.screenshotBase64}`}
                  alt={`Screenshot for ${selectedScreenshot.featureName}`}
                  className="max-w-full max-h-[70vh] object-contain rounded border"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Raw JSON Modal */}
      <RawJsonModal
        isOpen={showRawJson}
        onClose={() => setShowRawJson(false)}
        data={data}
        title="QA Test Raw Data"
      />
    </div>
  )
}
