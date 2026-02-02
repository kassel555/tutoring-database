# Branding Customization Guide

## ✅ What's Been Done

I've updated your app with the following changes:

### Structure Changes:
- ✅ **Tab order changed:** Clients → Lessons → Payments → Reports
- ✅ **Title updated:** "MacBryte Activity" (instead of "Tutoring Management System")
- ✅ **Logo placeholder added:** Blue SVG with "MacBryte" text
- ✅ **Layout cleaned up:** More concise spacing throughout
- ✅ **Column widths fixed:** Date columns auto-fit to text (no word wrap)
- ✅ **Header redesigned:** Logo on left, title on right

### Style Improvements:
- ✅ Tighter padding and margins for cleaner look
- ✅ Table columns auto-size to content
- ✅ Date columns never wrap
- ✅ User info more compact
- ✅ Professional, modern layout

---

## 🎨 Next Steps: Add Your Branding

### Step 1: Add Your Real Logo

**Current:** Using a blue placeholder SVG with "MacBryte" text

**To replace:**
1. Go to http://macbryte.com
2. Right-click on the logo (top left corner)
3. Save it as: **`logo.svg`** or **`logo.png`** or **`logo.jpg`**
4. Place it in: `/Volumes/coding/projects/sheets-to-supabase/web/`
5. Replace the existing `logo.svg` file

**Logo specifications:**
- Recommended height: 60-80px
- Transparent background preferred
- Formats supported: SVG (best), PNG, JPG

**If your logo is a different format:**
Update these files to match:
- `web/index.html` - line with `<img src="logo.svg"`
- `web/login.html` - line with `<img src="logo.svg"`

### Step 2: Provide Brand Colors

I need the following to match your website perfectly:

**Primary Brand Color:**
- What's the main MacBryte color? (e.g., blue, green, red)
- Hex code if you know it (e.g., `#3b82f6`)

**Secondary/Accent Colors:**
- Any secondary colors used on the website?
- Button colors?
- Gradient colors (if any)?

**Background Colors:**
- What color is the website background?
- Header background?

**Where I'll use these:**
- Tab buttons (active state)
- Primary action buttons
- Links and accents
- Login page gradient
- Header styling

### Step 3: Font Preferences (Optional)

**Current:** Using system fonts (Arial, Helvetica, sans-serif)

If MacBryte uses specific fonts:
- What fonts are used on the website?
- I can add Google Fonts or custom fonts

---

## 🚀 Quick Deploy After Changes

Once you've added your logo and told me the colors:

```bash
cd /Volumes/coding/projects/sheets-to-supabase
git add web/logo.svg  # or logo.png
git commit -m "Add MacBryte logo"
git push
```

I'll update the colors in the CSS and deploy everything together!

---

## 📋 Current Color Scheme (Default)

Until you provide MacBryte colors, I'm using:

- **Primary Blue:** `#3b82f6` (buttons, tabs, accents)
- **Success Green:** `#10b981` (success messages, active badges)
- **Error Red:** `#ef4444` (error messages)
- **Warning Orange:** `#f59e0b` (warnings)
- **Background White:** `#ffffff`
- **Secondary Gray:** `#6b7280` (text, borders)
- **Login Gradient:** Purple gradient (`#667eea` to `#764ba2`)

---

## 🎨 Tell Me Your Colors!

Just let me know:
1. **Main brand color:** (blue? green? what shade?)
2. **Any other colors used on macbryte.com**
3. **Upload the logo file** to the web folder

I'll update everything to match perfectly! 🎯
