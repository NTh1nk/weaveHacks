@echo off
echo 🐢 Setting up First Agent (QA Context Generator)...

REM Check if .env file exists
if exist "first-agent\.env" (
    echo ✅ .env file already exists
    echo Current configuration:
    type first-agent\.env
    echo.
    echo To modify the configuration, edit first-agent\.env
    pause
    exit /b 0
)

REM Copy example file if it doesn't exist
if not exist "first-agent\env.example" (
    echo ❌ env.example file not found!
    echo Please create first-agent\env.example with the required configuration.
    pause
    exit /b 1
)

echo 📝 Creating .env file from example...
copy "first-agent\env.example" "first-agent\.env"

if %ERRORLEVEL% EQU 0 (
    echo ✅ .env file created successfully!
    echo.
    echo 🔧 Next steps:
    echo 1. Edit first-agent\.env with your actual API keys
    echo 2. Get your W&B API key from: https://wandb.ai/settings
    echo 3. Get your GitHub token from: https://github.com/settings/tokens
    echo 4. Update WANDB_TEAM and WANDB_PROJECT with your values
    echo.
    echo 📋 Required variables:
    echo - WANDB_API_KEY: Your W&B API key
    echo - WANDB_TEAM: Your W&B team name (usually your username)
    echo - WANDB_PROJECT: Your W&B project name
    echo - GITHUB_TOKEN: Your GitHub personal access token
    echo - OPENAI_API_KEY: Same as WANDB_API_KEY for W&B Inference
    echo.
    echo After configuring, run: npm run start-all
) else (
    echo ❌ Failed to create .env file
)

pause 