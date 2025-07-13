#!/usr/bin/env python3
"""
Example usage of the QA Context Generator

This script demonstrates how to use the QA Context Generator to generate
comprehensive QA testing context from a GitHub Pull Request.
"""

import asyncio
from src.main import QAContextGenerator

async def example_usage():
    """Example of how to use the QA Context Generator."""
    
    # Initialize the generator
    print("🔧 Initializing QA Context Generator...")
    generator = QAContextGenerator()
    
    # Example PR URL (replace with a real PR)
    pr_url = "https://github.com/octocat/Hello-World/pull/1"
    
    print(f"📋 Processing PR: {pr_url}")
    
    try:
        # Generate QA context
        qa_report = await generator.generate_qa_context(
            pr_url=pr_url,
            output_file="example_qa_report"
        )
        
        print("\n✅ QA Context Generated Successfully!")
        print(f"📊 Generated report with {len(qa_report.testing_scenarios)} testing scenarios")
        print(f"🎯 Focus areas: {', '.join(qa_report.primary_focus_areas)}")
        
        # Display markdown preview
        generator.display_markdown_preview(qa_report)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("💡 Make sure you have set up your .env file with valid API keys")

if __name__ == "__main__":
    print("🧪 QA Context Generator Example")
    print("=" * 50)
    
    # Run the example
    asyncio.run(example_usage()) 