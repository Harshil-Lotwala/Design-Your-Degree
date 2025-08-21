#!/bin/bash

# Development Setup Script for Design Your Degree
# This script sets up the development environment efficiently

echo "🚀 Setting up Design Your Degree Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

# Install frontend dependencies (only production dependencies for smaller size)
if [ "$1" = "--production" ]; then
    npm ci --only=production
    print_status "Frontend production dependencies installed"
else
    npm install
    print_status "Frontend dependencies installed"
fi

cd ..

# Setup Backend
echo "🐍 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt
print_status "Backend dependencies installed"

cd ..

print_status "Development environment setup complete!"

echo ""
echo "📋 Quick Start Commands:"
echo "  Frontend: cd frontend && npm start"
echo "  Backend:  python start_backend.py"
echo ""
echo "🎯 For production builds:"
echo "  Frontend: cd frontend && npm run build"
echo "  Backend:  cd backend && source venv/bin/activate && python app.py"
echo ""

# Show current sizes
echo "📊 Current project sizes:"
du -sh frontend backend database .git 2>/dev/null | sort -hr
