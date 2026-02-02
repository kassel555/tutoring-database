# Setup Guide - Sheets-to-Supabase Migration

This guide walks through setting up the Supabase database and web interface.

---

## Prerequisites

- Google account with access to the tutoring Google Sheets
- Web browser
- Text editor (for editing config files)

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with your GitHub/Google account
3. Click "New Project"
4. Fill in the details:
   - **Name:** `tutoring-database`
   - **Database Password:** [Choose a strong password and save it securely]
   - **Region:** Choose closest to your location (e.g., US West)
   - **Pricing Plan:** Free tier is sufficient to start
5. Click "Create new project" (takes ~2 minutes)

---

## Step 2: Save Connection Details

Once the project is created, go to **Settings → API** and save these values:

```
Project URL: https://[your-project-ref].supabase.co
API Key (anon/public): eyJhbG... [long key]
API Key (service_role): eyJhbG... [long key - KEEP SECRET]
```

⚠️ **Important:** The service_role key has full database access. Never commit it to git or share publicly.

---

## Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" or press `Cmd/Ctrl + Enter`
6. You should see: "Success. No rows returned"

**Verify tables were created:**
- Go to **Table Editor** in the sidebar
- You should see three tables: `clients`, `payments`, `lessons`

---

## Step 4: Export Google Sheets Data

1. Open your Google Sheets tutoring database
2. For each sheet (Clients, Payments, Lessons):
   - Click **File → Download → Comma Separated Values (.csv)**
   - Save to `database/exports/` folder
   - Rename files to: `clients.csv`, `payments.csv`, `lessons.csv`

---

## Step 5: Import Data to Supabase

**Option A: Using Supabase Dashboard (Easiest)**

1. In Supabase, go to **Table Editor**
2. Select the `clients` table
3. Click "Insert → Import data from CSV"
4. Upload `database/exports/clients.csv`
5. Map columns correctly (should auto-detect)
6. Click "Import"
7. Repeat for `payments` and `lessons` tables

**Option B: Using Migration Script (More Control)**

1. Create a migration script (Node.js or Python)
2. Parse CSV files
3. Insert data via Supabase API
4. Handle any data transformations needed

---

## Step 6: Configure Web Interface

1. Open `web/config.js`
2. Replace placeholders with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://[your-project-ref].supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbG...'; // Your anon key
```

3. Save the file

---

## Step 7: Test Locally

1. Open `web/index.html` in your browser
2. You should see the interface load
3. Test basic operations:
   - View clients list
   - Add a test client
   - Add a test payment
   - Add a test lesson

---

## Step 8: Deploy Web Interface

**Option A: Netlify (Recommended)**

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop the `web/` folder
3. Site will be live at `https://[random-name].netlify.app`
4. Optional: Configure custom domain

**Option B: Vercel**

1. Create account at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload the `web/` folder
4. Deploy

**Option C: GitHub Pages**

1. Create a GitHub repository
2. Push the `web/` folder
3. Enable GitHub Pages in repo settings
4. Site will be at `https://[username].github.io/[repo-name]`

---

## Step 9: Verify Everything Works

**Database Checks:**
- [ ] All three tables exist
- [ ] Data imported successfully
- [ ] Row counts match original Google Sheets
- [ ] Foreign keys working (can't delete client with payments/lessons)

**Web Interface Checks:**
- [ ] Can view all clients
- [ ] Can add/edit/delete clients
- [ ] Payments show client names (relational data works)
- [ ] Lessons show client names
- [ ] Search and filtering work
- [ ] Mobile responsive

---

## Backup & Maintenance

**Daily Backups:**
Supabase automatically backs up your database daily on the free tier.

**Manual Backup:**
1. Go to **Database → Backups** in Supabase
2. Click "Download backup"

**Exporting Data:**
Use the SQL Editor to export data as needed:
```sql
COPY clients TO STDOUT WITH CSV HEADER;
COPY payments TO STDOUT WITH CSV HEADER;
COPY lessons TO STDOUT WITH CSV HEADER;
```

---

## Troubleshooting

**Problem:** Tables not created
- **Solution:** Check SQL Editor for errors. Make sure you copied the entire schema.sql file.

**Problem:** Can't see data in web interface
- **Solution:** Check browser console for errors. Verify config.js has correct credentials.

**Problem:** RLS blocking access
- **Solution:** Verify RLS policies are created. Check if using correct API key (anon key for now).

**Problem:** Foreign key errors during import
- **Solution:** Import clients first, then payments and lessons. Ensure client_id values match.

---

## Next Steps

- Remove anon access RLS policies and implement proper authentication
- Add user roles (admin, viewer, etc.)
- Implement data export functionality
- Add reporting/analytics features
- Set up automated backups to external storage

---

## Support

For Supabase issues: [https://supabase.com/docs](https://supabase.com/docs)
For this project: Check DEVLOG.md for development notes
