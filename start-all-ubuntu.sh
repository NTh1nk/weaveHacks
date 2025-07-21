#!/bin/bash

# Start All Services for WeaveHacks on Ubuntu (GNOME Terminal required)

# Function to start a service in a new terminal window
start_service() {
    local service_name="$1"
    local directory="$2"
    local command="$3"
    gnome-terminal -- bash -c "echo '=== $service_name ==='; cd \"$(pwd)/$directory\"; $command; echo; echo 'Process exited. Press Enter to keep using this terminal...'; read"
}

echo "🚀 Starting WeaveHacks services in new GNOME Terminal windows..."

# Start Stagehand Test Server
start_service "Stagehand Test Server" "testBrowserbase/stagehandtest" "npm run dev"

# Start Dashboard
start_service "Dashboard" "dashboard" "npm run dev"

# Start First Agent
start_service "First Agent" "first-agent" "source venv/bin/activate && python3 server.py"

echo "✅ All services started! Check your terminal windows."
echo "📊 Dashboard: http://localhost:7777"
echo "🤖 First Agent API: http://localhost:8000" 