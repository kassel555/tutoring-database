# Database Schema Documentation

**Project:** Tutoring Database
**Last Updated:** 2026-02-01

---

## Overview

This database stores information for a computer tutoring business with three main entities:
- **Clients** - People receiving tutoring
- **Payments** - Financial transactions
- **Lessons** - Tutoring sessions

---

## Entity Relationship Diagram

```
┌─────────────────┐
│    CLIENTS      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email           │
│ phone           │
│ status          │
│ notes           │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴───────┬──────────────┐
    │            │              │
    ▼            ▼              │
┌─────────┐  ┌──────────┐      │
│PAYMENTS │  │ LESSONS  │      │
├─────────┤  ├──────────┤      │
│ id (PK) │  │ id (PK)  │      │
│client_id│  │client_id │      │
│  (FK)   │  │  (FK)    │      │
│ amount  │  │lesson_date│     │
│ method  │  │ topic    │      │
│  date   │  │ duration │      │
│check_num│  │completed │      │
│ notes   │  │ notes    │      │
│created  │  │created_at│      │
└─────────┘  └──────────┘      │
                                │
```

---

## Table: `clients`

Stores client information and contact details.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NO | auto | Primary key |
| `name` | TEXT | NO | - | Client full name |
| `email` | TEXT | YES | - | Email address |
| `phone` | TEXT | YES | - | Phone number |
| `status` | TEXT | YES | 'active' | Client status (active, inactive, etc.) |
| `notes` | TEXT | YES | - | Additional notes about the client |
| `created_at` | TIMESTAMP | NO | NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp (auto-updated) |

### Indexes
- `PRIMARY KEY` on `id`
- `idx_clients_name` on `name` (for search)
- `idx_clients_status` on `status` (for filtering)
- `idx_clients_email` on `email` (for lookup)

### Triggers
- `update_clients_updated_at` - Automatically updates `updated_at` on row updates

### Example Data
```sql
INSERT INTO clients (name, email, phone, status, notes)
VALUES
    ('John Smith', 'john@example.com', '555-0100', 'active', 'Prefers morning sessions'),
    ('Jane Doe', 'jane@example.com', '555-0200', 'active', 'Intermediate Excel user');
```

---

## Table: `payments`

Stores payment records linked to clients.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NO | auto | Primary key |
| `client_id` | BIGINT | NO | - | Foreign key to clients table |
| `amount` | DECIMAL(10,2) | NO | - | Payment amount (e.g., 150.00) |
| `payment_method` | TEXT | NO | - | Method: 'interac', 'check', 'cash', etc. |
| `payment_date` | DATE | NO | - | Date payment was received |
| `check_number` | TEXT | YES | - | Check number (if payment_method = 'check') |
| `notes` | TEXT | YES | - | Additional payment notes |
| `created_at` | TIMESTAMP | NO | NOW() | Record creation timestamp |

### Foreign Keys
- `client_id` → `clients(id)` ON DELETE CASCADE
  - If a client is deleted, all their payments are deleted

### Indexes
- `PRIMARY KEY` on `id`
- `idx_payments_client_id` on `client_id` (for joins)
- `idx_payments_date` on `payment_date` (for date filtering)
- `idx_payments_method` on `payment_method` (for filtering)

### Example Data
```sql
INSERT INTO payments (client_id, amount, payment_method, payment_date, check_number)
VALUES
    (1, 150.00, 'interac', '2026-01-15', NULL),
    (2, 200.00, 'check', '2026-01-20', '1234');
```

### Common Queries
```sql
-- Get total payments by client
SELECT
    c.name,
    COUNT(p.id) as payment_count,
    SUM(p.amount) as total_paid
FROM clients c
LEFT JOIN payments p ON c.id = p.client_id
GROUP BY c.id, c.name
ORDER BY total_paid DESC;

-- Get payments for a specific month
SELECT * FROM payments
WHERE payment_date >= '2026-01-01'
  AND payment_date < '2026-02-01'
ORDER BY payment_date;
```

---

## Table: `lessons`

Stores lesson/tutoring session records.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NO | auto | Primary key |
| `client_id` | BIGINT | NO | - | Foreign key to clients table |
| `lesson_date` | DATE | NO | - | Date of the lesson |
| `topic` | TEXT | NO | - | Topic covered (e.g., "Excel Formulas") |
| `duration_minutes` | INTEGER | YES | - | Lesson duration in minutes |
| `notes` | TEXT | YES | - | Session notes |
| `completed` | BOOLEAN | YES | true | Whether lesson was completed (vs scheduled) |
| `created_at` | TIMESTAMP | NO | NOW() | Record creation timestamp |

### Foreign Keys
- `client_id` → `clients(id)` ON DELETE CASCADE
  - If a client is deleted, all their lessons are deleted

### Indexes
- `PRIMARY KEY` on `id`
- `idx_lessons_client_id` on `client_id` (for joins)
- `idx_lessons_date` on `lesson_date` (for date filtering)
- `idx_lessons_completed` on `completed` (for filtering)

### Example Data
```sql
INSERT INTO lessons (client_id, lesson_date, topic, duration_minutes, completed, notes)
VALUES
    (1, '2026-01-10', 'Excel Pivot Tables', 60, true, 'Good progress'),
    (2, '2026-01-12', 'Word Mail Merge', 90, true, 'Needs more practice');
```

### Common Queries
```sql
-- Get lesson count by client
SELECT
    c.name,
    COUNT(l.id) as lesson_count,
    SUM(l.duration_minutes) as total_minutes
FROM clients c
LEFT JOIN lessons l ON c.id = l.client_id
GROUP BY c.id, c.name
ORDER BY lesson_count DESC;

-- Get upcoming lessons (scheduled but not completed)
SELECT
    c.name as client_name,
    l.lesson_date,
    l.topic
FROM lessons l
JOIN clients c ON l.client_id = c.id
WHERE l.completed = false
  AND l.lesson_date >= CURRENT_DATE
ORDER BY l.lesson_date;

-- Most common topics
SELECT
    topic,
    COUNT(*) as times_taught
FROM lessons
GROUP BY topic
ORDER BY times_taught DESC
LIMIT 10;
```

---

## Row-Level Security (RLS)

All tables have RLS enabled for security.

### Current Policies

**For Development:**
- Anon users have full access (SELECT, INSERT, UPDATE, DELETE)
- Authenticated users have full access

**For Production:**
Should update to:
- Remove anon access entirely
- Require authentication for all operations
- Optionally add role-based access (admin vs viewer)

### Example Production Policies
```sql
-- Remove anon policies
DROP POLICY "Allow anon users full access to clients" ON clients;
DROP POLICY "Allow anon users full access to payments" ON payments;
DROP POLICY "Allow anon users full access to lessons" ON lessons;

-- Add stricter authenticated policies
CREATE POLICY "Authenticated users can read clients"
    ON clients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can modify clients"
    ON clients FOR ALL TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));
```

---

## Data Integrity Rules

### Cascading Deletes
When a client is deleted:
- All associated payments are automatically deleted
- All associated lessons are automatically deleted

This prevents orphaned records.

### Constraints
- Client names are required (NOT NULL)
- Payment amounts must be positive (can add CHECK constraint)
- Lesson dates cannot be null
- Payment methods should be standardized (can add ENUM or CHECK)

---

## Migration from Google Sheets

### Expected Column Mappings

**Clients Sheet → clients table:**
- Name → `name`
- Email → `email`
- Phone → `phone`
- Status → `status`
- Notes → `notes`

**Payments Sheet → payments table:**
- Client Name → lookup `client_id` from clients table
- Amount → `amount`
- Method → `payment_method`
- Date → `payment_date`
- Check # → `check_number`
- Notes → `notes`

**Lessons Sheet → lessons table:**
- Client Name → lookup `client_id` from clients table
- Date → `lesson_date`
- Topic → `topic`
- Duration → `duration_minutes`
- Notes → `notes`
- Completed → `completed`

---

## Performance Considerations

### Indexes
All foreign keys have indexes for fast joins.
Date columns have indexes for range queries.

### Query Optimization
- Use `EXPLAIN ANALYZE` to check query performance
- Add indexes on columns frequently used in WHERE/ORDER BY
- Consider materialized views for complex aggregations

---

## Future Enhancements

Potential schema additions:
- `invoices` table for billing
- `lesson_plans` table for curriculum planning
- `user_accounts` table for multi-user access
- `client_packages` table for lesson packages/subscriptions
- Audit log table for tracking changes

---

## Backup & Restore

**Backup:**
```bash
pg_dump -h [host] -U postgres -d [database] > backup.sql
```

**Restore:**
```bash
psql -h [host] -U postgres -d [database] < backup.sql
```

Supabase provides automatic daily backups on all tiers.
