#!/bin/bash

# Deploy Tutoring Database to Mac Mini Server
# Run this script ON the Mac Mini server

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "🚀 Deploying Tutoring Database to Mac Mini Server"
echo "=================================================="
echo ""
echo "Server: $(hostname)"
echo ""

# ============================================================================
# Step 1: Create project directory on server
# ============================================================================

echo "Step 1: Creating project directory..."
PROJECT_DIR="/Users/taly/tutoring-database"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
print_success "Project directory: $PROJECT_DIR"

# ============================================================================
# Step 2: Check Docker
# ============================================================================

echo ""
echo "Step 2: Checking Docker..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_success "Docker is running"
    else
        print_warning "Starting Docker..."
        open -a Docker
        echo "Waiting for Docker to start..."
        for i in {1..30}; do
            if docker info &> /dev/null 2>&1; then
                print_success "Docker started"
                break
            fi
            echo -n "."
            sleep 2
        done
    fi
else
    print_error "Docker not installed on server!"
    echo "Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# ============================================================================
# Step 3: Install Supabase CLI
# ============================================================================

echo ""
echo "Step 3: Installing Supabase CLI..."
if command -v supabase &> /dev/null; then
    print_success "Supabase CLI already installed"
else
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
        print_success "Supabase CLI installed"
    else
        print_error "Homebrew not found!"
        exit 1
    fi
fi

# ============================================================================
# Step 4: Initialize Supabase
# ============================================================================

echo ""
echo "Step 4: Setting up Supabase..."

# Stop any existing instances
supabase stop 2>/dev/null || true

# Initialize
if [ ! -d "supabase" ]; then
    supabase init
fi

# ============================================================================
# Step 5: Copy database schema
# ============================================================================

echo ""
echo "Step 5: Setting up database schema..."

mkdir -p supabase/migrations

cat > supabase/migrations/20260202_initial_schema.sql <<'EOFSCHEMA'
-- Tutoring Database Schema for Supabase
-- Customized for hours-based tutoring business with package system

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    email TEXT,
    telephone TEXT,
    lead_source TEXT,
    teacher TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_uid ON clients(uid);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_teacher ON clients(teacher);
CREATE INDEX IF NOT EXISTS idx_clients_lead_source ON clients(lead_source);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    package_type TEXT,
    hours_purchased DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    amount_owing_pretax DECIMAL(10,2),
    apply_tax BOOLEAN DEFAULT false,
    hst_amount DECIMAL(10,2) DEFAULT 0,
    total_payment DECIMAL(10,2),
    status TEXT DEFAULT 'paid',
    payment_method TEXT,
    year INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_package_type ON payments(package_type);

-- LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lesson_date DATE NOT NULL,
    lesson_datetime TIMESTAMP WITH TIME ZONE,
    hours_taught DECIMAL(10,2) NOT NULL,
    paid_teacher DATE,
    paid_or_probono TEXT,
    teacher TEXT NOT NULL,
    lesson_topic TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_client_id ON lessons(client_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CLIENT SUMMARY VIEW
CREATE OR REPLACE VIEW client_summary AS
SELECT
    c.id,
    c.uid,
    c.full_name,
    c.status,
    c.email,
    c.telephone,
    c.lead_source,
    c.teacher,
    c.notes,
    COALESCE(SUM(p.hours_purchased), 0) as total_hours_purchased,
    COALESCE(SUM(l.hours_taught), 0) as total_hours_used,
    COALESCE(SUM(p.hours_purchased), 0) - COALESCE(SUM(l.hours_taught), 0) as hours_remaining,
    MAX(l.lesson_date) as last_training_date,
    COUNT(DISTINCT p.id) as payment_count,
    COUNT(DISTINCT l.id) as lesson_count,
    COALESCE(SUM(p.total_payment), 0) as total_paid,
    c.created_at,
    c.updated_at
FROM clients c
LEFT JOIN payments p ON c.id = p.client_id
LEFT JOIN lessons l ON c.id = l.client_id
GROUP BY c.id, c.uid, c.full_name, c.status, c.email, c.telephone,
         c.lead_source, c.teacher, c.notes, c.created_at, c.updated_at;

-- ROW LEVEL SECURITY
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to clients"
    ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to payments"
    ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to lessons"
    ON lessons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Development: Allow anon access (REMOVE IN PRODUCTION)
CREATE POLICY "Allow anon users full access to clients"
    ON clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon users full access to payments"
    ON payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon users full access to lessons"
    ON lessons FOR ALL TO anon USING (true) WITH CHECK (true);
EOFSCHEMA

print_success "Schema file created"

# ============================================================================
# Step 6: Start Supabase
# ============================================================================

echo ""
echo "Step 6: Starting Supabase..."
supabase start

# Get status
STATUS=$(supabase status)
API_URL=$(echo "$STATUS" | grep "API URL" | awk '{print $4}')
STUDIO_URL=$(echo "$STATUS" | grep "Studio" | awk '{print $3}')

print_success "Supabase started!"

# ============================================================================
# Step 7: Apply schema
# ============================================================================

echo ""
echo "Step 7: Creating database tables..."
supabase db reset

print_success "Database ready!"

# ============================================================================
# Step 8: Create .env file
# ============================================================================

echo ""
echo "Step 8: Saving configuration..."

ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SERVICE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

cat > .env <<EOF
# Supabase Configuration for Mac Mini Server
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_KEY=$SERVICE_KEY
EOF

print_success ".env file created"

# ============================================================================
# Display Summary
# ============================================================================

echo ""
echo "=================================================="
echo "✅ Tutoring Database is Running on Mac Mini!"
echo "=================================================="
echo ""
echo "📍 Location: $PROJECT_DIR"
echo ""
echo "🌐 Access Points:"
echo "  Studio:  $STUDIO_URL"
echo "  API:     $API_URL"
echo ""
echo "🔑 Credentials saved to: $PROJECT_DIR/.env"
echo ""
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Access Supabase Studio from any device:"
echo "   http://server-macmini.localdomain:54323"
echo ""
echo "2. Copy this project to your laptop to manage data:"
echo "   scp -r taly@server-macmini.localdomain:$PROJECT_DIR ~/Desktop/"
echo ""
echo "3. Or install the web interface on the server"
echo ""
echo "To stop:  supabase stop"
echo "To start: supabase start"
echo ""
