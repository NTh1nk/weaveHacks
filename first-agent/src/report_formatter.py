from datetime import datetime
from typing import Dict, Any
import json
from src.models import QAReport, TestingScenario, Priority

class ReportFormatter:
    """Formats QA reports into beautiful markdown output."""
    
    def __init__(self):
        self.priority_emoji = {
            Priority.HIGH: "🔴",
            Priority.MEDIUM: "🟡", 
            Priority.LOW: "🟢"
        }
    
    def generate_markdown_report(self, qa_report: QAReport) -> str:
        """Generate a comprehensive markdown report."""
        markdown = []
        
        # Header
        markdown.append("# 🧪 QA Testing Context Report")
        markdown.append("")
        markdown.append(f"*Generated on {qa_report.generated_at.strftime('%Y-%m-%d at %H:%M:%S')}*")
        markdown.append("")
        
        # Overview Section
        markdown.append("## 📋 Overview")
        markdown.append("")
        overview = qa_report.overview
        
        priority_emoji = self.priority_emoji.get(Priority(overview.get("priority", "Medium")), "🟡")
        markdown.append(f"- **Feature:** {overview.get('feature', 'N/A')}")
        markdown.append(f"- **Priority:** {priority_emoji} {overview.get('priority', 'Medium')}")
        markdown.append(f"- **Files Changed:** {overview.get('files_changed', 0)}")
        markdown.append(f"- **Lines Changed:** {overview.get('lines_changed', 0)}")
        markdown.append(f"- **Estimated Testing Time:** {overview.get('testing_window', '30-60 minutes')}")
        markdown.append("")
        
        # Deployment Information
        markdown.append("## 🚀 Deployment Information")
        markdown.append("")
        deployment = qa_report.deployment_info
        
        if deployment.url:
            markdown.append(f"- **Live URL:** [{deployment.url}]({deployment.url})")
            markdown.append(f"- **Status:** {deployment.status}")
            markdown.append(f"- **Environment:** {deployment.environment}")
            
            if deployment.provider:
                markdown.append(f"- **Provider:** {deployment.provider}")
            
            if deployment.deployment_time:
                markdown.append(f"- **Deployed:** {deployment.deployment_time.strftime('%Y-%m-%d at %H:%M:%S')}")
            
            markdown.append("")
            markdown.append("**✅ Ready for testing! Use the live URL above.**")
        else:
            markdown.append("- **Live URL:** ⏳ *Waiting for deployment...*")
            markdown.append(f"- **Status:** {deployment.status}")
            markdown.append(f"- **Environment:** {deployment.environment}")
            markdown.append("")
            markdown.append("**⚠️ No deployment URL available yet. Use local setup for testing.**")
        
        markdown.append("")
        
        # Primary Focus Areas
        markdown.append("## 🎯 Primary Focus Areas")
        markdown.append("")
        
        for area in qa_report.primary_focus_areas:
            markdown.append(f"- **{area}**")
        
        markdown.append("")
        
        # Testing Scenarios
        markdown.append("## 🔍 Testing Scenarios")
        markdown.append("")
        
        for i, scenario in enumerate(qa_report.testing_scenarios, 1):
            priority_emoji = self.priority_emoji.get(scenario.priority, "🟡")
            markdown.append(f"### {i}. {scenario.title} {priority_emoji}")
            markdown.append("")
            markdown.append(f"**Description:** {scenario.description}")
            markdown.append("")
            markdown.append("**Steps:**")
            for step_num, step in enumerate(scenario.steps, 1):
                markdown.append(f"{step_num}. {step}")
            markdown.append("")
            markdown.append(f"**Expected Outcome:** {scenario.expected_outcome}")
            markdown.append("")
            markdown.append(f"**Priority:** {scenario.priority.value}")
            markdown.append("")
            markdown.append("---")
            markdown.append("")
        
        # Application Context
        markdown.append("## 📱 Application Context")
        markdown.append("")
        markdown.append(qa_report.application_context)
        markdown.append("")
        
        # Additional Resources
        if qa_report.additional_resources:
            markdown.append("## 📚 Additional Resources")
            markdown.append("")
            
            for resource_name, resource_content in qa_report.additional_resources.items():
                if resource_content.startswith('http'):
                    markdown.append(f"- **{resource_name}:** [{resource_content}]({resource_content})")
                else:
                    markdown.append(f"- **{resource_name}:** {resource_content}")
            
            markdown.append("")
        
        # Footer
        markdown.append("---")
        markdown.append("")
        markdown.append("*This report was generated automatically by the QA Context Generator.*")
        markdown.append(f"*For questions or issues, please refer to the [Pull Request]({qa_report.additional_resources.get('Pull Request', '#')}).*")
        
        return "\n".join(markdown)
    
    def generate_html_report(self, qa_report: QAReport) -> str:
        """Generate HTML version of the report."""
        markdown_content = self.generate_markdown_report(qa_report)
        
        # Simple HTML wrapper
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>QA Testing Context Report</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
                .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
                .priority-high {{ color: #d73a49; }}
                .priority-medium {{ color: #f66a0a; }}
                .priority-low {{ color: #28a745; }}
                .deployment-url {{ background: #f6f8fa; padding: 10px; border-radius: 5px; }}
                .checklist {{ background: #f8f9fa; padding: 15px; border-radius: 5px; }}
                pre {{ background: #f6f8fa; padding: 10px; border-radius: 5px; overflow-x: auto; }}
                code {{ background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div id="markdown-content">
                    {markdown_content}
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def generate_json_report(self, qa_report: QAReport) -> str:
        """Generate JSON version of the report."""
        return qa_report.model_dump_json(indent=2)
    
    def save_report(self, qa_report: QAReport, filename: str, format: str = "markdown") -> str:
        """Save the report to a file."""
        if format.lower() == "markdown":
            content = self.generate_markdown_report(qa_report)
            filename = f"{filename}.md"
        elif format.lower() == "html":
            content = self.generate_html_report(qa_report)
            filename = f"{filename}.html"
        elif format.lower() == "json":
            content = self.generate_json_report(qa_report)
            filename = f"{filename}.json"
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filename 