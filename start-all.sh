#!/bin/bash

# Start All Services for WeaveHacks on Mac
echo "🚀 Starting WeaveHacks services..."

# Function to start a service in a new terminal window
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    
    echo "Starting $service_name..."
    osascript -e "tell application \"Terminal\" to do script \"cd $(pwd)/$directory && $command\""
}

# Start Stagehand Test Server
start_service "Stagehand Test Server" "testBrowserbase/stagehandtest" "npm run dev"

# Start Dashboard
start_service "Dashboard" "dashboard" "npm run dev"

# Start First Agent
start_service "First Agent" "first-agent" "python3 server.py"

echo "✅ All services started! Check your terminal windows."
echo "📊 Dashboard: http://localhost:7777"
echo "🤖 First Agent API: http://localhost:8000" 