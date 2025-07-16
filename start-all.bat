@echo off
echo 🐢 Starting CodeTurtle Services...

REM Get the current directory (project root)
set PROJECT_ROOT=%CD%

REM Start Stagehand Test Server in a new terminal
echo Starting Stagehand Test Server...
start "Stagehand Test Server" powershell -NoExit -Command "cd '%PROJECT_ROOT%\testBrowserbase\stagehandtest'; Write-Host 'Starting Stagehand Test Server...' -ForegroundColor Green; npm run dev"

REM Wait a moment for the first service to start
timeout /t 2 /nobreak >nul

REM Start Dashboard in a new terminal
echo Starting Dashboard...
start "Dashboard" powershell -NoExit -Command "cd '%PROJECT_ROOT%\dashboard'; Write-Host 'Starting Dashboard...' -ForegroundColor Green; npm run dev"

REM Wait a moment for the second service to start
timeout /t 2 /nobreak >nul

REM Start First Agent (QA Context Generator) in a new terminal
echo Starting First Agent (QA Context Generator)...
start "First Agent" powershell -NoExit -Command "cd '%PROJECT_ROOT%\first-agent'; Write-Host 'Starting First Agent (QA Context Generator)...' -ForegroundColor Green; Write-Host 'Note: If this fails, you may need to configure environment variables.' -ForegroundColor Yellow; Write-Host 'See first-agent/env.example for required configuration.' -ForegroundColor Yellow; python server.py"

echo ✅ All three services are starting in separate terminals!
echo 📊 Dashboard will be available at: http://localhost:7777
echo 🔧 Stagehand test server should be running on its configured port
echo 🤖 First Agent (QA Context Generator) will be available at: http://localhost:8000
echo.
pause 