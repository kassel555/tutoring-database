# Cloud Supabase Setup Guide

Complete guide to moving your tutoring database to cloud Supabase.

---

## ✅ Why Cloud Supabase?

- **Access from anywhere** - No localhost issues
- **Always available** - No need to run Docker locally
- **Automatic backups** - Your data is safe
- **Free tier** - 500MB database, perfect for this project

---

## 📋 Step-by-Step Setup

### Step 1: Create Cloud Supabase Project (5 minutes)

1. **Go to:** https://supabase.com/dashboard

2. **Sign up / Log in**
   - Use email or GitHub
   - Free account is perfect!

3. **Create new project**
   - Click "New Project" button
   - **Name:** `tutoring-database`
   - **Database Password:** Choose strong password (save it!)
   - **Region:** Select closest to you:
     - 🇺🇸 West US (Oregon)
     - 🇺🇸 East US (North Virginia)
     - 🇨🇦 Canada (Central)
   - **Plan:** Free

4. **Click "Create new project"**
   - Wait ~2 minutes for initialization
   - Don't close the tab!

### Step 2: Get Your Credentials (1 minute)

Once project is ready:

1. Go to: **Settings** (gear icon) → **API**

2. **Copy these TWO values:**

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJI... (very long string)
   ```

3. **Save them somewhere safe** (Notes app, password manager)

### Step 3: Run Setup Script (1 minute)

Open Terminal and run:

```bash
cd /Volumes/coding/projects/sheets-to-supabase
./setup-cloud-supabase.sh
```

When prompted:
- **Paste your Project URL** → Press Enter
- **Paste your anon key** → Press Enter

✅ Configuration files updated!

### Step 4: Create Database Tables (2 minutes)

1. **In Supabase Dashboard:**
   - Click **SQL Editor** (left sidebar)
   - Click **+ New query**

2. **Copy the schema:**
   ```bash
   cat database/schema.sql | pbcopy
   ```
   *(Schema is already in your clipboard!)*

3. **In SQL Editor:**
   - **Paste** the schema (Cmd+V)
   - **Click "Run"** button (or F5)
   - Wait for "Success" message

4. **Verify tables created:**
   - Click **Table Editor** (left sidebar)
   - You should see: `clients`, `payments`, `lessons`

### Step 5: Deploy to Server (Optional)

If you want to run this on your Mac Mini server:

```bash
# Copy updated config to server
scp web/config.js taly@server-macmini.localdomain:/Users/taly/tutoring-database/web/

# Copy schema (if needed)
scp database/schema.sql taly@server-macmini.localdomain:/Users/taly/tutoring-database/database/
```

### Step 6: Test It! (1 minute)

**Local testing:**
```bash
open web/index.html
```

**Server testing:**
- Go to: `http://server-macmini.localdomain:3000`
- You should see the interface load
- **No more "Loading clients..." stuck!**

---

## 🎉 You're Done!

Your tutoring database is now:
- ✅ Running on cloud Supabase
- ✅ Accessible from anywhere
- ✅ Automatically backed up
- ✅ Using professional infrastructure

---

## 📊 Next Steps

1. **Add your first client** - Test the "Add Client" button
2. **Import existing data** - Use the migration script (see below)
3. **Explore reports** - Check the Reports tab

---

## 📁 Importing Existing Data

If you have data in Google Sheets:

1. **Export each sheet as CSV:**
   - File → Download → CSV
   - Save as: `clients.csv`, `payments.csv`, `lessons.csv`

2. **Place in exports folder:**
   ```bash
   mv ~/Downloads/*.csv database/exports/
   ```

3. **Run migration:**
   ```bash
   ./migrate.sh
   ```

---

## 🔐 Security Notes

- ✅ Your `anon` key is safe to use in frontend code
- ✅ Row Level Security (RLS) is enabled
- ✅ Anon users can read/write (perfect for single-user app)
- ⚠️  For production: add authentication and restrict RLS policies

---

## 🆘 Troubleshooting

### "Loading clients..." stuck

**Check:**
1. Browser console (F12) for errors
2. Supabase Project URL is correct in `web/config.js`
3. Tables exist in Supabase (Table Editor)

### "Network Error"

**Fix:**
- Check internet connection
- Verify Supabase project is still active
- Try hard refresh: Cmd+Shift+R

### Can't see data

**Fix:**
1. Check RLS policies are enabled (they should be)
2. Verify data exists: Supabase → Table Editor
3. Check browser console for errors

---

## 📚 Useful Supabase Links

- **Dashboard:** https://supabase.com/dashboard
- **Documentation:** https://supabase.com/docs
- **Table Editor:** View/edit data directly
- **SQL Editor:** Run queries
- **API Docs:** Auto-generated API documentation

---

**Questions?** Check the Supabase docs or ask for help!
