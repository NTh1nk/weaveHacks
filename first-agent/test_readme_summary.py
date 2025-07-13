#!/usr/bin/env python3
"""
Simple test script to test the README summary function using CrewAI.
"""

from src.agents import QAContextAgents

def test_readme_summary():
    """Test the simple README summary function."""
    
    # Sample README content for testing
    sample_readme = """
    # My Awesome Project
    
    This is a web application built with React and Node.js that helps users manage their tasks.
    
    ## Features
    - Create and edit tasks
    - Set due dates and priorities
    - Mark tasks as complete
    - Filter and search tasks
    
    ## Technologies
    - React 18
    - Node.js
    - Express
    - MongoDB
    - Tailwind CSS
    
    ## Getting Started
    1. Clone the repository
    2. Run `npm install`
    3. Start the development server with `npm start`
    4. Open http://localhost:3000 in your browser
    """
    
    # Initialize the agents
    agents = QAContextAgents()
    
    # Test the README summary function
    print("Testing README Summary with CrewAI...")
    print("=" * 50)
    
    result = agents.create_readme_summary(sample_readme)
    
    if result.success:
        print("✅ SUCCESS!")
        print(f"Execution time: {result.execution_time:.2f} seconds")
        print("\nSummary:")
        print("-" * 30)
        print(result.data)
    else:
        print("❌ FAILED!")
        print(f"Error: {result.error}")

if __name__ == "__main__":
    test_readme_summary() 