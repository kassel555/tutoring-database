# Quick Start Guide - 10 Minutes to Live System

This guide gets you from zero to a working system in ~10 minutes.

---

## Prerequisites

✅ Google Chrome or Firefox
✅ Your Google Sheets with tutoring data
✅ Terminal access

---

## 🚀 Automated Setup (Recommended)

### Step 1: Run Setup Script (1 minute)

```bash
cd /Volumes/coding/projects/sheets-to-supabase
chmod +x setup.sh migrate.sh
./setup.sh
```

This installs dependencies and creates configuration files.

---

### Step 2: Create Supabase Project (3 minutes)

1. **Go to** https://supabase.com
2. **Click** "New Project"
3. **Fill in:**
   - Name: `tutoring-database`
   - Database Password: [Choose strong password]
   - Region: [Closest to you]
4. **Wait** ~2 minutes for project to initialize
5. **Copy credentials:**
   - Go to Settings → API
   - Copy `Project URL`
   - Copy `anon public` key
   - Copy `service_role` key (secret!)

---

### Step 3: Configure Credentials (1 minute)

```bash
nano .env
```

**Replace placeholders with your credentials:**

```
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbG...  # Paste anon key
SUPABASE_SERVICE_KEY=eyJhbG...  # Paste service_role key
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 4: Create Database Tables (2 minutes)

1. **Open Supabase SQL Editor:**
   - https://supabase.com → Your Project → SQL Editor

2. **Copy schema:**
   ```bash
   cat database/schema.sql | pbcopy
   ```

3. **In Supabase:**
   - Paste the SQL
   - Click "Run" (or `Cmd+Enter`)
   - Wait for "Success" message

4. **Verify:**
   - Go to Table Editor
   - Should see: `clients`, `payments`, `lessons` tables

---

### Step 5: Export Google Sheets (2 minutes)

For **each** of your 3 sheets:

1. **Open sheet** in Google Sheets
2. **File → Download → Comma Separated Values (.csv)**
3. **Rename and move:**
   ```bash
   # Rename downloaded files to:
   mv ~/Downloads/[Sheet1].csv database/exports/clients.csv
   mv ~/Downloads/[Sheet2].csv database/exports/payments.csv
   mv ~/Downloads/[Sheet3].csv database/exports/lessons.csv
   ```

---

### Step 6: Run Migration (1 minute)

```bash
./migrate.sh
```

Follow prompts:
- Type `yes` when asked to confirm
- Wait for "Migration complete!" message

---

### Step 7: Test Locally (30 seconds)

```bash
open web/index.html
```

You should see:
- ✅ All your clients listed
- ✅ Hours balance calculated
- ✅ Payments and lessons imported

---

## 🎉 Done! Your System is Live Locally

---

## Optional: Deploy to Internet

### Option 1: Netlify (Easiest - 2 minutes)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd web
netlify deploy --prod
```

Follow prompts → Done! You'll get a live URL.

---

### Option 2: Drag & Drop (No code - 1 minute)

1. Go to https://netlify.com/drop
2. Drag `web/` folder onto the page
3. Done! Copy your live URL

---

## 📊 What You Now Have

✅ **Secure cloud database** (Supabase)
✅ **All your data migrated** (clients, payments, lessons)
✅ **Hours balance tracking** (purchased - used = remaining)
✅ **Web interface** (works on phone, tablet, desktop)
✅ **HST calculation** (automatic 13% tax)
✅ **Reports** (hours analysis, package performance)
✅ **Multi-teacher support** (track who teaches what)

---

## 🆘 Troubleshooting

### "Schema.sql failed to run"
- Make sure you copied the ENTIRE file
- Check for error message in Supabase
- Verify project is fully initialized (wait 2 mins)

### "Migration script can't find clients"
- Check CSV files are in `database/exports/`
- Make sure files are named exactly: `clients.csv`, `payments.csv`, `lessons.csv`
- Check files have data (not empty)

### "Web interface shows no data"
- Open browser console (F12)
- Check for errors
- Verify `web/config.js` has correct Supabase URL

### "HST calculation not working"
- Make sure you're using a modern browser (Chrome, Firefox, Safari)
- Try hard refresh: `Cmd+Shift+R`

---

## 📞 Need Help?

- Check logs in terminal
- Verify credentials in `.env`
- Read `docs/SETUP.md` for detailed steps
- Check Supabase dashboard for errors

---

## 🎯 Next Steps

1. **Backup your CSV files** (keep them safe!)
2. **Invite your team** (if applicable)
3. **Customize package types** (edit payment form options)
4. **Set up authentication** (when ready for production)
5. **Remove anon RLS policies** (see database/schema.sql comments)

---

**Estimated Total Time:** 10-15 minutes
**Result:** Fully functional tutoring management system!
