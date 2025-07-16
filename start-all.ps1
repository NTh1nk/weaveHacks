# Start All Services Script for CodeTurtle
# This script starts the stagehand test server, dashboard, and first agent

Write-Host "🐢 Starting CodeTurtle Services..." -ForegroundColor Green

# Function to start a service in a new terminal
function Start-ServiceInNewTerminal {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor Yellow
    
    # Start a new PowerShell window with the specified command
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host 'Starting $ServiceName...' -ForegroundColor Green; $Command" -WindowStyle Normal
}

# Get the current directory (project root)
$ProjectRoot = Get-Location

# Start Stagehand Test Server
$StagehandDir = Join-Path $ProjectRoot "testBrowserbase\stagehandtest"
Start-ServiceInNewTerminal -ServiceName "Stagehand Test Server" -WorkingDirectory $StagehandDir -Command "npm run dev"

# Wait a moment for the first service to start
Start-Sleep -Seconds 2

# Start Dashboard
$DashboardDir = Join-Path $ProjectRoot "dashboard"
Start-ServiceInNewTerminal -ServiceName "Dashboard" -WorkingDirectory $DashboardDir -Command "npm run dev"

# Wait a moment for the second service to start
Start-Sleep -Seconds 2

# Start First Agent (QA Context Generator)
$FirstAgentDir = Join-Path $ProjectRoot "first-agent"
Start-ServiceInNewTerminal -ServiceName "First Agent (QA Context Generator)" -WorkingDirectory $FirstAgentDir -Command "Write-Host 'Note: If this fails, you may need to configure environment variables.' -ForegroundColor Yellow; Write-Host 'See first-agent/env.example for required configuration.' -ForegroundColor Yellow; python server.py"

Write-Host "✅ All three services are starting in separate terminals!" -ForegroundColor Green
Write-Host "📊 Dashboard will be available at: http://localhost:7777" -ForegroundColor Cyan
Write-Host "🔧 Stagehand test server should be running on its configured port" -ForegroundColor Cyan
Write-Host "🤖 First Agent (QA Context Generator) will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 