-- Setup Admin User for Ceylon Swimming Academy
-- Email: athalshatrading36@gmail.com
-- Password: Reshan@1234

-- ========================================
-- STEP 1: Create or Update Admin User
-- ========================================

-- Option A: If you've already signed up through the app, just update your profile
UPDATE user_profiles 
SET role = 'Admin', 
    status = 'approved',
    updated_at = NOW()
WHERE email = 'athalshatrading36@gmail.com';

-- Option B: If the user exists in auth.users but not in user_profiles
-- First, find your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'athalshatrading36@gmail.com';

-- Then run this (replace 'YOUR-USER-ID-HERE' with the actual ID from above):
-- INSERT INTO user_profiles (id, email, full_name, role, status)
-- SELECT 
--   id,
--   'athalshatrading36@gmail.com',
--   'Admin User',
--   'Admin',
--   'approved'
-- FROM auth.users 
-- WHERE email = 'athalshatrading36@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET
--   status = 'approved',
--   role = 'Admin',
--   updated_at = NOW();

-- ========================================
-- STEP 2: Verify Admin Access
-- ========================================

-- Run this to confirm your admin setup:
SELECT id, email, full_name, role, status, created_at
FROM user_profiles 
WHERE email = 'athalshatrading36@gmail.com';

-- You should see:
-- - role = 'Admin'
-- - status = 'approved'

-- ========================================
-- INSTRUCTIONS
-- ========================================

-- 1. If you haven't signed up yet:
--    - Go to http://localhost:5173/signup
--    - Sign up with email: athalshatrading36@gmail.com and password: Reshan@1234
--    - Then run the UPDATE statement above
--
-- 2. If you've already signed up:
--    - Just run the UPDATE statement above
--
-- 3. If you get "0 rows updated":
--    - Check if user exists in auth.users table
--    - Use Option B above to manually insert the profile
