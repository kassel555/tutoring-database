# Authentication Setup Guide

## ✅ What's Been Done (Code Changes)

1. **Created login.html** - Beautiful login page with email/password form
2. **Created login.js** - Handles authentication logic and password reset
3. **Updated app.js** - Added auth check, redirects, and user display
4. **Updated styles.css** - Added login page styling and user info styling
5. **Updated netlify.toml** - Configured for SPA routing

## 🔧 Next Steps: Enable Auth in Supabase Dashboard

### Step 1: Enable Email Authentication (2 minutes)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** (left sidebar)
3. Find **Email** provider and click to configure
4. Toggle **Enable Email Provider** to ON
5. Settings to configure:
   - ✅ **Enable sign ups** - Turn ON
   - ⚠️ **Confirm email** - Turn OFF (for faster setup, you can enable later)
   - **Site URL**: Set to `https://tutoring-mb.netlify.app`
6. Click **Save**

### Step 2: Update Database RLS Policies (5 minutes)

Your database already has policies for authenticated users! Just need to remove anonymous access.

1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL to remove anonymous access:

```sql
-- Remove anonymous access (force authentication)
DROP POLICY IF EXISTS "Allow anon users full access to clients" ON clients;
DROP POLICY IF EXISTS "Allow anon users full access to payments" ON payments;
DROP POLICY IF EXISTS "Allow anon users full access to lessons" ON lessons;
```

3. Click **Run** to execute

**Result:**
- ✅ Authenticated users have FULL access (existing policies)
- ❌ Anonymous users have NO access (login required)

### Step 3: Create User Accounts (5 minutes)

1. Go to **Authentication** → **Users** (left sidebar)
2. Click **Add user** button (top right)
3. Create accounts for:
   - **Your email** (admin)
   - **1-2 other users** (team members)
4. For each user:
   - Enter **Email address**
   - Set **Password** (or let Supabase generate one)
   - Toggle **Auto Confirm User** to ON (skip email verification)
5. Click **Create user**

**Save these credentials securely** - you'll need them to log in!

### Step 4: Test Locally (Optional, 5 minutes)

Before deploying, test authentication locally:

```bash
cd /Volumes/coding/projects/sheets-to-supabase/web
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser:
- ✅ Should redirect to login.html
- ✅ Try logging in with created user credentials
- ✅ Should redirect to index.html and load data
- ✅ User email should appear in header
- ✅ Click "Sign Out" to test logout

### Step 5: Deploy to Netlify (2 minutes)

```bash
cd /Volumes/coding/projects/sheets-to-supabase
git add .
git commit -m "Add Supabase Auth with email/password login"
git push
```

Netlify will automatically deploy the changes.

### Step 6: Test Production (5 minutes)

1. Open https://tutoring-mb.netlify.app in **incognito/private window**
2. Should see login page
3. Test with created user account:
   - Enter email and password
   - Should redirect to main app
   - Should load clients/payments/lessons
   - User email should appear in header
4. Test CRUD operations (add/edit client, payment, lesson)
5. Click "Sign Out" - should return to login page
6. Try accessing index.html directly while logged out - should redirect to login

---

## 🔐 Security Notes

### What You Get:
- ✅ Individual email/password accounts for each user
- ✅ Each user has their own credentials
- ✅ Password reset capability (via email link)
- ✅ Can track who's logged in (Supabase dashboard)
- ✅ Can revoke individual user access (delete user)
- ✅ Protected by Supabase Row Level Security (RLS)

### Current Permissions:
- All authenticated users have **FULL ACCESS** (read/write all data)
- No role-based permissions yet (everyone is admin)
- For 1-2 trusted users, this is perfectly fine
- Can add role-based access later if needed

---

## 👥 User Management

### Adding New Users:
1. Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Toggle "Auto Confirm User" ON
5. Click "Create user"
6. Send credentials to user securely (password manager, encrypted message)

### Removing Users:
1. Supabase Dashboard → Authentication → Users
2. Find user in list
3. Click "..." menu (three dots)
4. Select "Delete user"
5. Confirm deletion

### Resetting Passwords:
**For Users:**
- Click "Reset password" link on login page
- Enter email address
- Check email for reset link
- Follow link to set new password

**For Admins:**
- Supabase Dashboard → Authentication → Users
- Find user and click "..." menu
- Select "Send password reset email"
- User receives email with reset link

---

## 🆘 Troubleshooting

### "Invalid login credentials" error
- Double-check email and password
- Make sure user was created in Supabase dashboard
- Verify "Auto Confirm User" was enabled

### Login page doesn't appear
- Check browser console for errors
- Verify config.js has correct Supabase URL and anon key
- Clear browser cache and try again

### Logged in but no data loads
- Check browser console for RLS policy errors
- Verify you ran the DROP POLICY commands
- Check Supabase dashboard → Authentication → Policies

### Can't access after login
- Check that authenticated user policies exist (they should)
- Verify you're testing in same browser session (not incognito after login)
- Try signing out and back in

---

## 🔄 Rollback Plan

If something goes wrong and you need to revert:

1. **Restore anonymous access:**
```sql
-- In Supabase SQL Editor
CREATE POLICY "Allow anon users full access to clients"
ON clients FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users full access to payments"
ON payments FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon users full access to lessons"
ON lessons FOR ALL TO anon USING (true) WITH CHECK (true);
```

2. **Revert code changes:**
```bash
git revert HEAD
git push
```

---

## 📋 Quick Reference

**Supabase Dashboard Sections:**
- **Authentication → Providers** - Enable email auth
- **Authentication → Users** - Manage user accounts
- **SQL Editor** - Run RLS policy commands
- **Authentication → Policies** - View/edit RLS policies

**Login URL:**
- https://tutoring-mb.netlify.app (redirects to login.html)
- https://tutoring-mb.netlify.app/login.html (direct link)

**Production Site:**
- https://tutoring-mb.netlify.app/index.html (main app, requires login)

---

## ⏱️ Estimated Time

- **Supabase setup:** 10 minutes
- **Local testing:** 5 minutes (optional)
- **Deploy & test:** 5 minutes

**Total:** ~20 minutes (or 15 minutes if you skip local testing)

---

## 📝 Summary

You now have a secure, production-ready authentication system:
- Individual user accounts with email/password
- Password reset via email
- Protected database (login required)
- User management dashboard
- Easy to add more users later

The app is ready to deploy once you complete the Supabase dashboard setup!
