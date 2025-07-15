This is a project for AWS Builder loft, This is a cursor MCP for CodeTurtle

# AWSMCP Orchestrator

This folder contains a Node.js orchestrator for running and managing the main components of the CodeTurtle QA system:

- **dashboard/**: Next.js dashboard for visualizing QA test results
- **first-agent/**: Python CrewAI-powered QA context generator

## Setup

1. Install Node.js dependencies (in this folder):
   ```bash
   npm install
   ```

2. Make sure you have Python and the required dependencies installed in `first-agent/`.

3. Make sure you have installed dependencies in `dashboard/` as well:
   ```bash
   cd ../dashboard
   npm install
   ```

## Usage

From the `AWSMCP` directory, run:

```bash
node orchestrator.js [dashboard|agent|all|vibe-test|help]
```

- `dashboard` — Start the dashboard (Next.js app)
- `agent`     — Run the first-agent (Python CLI)
- `all`       — Run both dashboard and agent
- `vibe-test <commitOrPR> [--url <url>] [--prompt <prompt>]` — Trigger a QA test for a commit/PR. If `--url` is not provided, you will be prompted for the deployment URL. If `--prompt` is not provided, the first-agent will generate one (or you will be prompted if it fails).
- `help`      — Show help message

Example:
```bash
node orchestrator.js vibe-test https://github.com/owner/repo/pull/123 --url https://myapp-pr-123.vercel.app
```

This will trigger a QA test for the given deployment and show results in the dashboard.

## Configuration

You can add a `config.json`