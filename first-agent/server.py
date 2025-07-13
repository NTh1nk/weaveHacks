#!/usr/bin/env python3
"""
QA Context Generator API Server

A simple FastAPI server that exposes the QA context generation functionality.
"""

import asyncio
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
import uvicorn

from src.main import QAContextGenerator
from src.report_formatter import ReportFormatter

# FastAPI app initialization
app = FastAPI(
    title="QA Context Generator API",
    description="Generate comprehensive QA testing context from GitHub PRs",
    version="1.0.0"
)

# Request model
class GenerateRequest(BaseModel):
    url: str
    output_file: Optional[str] = None

# Response model
class GenerateResponse(BaseModel):
    success: bool
    message: str
    markdown_report: Optional[str] = None
    error: Optional[str] = None

# Global instances
generator = None
formatter = None

@app.on_event("startup")
async def startup_event():
    """Initialize the QA generator and formatter on startup."""
    global generator, formatter
    generator = QAContextGenerator()
    formatter = ReportFormatter()

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "QA Context Generator API",
        "version": "1.0.0",
        "description": "Generate comprehensive QA testing context from GitHub PRs",
        "endpoints": {
            "generate": "POST /generate - Generate QA context from GitHub PR URL",
            "health": "GET /health - Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/generate", response_model=GenerateResponse)
async def generate_qa_context(request: GenerateRequest):
    """
    Generate QA testing context from a GitHub Pull Request URL.
    
    Args:
        request: Request containing the GitHub PR URL and optional output file
        
    Returns:
        QA report data in JSON format
    """
    try:
        # Validate GitHub PR URL
        if not request.url.startswith("https://github.com/") or "/pull/" not in request.url:
            raise HTTPException(
                status_code=400, 
                detail="Invalid GitHub PR URL. Must be in format: https://github.com/owner/repo/pull/123"
            )
        
        # Generate output filename if not provided
        output_file = request.output_file
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"qa_report_{timestamp}"
        
        # Generate the QA context
        qa_report = await generator.generate_qa_context(
            pr_url=request.url,
            output_file=output_file
        )
        
        # Generate markdown report
        markdown_report = formatter.generate_markdown_report(qa_report)
        
        return GenerateResponse(
            success=True,
            message="QA context generated successfully",
            markdown_report=markdown_report
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other exceptions
        error_message = str(e)
        return GenerateResponse(
            success=False,
            message="Failed to generate QA context",
            error=error_message
        )

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 