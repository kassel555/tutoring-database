# Changelog - Sheets-to-Supabase Migration

All user-facing changes to the tutoring database system.

---

## [Unreleased]

### Added
- **User authentication** - Secure login with email/password for each team member
  - Individual accounts with password reset capability
  - Sign-out button in header
  - Protected access - must log in to view data
- **MacBryte branding** - Official company colors, fonts, and logo
  - Orange/rust primary color (#C55F44)
  - Purple and gold accent colors
  - Bold Outfit font for headings
  - Official macbryte logo (large, prominent)
- **Enhanced Clients view** - Contact-focused table with new columns
  - Telephone # column
  - Email column
  - Address column (form ready, database pending)
  - Referred By column (tracks lead source)
  - Full Name now shows "(student)" label
- **Centered page title** - "Activity Logs" prominently displayed in header
- **Live web application deployed on Netlify** - Accessible from anywhere with internet connection
- **All historical data migrated** - 53 clients, 123 payments, 857 lessons imported from Google Sheets
- **Lesson activity heatmap** - Visual GitHub-style calendar showing teaching patterns and busy periods
- **Cloud database** - Supabase PostgreSQL backend with real-time sync capabilities
- **Automatic deployment** - Push to GitHub automatically updates live site

### Changed
- **Login required** - All pages now require authentication (no anonymous access)
- **Client table simplified** - Removed Hours Purchased/Used/Remaining columns (data still tracked in Reports)
- **Branding refresh** - Changed from generic blue to MacBryte orange/purple color scheme
- **Logo size** - Increased 4x for stronger brand presence
- **Text styling** - All "macbryte" references now lowercase (brand consistency)
- Migrated from local development to production cloud infrastructure
- Database now hosted on cloud Supabase for public accessibility

### Fixed
- Data import handling for duplicate UIDs (deduplication)
- Invalid date format validation during CSV import
- Missing teacher fields (defaults to "Rahul")

### Security
- **Database protection** - Row-level security requires login for all data access
- **Individual user accounts** - Each team member has their own credentials
- **Password reset** - Users can reset forgotten passwords via email

---

## Release Notes Format

When features are complete and deployed, they'll be documented here with version numbers and dates.
