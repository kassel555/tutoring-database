# Tutoring Database - Google Sheets to Supabase Migration

A complete migration solution for moving a computer tutoring business database from Google Sheets to Supabase with a custom web interface.

---

## 📋 Project Overview

**Current System:** 3 Google Sheets (Clients, Payments, Lessons)
**Target System:** Supabase PostgreSQL database + custom web interface

**Key Features:**
- ✅ Full CRUD operations for clients, payments, and lessons
- ✅ Relational database with foreign key constraints
- ✅ Mobile-responsive web interface
- ✅ Search and filtering capabilities
- ✅ Real-time data updates
- ✅ Row-Level Security (RLS) for data protection

---

## 🚀 Quick Start

### 1. Prerequisites
- Google account with access to tutoring Google Sheets
- Supabase account (free tier works)
- Web browser
- (Optional) Node.js for running migration scripts

### 2. Setup Steps

1. **Create Supabase Project**
   - Follow instructions in `docs/SETUP.md`
   - Save your API credentials

2. **Create Database Tables**
   - Copy SQL from `database/schema.sql`
   - Run in Supabase SQL Editor

3. **Export & Import Data**
   - Export Google Sheets as CSV
   - Import to Supabase via dashboard or migration script

4. **Configure Web Interface**
   - Edit `web/config.js` with your Supabase credentials
   - Open `web/index.html` in browser to test

5. **Deploy**
   - Upload `web/` folder to Netlify, Vercel, or GitHub Pages
   - Start using your new system!

---

## 📁 Project Structure

```
sheets-to-supabase/
├── README.md                 # This file
├── PRD.md                    # Product requirements & task checklist
├── DEVLOG.md                 # Development session logs
├── CHANGELOG.md              # User-facing changes
│
├── database/
│   ├── schema.sql            # Database table definitions
│   ├── migration-script.js   # (Optional) Data import script
│   └── exports/              # Place CSV exports here
│       ├── clients.csv
│       ├── payments.csv
│       └── lessons.csv
│
├── web/
│   ├── index.html            # Main web interface
│   ├── app.js                # Application logic
│   ├── styles.css            # Styling
│   └── config.js             # Supabase configuration
│
└── docs/
    ├── SETUP.md              # Detailed setup guide
    ├── SCHEMA.md             # Database schema documentation
    └── USAGE.md              # User guide (create after deployment)
```

---

## 🗄️ Database Schema

### Tables

1. **clients** - Client contact information
   - `id`, `name`, `email`, `phone`, `status`, `notes`, `created_at`, `updated_at`

2. **payments** - Payment records linked to clients
   - `id`, `client_id` (FK), `amount`, `payment_method`, `payment_date`, `check_number`, `notes`, `created_at`

3. **lessons** - Lesson/session records linked to clients
   - `id`, `client_id` (FK), `lesson_date`, `topic`, `duration_minutes`, `notes`, `completed`, `created_at`

**Relationships:**
- One client can have many payments (1:N)
- One client can have many lessons (1:N)
- Cascading deletes: Removing a client removes their payments and lessons

See `docs/SCHEMA.md` for detailed schema documentation.

---

## 💻 Web Interface Features

### Clients Tab
- View all clients with payment/lesson summaries
- Add, edit, delete clients
- Search by name, email, or phone
- Filter by status (active/inactive)

### Payments Tab
- View all payments with client names
- Add new payments (Interac, Check, Cash)
- Filter by client, method, date range
- View payment totals and monthly summaries

### Lessons Tab
- View all lessons with client names
- Schedule/add new lessons
- Track topics and duration
- Filter by client, status (completed/scheduled), date range

---

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- Currently configured for development (anon access allowed)
- **Before production:** Remove anon policies and require authentication
- See `database/schema.sql` for RLS policy examples

---

## 📱 Mobile Support

The web interface is fully responsive:
- ✅ Mobile-friendly forms
- ✅ Touch-optimized buttons
- ✅ Horizontal scroll for tables on small screens
- ✅ Optimized for phones, tablets, and desktops

---

## 🔄 Data Migration

### Option A: Dashboard Import (Easiest)
1. Export Google Sheets as CSV
2. Use Supabase Table Editor → Import CSV
3. Verify data imported correctly

### Option B: Migration Script (More Control)
1. Place CSV files in `database/exports/`
2. Run migration script (create if needed)
3. Handle any data transformations
4. Verify import success

See `docs/SETUP.md` for detailed migration instructions.

---

## 🚀 Deployment Options

### Netlify (Recommended)
```bash
# Drag and drop web/ folder to Netlify dashboard
# Or use CLI:
npm install -g netlify-cli
cd web
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
cd web
vercel --prod
```

### GitHub Pages
```bash
# Push to GitHub repository
# Enable Pages in repo settings → select main branch → /web folder
```

---

## 📊 Next Steps After Deployment

1. **Remove Development RLS Policies**
   - Drop anon access policies
   - Require authentication for all operations

2. **Add Authentication**
   - Use Supabase Auth for login
   - Implement role-based access (admin vs viewer)

3. **Enhanced Features**
   - Export data to CSV/PDF
   - Email receipts/invoices
   - Reporting and analytics
   - Lesson package management
   - Automated reminders

4. **Backup Strategy**
   - Set up automated backups
   - Document restore procedures
   - Consider external backup storage

---

## 🛠️ Tech Stack

- **Database:** Supabase (PostgreSQL)
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Hosting:** Netlify / Vercel / GitHub Pages
- **Libraries:** Supabase JS Client (loaded from CDN)

---

## 📝 Documentation

- `docs/SETUP.md` - Complete setup instructions
- `docs/SCHEMA.md` - Database schema details
- `PRD.md` - Project requirements and task list
- `DEVLOG.md` - Development session notes

---

## 🐛 Troubleshooting

**Problem:** Can't connect to Supabase
- **Solution:** Verify credentials in `web/config.js` match Supabase dashboard

**Problem:** Data not showing in web interface
- **Solution:** Check browser console for errors. Verify RLS policies allow access.

**Problem:** Import fails with foreign key errors
- **Solution:** Import clients first, then payments/lessons. Ensure client_id values exist.

See `docs/SETUP.md` for more troubleshooting tips.

---

## 📄 License

This project is for internal use. Modify as needed for your tutoring business.

---

## ✨ Credits

Built with Claude Code
Database powered by Supabase
