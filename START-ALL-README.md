# Start All Command - CodeTurtle Services

This document explains how to use the `start-all` command to launch the Stagehand test server, Dashboard, and First Agent simultaneously.

## 🚀 Quick Start

### Option 1: Using npm script (Recommended)
```bash
npm run start-all
```

### Option 2: Using batch file directly
```bash
start-all.bat
```

### Option 3: Using PowerShell script
```powershell
.\start-all.ps1
```

## 📋 What the Start All Command Does

The `start-all` command will:

1. **Start Stagehand Test Server** in a new terminal window
   - Location: `testBrowserbase/stagehandtest/`
   - Command: `npm run dev`
   - Purpose: Runs the BrowserBase Stagehand testing environment

2. **Start Dashboard** in a separate terminal window
   - Location: `dashboard/`
   - Command: `npm run dev`
   - Purpose: Runs the Next.js dashboard application
   - URL: http://localhost:7777

3. **Start First Agent (QA Context Generator)** in a separate terminal window
   - Location: `first-agent/`
   - Command: `python server.py`
   - Purpose: Runs the CrewAI-powered QA context generation API
   - URL: http://localhost:8000

## 🔧 Prerequisites

Before running `start-all`, make sure you have:

1. **Node.js and npm** installed
2. **Python 3.8+** installed (for First Agent)
3. **Dependencies installed** for all projects:
   ```bash
   npm run install-all
   ```
   
   Or install individually:
   ```bash
   npm run install-stagehandtest
   npm run install-dashboard
   npm run install-first-agent
   ```

4. **First Agent Configuration** (required for the First Agent to start):
   ```bash
   npm run setup-first-agent
   ```
   
   This will create a `.env` file that you need to configure with your API keys:
   - **W&B API Key**: Get from https://wandb.ai/settings
   - **GitHub Token**: Create at https://github.com/settings/tokens
   - **W&B Team/Project**: Your W&B team name and project name

## 📁 File Structure

```
weaveHacks/
├── start-all.bat          # Windows batch file for starting all services
├── start-all.ps1          # PowerShell script for starting all services
├── package.json           # Root package.json with start-all script
├── testBrowserbase/
│   └── stagehandtest/     # Stagehand test server
├── dashboard/             # Next.js dashboard application
└── first-agent/           # CrewAI QA Context Generator
```

## 🐢 Services Overview

### Stagehand Test Server
- **Purpose**: BrowserBase Stagehand testing environment
- **Technology**: TypeScript, Express, BrowserBase SDK
- **Port**: Configured in stagehand.config.ts
- **Features**: Automated browser testing, screenshot capture, API testing

### Dashboard
- **Purpose**: Web interface for viewing test results and managing workflows
- **Technology**: Next.js, React, TypeScript, Tailwind CSS
- **Port**: 7777 (http://localhost:7777)
- **Features**: QA data visualization, session management, workflow canvas

### First Agent (QA Context Generator)
- **Purpose**: CrewAI-powered API for generating QA testing context from GitHub PRs
- **Technology**: Python, FastAPI, CrewAI, W&B Weave
- **Port**: 8000 (http://localhost:8000)
- **Features**: GitHub PR analysis, automated QA context generation, markdown report creation

## 🛠️ Troubleshooting

### If services don't start:
1. Check that all dependencies are installed:
   ```bash
   npm run install-all
   ```

2. Verify Node.js and Python version compatibility:
   ```bash
   node --version
   npm --version
   python --version
   ```

3. Check if ports are already in use:
   - Dashboard port 7777
   - Stagehand port (check stagehand.config.ts)
   - First Agent port 8000

### If First Agent fails to start:
The First Agent requires environment variables to be configured. Run:
```bash
npm run setup-first-agent
```

Then edit `first-agent/.env` with your actual API keys:
- **W&B API Key**: Get from https://wandb.ai/settings
- **GitHub Token**: Create at https://github.com/settings/tokens (needs repo access)
- **W&B Team**: Your W&B username or team name
- **W&B Project**: Your project name (e.g., "qa-context-generator")

### If terminals don't open:
- Make sure PowerShell execution policy allows running scripts
- Try running the batch file directly: `start-all.bat`

### Manual start commands:
If the automated start doesn't work, you can start services manually:

**Terminal 1 (Stagehand):**
```bash
cd testBrowserbase/stagehandtest
npm run dev
```

**Terminal 2 (Dashboard):**
```bash
cd dashboard
npm run dev
```

**Terminal 3 (First Agent):**
```bash
cd first-agent
python server.py
```

## 🎯 Next Steps

After running `start-all`:

1. **Access the Dashboard**: Open http://localhost:7777 in your browser
2. **Access the First Agent API**: Open http://localhost:8000 for API documentation
3. **Configure Stagehand**: Check `testBrowserbase/stagehandtest/stagehand.config.ts` for settings
4. **Run Tests**: Use the dashboard interface to create and run test workflows
5. **Generate QA Context**: Use the First Agent API to generate QA context from GitHub PRs
6. **View Results**: Check the QA dashboard for test results and analytics

## 📝 Notes

- All three services run in development mode with hot reloading
- The dashboard will automatically reload when you make changes
- Stagehand test server will restart when configuration changes
- First Agent API will restart when Python files change
- Use `Ctrl+C` in each terminal to stop the respective service 