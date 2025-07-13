"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { JSX } from "react" // Import JSX to fix the undeclared variable error
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Settings, Zap } from "lucide-react"

interface WorkflowNode {
  id: string
  name: string
  status: "completed" | "running" | "pending" | "failed"
  duration: string
  x: number
  y: number
  connections: string[]
  description?: string
}

interface Connection {
  from: string
  to: string
}

// Example 1: Basic QA Workflow
const basicWorkflow: WorkflowNode[] = [
  {
    id: "start",
    name: "Start",
    status: "completed",
    duration: "0.1s",
    x: 50,
    y: 100,
    connections: ["pageload", "auth"],
    description: "Test session initiated"
  },
  {
    id: "pageload",
    name: "Page Load",
    status: "completed",
    duration: "1.2s",
    x: 200,
    y: 50,
    connections: ["datafetch"],
    description: "Initial page rendering"
  },
  { 
    id: "auth", 
    name: "Auth Check", 
    status: "completed", 
    duration: "0.8s", 
    x: 200, 
    y: 150, 
    connections: ["datafetch"],
    description: "User authentication verification"
  },
  {
    id: "datafetch",
    name: "Data Fetch",
    status: "running",
    duration: "2.1s",
    x: 350,
    y: 100,
    connections: ["render", "validate"],
    description: "API data retrieval"
  },
  { 
    id: "render", 
    name: "Render UI", 
    status: "pending", 
    duration: "-", 
    x: 500, 
    y: 50, 
    connections: ["end"],
    description: "Component rendering"
  },
  { 
    id: "validate", 
    name: "Validate", 
    status: "pending", 
    duration: "-", 
    x: 500, 
    y: 150, 
    connections: ["end"],
    description: "Data validation checks"
  },
  { 
    id: "end", 
    name: "End", 
    status: "pending", 
    duration: "-", 
    x: 650, 
    y: 100, 
    connections: [],
    description: "Test completion"
  },
]

// Example 2: E-commerce Testing Workflow
const ecommerceWorkflow: WorkflowNode[] = [
  {
    id: "landing",
    name: "Landing",
    status: "completed",
    duration: "0.8s",
    x: 50,
    y: 80,
    connections: ["search", "nav"],
    description: "Homepage load"
  },
  {
    id: "search",
    name: "Search",
    status: "completed",
    duration: "1.5s",
    x: 180,
    y: 40,
    connections: ["results"],
    description: "Product search"
  },
  {
    id: "nav",
    name: "Navigation",
    status: "completed",
    duration: "0.6s",
    x: 180,
    y: 120,
    connections: ["category"],
    description: "Menu navigation"
  },
  {
    id: "results",
    name: "Results",
    status: "running",
    duration: "2.3s",
    x: 310,
    y: 40,
    connections: ["product"],
    description: "Search results display"
  },
  {
    id: "category",
    name: "Category",
    status: "completed",
    duration: "1.1s",
    x: 310,
    y: 120,
    connections: ["product"],
    description: "Category page load"
  },
  {
    id: "product",
    name: "Product",
    status: "running",
    duration: "1.8s",
    x: 440,
    y: 80,
    connections: ["cart", "reviews"],
    description: "Product details"
  },
  {
    id: "cart",
    name: "Cart",
    status: "pending",
    duration: "-",
    x: 570,
    y: 40,
    connections: ["checkout"],
    description: "Shopping cart"
  },
  {
    id: "reviews",
    name: "Reviews",
    status: "pending",
    duration: "-",
    x: 570,
    y: 120,
    connections: ["checkout"],
    description: "Customer reviews"
  },
  {
    id: "checkout",
    name: "Checkout",
    status: "pending",
    duration: "-",
    x: 700,
    y: 80,
    connections: ["payment"],
    description: "Checkout process"
  },
  {
    id: "payment",
    name: "Payment",
    status: "pending",
    duration: "-",
    x: 830,
    y: 80,
    connections: ["confirmation"],
    description: "Payment processing"
  },
  {
    id: "confirmation",
    name: "Confirm",
    status: "pending",
    duration: "-",
    x: 960,
    y: 80,
    connections: [],
    description: "Order confirmation"
  },
]

// Example 3: Performance Testing Workflow
const performanceWorkflow: WorkflowNode[] = [
  {
    id: "init",
    name: "Init",
    status: "completed",
    duration: "0.2s",
    x: 50,
    y: 100,
    connections: ["load", "metrics"],
    description: "Performance test start"
  },
  {
    id: "load",
    name: "Load Test",
    status: "running",
    duration: "15.2s",
    x: 200,
    y: 50,
    connections: ["stress"],
    description: "Load testing execution"
  },
  {
    id: "metrics",
    name: "Metrics",
    status: "completed",
    duration: "2.1s",
    x: 200,
    y: 150,
    connections: ["stress"],
    description: "Performance metrics collection"
  },
  {
    id: "stress",
    name: "Stress Test",
    status: "running",
    duration: "8.7s",
    x: 350,
    y: 100,
    connections: ["analysis"],
    description: "Stress testing"
  },
  {
    id: "analysis",
    name: "Analysis",
    status: "pending",
    duration: "-",
    x: 500,
    y: 100,
    connections: ["report"],
    description: "Performance analysis"
  },
  {
    id: "report",
    name: "Report",
    status: "pending",
    duration: "-",
    x: 650,
    y: 100,
    connections: [],
    description: "Generate performance report"
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10b981"
    case "running":
      return "#f59e0b"
    case "failed":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "running":
      return "bg-yellow-500"
    case "failed":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

export function WorkflowCanvas() {
  const [currentWorkflow, setCurrentWorkflow] = useState<"basic" | "performance">("basic")
  const [nodes, setNodes] = useState<WorkflowNode[]>(basicWorkflow)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const workflows = {
    basic: basicWorkflow,
    performance: performanceWorkflow
  }

  const handleWorkflowChange = (workflow: "basic" | "performance") => {
    setCurrentWorkflow(workflow)
    setNodes(workflows[workflow])
    setSelectedNode(null)
    setIsRunning(false)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault()
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setDraggedNode(nodeId)
      setSelectedNode(nodeId)
    },
    [nodes],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = e.clientX - canvasRect.left - dragOffset.x
      const newY = e.clientY - canvasRect.top - dragOffset.y

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggedNode
            ? { ...node, x: Math.max(0, Math.min(newX, 1200)), y: Math.max(0, Math.min(newY, 600)) }
            : node,
        ),
      )
    },
    [draggedNode, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  const startWorkflow = () => {
    setIsRunning(true)
    // Simulate workflow progression
    const interval = setInterval(() => {
      setNodes(prev => {
        const runningNode = prev.find(n => n.status === "running")
        if (!runningNode) {
          clearInterval(interval)
          setIsRunning(false)
          return prev
        }
        
        return prev.map(node => {
          if (node.id === runningNode.id) {
            return { ...node, status: "completed" as const, duration: `${(parseFloat(node.duration) + 0.5).toFixed(1)}s` }
          }
          if (runningNode.connections.includes(node.id) && node.status === "pending") {
            return { ...node, status: "running" as const, duration: "0.1s" }
          }
          return node
        })
      })
    }, 2000)
  }

  const resetWorkflow = () => {
    setNodes(workflows[currentWorkflow])
    setIsRunning(false)
    setSelectedNode(null)
  }

  const renderConnections = () => {
    const connections: JSX.Element[] = []

    nodes.forEach((fromNode) => {
      fromNode.connections.forEach((toNodeId) => {
        const toNode = nodes.find((n) => n.id === toNodeId)
        if (!toNode) return

        const fromX = fromNode.x + 40 // Center of node (80px width / 2)
        const fromY = fromNode.y + 25 // Center of node (50px height / 2)
        const toX = toNode.x + 40
        const toY = toNode.y + 25

        // Calculate arrow direction
        const angle = Math.atan2(toY - fromY, toX - fromX)
        const arrowLength = 8
        const arrowAngle = Math.PI / 6

        connections.push(
          <g key={`${fromNode.id}-${toNodeId}`}>
            {/* Connection line */}
            <line
              x1={fromX}
              y1={fromY}
              x2={toX - 15} // Stop before the target node
              y2={toY}
              stroke={getStatusColor(fromNode.status)}
              strokeWidth="2"
              strokeDasharray={fromNode.status === "pending" ? "5,5" : "none"}
            />
            {/* Arrow head */}
            <polygon
              points={`${toX - 15},${toY} ${toX - 15 - arrowLength * Math.cos(angle - arrowAngle)},${toY - arrowLength * Math.sin(angle - arrowAngle)} ${toX - 15 - arrowLength * Math.cos(angle + arrowAngle)},${toY - arrowLength * Math.sin(angle + arrowAngle)}`}
              fill={getStatusColor(fromNode.status)}
            />
          </g>,
        )
      })
    })

    return connections
  }

  const selectedNodeData = nodes.find(n => n.id === selectedNode)

  return (
    <div className="relative">
      {/* Workflow Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={currentWorkflow === "basic" ? "default" : "outline"}
            size="sm"
            onClick={() => handleWorkflowChange("basic")}
          >
            Basic QA
          </Button>
          <Button
            variant={currentWorkflow === "performance" ? "default" : "outline"}
            size="sm"
            onClick={() => handleWorkflowChange("performance")}
          >
            Performance
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetWorkflow}
            disabled={isRunning}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={startWorkflow}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mr-1" />
            {isRunning ? "Running..." : "Start"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workflow Canvas */}
        <div className="lg:col-span-2">
          <div
            ref={canvasRef}
            className="relative w-full h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ minHeight: '400px' }}
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '1200px', minHeight: '600px' }}>{renderConnections()}</svg>

            {/* Workflow Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-move select-none transition-transform hover:scale-105 ${
                  draggedNode === node.id ? "z-10 scale-105" : "z-0"
                } ${selectedNode === node.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                <div
                  className={`w-20 h-12 ${getStatusBgColor(node.status)} text-white rounded-lg flex items-center justify-center font-semibold text-xs shadow-lg relative border-2 border-white`}
                >
                  <div className="text-center">
                    <div className="leading-tight">{node.name}</div>
                  </div>
                  {node.status === "running" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">{node.duration}</div>
              </div>
            ))}

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
              Drag nodes to reposition • Click to select • Scroll to navigate • Connections show workflow flow
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded relative">
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
              </div>
              <span>Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Node Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 h-80">
            <h3 className="font-semibold text-lg mb-4">Node Details</h3>
            {selectedNodeData ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded ${getStatusBgColor(selectedNodeData.status)}`}></div>
                    <span className="text-sm capitalize">{selectedNodeData.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm text-gray-900">{selectedNodeData.duration}</p>
                </div>
                {selectedNodeData.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-600">{selectedNodeData.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Connections</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNodeData.connections.map(connId => {
                      const connNode = nodes.find(n => n.id === connId)
                      return (
                        <span key={connId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {connNode?.name || connId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a node to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
