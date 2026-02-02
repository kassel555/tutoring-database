# Changelog - Sheets-to-Supabase Migration

All user-facing changes to the tutoring database system.

---

## [Unreleased]

### Added
- **Live web application deployed on Netlify** - Accessible from anywhere with internet connection
- **All historical data migrated** - 53 clients, 123 payments, 857 lessons imported from Google Sheets
- **Lesson activity heatmap** - Visual GitHub-style calendar showing teaching patterns and busy periods
- **Cloud database** - Supabase PostgreSQL backend with real-time sync capabilities
- **Automatic deployment** - Push to GitHub automatically updates live site

### Changed
- Migrated from local development to production cloud infrastructure
- Database now hosted on cloud Supabase for public accessibility

### Fixed
- Data import handling for duplicate UIDs (deduplication)
- Invalid date format validation during CSV import
- Missing teacher fields (defaults to "Rahul")

---

## Release Notes Format

When features are complete and deployed, they'll be documented here with version numbers and dates.
