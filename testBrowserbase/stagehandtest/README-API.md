# QA Testing API Service

A comprehensive QA testing service that uses AI agents to test websites and provide structured reports.

## Features

- **AI-Powered Testing**: Uses OpenAI's computer-use-preview model for intelligent website testing
- **Structured Output**: Converts agent results into structured JSON format
- **Express.js API**: Simple REST API for integration
- **Automated Screenshots**: Takes screenshots during testing
- **Feature-Based Testing**: Tests specific features based on provided context

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

### 1. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 2. API Endpoints

#### Health Check
```
GET /health
```

#### QA Test
```
POST /qa-test
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "promptContent": "Test login feature with username 'admin' and password 'password'"
}
```

**Response:**
```json
{
  "success": true,
  "status": "COMPLETED",
  "data": {
    "agentAnalysis": {
      "status": "COMPLETED",
      "rawResult": {
        "success": true,
        "actions": [
          {
            "type": "screenshot"
          },
          {
            "type": "click",
            "button": "left",
            "x": 442,
            "y": 341
          },
          {
            "type": "type",
            "text": "admin"
          }
        ],
        "message": "- Feature name: Login Feature\n- Status: PASSED\n- What happened: Successfully logged in with provided credentials",
        "completed": true,
        "usage": {
          "input_tokens": 1000,
          "output_tokens": 200,
          "inference_time_ms": 5000
        }
      }
    }
  },
  "error": null
}
```

### 3. Test the API

Run the test script:
```bash
node test-api.js
```

## How It Works

1. **Function-based Architecture**: Core QA testing logic is wrapped in `runQATest(url, promptContent)`
2. **AI Agent Testing**: Uses Stagehand with computer-use-preview model to test website features
3. **Result Structuring**: Uses GPT-4o to structure agent results into consistent JSON format
4. **External Integration**: Ready to send results to external endpoints (commented out)

## Example Usage

```javascript
// Example POST request
const response = await fetch('http://localhost:3000/qa-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://weave-demo-sable.vercel.app/',
    promptContent: 'Test the table readability feature and emoji display'
  })
});

const result = await response.json();
console.log('QA Result:', result);
```

## Response Format

The API returns structured data with:
- **status**: COMPLETED/FAILED
- **actions**: Array of actions performed (clicks, typing, screenshots)
- **message**: Detailed test results with feature status
- **usage**: Token usage and timing information

## Development

For development with auto-reload:
```bash
npm run dev
```

## External Integration

The service is ready to integrate with external endpoints. Uncomment the fetch call in the code to send results to your backend service.

## Notes

- Each test runs in a fresh browser session
- Screenshots are automatically taken during testing
- Results are structured using OpenAI GPT-4o for consistency
- Service handles errors gracefully with fallback responses 