# 🧪 QA Context Generator

A CrewAI-powered application that automatically generates comprehensive QA testing context from GitHub Pull Requests. Integrated with W&B Weave for observability and monitoring.

## 🚀 Features

- **Intelligent PR Analysis**: Automatically extracts relevant information from GitHub PRs including title, description, files changed, and labels
- **Repository Context**: Analyzes README files and documentation to understand the application's purpose and functionality
- **Deployment Monitoring**: Monitors PR comments for deployment links from Fly.io, Vercel, Netlify, and other platforms
- **AI-Powered QA Context**: Uses CrewAI agents to generate focused testing scenarios and prioritized testing areas
- **Multiple Output Formats**: Generates reports in Markdown, HTML, and JSON formats
- **W&B Weave Integration**: Full observability with logging, performance tracking, and execution monitoring
- **Beautiful CLI Interface**: Rich console output with progress indicators and formatted reports

## 🏗️ Architecture

The application uses a multi-agent architecture powered by CrewAI:

1. **GitHub Data Collector Agent**: Extracts PR and repository information
2. **Documentation Analyzer Agent**: Processes README and documentation files
3. **Deployment Monitor Agent**: Tracks deployment status and links
4. **QA Context Generator Agent**: Creates testing scenarios and priorities
5. **Output Formatter Agent**: Generates beautiful, readable reports

## 🔧 Setup

### Prerequisites

- Python 3.8+
- W&B account with API access
- GitHub Personal Access Token
- Access to W&B Inference API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd qa-context-generator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration:
```env
# W&B Configuration
WANDB_API_KEY=your-wandb-api-key
WANDB_TEAM=your-team-name
WANDB_PROJECT=qa-context-generator

# GitHub Configuration
GITHUB_TOKEN=your-github-token

# OpenAI Configuration (using W&B Inference)
OPENAI_API_KEY=your-wandb-api-key
OPENAI_BASE_URL=https://api.inference.wandb.ai/v1

# Application Configuration
MODEL_NAME=meta-llama/Llama-3.1-8B-Instruct
MAX_DEPLOYMENT_WAIT_MINUTES=10
MIN_COMMENTS_FOR_DEPLOYMENT=2
```

### Getting API Keys

1. **W&B API Key**: Get from https://wandb.ai/authorize
2. **GitHub Token**: Create at https://github.com/settings/tokens (needs repo access)
3. **W&B Inference**: Use the same W&B API key for OpenAI configuration

## 🎯 Usage

### Command Line Interface

Check if your configuration is correct:
```bash
python cli.py config-check
```

Generate QA context from a PR:
```bash
python cli.py generate https://github.com/owner/repo/pull/123
```

Generate with custom output filename:
```bash
python cli.py generate https://github.com/owner/repo/pull/123 --output my_report
```

Generate without preview:
```bash
python cli.py generate https://github.com/owner/repo/pull/123 --no-preview
```

Show example usage:
```bash
python cli.py example
```

### Python API

```python
from src.main import QAContextGenerator

# Initialize the generator
generator = QAContextGenerator()

# Generate QA context
qa_report = await generator.generate_qa_context(
    pr_url="https://github.com/owner/repo/pull/123",
    output_file="qa_report_20240101"
)

# Display markdown preview
generator.display_markdown_preview(qa_report)
```

## 📋 Sample Output

The generated QA report includes:

### 📋 Overview
- **Feature**: Add user authentication system
- **Priority**: 🔴 High
- **Files Changed**: 15
- **Lines Changed**: 247
- **Estimated Testing Time**: 30-60 minutes

### 🚀 Deployment Information
- **Live URL**: https://myapp-pr-123.fly.dev
- **Status**: deployed
- **Provider**: fly.io

### 🎯 Primary Focus Areas
- **Authentication/Authorization**
- **User Interface Changes**
- **Backend Logic**

### 🔍 Testing Scenarios
1. **Core Functionality Verification** 🔴
   - Navigate to the deployment URL
   - Test the primary user flows
   - Verify no breaking changes

2. **User Interface Testing** 🔴
   - Check visual elements for proper rendering
   - Test responsive design
   - Verify interactive elements

### 📱 Application Context
**Repository**: my-awesome-app
**Key Features**: User management, Dashboard, Real-time updates
**Application Summary**: A modern web application for team collaboration

## 🔍 Advanced Features

### Smart Deployment Monitoring
- Waits for deployment comments (configurable timeout)
- Supports multiple deployment platforms
- Extracts deployment metadata automatically

### Intelligent File Analysis
- Categorizes changed files by functionality
- Identifies UI/UX, API, and database changes
- Prioritizes testing areas based on impact

### W&B Weave Integration
- Tracks all agent executions
- Monitors performance metrics
- Logs API calls and responses
- Enables debugging and optimization

## 🛠️ Development

### Project Structure
```
qa-context-generator/
├── src/
│   ├── config.py          # Configuration management
│   ├── models.py          # Pydantic data models
│   ├── github_service.py  # GitHub API integration
│   ├── agents.py          # CrewAI agents
│   ├── report_formatter.py # Report generation
│   └── main.py           # Main orchestrator
├── cli.py                # Command line interface
├── requirements.txt      # Dependencies
├── .env.example         # Environment template
└── README.md            # This file
```

### Adding New Features

1. **New Agent**: Add to `src/agents.py`
2. **New Output Format**: Extend `src/report_formatter.py`
3. **New Data Source**: Add service to `src/` and integrate in `src/main.py`

## 🧪 Testing

Run the application with a test PR:
```bash
python cli.py generate https://github.com/octocat/Hello-World/pull/1
```

## 📊 Monitoring

Monitor your QA Context Generator usage in W&B:
1. Visit your W&B project dashboard
2. View agent execution traces
3. Monitor performance metrics
4. Analyze usage patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review the W&B Weave documentation
3. Check CrewAI documentation for agent-related questions

## 🔮 Future Enhancements

- **Slack/Teams Integration**: Send reports directly to team channels
- **Jira Integration**: Create test tickets automatically
- **Screenshot Generation**: Capture deployment screenshots
- **Performance Testing**: Integrate with performance monitoring tools
- **Custom Templates**: Support for different project types and QA workflows

---

*Built with ❤️ using CrewAI and W&B Weave* 