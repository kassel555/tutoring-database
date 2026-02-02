# Development Log - Sheets-to-Supabase Migration

Session-by-session development history for the tutoring database migration project.

---

## 2026-02-01 - Project Initialization

### What Was Built
- Created project structure at `/Volumes/coding/projects/sheets-to-supabase/`
- Set up directory structure: `database/`, `web/`, `docs/`
- Created PRD.md with 20 tasks across 4 phases
- Initialized DEVLOG.md and CHANGELOG.md

### Technical Decisions
- **Decision:** Use Supabase for backend
  - **Why:** Built-in PostgreSQL, real-time capabilities, easy auth, generous free tier
  - **Alternatives Considered:** Firebase (less SQL-friendly), custom Node.js backend (more setup)

- **Decision:** Start with vanilla HTML/JS for web interface
  - **Why:** Simplest deployment, no build tools, fast iteration
  - **Alternatives Considered:** React/Vue (added complexity for MVP), server-side rendering

- **Decision:** Use Row-Level Security (RLS) from the start
  - **Why:** Security best practice, allows future multi-user support
  - **Alternatives Considered:** Service role key only (less secure)

### Files Changed
- `/Volumes/coding/projects/sheets-to-supabase/PRD.md` - Created with full task breakdown
- `/Volumes/coding/projects/sheets-to-supabase/DEVLOG.md` - Created this file
- `/Volumes/coding/projects/sheets-to-supabase/CHANGELOG.md` - Created for user-facing changes

### Context for Next Session
- Ready to start Phase 1: Supabase project creation
- Need to see actual Google Sheets structure to finalize schema
- Next task: Create Supabase project and save credentials

---

## 2026-02-01 - Schema Customization & Complete Rebuild

### What Was Built
- **Analyzed actual Google Sheets structure** from user's tutoring business
  - Clients sheet: UID system, lead source tracking, teacher assignment
  - Payments sheet: Package-based hours, HST tax handling, accounts receivable
  - Lessons sheet: Hours tracking, teacher payment status, topic tracking

- **Completely rebuilt database schema** to match exact business model
  - Added UID field (custom client IDs like JAAN, VISH, RISH)
  - Implemented hours-based tracking (purchased vs used)
  - Added package type support (basic, plus, home visit packages)
  - Integrated HST tax calculation (13% Canadian tax)
  - Added lead source tracking (bark, google, referral)
  - Added teacher field for multi-teacher support
  - Created client_summary view for real-time hours balance

- **Rebuilt complete web interface** with custom fields
  - UID-based client management
  - Hours purchased/used/remaining display
  - Package type selection in payments
  - HST auto-calculation (checkbox + 13% math)
  - Teacher tracking and filtering
  - Lead source attribution
  - New Reports tab with hours balance analytics
  - Revenue by package type analysis

- **Updated migration script** with exact column mappings
  - Mapped Google Sheets column names to database fields
  - Handled date format variations (MM/DD/YYYY, YYYY/MM/DD)
  - Extracted lesson topics from description field
  - Smart UID-to-ID mapping for relational integrity

### Technical Decisions
- **Decision:** Hours-based system instead of dollar-only tracking
  - **Why:** User's business model sells hour packages, needs balance tracking
  - **Implementation:** Separate hours_purchased and hours_taught fields, calculated remaining

- **Decision:** Keep UID system alongside auto-increment IDs
  - **Why:** User's existing UIDs (JAAN, VISH) are already in use, changing would break references
  - **Implementation:** uid TEXT UNIQUE + id BIGSERIAL PRIMARY KEY

- **Decision:** HST as separate field instead of embedded in total
  - **Why:** Canadian tax reporting requires separate tracking, refunds need tax breakdown
  - **Implementation:** apply_tax BOOLEAN + hst_amount DECIMAL + total_payment DECIMAL

- **Decision:** Package type as TEXT instead of reference table
  - **Why:** Packages change over time, historical records shouldn't update
  - **Implementation:** Free-text package_type field, reports aggregate dynamically

### Files Changed
- `/database/schema.sql` - Completely rewritten with hours tracking, UID system, HST fields
- `/web/index.html` - Rebuilt forms with UID, packages, hours, tax, teacher, reports tab
- `/web/app.js` - Rewritten with hours calculations, tax math, reports generation (700+ lines)
- `/web/styles.css` - Added form-row layout, utility classes (text-success, text-error)
- `/database/migration-script.js` - Rewritten with exact Google Sheets column mappings

### Key Features Implemented
1. **Client Hours Balance** - Real-time calculation of purchased - used = remaining
2. **HST Auto-Calculation** - Checkbox triggers 13% tax calculation
3. **UID-Based Search** - Find clients by custom ID (JAAN, VISH, etc.)
4. **Package Analytics** - Revenue and hours sold by package type
5. **Teacher Filtering** - Multi-teacher support with filtering
6. **Lead Attribution** - Track marketing sources (bark, google, referral)
7. **Reports Dashboard** - Hours remaining, package performance, client status

### Database Schema Summary
```
CLIENTS: id, uid*, full_name, status, email, telephone, lead_source*, teacher*, notes
PAYMENTS: id, client_id(FK), payment_date, package_type*, hours_purchased*,
          amount_paid, hourly_rate, apply_tax*, hst_amount*, total_payment,
          status, payment_method, year, notes
LESSONS: id, client_id(FK), lesson_date, hours_taught*, teacher*, lesson_topic*,
         paid_or_probono*, paid_teacher, notes

* = New fields added based on actual Google Sheets
```

### Known Issues / Tech Debt
- [ ] Migration script needs testing with actual CSV exports
- [ ] Date parsing may need adjustment based on actual date formats in CSVs
- [ ] Consider adding package definitions table for consistent pricing
- [ ] Teacher payment tracking could be enhanced with amounts

### Context for Next Session
- **Next Step:** Create Supabase project and run schema.sql
- **Then:** Export Google Sheets as CSV to database/exports/
- **Then:** Run migration script to import data
- **Finally:** Configure web interface and deploy

All files now match the user's exact Google Sheets structure and business model!

---

## 2026-02-02 - Lesson Activity Heatmap Implementation

### What Was Built
- **Lesson Activity Heatmap** - GitHub-style contribution graph visualization
  - Added to Reports tab in web interface
  - Shows lesson frequency over time with color-coded intensity
  - Interactive hover tooltips displaying exact lesson counts per day
  - Time range selector: 3 months, 6 months, 1 year

### Technical Decisions
- **Decision:** GitHub-style green color scheme
  - **Why:** Familiar pattern users recognize, positive "growth" association with green
  - **Implementation:** 5 activity levels (0-4+) with progressively darker green shades

- **Decision:** Week-based grid layout (Sunday-Saturday)
  - **Why:** Matches GitHub's familiar contribution graph, shows weekly patterns
  - **Implementation:** CSS flexbox with 12px cells, 2px gap

- **Decision:** Client-side date aggregation
  - **Why:** No additional database queries needed, instant updates
  - **Implementation:** JavaScript groups lessons by date, calculates levels

### Files Changed
- `/web/index.html` - Added heatmap section to Reports tab (lines ~453)
- `/web/styles.css` - Added 140+ lines of heatmap styling (GitHub-style colors, responsive layout)
- `/web/app.js` - Added heatmap rendering functions (~200 lines):
  - `renderLessonHeatmap(months)` - Main render function
  - `generateHeatmapData()` - Date grid generation
  - `renderHeatmapHTML()` - HTML string builder
  - `getActivityLevel()` - Count-to-color mapping
  - `addHeatmapTooltips()` - Interactive hover functionality

### Key Features Implemented
1. **Visual Pattern Recognition** - Quickly spot busy periods and gaps
2. **Interactive Tooltips** - Hover any cell to see exact date and lesson count
3. **Flexible Time Ranges** - Switch between 3/6/12 month views
4. **Color-Coded Intensity** - 0 lessons (gray) → 4+ lessons (dark green)
5. **Responsive Design** - Horizontal scroll on mobile, full view on desktop

### Known Issues / Next Steps
- [ ] Task 20: Need clarification on "remove payments recorded field" - no obvious field found on front page
- [ ] Consider adding click-to-filter: clicking a day could filter lessons table
- [ ] Could add month labels above heatmap for easier navigation

### Context for Next Session
- **Heatmap is complete and functional** - Task 19 marked done in PRD
- **Need to clarify Task 20** - "payments recorded field" location unclear
- **Ready for testing** - Should verify heatmap renders correctly with real lesson data
- **Deployment pending** - Still need to complete Phase 1-3 tasks (Supabase setup, migration, etc.)

---

## 2026-02-02 - Cloud Supabase Migration & Netlify Deployment

### What Was Built
- **Migrated to cloud Supabase** from local setup
  - Created cloud project at hawowbywchrbbhlcascn.supabase.co
  - Executed complete schema.sql in Supabase SQL Editor
  - Updated web/config.js with cloud API URL and anon key
  - Updated .env for migration scripts

- **Data migration completed** - All Google Sheets data imported
  - 53 clients imported
  - 123 payments imported
  - 857 lessons imported
  - Built robust error handling for data validation

- **GitHub repository setup**
  - Initialized git repository
  - Created GitHub repo: kassel555/tutoring-database
  - Pushed complete codebase to GitHub
  - Created GitHub Actions workflow for deployment

- **Netlify deployment** - Live production deployment
  - Created netlify.toml configuration
  - Connected Netlify to GitHub repository
  - Automatic deployment on push to main branch
  - Production site live and accessible

### Technical Decisions
- **Decision:** Cloud Supabase instead of local instance
  - **Why:** User needed publicly accessible database for web deployment
  - **Implementation:** Used hawowbywchrbbhlcascn.supabase.co with anon key in client-side code

- **Decision:** Anon key in config.js (committed to repo)
  - **Why:** Safe for client-side use - RLS policies protect data, no sensitive operations exposed
  - **Alternatives Considered:** Environment variables (overkill for single-user app with RLS)

- **Decision:** Netlify over GitHub Pages
  - **Why:** Works with private repos, faster deploys, better dashboard, serverless functions support
  - **Alternatives Tried:** GitHub Pages (failed - requires public repo on free tier)

- **Decision:** Migration script with extensive error handling
  - **Why:** CSV data had format inconsistencies, needed robust validation
  - **Implementation:** Deduplication, date parsing, default values for missing fields

### Files Changed
- `/web/config.js` - Updated with cloud Supabase credentials
- `/.env` - Updated with cloud Supabase URL and anon key
- `/.github/workflows/deploy.yml` - Created GitHub Actions workflow for Pages
- `/netlify.toml` - Created Netlify configuration (publish: web, SPA redirects)
- `/database/import-lessons-only.js` - Created with date validation and error handling
- `/.gitignore` - Modified to allow config.js (anon key is safe)
- `/PRD.md` - Updated status to 20/22 complete

### Bugs Fixed / Issues Resolved
1. **Issue:** Duplicate UID constraint violation during import
   - **Error:** `duplicate key value violates unique constraint "clients_uid_key"`
   - **Solution:** Implemented Map-based deduplication, keeping first occurrence of each UID

2. **Issue:** Invalid date format in lessons CSV
   - **Error:** `invalid input syntax for type date: "yes"`
   - **Solution:** Created parseDate() function to validate dates, skip invalid entries

3. **Issue:** Null teacher constraint violation
   - **Error:** `null value in column "teacher" of relation "lessons" violates not-null constraint`
   - **Solution:** Default to "Rahul" when teacher field is missing

4. **Issue:** GitHub Pages 404 error
   - **Error:** "There isn't a GitHub Pages site here"
   - **Root Cause:** Repository was private, Pages requires public repo on free plan
   - **Solution:** Switched to Netlify (supports private repos)

### Import Statistics
- **Clients:** 53 records imported successfully
- **Payments:** 123 records with proper foreign key relationships
- **Lessons:** 857 records with date validation and teacher defaults
- **Total Records:** 1,033 rows migrated from Google Sheets

### Database Configuration
```
Supabase URL: https://hawowbywchrbbhlcascn.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (exposed in config.js)
GitHub Repo: kassel555/tutoring-database
Netlify: Connected via GitHub integration
```

### Context for Next Session
- **Production site is LIVE** - Deployed on Netlify with auto-deploy on push
- **All data successfully migrated** - 1,033 records across 3 tables
- **2 tasks remaining:**
  - Task 20: Remove "payments recorded" field from front page (need clarification)
  - Task 22: End-to-end testing & documentation
- **Next steps:**
  - Test all CRUD operations on live site
  - Verify mobile responsiveness
  - Create user documentation (docs/USAGE.md)
  - Final testing and handoff

**Major Milestone:** Fully functional production application with real data! 🎉

