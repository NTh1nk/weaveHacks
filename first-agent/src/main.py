import asyncio
from datetime import datetime
from typing import Optional
import weave
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich.markdown import Markdown

from src.config import config
from src.agents import QAContextAgents
from src.report_formatter import ReportFormatter
from src.models import QAReport

class QAContextGenerator:
    """Main orchestrator for the QA Context Generator application."""
    
    def __init__(self):
        self.console = Console()
        self.agents = QAContextAgents()
        self.formatter = ReportFormatter()
        
        # Initialize W&B Weave
        self.project_name = config.initialize_weave()
        self.console.print(f"[green]✓[/green] Initialized W&B Weave project: {self.project_name}")
    
    @weave.op()
    async def generate_qa_context(self, pr_url: str, output_file: Optional[str] = None) -> QAReport:
        """
        Generate comprehensive QA context from a GitHub PR URL.
        
        Args:
            pr_url: GitHub pull request URL
            output_file: Optional output file path (without extension)
            
        Returns:
            QAReport: Complete QA report with all context
        """
        self.console.print(Panel.fit(
            f"[bold blue]QA Context Generator[/bold blue]\n"
            f"Processing PR: {pr_url}",
            border_style="blue"
        ))

        print("generate_qa_context from main.py")
        
        # Collect GitHub data
        self.console.print("Collecting GitHub data...")
        github_result = self.agents.collect_github_data(pr_url)
        
        if not github_result.success:
            self.console.print(f"[red]❌ Failed to collect GitHub data: {github_result.error}[/red]")
            raise Exception(f"GitHub data collection failed: {github_result.error}")
        
        pr_data = github_result.data["pr_data"]
        doc_data = github_result.data["doc_data"]
        
        # Display PR information
        self.console.print(f"\n[bold green]✓ Pull Request Information:[/bold green]")
        self.console.print(f"[bold]Title:[/bold] {pr_data.title}")
        self.console.print(f"[bold]Description:[/bold] {pr_data.description or 'No description provided'}")
        
        # Display README information
        self.console.print(f"\n[bold green]✓ Repository Documentation:[/bold green]")
        if doc_data.readme_content:
            readme_preview = doc_data.readme_content[:500] + "..." if len(doc_data.readme_content) > 500 else doc_data.readme_content
            self.console.print(f"[bold]README Preview:[/bold]")
            self.console.print(Panel(readme_preview, title="README.md", border_style="dim"))
            
            if doc_data.key_features:
                self.console.print(f"[bold]Key Features:[/bold]")
                for feature in doc_data.key_features:
                    self.console.print(f"  • {feature}")
        else:
            self.console.print("[yellow]⚠️  No README found in repository[/yellow]")
        
        return "success"
    
    def _display_results(self, qa_report: QAReport):
        """Display the QA report results in the console."""
        self.console.print("\n" + "="*80)
        self.console.print(Panel.fit(
            "[bold green]QA Context Generated Successfully![/bold green]",
            border_style="green"
        ))
        
        # Display key information
        overview = qa_report.overview
        self.console.print(f"\n[bold]📋 Overview:[/bold]")
        self.console.print(f"• Feature: {overview.get('feature', 'N/A')}")
        self.console.print(f"• Priority: {overview.get('priority', 'Medium')}")
        self.console.print(f"• Files Changed: {overview.get('files_changed', 0)}")
        self.console.print(f"• Lines Changed: {overview.get('lines_changed', 0)}")
        
        self.console.print(f"\n[bold]🚀 Deployment:[/bold]")
        if qa_report.deployment_info.url:
            self.console.print(f"• Live URL: {qa_report.deployment_info.url}")
            self.console.print(f"• Provider: {qa_report.deployment_info.provider}")
        else:
            self.console.print("• Status: Waiting for deployment...")
        
        self.console.print(f"\n[bold]🎯 Focus Areas:[/bold]")
        for area in qa_report.primary_focus_areas:
            self.console.print(f"• {area}")
        
        self.console.print(f"\n[bold]🔍 Testing Scenarios:[/bold]")
        for i, scenario in enumerate(qa_report.testing_scenarios, 1):
            priority_emoji = "🔴" if scenario.priority.value == "High" else "🟡" if scenario.priority.value == "Medium" else "🟢"
            self.console.print(f"{i}. {scenario.title} {priority_emoji}")
    
    async def _save_reports(self, qa_report: QAReport, output_file: str):
        """Save the QA report in multiple formats."""
        self.console.print(f"\n[bold]💾 Saving reports...[/bold]")
        
        # Save in different formats
        formats = ["markdown", "html", "json"]
        saved_files = []
        
        for format in formats:
            try:
                filename = self.formatter.save_report(qa_report, output_file, format)
                saved_files.append(filename)
                self.console.print(f"[green]✓[/green] Saved {format.upper()}: {filename}")
            except Exception as e:
                self.console.print(f"[red]❌[/red] Failed to save {format.upper()}: {str(e)}")
        
        if saved_files:
            self.console.print(f"\n[bold green]Reports saved successfully![/bold green]")
            self.console.print("📁 Files created:")
            for file in saved_files:
                self.console.print(f"  • {file}")
        
        return saved_files
    
    def display_markdown_preview(self, qa_report: QAReport):
        """Display a markdown preview of the report."""
        markdown_content = self.formatter.generate_markdown_report(qa_report)
        
        self.console.print("\n" + "="*80)
        self.console.print(Panel.fit(
            "[bold blue]QA Report Preview[/bold blue]",
            border_style="blue"
        ))
        
        # Display truncated markdown content
        lines = markdown_content.split('\n')
        preview_lines = lines[:50]  # Show first 50 lines
        
        if len(lines) > 50:
            preview_lines.append("...")
            preview_lines.append(f"[Total lines: {len(lines)}]")
        
        preview_content = '\n'.join(preview_lines)
        
        try:
            md = Markdown(preview_content)
            self.console.print(md)
        except Exception:
            # Fallback to plain text if markdown rendering fails
            self.console.print(preview_content)

async def main():
    """Main entry point for the application."""
    generator = QAContextGenerator()
    
    # Example usage
    pr_url = "https://github.com/example/repo/pull/123"  # This would be provided by user
    
    try:
        qa_report = await generator.generate_qa_context(
            pr_url=pr_url,
            output_file="qa_report_" + datetime.now().strftime("%Y%m%d_%H%M%S")
        )
        
        # Display preview
        generator.display_markdown_preview(qa_report)
        
    except Exception as e:
        generator.console.print(f"[red]❌ Error: {str(e)}[/red]")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 