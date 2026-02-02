#!/bin/bash

# Install Docker on Mac Mini Server (run as rahul/admin user)
# This script installs Homebrew, Colima, and Docker system-wide

set -e

echo "🚀 Installing Docker on Mac Mini Server"
echo "========================================"
echo ""
echo "⚠️  This script will:"
echo "  1. Install Homebrew (requires admin password)"
echo "  2. Install Colima + Docker"
echo "  3. Start Docker daemon"
echo ""
echo "You'll be prompted for your password."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Install Homebrew
echo "📦 Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo ""
echo "🔧 Configuring PATH..."
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install Colima and Docker
echo ""
echo "🐳 Installing Colima + Docker..."
brew install colima docker docker-compose

# Start Colima
echo ""
echo "🚀 Starting Colima (Docker daemon)..."
colima start --cpu 2 --memory 4 --disk 60

# Verify Docker works
echo ""
echo "✅ Verifying Docker installation..."
docker ps

echo ""
echo "========================================"
echo "✅ Docker Installation Complete!"
echo "========================================"
echo ""
echo "Docker is now available system-wide for all users."
echo ""
echo "Next steps:"
echo "  1. Exit this session (type: exit)"
echo "  2. SSH as taly: ssh taly@server-macmini.localdomain"
echo "  3. Run deployment: ./deploy-to-server.sh"
echo ""
