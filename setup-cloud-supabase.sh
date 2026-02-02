#!/bin/bash

# Setup Cloud Supabase Configuration
# Run this after creating your cloud Supabase project

set -e

echo "🌐 Cloud Supabase Configuration Setup"
echo "======================================"
echo ""

# Prompt for credentials
read -p "Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase anon/public key: " SUPABASE_ANON_KEY

# Validate inputs
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Both URL and anon key are required!"
    exit 1
fi

# Remove trailing slash from URL if present
SUPABASE_URL=${SUPABASE_URL%/}

echo ""
echo "Updating configuration files..."

# Update .env
cat > .env <<EOF
# Cloud Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo "✅ .env updated"

# Update web/config.js
cat > web/config.js <<EOF
// Cloud Supabase Configuration
const SUPABASE_URL = '$SUPABASE_URL';
const SUPABASE_ANON_KEY = '$SUPABASE_ANON_KEY';

window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};
EOF

echo "✅ web/config.js updated"

echo ""
echo "======================================"
echo "✅ Configuration Complete!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to Supabase Dashboard → SQL Editor"
echo "2. Paste the schema from database/schema.sql"
echo "3. Click 'Run' to create tables"
echo ""
echo "4. Then open your app:"
echo "   open web/index.html"
echo ""
echo "🎉 You're ready to use cloud Supabase!"
echo ""
