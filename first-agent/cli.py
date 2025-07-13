#!/usr/bin/env python3
"""
QA Context Generator CLI

A CrewAI-powered tool that generates comprehensive QA testing context from GitHub PRs.
Integrated with W&B Weave for observability.
"""

import asyncio
import typer
from typing import Optional
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from src.main import QAContextGenerator
from src.config import config

app = typer.Typer(
    name="qa-context-generator",
    help="Generate comprehensive QA testing context from GitHub PRs using CrewAI and W&B Weave",
    no_args_is_help=True,
)

console = Console()

@app.command()
def generate(
    pr_url: str = typer.Argument(..., help="GitHub Pull Request URL"),
    output: Optional[str] = typer.Option(
        None, 
        "--output", 
        "-o", 
        help="Output file prefix (without extension). If not provided, files won't be saved."
    ),
    format: str = typer.Option(
        "all", 
        "--format", 
        "-f", 
        help="Output format: markdown, html, json, or all"
    ),
    preview: bool = typer.Option(
        True, 
        "--preview/--no-preview", 
        help="Show markdown preview in console"
    ),
    verbose: bool = typer.Option(
        False, 
        "--verbose", 
        "-v", 
        help="Enable verbose output"
    ),
):
    """
    Generate QA testing context from a GitHub Pull Request.
    
    Example:
        qa-context-generator generate https://github.com/owner/repo/pull/123
        qa-context-generator generate https://github.com/owner/repo/pull/123 --output my_report
    """
    
    # Validate PR URL
    if not pr_url.startswith("https://github.com/") or "/pull/" not in pr_url:
        console.print("[red]❌ Invalid GitHub PR URL. Must be in format: https://github.com/owner/repo/pull/123[/red]")
        raise typer.Exit(1)
    
    # Generate output filename if not provided
    if output is None and format != "none":
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output = f"qa_report_{timestamp}"
    
    try:
        # Run the async generator
        asyncio.run(_generate_async(pr_url, output, format, preview, verbose))
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️ Operation cancelled by user[/yellow]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]❌ Error: {str(e)}[/red]")
        if verbose:
            console.print_exception()
        raise typer.Exit(1)

async def _generate_async(pr_url: str, output: Optional[str], format: str, preview: bool, verbose: bool):
    """Async wrapper for the generation process."""
    generator = QAContextGenerator()
    
    # Generate the QA context
    qa_report = await generator.generate_qa_context(
        pr_url=pr_url,
        output_file=output
    )
    
    # Show preview if requested
    if preview:
        generator.display_markdown_preview(qa_report)

@app.command()
def config_check():
    """Check if all required configuration is set up correctly."""
    console.print(Panel.fit(
        "[bold blue]Configuration Check[/bold blue]",
        border_style="blue"
    ))
    
    # Create a table for configuration status
    table = Table(title="Configuration Status")
    table.add_column("Setting", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Value", style="yellow")
    
    config_items = [
        ("WANDB_API_KEY", config.wandb_api_key),
        ("WANDB_TEAM", config.wandb_team),
        ("WANDB_PROJECT", config.wandb_project),
        ("GITHUB_TOKEN", config.github_token),
        ("OPENAI_API_KEY", config.openai_api_key),
        ("MODEL_NAME", config.model_name),
    ]
    
    all_configured = True
    
    for name, value in config_items:
        if value:
            status = "✅ Set"
            display_value = value[:20] + "..." if len(value) > 20 else value
            if "TOKEN" in name or "KEY" in name:
                display_value = "***" + display_value[-4:] if len(display_value) > 4 else "***"
        else:
            status = "❌ Missing"
            display_value = "Not configured"
            all_configured = False
        
        table.add_row(name, status, display_value)
    
    console.print(table)
    
    if all_configured:
        console.print("\n[bold green]✅ All configuration is set up correctly![/bold green]")
    else:
        console.print("\n[bold red]❌ Some configuration is missing. Please check your .env file.[/bold red]")
        console.print("Create a .env file based on .env.example and fill in the required values.")

@app.command()
def example():
    """Show example usage and configuration."""
    console.print(Panel.fit(
        "[bold blue]QA Context Generator - Example Usage[/bold blue]",
        border_style="blue"
    ))
    
    console.print("\n[bold]🔧 Setup:[/bold]")
    console.print("1. Copy .env.example to .env")
    console.print("2. Fill in your API keys and configuration")
    console.print("3. Install dependencies: pip install -r requirements.txt")
    
    console.print("\n[bold]📝 Configuration (.env file):[/bold]")
    console.print("""
# W&B Configuration
WANDB_API_KEY=your-wandb-api-key
WANDB_TEAM=your-team-name
WANDB_PROJECT=qa-context-generator

# GitHub Configuration
GITHUB_TOKEN=your-github-token

# OpenAI Configuration (using W&B Inference)
OPENAI_API_KEY=your-wandb-api-key
OPENAI_BASE_URL=https://api.inference.wandb.ai/v1
""")
    
    console.print("\n[bold]🚀 Usage Examples:[/bold]")
    console.print("# Generate QA context and save reports")
    console.print("python cli.py generate https://github.com/owner/repo/pull/123")
    console.print("")
    console.print("# Generate with custom output filename")
    console.print("python cli.py generate https://github.com/owner/repo/pull/123 --output my_report")
    console.print("")
    console.print("# Generate without preview")
    console.print("python cli.py generate https://github.com/owner/repo/pull/123 --no-preview")
    console.print("")
    console.print("# Check configuration")
    console.print("python cli.py config-check")

@app.command()
def version():
    """Show version information."""
    console.print(Panel.fit(
        "[bold blue]QA Context Generator v1.0.0[/bold blue]\n"
        "Powered by CrewAI and W&B Weave\n"
        "Built for intelligent QA testing context generation",
        border_style="blue"
    ))

if __name__ == "__main__":
    app() 