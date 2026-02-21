# Admin User Quick Setup Guide

## Your Admin Credentials
- **Email**: athalshatrading36@gmail.com
- **Password**: Reshan@1234

## Setup Instructions

### Step 1: Run the Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the contents of `supabase-schema.sql`
4. Run the query to create all tables and functions

### Step 2: Create Admin Account

**OPTION A: Sign up through the app (Recommended)**
1. Start your development server: `npm run dev`
2. Go to http://localhost:5173/signup
3. Sign up with the credentials above
4. Go back to Supabase SQL Editor and run:
```sql
UPDATE user_profiles 
SET role = 'Admin', 
    status = 'approved',
    updated_at = NOW()
WHERE email = 'athalshatrading36@gmail.com';
```

**OPTION B: If user already exists in Supabase**
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Find the user with email `athalshatrading36@gmail.com`
3. Copy the User ID
4. Run this in SQL Editor (replace `YOUR-USER-ID-HERE` with the copied ID):
```sql
INSERT INTO user_profiles (id, email, full_name, role, status)
VALUES (
  'YOUR-USER-ID-HERE',
  'athalshatrading36@gmail.com',
  'Admin User',
  'Admin',
  'approved'
)
ON CONFLICT (id) DO UPDATE SET
  status = 'approved',
  role = 'Admin',
  updated_at = NOW();
```

### Step 3: Verify Admin Access
Run this query to confirm:
```sql
SELECT * FROM user_profiles WHERE email = 'athalshatrading36@gmail.com';
```

You should see:
- `role` = 'Admin'
- `status` = 'approved'

### Step 4: Login
1. Go to http://localhost:5173/login
2. Login with your admin credentials
3. You should be redirected to the Admin Dashboard

## Fixed Issues

✅ **Infinite Loading**: Fixed by removing the undefined `isLoadingPublicSettings` reference in App.jsx

✅ **Admin Setup**: Clear instructions added to supabase-schema.sql with your specific email

## Need Help?

If you encounter any issues:
1. Check browser console for errors (F12)
2. Verify Supabase connection in `src/api/supabaseClient.js`
3. Ensure your Supabase project URL and anon key are correctly configured in environment variables
