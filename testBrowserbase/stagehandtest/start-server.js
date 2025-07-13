#!/usr/bin/env node

// Simple startup script for the QA Testing API

console.log('🚀 Starting QA Testing API Server...\n');

// Check if .env file exists
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env file not found');
  console.log('Make sure to set OPENAI_API_KEY environment variable\n');
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
  console.log('Please set OPENAI_API_KEY in your .env file or environment\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔑 OpenAI API Key found');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log('📁 Created screenshots directory');
} else {
  console.log('📁 Screenshots directory exists');
}

console.log('\n🎯 Server Configuration:');
console.log('- Port: 3000');
console.log('- Environment: LOCAL');
console.log('- Model: computer-use-preview');
console.log('- Screenshots: ./screenshots/');

console.log('\n📋 Available Endpoints:');
console.log('- GET  /health         - Health check');
console.log('- POST /qa-test        - Run QA test');

console.log('\n🧪 Test Commands:');
console.log('- npm run test-api     - Test basic API');
console.log('- npm run test-screenshots - Test screenshot functionality');

console.log('\n📖 Example API Call:');
console.log(`curl -X POST http://localhost:3000/qa-test \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://weave-demo-sable.vercel.app/",
    "promptContent": "Test login and non-existent features"
  }'`);

console.log('\n🔄 Starting server...\n');

// Import and start the server
import('./index.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 