#!/usr/bin/env python3
"""
Test example for the QA Context Generator

This script demonstrates the QA Context Generator functionality with mock data.
"""

import asyncio
from datetime import datetime
from src.models import PRData, DocumentationData, DeploymentInfo, QAReport
from src.report_formatter import ReportFormatter

def create_mock_data():
    """Create mock data for testing."""
    
    # Mock PR data
    pr_data = PRData(
        title="Add user authentication system",
        description="This PR adds a complete user authentication system with login, registration, and password reset functionality.",
        labels=["feature", "high-priority", "authentication"],
        files_changed=[
            "src/components/LoginForm.tsx",
            "src/components/RegisterForm.tsx", 
            "src/api/auth.py",
            "src/models/user.py",
            "src/styles/auth.css"
        ],
        additions=234,
        deletions=13,
        commits_count=8,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        pr_url="https://github.com/example/myapp/pull/123",
        repo_name="myapp",
        repo_owner="example"
    )
    
    # Mock documentation data
    doc_data = DocumentationData(
        readme_content="# MyApp\n\nA modern web application for team collaboration and project management.",
        setup_instructions="1. Install dependencies: npm install\n2. Set up environment variables\n3. Run: npm start",
        key_features=[
            "User management",
            "Team collaboration", 
            "Project tracking",
            "Real-time notifications",
            "Dashboard analytics"
        ],
        testing_guidelines="Run tests with: npm test"
    )
    
    # Mock deployment info
    deployment_info = DeploymentInfo(
        url="https://myapp-pr-123.fly.dev",
        environment="staging",
        status="deployed",
        provider="fly.io",
        deployment_time=datetime.now()
    )
    
    return pr_data, doc_data, deployment_info

def test_report_generation():
    """Test the report generation functionality."""
    
    print("🧪 Testing QA Context Generator")
    print("=" * 50)
    
    # Create mock data
    pr_data, doc_data, deployment_info = create_mock_data()
    
    # Initialize report formatter
    formatter = ReportFormatter()
    
    # Create a mock QA report
    from src.models import TestingScenario, Priority
    
    testing_scenarios = [
        TestingScenario(
            title="User Authentication Flow",
            description="Test the complete user authentication workflow",
            steps=[
                "Navigate to the login page",
                "Enter valid credentials",
                "Verify successful login",
                "Test logout functionality"
            ],
            expected_outcome="User can successfully authenticate and logout",
            priority=Priority.HIGH
        ),
        TestingScenario(
            title="Registration Process",
            description="Test new user registration",
            steps=[
                "Navigate to registration page",
                "Fill in required fields",
                "Submit registration form",
                "Verify account creation"
            ],
            expected_outcome="New user account is created successfully",
            priority=Priority.HIGH
        ),
        TestingScenario(
            title="UI/UX Validation",
            description="Test the user interface changes",
            steps=[
                "Check form layouts and styling",
                "Test responsive design",
                "Verify error message display",
                "Test form validation"
            ],
            expected_outcome="UI renders correctly and provides good user experience",
            priority=Priority.MEDIUM
        )
    ]
    
    qa_report = QAReport(
        overview={
            "feature": pr_data.title,
            "priority": "High",
            "files_changed": len(pr_data.files_changed),
            "lines_changed": pr_data.additions + pr_data.deletions,
            "testing_window": "45-60 minutes"
        },
        primary_focus_areas=[
            "Authentication/Authorization",
            "User Interface Changes", 
            "Frontend Functionality"
        ],
        testing_scenarios=testing_scenarios,
        application_context=f"**Repository**: {pr_data.repo_name}\n**Key Features**: {', '.join(doc_data.key_features)}\n**Application Summary**: {doc_data.readme_content.split('.')[0]}",
        deployment_info=deployment_info,
        additional_resources={
            "Setup Instructions": doc_data.setup_instructions,
            "Testing Guidelines": doc_data.testing_guidelines,
            "Pull Request": pr_data.pr_url
        }
    )
    
    # Generate reports
    print("📝 Generating markdown report...")
    markdown_report = formatter.generate_markdown_report(qa_report)
    
    print("💾 Saving reports...")
    saved_files = []
    
    # Save in different formats
    for format_type in ["markdown", "html", "json"]:
        filename = formatter.save_report(qa_report, "test_qa_report", format_type)
        saved_files.append(filename)
        print(f"✅ Saved {format_type.upper()}: {filename}")
    
    print(f"\n🎉 Test completed successfully!")
    print(f"📁 Generated files: {', '.join(saved_files)}")
    
    # Display a preview
    print("\n📋 Report Preview:")
    print("-" * 50)
    lines = markdown_report.split('\n')
    for line in lines[:30]:  # Show first 30 lines
        print(line)
    
    if len(lines) > 30:
        print("...")
        print(f"[{len(lines)} total lines]")

if __name__ == "__main__":
    test_report_generation() 