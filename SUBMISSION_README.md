# 🧪 QA Context Generator - WeaveHacks Submission

**Team**: NTh1nk  
**Hackathon**: WeaveHacks: Agent Protocols Hackathon (MCP, A2A)  
**Date**: July 12-13, 2025

## 🎯 Project Overview

A comprehensive QA testing automation system that combines intelligent PR analysis with automated browser testing. The system uses CrewAI agents to analyze GitHub Pull Requests and generate targeted QA testing scenarios, then executes these tests using BrowserBase Stagehand for comprehensive web application testing.

## 🏗️ Architecture

### Multi-Agent System (A2A Protocol)
Our system uses **CrewAI** (A2A protocol) with multiple specialized agents:

1. **GitHub Data Collector Agent** - Extracts PR information and repository context
2. **Documentation Analyzer Agent** - Processes README and documentation files  
3. **Deployment Monitor Agent** - Tracks deployment status and links
4. **QA Context Generator Agent** - Creates testing scenarios and priorities
5. **Output Formatter Agent** - Generates beautiful, readable reports

### Testing Infrastructure
- **BrowserBase Stagehand** - Automated browser testing with screenshot capture
- **Next.js Dashboard** - Real-time visualization of test results
- **REST API** - Data exchange between components

## 🚀 Key Features

### Intelligent PR Analysis
- Automatically extracts relevant information from GitHub PRs
- Analyzes repository context and documentation
- Monitors deployment status from multiple platforms (Fly.io, Vercel, Netlify)
- Generates focused testing scenarios based on code changes

### Automated Testing
- BrowserBase-powered automated testing
- Comprehensive test coverage including UI, functionality, and edge cases
- Screenshot capture for visual regression testing
- Error tracking and detailed reporting

### Real-time Dashboard
- Live metrics and test result visualization
- Historical data tracking and trends
- Error breakdown and analysis
- Responsive design for desktop and mobile

### W&B Weave Integration
- Full observability with logging and performance tracking
- Execution monitoring for all agent operations
- API call tracking and response monitoring
- Debugging and optimization capabilities

## 🛠️ Technology Stack

- **Agent Framework**: CrewAI (A2A Protocol)
- **Observability**: W&B Weave
- **Testing**: BrowserBase Stagehand
- **Frontend**: Next.js, React
- **Backend**: Node.js, Express
- **Language**: Python, TypeScript, JavaScript

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- W&B account with API access
- GitHub Personal Access Token
- BrowserBase account

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd weaveHacks
npm run install-all
```

### 2. Set Up Environment Variables
```bash
# Copy environment template
cp first-agent/.env.example first-agent/.env

# Edit with your credentials
# W&B Configuration
WANDB_API_KEY=your-wandb-api-key
WANDB_TEAM=your-team-name
WANDB_PROJECT=qa-context-generator

# GitHub Configuration
GITHUB_TOKEN=your-github-token

# OpenAI Configuration (using W&B Inference)
OPENAI_API_KEY=your-wandb-api-key
OPENAI_BASE_URL=https://api.inference.wandb.ai/v1
```

### 3. Start the System
```bash
# Terminal 1: Start the testing system
npm run start-stagehandtest

# Terminal 2: Start the dashboard
npm run start-dashboard
```

### 4. Generate QA Context
```bash
cd first-agent
python cli.py generate https://github.com/owner/repo/pull/123
```

## 📊 Demo Instructions

### 1. Show W&B Weave Integration
- Open your W&B project: `https://wandb.ai/your-team/qa-context-generator`
- Show the traces and execution monitoring
- Demonstrate the `@weave.op()` decorators in the code

### 2. Demonstrate PR Analysis
- Run the CLI tool with a real GitHub PR
- Show the generated QA report with testing scenarios
- Highlight the intelligent analysis of code changes

### 3. Show Automated Testing
- Demonstrate BrowserBase testing in action
- Show the dashboard with real-time results
- Display captured screenshots and error reports

### 4. Show Dashboard
- Navigate through different metrics and charts
- Show historical data and trends
- Demonstrate responsive design

## 🔍 Code Structure

```
weaveHacks/
├── first-agent/                 # CrewAI QA Context Generator
│   ├── src/
│   │   ├── agents.py           # CrewAI agents with @weave.op()
│   │   ├── config.py           # W&B Weave initialization
│   │   └── main.py             # Main orchestrator
│   ├── cli.py                  # Command line interface
│   └── requirements.txt        # Python dependencies
├── dashboard/                   # Next.js Dashboard
│   ├── components/             # React components
│   ├── lib/                    # Data service and utilities
│   └── pages/                  # Next.js pages
├── testBrowserbase/            # BrowserBase Testing
│   └── stagehandtest/          # Stagehand test system
└── package.json                # Workspace configuration
```

## 🎯 Hackathon Requirements Met

✅ **W&B Weave Integration**: Full observability with `@weave.op()` decorators  
✅ **Agent Protocol**: Uses CrewAI (A2A protocol)  
✅ **Sponsor Tools**: BrowserBase, CrewAI integration  
✅ **Open GitHub Repo**: All code publicly available  
✅ **Built at Hackathon**: Complete project built during event  
✅ **In-person Participation**: Team present at hackathon  

## 🏆 Innovation Highlights

1. **Intelligent PR Analysis**: Automatically generates targeted QA scenarios based on code changes
2. **Multi-Platform Deployment Monitoring**: Tracks deployments across Fly.io, Vercel, Netlify
3. **Comprehensive Testing Coverage**: UI, functionality, edge cases, and visual regression
4. **Real-time Observability**: Full W&B Weave integration for monitoring and debugging
5. **Beautiful Visualization**: Modern dashboard with responsive design

## 🔗 Links

- **W&B Project**: `https://wandb.ai/your-team/qa-context-generator`
- **Live Dashboard**: `http://localhost:3000`
- **Test System API**: `http://localhost:4000`
- **GitHub Repository**: `<your-repo-url>`

## 👥 Team

- **Team Name**: NTh1nk
- **Members**: [Your team members]
- **Hackathon**: WeaveHacks 2025

---

*Built with ❤️ using CrewAI, W&B Weave, and BrowserBase for the WeaveHacks hackathon* 