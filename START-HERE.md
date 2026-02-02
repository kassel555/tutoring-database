# START HERE - Simple 4-Step Setup

Copy and paste these commands one at a time. That's it!

---

## Step 1: Create Supabase Account (Manual - 3 min)

**Browser → https://supabase.com**

1. Click "New Project"
2. Name: `tutoring-database`
3. Password: [choose one]
4. Region: [closest to you]
5. Click "Create"
6. **Wait 2 minutes** for project to initialize

**Then copy 3 things:**
- Settings → API → Project URL
- Settings → API → `anon public` key
- Settings → API → `service_role` key

---

## Step 2: Add Credentials (30 seconds)

```bash
cd /Volumes/coding/projects/sheets-to-supabase
nano .env
```

**Paste your credentials** (replace the placeholders):
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 3: Create Database Tables (Manual - 2 min)

**Browser → https://supabase.com → Your Project → SQL Editor**

**Copy the schema:**
```bash
cat database/schema.sql | pbcopy
```

**In Supabase SQL Editor:**
- Paste the SQL
- Click "Run"
- Wait for "Success"

---

## Step 4: Export & Migrate Your Data (3 min)

**A. Export from Google Sheets:**

For each of your 3 sheets:
- File → Download → CSV
- Move to the right folder:

```bash
# Replace [filename] with actual downloaded file name
mv ~/Downloads/[Sheet-1].csv database/exports/clients.csv
mv ~/Downloads/[Sheet-2].csv database/exports/payments.csv
mv ~/Downloads/[Sheet-3].csv database/exports/lessons.csv
```

**B. Run automated migration:**

```bash
./migrate.sh
```

Type `yes` when prompted.

---

## Step 5: Test It! (10 seconds)

```bash
open web/index.html
```

**You should see:**
- ✅ All your clients
- ✅ Hours calculated
- ✅ Payments & lessons imported

---

## 🎉 DONE!

**Total time:** ~10 minutes
**Manual steps:** Only 4!
**Everything else:** Automated!

---

## Optional: Put It Online (2 min)

**Easiest way:**
```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Deploy (any time)
cd web
netlify deploy --prod
```

Done! You get a live URL.

---

## Need Help?

Run: `cat QUICKSTART.md` for detailed guide
