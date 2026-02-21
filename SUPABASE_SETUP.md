# 🚀 Supabase Setup Guide - Ceylon Swimming Academy

## ✅ Step-by-Step Instructions

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. In your Supabase dashboard, go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the Settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Create Environment File

1. In VS Code, create a new file called `.env.local` in your project root (next to package.json)
2. Copy this template and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_key_here
```

3. Save the file

### Step 4: Run the Database Schema

1. In Supabase dashboard, click **SQL Editor** (📝 icon in sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **RUN** (bottom right)
7. You should see: "Success. No rows returned"

This creates:
- ✅ 6 tables (swimmers, attendance, meets, racetimes, notices, trialrequests)
- ✅ Indexes for fast queries
- ✅ Sample data (3 swimmers, 1 notice)
- ✅ Security policies

### Step 5: Verify Tables Created

1. In Supabase, click **Table Editor** (🗂️ icon in sidebar)
2. You should see all 6 tables listed
3. Click on **swimmers** - you should see 3 sample swimmers!

### Step 6: Restart Your Dev Server

1. Stop your current dev server (Ctrl+C in terminal)
2. Start it again:
```powershell
npm run dev
```

3. The server will load your new .env.local file

### Step 7: Test It!

1. Open your browser to the app URL
2. Go to **Swimmers** page
3. Try adding a new swimmer
4. Go back to Supabase **Table Editor** → **swimmers**
5. You should see your new swimmer in the database! 🎉

---

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env.local` file exists
- Check that variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating .env.local

### Error: "relation 'swimmers' does not exist"
- You haven't run the SQL schema yet
- Go to Supabase SQL Editor and run the `supabase-schema.sql` file

### Data not showing up
- Check Supabase Table Editor to see if data is actually in the database
- Open browser console (F12) to see any error messages
- Make sure your Supabase project is running (not paused)

---

## 📊 What's Different from Mock Database?

✅ **Real database** - Data persists across devices and browsers
✅ **Multi-user** - Multiple people can use the app at the same time
✅ **Backup** - Supabase automatically backs up your data
✅ **Scalable** - Can handle thousands of swimmers
✅ **Dashboard** - View and edit data directly in Supabase

---

## 🎯 Next Steps After Setup

Once everything is working:

1. **Deploy your app** to Vercel, Netlify, or GitHub Pages
2. **Set up authentication** (optional - Supabase has built-in auth)
3. **Customize permissions** - Restrict who can edit/delete
4. **Add real-time features** - Live updates when data changes
5. **Set up backups** - Schedule database exports

---

## Need Help?

If you're stuck:
1. Check the browser console (F12) for errors
2. Check Supabase dashboard for any issues
3. Make sure your .env.local file is correct
4. Try restarting the dev server

Let me know when you're ready to test! 🏊‍♂️
