#!/bin/bash

# Migration Script Runner
# Runs the data migration after configuration

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚀 Starting Migration Process"
echo "================================"
echo ""

# ============================================================================
# Step 1: Check .env file
# ============================================================================

if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Run ./setup.sh first"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

if [[ "$SUPABASE_URL" == *"YOUR-PROJECT-REF"* ]]; then
    print_error ".env file not configured!"
    echo ""
    echo "Please edit .env with your Supabase credentials:"
    echo "  nano .env"
    echo ""
    echo "Get credentials from:"
    echo "  https://supabase.com → Your Project → Settings → API"
    exit 1
fi

print_success "Configuration loaded"

# ============================================================================
# Step 2: Generate web config from .env
# ============================================================================

echo ""
echo "Generating web config..."

cat > web/config.js <<EOF
// Supabase Configuration
// Auto-generated from .env - DO NOT COMMIT THIS FILE

const SUPABASE_URL = '$SUPABASE_URL';
const SUPABASE_ANON_KEY = '$SUPABASE_ANON_KEY';

window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};
EOF

print_success "web/config.js created"

# ============================================================================
# Step 3: Update migration script with credentials
# ============================================================================

echo ""
echo "Updating migration script..."

cd database

# Create a temporary migration script with credentials
cat migration-script.js | \
    sed "s|https://YOUR-PROJECT-REF.supabase.co|$SUPABASE_URL|g" | \
    sed "s|YOUR-SERVICE-ROLE-KEY-HERE|$SUPABASE_SERVICE_KEY|g" > migration-script-configured.js

print_success "Migration script configured"

# ============================================================================
# Step 4: Check CSV files
# ============================================================================

echo ""
echo "Checking CSV files..."

MISSING_FILES=()
if [ ! -f "exports/clients.csv" ]; then
    MISSING_FILES+=("clients.csv")
fi
if [ ! -f "exports/payments.csv" ]; then
    MISSING_FILES+=("payments.csv")
fi
if [ ! -f "exports/lessons.csv" ]; then
    MISSING_FILES+=("lessons.csv")
fi

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Missing CSV files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - database/exports/$file"
    done
    echo ""
    echo "Export your Google Sheets as CSV and place them in database/exports/"
    exit 1
fi

print_success "All CSV files found"

# ============================================================================
# Step 5: Run Migration
# ============================================================================

echo ""
echo "================================"
echo "🚨 IMPORTANT!"
echo "================================"
echo ""
echo "This will import your data into Supabase."
echo ""
echo "Make sure you have:"
echo "  1. Created tables in Supabase (run schema.sql)"
echo "  2. Exported your Google Sheets as CSV"
echo "  3. Placed CSV files in database/exports/"
echo ""
read -p "Ready to migrate? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_warning "Migration cancelled"
    exit 0
fi

echo ""
echo "Running migration..."
echo ""

node migration-script-configured.js

# Clean up configured script
rm migration-script-configured.js

echo ""
print_success "Migration complete!"

cd ..

# ============================================================================
# Step 6: Open web interface
# ============================================================================

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Test the web interface:"
echo "   → open web/index.html"
echo ""
echo "2. Deploy to production:"
echo "   → ./deploy.sh"
echo ""
echo "3. Verify data in Supabase:"
echo "   → https://supabase.com → Your Project → Table Editor"
echo ""
