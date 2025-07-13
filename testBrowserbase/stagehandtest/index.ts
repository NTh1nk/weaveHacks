// Generated script for workflow 100a45ae-13d1-404f-b406-63af61a3a7c7
// Generated at 2025-07-12T19:24:23.400Z

import { Stagehand, type ConstructorParams } from "@browserbasehq/stagehand";
import { z } from 'zod';
import express from 'express';
import { OpenAI } from 'openai';

// Stagehand configuration
const stagehandConfig = (): ConstructorParams => {
  return {
    env: 'LOCAL',
    verbose: 1,
    modelName: 'computer-use-preview',
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  };
};

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
Test the features mentioned in the context on the CURRENT WEBSITE you are viewing right now.

**INSTRUCTIONS:**
1. Look at the current page you are on
2. Test each feature/functionality mentioned in the context systematically
3. For each feature, determine if it PASSED, FAILED, or was NOT_FOUND
4. If a feature doesn't work the first time, mark it as FAILED and move to next feature
5. Document what happened for each feature

**TESTING METHODOLOGY:**
- You are already on the website - start testing immediately
- Navigate through the website systematically
- Test each feature mentioned in the context
- If a feature doesn't work the first time, mark it as FAILED and move to next feature
- Document what happened for each feature

**IMPORTANT:** 
- You are ALREADY on the website ${url}
- Start testing the features mentioned in the context RIGHT NOW
- Do not ask for another website - test the current one you are viewing

Provide a clear text report with:
- Feature name
- Status (PASSED/FAILED/NOT_FOUND)
- What happened when testing

Focus only on whether features work or not and what happened.`,
      maxSteps: 30,
      autoScreenshot: true
    });

    // Step 5: Structure the agent result using OpenAI GPT-4o
    console.log("Structuring agent result...");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Based on this agent result: ${JSON.stringify(agentResult)}

Please structure this into the exact JSON format:
{
  "agentAnalysis": {
    "status": "COMPLETED" | "FAILED",
    "rawResult": {
      "success": boolean,
      "actions": [
        {
          "type": "screenshot" | "click" | "type" | "navigate" | "observe",
          "button"?: "left" | "right",
          "x"?: number,
          "y"?: number,
          "text"?: string,
          "url"?: string,
          "selector"?: string
        }
      ],
      "message": "Detailed report with feature name, status (PASSED/FAILED/NOT_FOUND), and what happened",
      "completed": boolean,
      "usage": {
        "input_tokens": number,
        "output_tokens": number,
        "inference_time_ms": number
      }
    }
  }
}

Return ONLY the JSON response, no additional text.`
        }
      ],
      temperature: 0.1
    });

    // Parse the structured response
    let structuredResult;
    try {
      let responseContent = structuredResponse.choices[0].message.content!;
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      structuredResult = JSON.parse(responseContent);
    } catch (error) {
      console.error("Failed to parse structured response:", error);
      structuredResult = {
        agentAnalysis: {
          status: "FAILED",
          rawResult: {
            success: false,
            actions: [],
            message: "Failed to structure agent response",
            completed: false,
            usage: { input_tokens: 0, output_tokens: 0, inference_time_ms: 0 }
          }
        }
      };
    }

    // Step 6: Display results
    console.log("\n🧪 QA Test Results:");
    console.log("==================");
    console.log(JSON.stringify(structuredResult, null, 2));

    // Step 7: Send to another endpoint (commented out for now)
    /*
    try {
      const response = await fetch('https://your-api-endpoint.com/qa-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          promptContent: promptContent,
          testResult: structuredResult
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Successfully sent to external endpoint:', result);
    } catch (error) {
      console.error('Failed to send to external endpoint:', error);
    }
    */

    // Clean up
    console.log("Closing Stagehand connection...");
  await stagehand.close();

    console.log("QA Test completed successfully");
    return { 
      success: true, 
      result: structuredResult,
      status: structuredResult.agentAnalysis.status
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
const PORT = process.env.PORT || 3000;

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
    res.json({
      success: result.success,
      status: result.status,
      data: result.result || null,
      error: result.error || null
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      status: "FAILED",
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