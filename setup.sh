#!/bin/bash

# Tutoring Database Setup Script
# This script automates the setup process as much as possible

set -e  # Exit on error

echo "🚀 Tutoring Database Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# Step 1: Check Node.js Installation
# ============================================================================

echo "Step 1: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Or run: brew install node"
    exit 1
fi

# ============================================================================
# Step 2: Install Migration Script Dependencies
# ============================================================================

echo ""
echo "Step 2: Installing migration script dependencies..."
cd database

if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json <<EOF
{
  "name": "tutoring-database-migration",
  "version": "1.0.0",
  "description": "Migration script for tutoring database",
  "main": "migration-script.js",
  "scripts": {
    "migrate": "node migration-script.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "csv-parser": "^3.0.0"
  }
}
EOF
fi

npm install
print_success "Dependencies installed"

cd ..

# ============================================================================
# Step 3: Create .env file for configuration
# ============================================================================

echo ""
echo "Step 3: Creating configuration files..."

if [ ! -f ".env" ]; then
    cat > .env <<EOF
# Supabase Configuration
# Get these values from: https://supabase.com → Your Project → Settings → API

SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Warning: DO NOT commit the service role key to git!
# The service role key has full database access.
EOF
    print_success ".env file created"
else
    print_warning ".env file already exists (not overwriting)"
fi

# Create web config from .env (will do this after user fills in .env)
cat > web/config.example.js <<EOF
// Supabase Configuration
// This file will be auto-generated from .env

const SUPABASE_URL = 'PLACEHOLDER';
const SUPABASE_ANON_KEY = 'PLACEHOLDER';

window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};
EOF

print_success "Configuration templates created"

# ============================================================================
# Step 4: Check for CSV files
# ============================================================================

echo ""
echo "Step 4: Checking for CSV exports..."

CSV_COUNT=0
if [ -f "database/exports/clients.csv" ]; then
    CSV_COUNT=$((CSV_COUNT + 1))
    print_success "clients.csv found"
else
    print_warning "clients.csv not found"
fi

if [ -f "database/exports/payments.csv" ]; then
    CSV_COUNT=$((CSV_COUNT + 1))
    print_success "payments.csv found"
else
    print_warning "payments.csv not found"
fi

if [ -f "database/exports/lessons.csv" ]; then
    CSV_COUNT=$((CSV_COUNT + 1))
    print_success "lessons.csv found"
else
    print_warning "lessons.csv not found"
fi

if [ $CSV_COUNT -eq 3 ]; then
    print_success "All CSV files found!"
else
    print_warning "Missing CSV files. You'll need to export from Google Sheets."
fi

# ============================================================================
# Display Next Steps
# ============================================================================

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create Supabase Project:"
echo "   → Go to https://supabase.com"
echo "   → Create new project: 'tutoring-database'"
echo "   → Copy API URL and keys"
echo ""
echo "2. Configure credentials:"
echo "   → Edit .env file with your Supabase credentials"
echo "   → nano .env"
echo ""
echo "3. Export Google Sheets (if not done yet):"
echo "   → Export each sheet as CSV"
echo "   → Save to database/exports/"
echo ""
echo "4. Run the automated migration:"
echo "   → ./migrate.sh"
echo ""
echo "Or follow the manual guide:"
echo "   → cat docs/SETUP.md"
echo ""
