"use client"

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
import { Clock, Globe, CheckCircle, XCircle, ExternalLink, Play, Settings, Filter, DollarSign, Hash, ChevronDown, Video, Download, Trash2 } from "lucide-react"
import { WorkflowCanvas } from "@/components/workflow-canvas"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const costData = [
  { time: "00:00", cost: 0.12, tokens: 450, requests: 45 },
  { time: "00:05", cost: 0.18, tokens: 520, requests: 52 },
  { time: "00:10", cost: 0.09, tokens: 380, requests: 38 },
  { time: "00:15", cost: 0.22, tokens: 610, requests: 61 },
  { time: "00:20", cost: 0.14, tokens: 470, requests: 47 },
  { time: "00:25", cost: 0.16, tokens: 550, requests: 55 },
]

const networkRequests = [
  { url: "/api/users", method: "GET", status: 200, duration: "120ms", size: "2.1KB" },
  { url: "/api/products", method: "POST", status: 201, duration: "340ms", size: "1.8KB" },
  { url: "/api/analytics", method: "GET", status: 500, duration: "2.1s", size: "0KB" },
  { url: "/api/auth", method: "POST", status: 200, duration: "89ms", size: "512B" },
  { url: "/api/images", method: "GET", status: 404, duration: "45ms", size: "0KB" },
]

const statusData = [
  { name: "Success", value: 85, color: "#10b981" },
  { name: "Failed", value: 12, color: "#ef4444" },
  { name: "Pending", value: 3, color: "#f59e0b" },
]

const workflowSteps = [
  { id: 1, name: "Page Load", status: "completed", duration: "1.2s" },
  { id: 2, name: "Authentication", status: "completed", duration: "0.8s" },
  { id: 3, name: "Data Fetch", status: "running", duration: "2.1s" },
  { id: 4, name: "Render UI", status: "pending", duration: "-" },
  { id: 5, name: "User Interaction", status: "pending", duration: "-" },
]



export function QADashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CodeTurtle</h1>
          <p className="text-gray-600">QA Testing Dashboard - Performance monitoring and session analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Duration
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
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
                <p className="text-green-100 text-sm">Total Cost</p>
                <p className="text-2xl font-bold">$0.91</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-200" />
            </div>
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costData.slice(-4)}>
                  <Area type="monotone" dataKey="cost" stroke="#ffffff" fill="#ffffff" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tokens</p>
                <p className="text-xl font-bold">2,980</p>
              </div>
              <Hash className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData.slice(-6)}>
                  <Bar dataKey="tokens" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cost per Token</p>
                <p className="text-xl font-bold">$0.0003</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData.slice(-6)}>
                  <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Tokens/Request</p>
                <p className="text-xl font-bold">54.2</p>
              </div>
              <Hash className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData.slice(-6)}>
                  <Bar dataKey="tokens" fill="#3b82f6" />
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
            <WorkflowCanvas />
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
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Performance Chart and Network Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost and Token Metrics Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Cost & Token Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#10b981" name="Cost ($)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#3b82f6" name="Tokens" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Network Console Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {networkRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {request.method}
                      </Badge>
                      <span className="text-sm font-medium truncate">{request.url}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span>Duration: {request.duration}</span>
                      <span>Size: {request.size}</span>
                    </div>
                  </div>
                  <Badge variant={request.status === 200 || request.status === 201 ? "default" : "destructive"}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
