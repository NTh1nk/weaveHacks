# QA Testing API Service

A comprehensive QA testing service that uses AI agents to test websites and provide structured reports with automatic screenshot capture for failed features and local database storage.

## Features

- **AI-Powered Testing**: Uses OpenAI's computer-use-preview model for intelligent website testing
- **Structured Output**: Converts agent results into structured JSON format
- **Express.js API**: Simple REST API for integration
- **Automated Screenshots**: Takes screenshots during testing and captures failed features
- **Feature-Based Testing**: Tests specific features based on provided context
- **Failure Documentation**: Automatically captures screenshots when features fail
- **Base64 Screenshot Encoding**: Screenshots included in API response for easy integration
- **Local Database Storage**: Saves complete JSON results with screenshots to local `db/` folder
- **Sequential File Naming**: Results saved as `1.json`, `2.json`, `3.json`, etc.
- **Result Retrieval API**: Fetch saved results by file number

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

#### Run QA Test
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
    },
    "features": [
      {
        "featureName": "Login Feature",
        "status": "PASSED",
        "whatHappened": "Successfully logged in with provided credentials"
      }
    ],
    "failedFeatures": [
      {
        "featureName": "Contact Form",
        "reason": "Contact form was not found on the page"
      }
    ],
    "screenshots": [
      {
        "featureName": "Contact Form",
        "reason": "Contact form was not found on the page",
        "screenshotPath": "./screenshots/failure-contact-form-2023-07-12T19-24-23-400Z.png",
        "screenshotBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ]
  },
  "localDbFile": "1.json"
}
```

#### List All Results
```
GET /qa-results
```

**Response:**
```json
{
  "success": true,
  "totalResults": 3,
  "results": [
    {
      "number": 1,
      "fileName": "1.json"
    },
    {
      "number": 2,
      "fileName": "2.json"
    },
    {
      "number": 3,
      "fileName": "3.json"
    }
  ]
}
```

#### Fetch Specific Result
```
GET /qa-result/:number
```

**Example:** `GET /qa-result/1`

**Response:**
```json
{
  "success": true,
  "fileNumber": 1,
  "fileName": "1.json",
  "data": {
    "id": 1,
    "timestamp": "2023-07-12T19:24:23.400Z",
    "url": "https://example.com",
    "promptContent": "Test login feature",
    "testResult": {
      "agentAnalysis": { ... },
      "features": [ ... ],
      "failedFeatures": [ ... ],
      "screenshots": [ ... ]
    },
    "screenshotCount": 1
  }
}
```

### 3. Test the API

#### Basic API Test
```bash
npm run test-api
```

#### Screenshot Functionality Test
```bash
npm run test-screenshots
```

#### Quick Test
```bash
npm run test-quick
```

#### Database Functionality Test
```bash
npm run test-db
```

## Database Storage

### Local File Structure
```
db/
├── 1.json
├── 2.json
├── 3.json
└── ...
```

### File Format
Each JSON file contains:
- **id**: Sequential file number
- **timestamp**: When the test was run
- **url**: Tested website URL
- **promptContent**: Original test prompt
- **testResult**: Complete test results including:
  - Agent analysis
  - Individual features with status
  - Failed features with reasons
  - Screenshots with base64 data
- **screenshotCount**: Number of screenshots captured

### Example File Content
```json
{
  "id": 1,
  "timestamp": "2023-07-12T19:24:23.400Z",
  "url": "https://weave-demo-sable.vercel.app/",
  "promptContent": "Test login feature and non-existent search filters",
  "testResult": {
    "agentAnalysis": { ... },
    "features": [
      {
        "featureName": "Login Feature",
        "status": "PASSED",
        "whatHappened": "Successfully logged in"
      },
      {
        "featureName": "Advanced Search",
        "status": "FAILED", 
        "whatHappened": "Feature not found on website"
      }
    ],
    "failedFeatures": [
      {
        "featureName": "Advanced Search",
        "reason": "Feature not found on website"
      }
    ],
    "screenshots": [
      {
        "featureName": "Advanced Search",
        "reason": "Feature not found on website",
        "screenshotPath": "./screenshots/failure-advanced-search-2023-07-12T19-24-23-400Z.png",
        "screenshotBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ]
  },
  "screenshotCount": 1
}
```

## Screenshot Functionality

### Automatic Capture
When features fail during testing, the service automatically:
1. **Identifies Failed Features**: Uses GPT-4o to extract failed features from agent results
2. **Captures Screenshots**: Takes full-page screenshots for each failed feature
3. **Saves Locally**: Stores screenshots in `./screenshots/` directory with descriptive filenames
4. **Converts to Base64**: Encodes screenshots as base64 for API transport
5. **Includes in Response**: Adds screenshot data to the JSON response
6. **Saves to Database**: Stores complete results with screenshots in `db/` folder

### Screenshot Format
```json
{
  "screenshots": [
    {
      "featureName": "Login Form",
      "reason": "Login button was not clickable",
      "screenshotPath": "./screenshots/failure-login-form-2023-07-12T19-24-23-400Z.png",
      "screenshotBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

## How It Works

1. **Function-based Architecture**: Core QA testing logic is wrapped in `runQATest(url, promptContent)`
2. **AI Agent Testing**: Uses Stagehand with computer-use-preview model to test website features
3. **Result Structuring**: Uses GPT-4o to structure agent results and extract failed features
4. **Screenshot Capture**: Automatically captures screenshots for any failed features
5. **Base64 Encoding**: Converts screenshots to base64 for easy API transport
6. **Database Storage**: Saves complete results to local `db/` folder with sequential numbering
7. **Result Retrieval**: Provides API endpoints to list and fetch saved results
8. **External Integration**: Ready to send results with screenshots to external endpoints

## Example Usage

### Run QA Test and Save to Database
```javascript
const response = await fetch('http://localhost:3000/qa-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://weave-demo-sable.vercel.app/',
    promptContent: 'Test the table readability feature and non-existent contact form'
  })
});

const result = await response.json();
console.log('Saved as:', result.localDbFile); // e.g., "1.json"
```

### Fetch Saved Result
```javascript
const fetchResponse = await fetch('http://localhost:3000/qa-result/1');
const savedResult = await fetchResponse.json();

console.log('URL tested:', savedResult.data.url);
console.log('Features tested:', savedResult.data.testResult.features.length);
console.log('Screenshots:', savedResult.data.testResult.screenshots.length);
```

### List All Results
```javascript
const listResponse = await fetch('http://localhost:3000/qa-results');
const listResult = await listResponse.json();

listResult.results.forEach(result => {
  console.log(`${result.number}. ${result.fileName}`);
});
```

## Response Format

The API returns structured data with:
- **status**: COMPLETED/FAILED
- **actions**: Array of actions performed (clicks, typing, screenshots)
- **features**: Array of individual features with status and details
- **failedFeatures**: Array of features that failed with reasons
- **screenshots**: Array of screenshot data for failed features (base64 + file paths)
- **localDbFile**: Name of the saved JSON file (e.g., "1.json")
- **usage**: Token usage and timing information

## Development

For development with auto-reload:
```bash
npm run dev
```

## File Structure

```
├── screenshots/
│   ├── failure-login-form-2023-07-12T19-24-23-400Z.png
│   ├── failure-contact-form-2023-07-12T19-25-15-123Z.png
│   └── ...
├── db/
│   ├── 1.json
│   ├── 2.json
│   ├── 3.json
│   └── ...
└── ...
```

## External Integration

The service is ready to integrate with external endpoints. Screenshots are included in the payload sent to external services, providing visual evidence of failures.

## Notes

- Each test runs in a fresh browser session
- Screenshots are automatically taken for failed features only
- Screenshots are saved locally and encoded as base64 for transport
- Full-page screenshots provide complete context of failures
- Results are structured using OpenAI GPT-4o for consistency
- Service handles errors gracefully with fallback responses
- Screenshot and database directories are created automatically if they don't exist
- Files are saved with sequential numbering (1.json, 2.json, 3.json, etc.)
- Complete JSON with base64 screenshots is stored locally for retrieval 