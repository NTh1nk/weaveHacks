// Generated script for workflow 100a45ae-13d1-404f-b406-63af61a3a7c7
// Generated at 2025-07-12T19:24:23.400Z

import { Stagehand, type ConstructorParams } from "@browserbasehq/stagehand";
import { z } from 'zod';
import express from 'express';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

// Stagehand configuration
const stagehandConfig = (): ConstructorParams => {
  return {
    env: 'LOCAL',
    verbose: 1,
    modelName: 'gemini-flash',
    modelClientOptions: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  };
};

// Helper function to ensure screenshot directory exists
async function ensureScreenshotDirectory(): Promise<string> {
  const screenshotDir = path.join(process.cwd(), 'screenshots');
  try {
    await fs.mkdir(screenshotDir, { recursive: true });
    console.log(`📁 Screenshot directory ready: ${screenshotDir}`);
    return screenshotDir;
  } catch (error) {
    console.error('Failed to create screenshot directory:', error);
    throw error;
  }
}

// Helper function to capture screenshot
async function captureFailureScreenshot(page: any, featureName: string): Promise<string | null> {
  try {
    console.log(`🔍 Starting screenshot capture for: ${featureName}`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotDir = await ensureScreenshotDirectory();
    
    const fileName = `failure-${featureName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${timestamp}.png`;
    const screenshotPath = path.join(screenshotDir, fileName);
    
    console.log(`📁 Screenshot directory: ${screenshotDir}`);
    console.log(`📄 Screenshot filename: ${fileName}`);
    console.log(`📍 Full screenshot path: ${screenshotPath}`);
    
    // Take the screenshot
    console.log(`📸 Taking screenshot...`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    
    // Wait a moment for file system to sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify file was created and get its size
    try {
      const stats = await fs.stat(screenshotPath);
      console.log(`✅ Screenshot saved successfully!`);
      console.log(`   Path: ${screenshotPath}`);
      console.log(`   Size: ${stats.size} bytes`);
      console.log(`   Created: ${stats.birthtime}`);
      return screenshotPath;
    } catch (verifyError) {
      console.error(`❌ Screenshot file not found after creation: ${screenshotPath}`);
      console.error(`   Verify error:`, verifyError);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to capture screenshot:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Helper function to convert screenshot to base64
async function screenshotToBase64(screenshotPath: string): Promise<string | null> {
  try {
    const imageBuffer = await fs.readFile(screenshotPath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to convert screenshot to base64:', error);
    return null;
  }
}

// Helper function to generate GitHub comment using OpenAI
async function generateGithubComment(features: any[], url: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not found. Skipping GitHub comment generation.');
    return null;
  }
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Prepare a summary of the test results
    const testSummary = features.map(feature => {
      let statusIcon = '❓';
      if (feature.status === 'PASSED') statusIcon = '✅';
      if (feature.status === 'FAILED') statusIcon = '❌';

      return `- ${statusIcon} **${feature.featureName}**: ${feature.status} - ${feature.whatHappened}`;
    }).join('\n');

    const prompt = `
Generate a concise and professional GitHub comment in Markdown for a pull request based on the QA test results for ${url}.

The comment must be brief and focus on the functionality of each tested feature.
- Start with a short title with an emoji.
- List each feature with a status icon (✅, ❌).
- Briefly describe what happened for each feature.
- If any tests failed, note that screenshots are available.

Here are the test results:
${testSummary}

Generate a concise comment based on these results.
`;

    console.log("🤖 Calling OpenAI to generate GitHub comment...");
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const comment = response.choices[0]?.message?.content?.trim() || null;
    if (comment) {
      console.log('✅ GitHub comment generated successfully.');
    } else {
      console.log('❌ Failed to generate GitHub comment from OpenAI response.');
    }
    return comment;
  } catch (error) {
    console.error('❌ Failed to generate GitHub comment:', error);
    return null;
  }
}

// Helper function to ensure db directory exists
async function ensureDbDirectory(): Promise<string> {
  const dbDir = path.join(process.cwd(), 'db');
  try {
    await fs.mkdir(dbDir, { recursive: true });
    console.log(`📁 DB directory ready: ${dbDir}`);
    return dbDir;
  } catch (error) {
    console.error('Failed to create db directory:', error);
    throw error;
  }
}

// Helper function to get next available file number
async function getNextFileNumber(): Promise<number> {
  const dbDir = await ensureDbDirectory();
  try {
    const files = await fs.readdir(dbDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return 1;
    }
    
    const numbers = jsonFiles
      .map(file => parseInt(file.replace('.json', '')))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  } catch (error) {
    console.error('Error reading db directory:', error);
    return 1;
  }
}

// Helper function to save JSON result to db folder
async function saveResultToDb(result: any): Promise<string> {
  try {
    const dbDir = await ensureDbDirectory();
    const fileNumber = await getNextFileNumber();
    const fileName = `${fileNumber}.json`;
    const filePath = path.join(dbDir, fileName);
    
    const dataToSave = {
      id: fileNumber,
      timestamp: new Date().toISOString(),
      ...result
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    console.log(`💾 Saved result to: ${filePath}`);
    return fileName;
  } catch (error) {
    console.error('Failed to save result to db:', error);
    throw error;
  }
}

// QA Testing Function
async function runQATest(url: string, promptContent: string) {
  console.log("Starting QA Testing Workflow...");

  try {
    // Step 1: Initialize Stagehand for browser testing
    console.log("Initializing Stagehand...");
    let stagehand = new Stagehand(stagehandConfig());
    await stagehand.init();
    console.log("Stagehand initialized successfully.");

    // Step 2: Initialize Computer Use Agent (CUA)
    console.log("Initializing Computer Use Agent...");
    const agent = stagehand.agent({
      provider: "openai",
      model: "computer-use-preview",
      instructions: "You are a QA testing assistant that can use a web browser to find bugs and issues on websites. EVERYTHING HERE IS FOR TESTING PURPOSES ONLY. SO IT IS OK TO TEST ANYTHING. [IMPORTANT: IF FEATURE DOES NOT WORK 1 TIME, THEN STOP TESTING AND GO TO THE NEXT FEATURE, AFTER THAT STOP STEPS AND GENERATE REPORT ]",
      options: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    // Step 3: Navigate to target URL
    console.log(`Navigating to ${url}`);
    const page = stagehand.page;
    if (!page) {
      throw new Error("Failed to get page instance from Stagehand");
    }
    await page.goto(url);

    // Step 4: Execute QA testing with the agent
    console.log("🤖 Agent analyzing website for bugs and issues...");
    
    const agentResult = await agent.execute({
      instruction: `You are currently on the website: ${url}

Based on this testing context: "${promptContent}"

**YOUR TASK:**
Test the features mentioned in the context on the CURRENT WEBSITE you are viewing right now. While you are testing, track the steps you take.

**CRITICAL INSTRUCTIONS:**
1. Look at the current page you are on.
2. Test each feature/functionality mentioned in the context systematically.
3. For each feature, you MUST determine if it: PASSED, FAILED, or NOT_FOUND.
4. If a feature doesn't work the first time, mark it as FAILED and move to the next feature.
5. Document what happened for each feature with clear status.
6. As you perform actions, create a graph of your steps. Each step is a node. Connect nodes to show the sequence of actions.

**REQUIRED OUTPUT FORMAT:**
You MUST return ONLY a single JSON object. Do not add any text before or after the JSON object. The JSON object must conform to this structure:

{
  "agentAnalysis": {
    "status": "COMPLETED" or "FAILED",
    "summary": "A brief summary of the testing process."
  },
  "features": [
    {
      "featureName": "string",
      "status": "PASSED" | "FAILED" | "NOT_FOUND",
      "whatHappened": "string"
    }
  ],
  "graph": {
    "nodes": [
      { "nodeId": "string (e.g., 'step1')", "nodeText": "string (description of the step)" }
    ],
    "edges": [
      { "source": "string (nodeId)", "target": "string (nodeId)" }
    ]
  }
}

**EXAMPLE GRAPH:**
If you first click a "Login" button and then fill in a username, your graph might look like this:
"graph": {
  "nodes": [
    { "nodeId": "step1", "nodeText": "Clicked Login button" },
    { "nodeId": "step2", "nodeText": "Filled in username" }
  ],
  "edges": [
    { "source": "step1", "target": "step2" }
  ]
}

**IMPORTANT:**
- You are ALREADY on the website ${url}.
- Start testing RIGHT NOW.
- Do not ask for another website.
- Your final output must be only the JSON object.`,
      maxSteps: 30,
      autoScreenshot: true
    });

    // Step 5: Parse the agent's JSON output
    console.log("\n🔧 Parsing agent result...");
    let structuredResult;
    try {
      let responseContent = agentResult.message;
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      structuredResult = JSON.parse(responseContent);
      console.log("Structured result:", JSON.stringify(structuredResult, null, 2));
    } catch (error) {
      console.error("Failed to parse agent JSON response:", error);
      console.log("Raw agent response:", agentResult.message);
      structuredResult = {
        agentAnalysis: {
          status: "FAILED",
          summary: "Failed to parse agent response into JSON."
        },
        features: [],
        graph: { nodes: [], edges: [] }
      };
    }
    
    // Step 6: Generate GitHub comment
    console.log("\n📝 Generating GitHub comment...");
    const githubComment = await generateGithubComment(structuredResult.features || [], url);

    // Step 7: Identify failed features for screenshots
    const failedFeatures = structuredResult.features?.filter((f: any) => f.status === 'FAILED') || [];

    // Step 8: Capture screenshots for each failed feature
    if (failedFeatures.length === 0) {
      console.log(`\n📸 No screenshots needed - no failed features detected`);
    } else {
      console.log(`\n📸 Starting screenshot capture for ${failedFeatures.length} failed features...`);
    }
    const screenshots = [];
    
    for (const [index, failedFeature] of failedFeatures.entries()) {
      console.log(`\n🎯 Capturing screenshot ${index + 1}/${failedFeatures.length}`);
      console.log(`   Feature: ${failedFeature.featureName}`);
      console.log(`   Reason: ${failedFeature.whatHappened}`);
      
      try {
        const screenshotPath = await captureFailureScreenshot(page, failedFeature.featureName);
        
        if (screenshotPath) {
          console.log(`✅ Screenshot captured: ${screenshotPath}`);
          
          // Convert to base64
          const base64Screenshot = await screenshotToBase64(screenshotPath);
          
          if (base64Screenshot) {
            screenshots.push({
              featureName: failedFeature.featureName,
              reason: failedFeature.whatHappened,
              screenshotPath: screenshotPath,
              screenshotBase64: base64Screenshot
            });
            console.log(`✅ Base64 conversion successful (${base64Screenshot.length} chars)`);
          } else {
            console.log(`❌ Failed to convert screenshot to base64`);
            screenshots.push({
              featureName: failedFeature.featureName,
              reason: failedFeature.whatHappened,
              screenshotPath: screenshotPath,
              screenshotBase64: null
            });
          }
        } else {
          console.log(`❌ Failed to capture screenshot for: ${failedFeature.featureName}`);
        }
      } catch (error) {
        console.error(`❌ Error capturing screenshot for ${failedFeature.featureName}:`, error);
      }
    }

    // Step 9: Add screenshots to the structured result
    structuredResult.screenshots = screenshots;

    // Step 10: Display results
    console.log("\n🧪 QA Test Results:");
    console.log("==================");
    console.log("Features tested:", structuredResult.features?.length || 0);
    console.log("Failed features:", failedFeatures.length);
    console.log("Screenshots captured:", screenshots.length);
    if (githubComment) {
      console.log("GitHub Comment Generated: ✅");
      console.log(githubComment);
    } else {
      console.log("GitHub Comment Generated: ❌");
    }

    if (screenshots.length > 0) {
      console.log(`\n📸 Screenshot Summary:`);
      screenshots.forEach((shot, index) => {
        console.log(`${index + 1}. ${shot.featureName}`);
        console.log(`   Path: ${shot.screenshotPath}`);
        console.log(`   Base64: ${shot.screenshotBase64 ? 'Available' : 'Failed'}`);
      });
    } else {
      console.log(`\n📸 No screenshots captured - all tests passed successfully`);
    }

    // Step 11: Send to external endpoint
    console.log("\n📤 Sending results to external endpoint...");
    const payload = {
      url: url,
      promptContent: promptContent,
      testResult: structuredResult,
      timestamp: new Date().toISOString(),
      screenshotCount: screenshots.length
    };
    
    console.log("📋 Payload Summary:");
    console.log(`   URL: ${payload.url}`);
    console.log(`   Features: ${structuredResult.features?.length || 0}`);
    console.log(`   Screenshots: ${payload.screenshotCount}`);
    console.log(`   GitHub Comment: ${githubComment ? 'Generated' : 'Not Generated'}`);
    
    // Step 12: Save result to local db
    console.log("\n💾 Saving result to local database...");
    let savedFileName = null;
    try {
      savedFileName = await saveResultToDb(payload);
      console.log(`✅ Result saved as: ${savedFileName}`);
    } catch (error) {
      console.error('❌ Failed to save to local db:', error);
    }
    
    // For now, simulate the API call (uncomment the fetch when you have a real endpoint)
    try {
      console.log("🔄 Simulating external API call...");
      
      /*
      // Uncomment this block when you have a real API endpoint
      const response = await fetch('https://your-api-endpoint.com/qa-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Successfully sent to external endpoint:', result);
      */
      
      // Simulated response
      const simulatedResponse = {
        success: true,
        message: "QA results received successfully",
        featuresReceived: structuredResult.features?.length || 0,
        screenshotsReceived: screenshots.length,
        localDbFile: savedFileName,
        githubComment: githubComment,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Simulated external endpoint response:');
      console.log(JSON.stringify(simulatedResponse, null, 2));
      
    } catch (error) {
      console.error('❌ Failed to send to external endpoint:', error);
    }

    // Step 13: Send GitHub comment to another dummy endpoint (commented out as requested)
    /*
    if (githubComment) {
      try {
        console.log("\n📤 Sending GitHub comment to a dummy endpoint...");
        const commentPayload = {
          comment: githubComment,
          sourceUrl: url,
          timestamp: new Date().toISOString(),
        };

        const response = await fetch('https://your-dummy-comment-endpoint.com/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentPayload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Successfully sent GitHub comment to dummy endpoint:", result);
      } catch (error) {
        console.error("❌ Failed to send GitHub comment to dummy endpoint:", error);
      }
    } else {
      console.log("\n🤷 No GitHub comment was generated, skipping post to dummy endpoint.");
    }
    */

    // Clean up
    console.log("Closing Stagehand connection...");
    await stagehand.close();

    console.log("QA Test completed successfully");
    return { 
      success: true, 
      result: structuredResult,
      status: structuredResult.agentAnalysis.status,
      localDbFile: savedFileName,
      githubComment: githubComment
    };

  } catch (error) {
    console.error("QA Test failed:", error);
    return { 
      success: false, 
      error: error,
      status: "FAILED"
    };
  }
}

// Express.js Server
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

app.post('/qa-test', async (req, res) => {
  try {
    const { url, promptContent } = req.body;

    // Validate input
    if (!url || !promptContent) {
      return res.status(400).json({
        success: false,
        error: "Both 'url' and 'promptContent' are required"
      });
    }

    console.log(`\n🚀 Starting QA Test for: ${url}`);
    console.log(`📝 Prompt: ${promptContent.substring(0, 100)}...`);

    // Run QA test
    const result = await runQATest(url, promptContent);

    // Return result
    if (result.success) {
      res.json({ githubComment: result.githubComment || null });
    } else {
      res.status(500).json({
        success: false,
        error: result.error ? (result.error as Error).message : 'Internal Server Error'
      });
    }

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      status: "FAILED",
      error: "Internal server error"
    });
  }
});

// Endpoint to fetch saved JSON result by number
app.get('/qa-result/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const fileNumber = parseInt(number);
    
    if (isNaN(fileNumber) || fileNumber < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid file number. Must be a positive integer."
      });
    }

    const dbDir = await ensureDbDirectory();
    const fileName = `${fileNumber}.json`;
    const filePath = path.join(dbDir, fileName);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const result = JSON.parse(fileContent);
      
      console.log(`📖 Retrieved result: ${fileName}`);
      
      res.json({
        success: true,
        fileNumber: fileNumber,
        fileName: fileName,
        data: result
      });
      
    } catch (fileError) {
      console.log(`❌ File not found: ${fileName}`);
      res.status(404).json({
        success: false,
        error: `Result file ${fileName} not found`,
        availableFiles: await getAvailableFiles()
      });
    }

  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Helper function to get available files
async function getAvailableFiles(): Promise<string[]> {
  try {
    const dbDir = await ensureDbDirectory();
    const files = await fs.readdir(dbDir);
    return files.filter(file => file.endsWith('.json')).sort();
  } catch (error) {
    console.error('Error reading available files:', error);
    return [];
  }
}

// Endpoint to list all available results
app.get('/qa-results', async (req, res) => {
  try {
    const files = await getAvailableFiles();
    
    const results = files.map(file => {
      const number = parseInt(file.replace('.json', ''));
      return {
        number: number,
        fileName: file
      };
    }).sort((a, b) => a.number - b.number);
    
    console.log(`📋 Listed ${results.length} available results`);
    
    res.json({
      success: true,
      totalResults: results.length,
      results: results
    });
    
  } catch (error) {
    console.error("Error listing results:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Endpoint to get basic summary data for all results
app.get('/qa-summary', async (req, res) => {
  try {
    const files = await getAvailableFiles();
    const summaryData = [];
    
    for (const file of files) {
      try {
        const dbDir = await ensureDbDirectory();
        const filePath = path.join(dbDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const result = JSON.parse(fileContent);
        
        const failedCount = result.testResult.features?.filter((f: any) => f.status === 'FAILED').length || 0;
        const totalCount = result.testResult.features?.length || 0;
        
        summaryData.push({
          id: result.id,
          url: result.url,
          timestamp: result.timestamp,
          totalFeatures: totalCount,
          failedFeatures: failedCount,
          screenshots: result.testResult.screenshots?.length || 0
        });
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
        // Skip corrupted files
        continue;
      }
    }
    
    // Sort by ID (file number)
    summaryData.sort((a, b) => a.id - b.id);
    
    console.log(`📊 Generated summary for ${summaryData.length} results`);
    
    res.json({
      success: true,
      totalResults: summaryData.length,
      summary: summaryData
    });
    
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'QA Testing Service is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QA Testing Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 QA Test endpoint: POST http://localhost:${PORT}/qa-test`);
});

export default app;