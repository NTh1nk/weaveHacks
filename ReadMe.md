# WeaveHacks

A workspace containing multiple projects including CodeTurtle, Dashboard, and BrowserBase testing tools.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Installation & Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Build all projects:**
   ```bash
   npm run build-all
   ```

3. **Start all projects:**
   ```bash
   npm run start (stageHand)
   npm run build (dashboard)
   order is important, 2 consoles running simul
   ```

### Individual Project Commands

#### Dashboard (Next.js)
- Build: `npm run build-dashboard`
- Start: `npm run start-dashboard`
- Dev: `npm run dev-dashboard`

#### CodeTurtle (React)
- Build: `npm run build-code-turtle`
- Start: `npm run start-code-turtle`
- Dev: `npm run dev-code-turtle`

#### StagehandTest (TypeScript)
- Build: `npm run build-stagehandtest`
- Start: `npm run start-stagehandtest`
- Dev: `npm run dev-stagehandtest`

### Project Structure
- `dashboard/` - Next.js dashboard application
- `code-turtle/` - React application
- `testBrowserbase/stagehandtest/` - TypeScript testing project
- `first-agent/browser_base_testing/` - Browser testing utilities

### Available Scripts
- `npm run build-all` - Build all projects
- `npm run start-all` - Start all projects
- `npm run install-all` - Install dependencies for all projects