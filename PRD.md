# Sheets-to-Supabase Migration

**Project:** Computer tutoring business database migration from Google Sheets to Supabase with custom web interface

**Status: 6/22 Complete**

---

## Overview

Migrate a computer tutoring business from 3 Google Sheets (Clients, Payments, Lessons) to a Supabase PostgreSQL database with a custom web interface for data management.

**Current State:** Google Sheets-based system
**Target State:** Supabase database + web interface

---

## Phase 1: Supabase Database Setup

### 1. Project Setup

1. [x] **Create Supabase project** ✅
   - Sign up/log in to Supabase
   - Create new project named `tutoring-database`
   - Save connection details (API URL, anon key, service role key) to `docs/SETUP.md`
   - **Completed:** Cloud Supabase project created at hawowbywchrbbhlcascn.supabase.co

### 2. Database Schema Design

2. [x] **Create clients table** ✅
   - Fields: id, name, email, phone, status, notes, created_at, updated_at
   - Add to `database/schema.sql`
   - Execute in Supabase SQL Editor
   - **Completed:** Table created with custom UID system and enhanced fields

3. [x] **Create payments table** ✅
   - Fields: id, client_id (FK), amount, payment_method, payment_date, check_number, notes, created_at
   - Add foreign key to clients table with CASCADE delete
   - Execute in Supabase SQL Editor
   - **Completed:** Table created with package tracking and HST support

4. [x] **Create lessons table** ✅
   - Fields: id, client_id (FK), lesson_date, topic, duration_minutes, notes, completed, created_at
   - Add foreign key to clients table with CASCADE delete
   - Execute in Supabase SQL Editor
   - **Completed:** Table created with hours tracking and teacher payment status

5. [x] **Set up Row-Level Security (RLS)** ✅
   - Enable RLS on all three tables
   - Create policies for authenticated access
   - Test policies work correctly
   - **Completed:** RLS enabled with anon access for single-user app

6. [x] **Create database indexes** ✅
   - Add indexes on foreign keys (client_id)
   - Add indexes on date fields for filtering
   - Document in `docs/SCHEMA.md`
   - **Completed:** All indexes created, schema documented in database/schema.sql

---

## Phase 2: Data Migration

### 3. Export & Prepare Data

7. [ ] **Export Google Sheets data**
   - Export Clients sheet as CSV
   - Export Payments sheet as CSV
   - Export Lessons sheet as CSV
   - Save to `database/exports/` directory

8. [ ] **Clean exported data**
   - Remove empty rows
   - Fix formatting issues
   - Validate data consistency
   - Document any transformations needed

### 4. Import to Supabase

9. [ ] **Import clients data**
   - Use Supabase dashboard CSV import or migration script
   - Verify row count matches
   - Check for data integrity issues

10. [ ] **Import payments data**
    - Ensure client_id references match
    - Import using CSV or migration script
    - Verify foreign key relationships

11. [ ] **Import lessons data**
    - Ensure client_id references match
    - Import using CSV or migration script
    - Verify foreign key relationships

12. [ ] **Verify data migration**
    - Compare row counts with original sheets
    - Test sample queries
    - Check relational integrity (no orphaned records)

---

## Phase 3: Web Interface

### 5. Build Core Features

13. [ ] **Set up web project structure**
    - Create `web/index.html` with basic layout
    - Create `web/app.js` with Supabase client initialization
    - Create `web/styles.css` with basic styling
    - Create `web/config.js` for environment variables

14. [ ] **Implement client management**
    - List all clients in table view
    - Add new client form
    - Edit existing client
    - Delete client (with confirmation)
    - View client details with related payments/lessons

15. [ ] **Implement payment tracking**
    - List all payments with client names
    - Add new payment form
    - Filter by client, date range, payment method
    - Calculate and display payment totals
    - Show payment history per client

16. [ ] **Implement lesson management**
    - List all lessons with client names
    - Schedule/add new lesson form
    - View lessons by client
    - Track topics covered
    - Mark lessons as complete/incomplete

17. [ ] **Add search and filtering**
    - Search clients by name/email/phone
    - Filter payments by date range
    - Filter lessons by date/client
    - Add sorting to all tables

18. [ ] **Implement responsive design**
    - Mobile-friendly layout
    - Tablet optimization
    - Desktop full-width utilization
    - Test on multiple devices

19. [x] **Add lesson activity heatmap** ✅
    - Calendar-style heatmap visualization showing lesson frequency
    - Color intensity based on number of lessons per day/week
    - GitHub-style contribution graph design
    - Interactive: hover shows exact lesson count and date
    - Selectable time ranges: 3 months, 6 months, 1 year
    - Helps identify busy periods and teaching patterns
    - Acceptance: Visual heatmap displays on dashboard, shows accurate lesson activity data
    - **Implemented:** Added to Reports tab with GitHub-style green color scheme, interactive tooltips, and time range buttons

20. [ ] **Remove payments recorded field from front page**
    - Clean up dashboard/front page UI
    - Remove redundant "payments recorded" display element
    - Keep payment data accessible in dedicated payments section
    - Simplify information hierarchy on main view
    - Acceptance: Payments recorded field no longer visible on front page, still accessible in payments section

---

## Phase 4: Deployment & Testing

### 6. Deploy & Verify

21. [ ] **Deploy web interface**
    - Host on Netlify/Vercel/GitHub Pages
    - Configure environment variables
    - Test production deployment
    - Set up custom domain (optional)

22. [ ] **End-to-end testing & documentation**
    - Test all CRUD operations in production
    - Verify mobile functionality
    - Create user documentation in `docs/USAGE.md`
    - Document backup procedures
    - Create handoff documentation

---

## Success Criteria

✅ All three tables created with proper relationships
✅ All data migrated from Google Sheets
✅ Web interface allows full CRUD operations
✅ Mobile-responsive design
✅ Deployed and accessible online
✅ Documentation complete

---

## Notes

- Schema may need adjustment after reviewing actual Google Sheets structure
- Can start with basic UI and iterate based on user feedback
- Foreign keys ensure data integrity (can't delete clients with related payments/lessons)
- RLS provides security layer for future multi-user access
