# QA Testing API

AI-powered website testing service with screenshot capture and local database storage.

## Endpoints

### `POST /qa-test`
**Input:** `{ "url": "string", "promptContent": "string" }`  
**Output:** `{ "success": boolean, "status": string, "data": object, "localDbFile": string }`  
**Does:** Runs QA test, saves to database, returns results with screenshots

### `GET /qa-results`
**Input:** None  
**Output:** `{ "success": boolean, "totalResults": number, "results": [{ "number": number, "fileName": string }] }`  
**Does:** Lists all saved result files

### `GET /qa-result/:number`
**Input:** URL parameter `number`  
**Output:** `{ "success": boolean, "fileNumber": number, "fileName": string, "data": object }`  
**Does:** Fetches specific result by file number

### `GET /qa-summary`
**Input:** None  
**Output:** `{ "success": boolean, "totalResults": number, "summary": [{ "id": number, "url": string, "timestamp": string, "totalFeatures": number, "failedFeatures": number, "screenshots": number }] }`  
**Does:** Returns basic data for all database entries

### `GET /health`
**Input:** None  
**Output:** `{ "status": "OK", "message": string }`  
**Does:** Health check

## Usage
```bash
npm start
curl -X POST http://localhost:3000/qa-test -H "Content-Type: application/json" -d '{"url": "https://example.com", "promptContent": "Test login"}'
``` 