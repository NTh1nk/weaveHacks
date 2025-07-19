#!/bin/bash

# WeaveHacks Installation Script for macOS
# This script installs all necessary dependencies for the WeaveHacks project

set -e  # Exit on any error

echo "🐢 Installing WeaveHacks dependencies for macOS..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Homebrew is installed
check_homebrew() {
    print_status "Checking for Homebrew..."
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for M1/M2 Macs
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        print_success "Homebrew installed successfully!"
    else
        print_success "Homebrew is already installed"
    fi
}

# Install system dependencies
install_system_deps() {
    print_status "Installing system dependencies..."
    
    # Update Homebrew
    brew update
    
    # Install Node.js (LTS version)
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        brew install node
    else
        print_success "Node.js is already installed"
    fi
    
    # Install Python 3
    if ! command -v python3 &> /dev/null; then
        print_status "Installing Python 3..."
        brew install python@3.11
    else
        print_success "Python 3 is already installed"
    fi
    
    # Install pnpm (package manager used by stagehandtest)
    if ! command -v pnpm &> /dev/null; then
        print_status "Installing pnpm..."
        brew install pnpm
    else
        print_success "pnpm is already installed"
    fi
    
    print_success "System dependencies installed!"
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    cd first-agent
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    print_status "Installing Python packages..."
    pip install -r requirements.txt
    
    print_success "Python dependencies installed!"
    cd ..
}

# Install Node.js dependencies
install_node_deps() {
    print_status "Installing Node.js dependencies..."
    
    # Install dashboard dependencies
    print_status "Installing dashboard dependencies..."
    cd dashboard
    npm install
    cd ..
    
    # Install stagehandtest dependencies
    print_status "Installing stagehandtest dependencies..."
    cd testBrowserbase/stagehandtest
    pnpm install
    cd ../..
    
    # Install code-turtle dependencies (if needed)
    print_status "Installing code-turtle dependencies..."
    cd code-turtle
    npm install
    cd ..
    
    print_success "Node.js dependencies installed!"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Copy example.env to .env in first-agent if it doesn't exist
    if [ ! -f "first-agent/.env" ] && [ -f "first-agent/env.example" ]; then
        print_status "Creating .env file for first-agent..."
        cp first-agent/env.example first-agent/.env
        print_warning "Please edit first-agent/.env with your API keys and configuration"
    fi
    
    # Copy example.env to .env in code-turtle if it doesn't exist
    if [ ! -f "code-turtle/.env" ] && [ -f "code-turtle/example.env" ]; then
        print_status "Creating .env file for code-turtle..."
        cp code-turtle/example.env code-turtle/.env
        print_warning "Please edit code-turtle/.env with your configuration"
    fi
    
    # Copy env.example to .env in stagehandtest if it doesn't exist
    if [ ! -f "testBrowserbase/stagehandtest/.env" ] && [ -f "testBrowserbase/stagehandtest/env.example" ]; then
        print_status "Creating .env file for stagehandtest..."
        cp testBrowserbase/stagehandtest/env.example testBrowserbase/stagehandtest/.env
        print_warning "Please edit testBrowserbase/stagehandtest/.env with your API keys"
    fi
    
    print_success "Environment files set up!"
}

# Verify installations
verify_installations() {
    print_status "Verifying installations..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js: $(node --version)"
    else
        print_error "Node.js not found!"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm: $(npm --version)"
    else
        print_error "npm not found!"
    fi
    
    # Check pnpm
    if command -v pnpm &> /dev/null; then
        print_success "pnpm: $(pnpm --version)"
    else
        print_error "pnpm not found!"
    fi
    
    # Check Python 3
    if command -v python3 &> /dev/null; then
        print_success "Python 3: $(python3 --version)"
    else
        print_error "Python 3 not found!"
    fi
    
    print_success "Installation verification complete!"
}

# Main installation process
main() {
    echo "Starting WeaveHacks installation for macOS..."
    echo "This will install all necessary dependencies for the project."
    echo ""
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script is designed for macOS only!"
        exit 1
    fi
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root (sudo)."
        print_error "Please run it as a regular user. Homebrew and npm will handle permissions automatically."
        exit 1
    fi
    
    # Run installation steps
    check_homebrew
    install_system_deps
    install_python_deps
    install_node_deps
    setup_env_files
    verify_installations
    
    echo ""
    echo "=================================================="
    print_success "🎉 WeaveHacks installation completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit environment files with your API keys:"
    echo "   - first-agent/.env"
    echo "   - code-turtle/.env (if needed)"
    echo ""
    echo "2. Start the services using:"
    echo "   ./start-all.sh"
    echo ""
    echo "3. Access the applications:"
    echo "   - Dashboard: http://localhost:7777"
    echo "   - First Agent API: http://localhost:8000"
    echo ""
    print_warning "Remember to activate the Python virtual environment before running the first-agent:"
    echo "   cd first-agent && source venv/bin/activate"
    echo ""
}

# Run main function
main "$@" 