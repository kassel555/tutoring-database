-- Tutoring Database Schema for Supabase
-- Customized for hours-based tutoring business with package system
-- Created: 2026-02-01
-- Updated: 2026-02-01 - Matched to actual Google Sheets structure

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
-- Stores client information with custom UID system
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

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_clients_uid ON clients(uid);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_teacher ON clients(teacher);
CREATE INDEX IF NOT EXISTS idx_clients_lead_source ON clients(lead_source);

-- Add comments
COMMENT ON TABLE clients IS 'Tutoring clients with custom UID system and lead tracking';
COMMENT ON COLUMN clients.uid IS 'Custom unique identifier (e.g., JAAN, VISH, RISH)';
COMMENT ON COLUMN clients.status IS 'Client status: active, retired, inactive, etc.';
COMMENT ON COLUMN clients.lead_source IS 'How client found business: bark, google, referral, etc.';
COMMENT ON COLUMN clients.teacher IS 'Primary teacher assigned to this client';

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
-- Stores payment records with package tracking and HST
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_package_type ON payments(package_type);
CREATE INDEX IF NOT EXISTS idx_payments_year ON payments(year);

-- Add comments
COMMENT ON TABLE payments IS 'Payment records with package-based hours and HST tracking';
COMMENT ON COLUMN payments.package_type IS 'Package name: basic, plus, home visit, etc.';
COMMENT ON COLUMN payments.hours_purchased IS 'Number of hours included in this payment/package';
COMMENT ON COLUMN payments.amount_paid IS 'Actual amount paid by client';
COMMENT ON COLUMN payments.hourly_rate IS 'Rate per hour (may be calculated from package)';
COMMENT ON COLUMN payments.amount_owing_pretax IS 'Amount owing before tax';
COMMENT ON COLUMN payments.apply_tax IS 'Whether HST should be applied';
COMMENT ON COLUMN payments.hst_amount IS 'HST tax amount (13% in Ontario)';
COMMENT ON COLUMN payments.total_payment IS 'Total payment including tax';
COMMENT ON COLUMN payments.status IS 'Payment status: paid, owing, partial, etc.';

-- ============================================================================
-- LESSONS TABLE
-- ============================================================================
-- Stores lesson records with hours tracking
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_client_id ON lessons(client_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher);
CREATE INDEX IF NOT EXISTS idx_lessons_paid_teacher ON lessons(paid_teacher);

-- Add comments
COMMENT ON TABLE lessons IS 'Lesson records with hours consumed and teacher tracking';
COMMENT ON COLUMN lessons.hours_taught IS 'Number of hours consumed in this lesson';
COMMENT ON COLUMN lessons.paid_teacher IS 'Date when teacher was paid for this lesson';
COMMENT ON COLUMN lessons.paid_or_probono IS 'Whether lesson was paid or pro bono';
COMMENT ON COLUMN lessons.teacher IS 'Teacher who conducted this lesson';
COMMENT ON COLUMN lessons.lesson_topic IS 'Main topic/subject covered in lesson';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS FOR CALCULATED FIELDS
-- ============================================================================

-- View: Client Summary with hours balance
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

COMMENT ON VIEW client_summary IS 'Client overview with calculated hours balance and activity';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables for security

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to clients"
    ON clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to payments"
    ON payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to lessons"
    ON lessons
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- For development/testing: allow anon access (REMOVE IN PRODUCTION)
CREATE POLICY "Allow anon users full access to clients"
    ON clients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon users full access to payments"
    ON payments
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon users full access to lessons"
    ON lessons
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Uncomment to insert sample data for testing

-- INSERT INTO clients (uid, full_name, status, email, telephone, lead_source, teacher) VALUES
-- ('TEST1', 'John Smith', 'active', 'john@example.com', '555-0100', 'google', 'Rahul'),
-- ('TEST2', 'Jane Doe', 'active', 'jane@example.com', '555-0200', 'referral', 'Rahul');

-- INSERT INTO payments (client_id, payment_date, package_type, hours_purchased, amount_paid, apply_tax, hst_amount, total_payment, status, payment_method, year)
-- SELECT id, '2026-01-15', 'basic', 3, 125, false, 0, 125, 'paid', 'cash', 2026
-- FROM clients WHERE uid = 'TEST1';

-- INSERT INTO lessons (client_id, lesson_date, hours_taught, teacher, lesson_topic)
-- SELECT id, '2026-01-20', 1, 'Rahul', 'Excel Basics'
-- FROM clients WHERE uid = 'TEST1';

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get client summary with hours balance
-- SELECT * FROM client_summary ORDER BY full_name;

-- Get clients with hours remaining
-- SELECT uid, full_name, hours_remaining
-- FROM client_summary
-- WHERE hours_remaining > 0
-- ORDER BY hours_remaining DESC;

-- Get all payments with client info
-- SELECT
--     c.uid,
--     c.full_name,
--     p.payment_date,
--     p.package_type,
--     p.hours_purchased,
--     p.total_payment,
--     p.status
-- FROM payments p
-- JOIN clients c ON p.client_id = c.id
-- ORDER BY p.payment_date DESC;

-- Get all lessons with client info
-- SELECT
--     c.uid,
--     c.full_name,
--     l.lesson_date,
--     l.hours_taught,
--     l.teacher,
--     l.lesson_topic
-- FROM lessons l
-- JOIN clients c ON l.client_id = c.id
-- ORDER BY l.lesson_date DESC;

-- Get lessons by teacher
-- SELECT
--     teacher,
--     COUNT(*) as lesson_count,
--     SUM(hours_taught) as total_hours
-- FROM lessons
-- GROUP BY teacher
-- ORDER BY total_hours DESC;

-- Get revenue by package type
-- SELECT
--     package_type,
--     COUNT(*) as sales_count,
--     SUM(hours_purchased) as total_hours,
--     SUM(total_payment) as total_revenue
-- FROM payments
-- WHERE status = 'paid'
-- GROUP BY package_type
-- ORDER BY total_revenue DESC;

-- Get clients with outstanding balances (owing)
-- SELECT
--     c.uid,
--     c.full_name,
--     SUM(p.amount_owing_pretax) as total_owing
-- FROM clients c
-- JOIN payments p ON c.id = p.client_id
-- WHERE p.status = 'owing'
-- GROUP BY c.id, c.uid, c.full_name
-- ORDER BY total_owing DESC;
