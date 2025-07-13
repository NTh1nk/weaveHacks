# CodeTurtle Dashboard

A modern dashboard for visualizing QA test results from the Browserbase Stagehand testing system.

## Features

- **Real-time Data Loading**: Connects to the test system API to load the latest test results
- **Interactive Metrics**: Displays test success rates, error breakdowns, and user experience scores
- **Test History**: Shows historical test data with trends over time
- **Error Details**: Detailed view of failed tests with screenshots and error messages
- **Session Management**: Select and view specific test sessions
- **Workflow Visualization**: Visual representation of test workflow steps
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

The dashboard is built with Next.js 15 and connects to the test system API running on port 4000. It automatically converts the test system's JSON format to the dashboard's internal format.

### Data Flow

1. **Test System** (port 4000) - Runs QA tests and saves results to numbered JSON files
2. **Dashboard** (port 7777) - Fetches data from test system API and displays it

### API Endpoints Used

- `GET /health` - Health check
- `GET /qa-summary` - Get summary of all test results
- `GET /qa-result/:id` - Get detailed result for specific test

## Setup

### Prerequisites

1. **Test System**: Make sure the test system is running on port 4000
   ```bash
   cd testBrowserbase/stagehandtest
   npm start
   ```

2. **Dashboard**: Install dependencies and start the dashboard
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

### Environment Variables

- `TEST_API_URL` - URL of the test system API (default: `http://localhost:4000`)

## Data Format Conversion

The dashboard automatically converts the test system's JSON format to its internal format:

### Test System Format
```json
{
  "id": 4,
  "timestamp": "2025-07-13T07:08:13.936Z",
  "url": "https://example.com",
  "promptContent": "Test login functionality",
  "testResult": {
    "agentAnalysis": {
      "status": "COMPLETED",
      "rawResult": "..."
    },
    "features": [
      {
        "featureName": "Login",
        "status": "PASSED",
        "whatHappened": "Successfully logged in"
      }
    ],
    "screenshots": [...]
  }
}
```

### Dashboard Format
```json
{
  "testUrl": "https://example.com",
  "testTimestamp": "2025-07-13T07:08:13.936Z",
  "overallStatus": "passed",
  "userExperienceScore": 100,
  "summary": {
    "totalTests": 1,
    "passed": 1,
    "failed": 0,
    "warnings": 0,
    "userBlockingIssues": 0,
    "usabilityIssues": 0
  },
  "errors": []
}
```

## Pages

- **Dashboard** (`/`) - Main dashboard with metrics and charts
- **Test** (`/test`) - Detailed view of test results
- **Status** (`/status`) - System status and health information
- **Workflow** (`/workflow`) - Workflow visualization

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks

## Development

### Adding New Metrics

1. Update the `DashboardMetrics` interface in `lib/data-service.ts`
2. Modify the `getDashboardMetrics()` method to calculate the new metric
3. Update the dashboard components to display the new metric

### Adding New Data Sources

1. Add new API endpoints to the test system
2. Update the data service to fetch from the new endpoints
3. Create new interfaces for the data format
4. Add conversion logic if needed

## Troubleshooting

### Dashboard Shows No Data

1. Check if the test system is running: `http://localhost:4000/health`
2. Verify there are test results: `http://localhost:4000/qa-summary`
3. Check browser console for API errors
4. Ensure CORS is properly configured on the test system

### API Connection Issues

1. Verify the test system is running on port 4000
2. Check the `TEST_API_URL` environment variable
3. Ensure both systems are on the same network/localhost

## API Reference

### Test System API

- `POST /qa-test` - Run a new QA test
- `GET /qa-summary` - Get summary of all test results
- `GET /qa-result/:id` - Get detailed result for specific test
- `GET /health` - Health check

### Dashboard API

- `GET /api/qa-data` - Get dashboard metrics and data
- `GET /api/sessions` - Get list of available sessions
- `GET /api/data` - Get additional dashboard data