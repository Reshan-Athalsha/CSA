-- Ceylon Swimming Academy - Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ========================================
-- CLEAN UP EXISTING TABLES (OPTIONAL - UNCOMMENT TO RESET DATABASE)
-- ========================================
-- WARNING: Uncommenting these lines will DELETE ALL DATA!
-- Only use this if you want to completely reset your database

-- DROP TABLE IF EXISTS racetimes CASCADE;
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS trialrequests CASCADE;
-- DROP TABLE IF EXISTS notices CASCADE;
-- DROP TABLE IF EXISTS meets CASCADE;
-- DROP TABLE IF EXISTS swimmers CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ========================================
-- AUTHENTICATION & USER PROFILES
-- ========================================

-- 1. User Profiles Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'Parent',
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role WITHOUT triggering RLS
-- (SECURITY DEFINER runs as the function owner, bypassing row-level security)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's own profile WITHOUT triggering RLS
-- This is used by the app to avoid the infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json AS $$
  SELECT row_to_json(p.*)
  FROM public.user_profiles p
  WHERE p.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (public.get_current_user_role() = 'Admin');

DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
CREATE POLICY "Admins can update profiles" ON user_profiles
    FOR UPDATE USING (public.get_current_user_role() = 'Admin');

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'Parent'),
        'pending'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- SWIMMING ACADEMY DATA TABLES
-- ========================================

-- 2. Swimmers Table
CREATE TABLE IF NOT EXISTS swimmers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    squad TEXT NOT NULL DEFAULT 'Beginner',
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swimmer_id UUID REFERENCES swimmers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swimmer_id, date)
);

-- 4. Meets Table
CREATE TABLE IF NOT EXISTS meets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meet_name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'Upcoming',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Race Times Table
CREATE TABLE IF NOT EXISTS racetimes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swimmer_id UUID REFERENCES swimmers(id) ON DELETE CASCADE,
    meet_id UUID REFERENCES meets(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    time_seconds NUMERIC(10, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    stroke TEXT,
    distance TEXT,
    is_personal_best BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: add date column if upgrading from older schema
ALTER TABLE racetimes ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- 6. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    target_audience TEXT DEFAULT 'All',
    priority TEXT DEFAULT 'Normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Trial Requests Table
CREATE TABLE IF NOT EXISTS trialrequests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_name TEXT NOT NULL,
    child_name TEXT NOT NULL,
    child_age INTEGER,
    email TEXT,
    phone TEXT,
    swimming_experience TEXT,
    message TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_swimmers_squad ON swimmers(squad);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_swimmer ON attendance(swimmer_id);
CREATE INDEX IF NOT EXISTS idx_meets_date ON meets(date);
CREATE INDEX IF NOT EXISTS idx_racetimes_swimmer ON racetimes(swimmer_id);
CREATE INDEX IF NOT EXISTS idx_racetimes_meet ON racetimes(meet_id);
CREATE INDEX IF NOT EXISTS idx_notices_created ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trialrequests_status ON trialrequests(status);

-- Insert sample data (only if tables are empty)
INSERT INTO swimmers (first_name, last_name, date_of_birth, squad, parent_name, parent_email, parent_phone, emergency_contact, medical_notes)
SELECT 'Kavith', 'Fernando', '2015-03-15', 'Elite', 'Mr. Fernando', 'fernando@example.com', '+94771234567', '+94771234567', ''
WHERE NOT EXISTS (SELECT 1 FROM swimmers WHERE parent_email = 'fernando@example.com');

INSERT INTO swimmers (first_name, last_name, date_of_birth, squad, parent_name, parent_email, parent_phone, emergency_contact, medical_notes)
SELECT 'Amaya', 'Silva', '2016-07-22', 'Intermediate', 'Mrs. Silva', 'silva@example.com', '+94772345678', '+94772345678', ''
WHERE NOT EXISTS (SELECT 1 FROM swimmers WHERE parent_email = 'silva@example.com');

INSERT INTO swimmers (first_name, last_name, date_of_birth, squad, parent_name, parent_email, parent_phone, emergency_contact, medical_notes)
SELECT 'Dineth', 'Perera', '2017-11-08', 'Beginner', 'Mr. Perera', 'perera@example.com', '+94773456789', '+94773456789', 'Asthma - has inhaler'
WHERE NOT EXISTS (SELECT 1 FROM swimmers WHERE parent_email = 'perera@example.com');

INSERT INTO notices (title, content, author_name, target_audience, priority)
SELECT 'Welcome to CSA!', 'Welcome to Ceylon Swimming Academy. Check here for important announcements from Coach Indika.', 'Coach Indika Hewage', 'All', 'Normal'
WHERE NOT EXISTS (SELECT 1 FROM notices WHERE title = 'Welcome to CSA!');

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE swimmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE racetimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE trialrequests ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
DROP POLICY IF EXISTS "Allow all operations on swimmers" ON swimmers;
CREATE POLICY "Allow all operations on swimmers" ON swimmers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on attendance" ON attendance;
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on meets" ON meets;
CREATE POLICY "Allow all operations on meets" ON meets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on racetimes" ON racetimes;
CREATE POLICY "Allow all operations on racetimes" ON racetimes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on notices" ON notices;
CREATE POLICY "Allow all operations on notices" ON notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on trialrequests" ON trialrequests;
CREATE POLICY "Allow all operations on trialrequests" ON trialrequests FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- FK RELATIONSHIP COLUMNS (spec-compliant relational links)
-- Run these safely on an existing database — they add columns only if missing
-- ========================================

-- Swimmers.parent_id → FK to user_profiles (the parent's user account)
ALTER TABLE swimmers ADD COLUMN IF NOT EXISTS
    parent_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
COMMENT ON COLUMN swimmers.parent_id IS 'FK to user_profiles for the linked parent account';

-- Notices.author_id → FK to user_profiles (who posted the notice)
ALTER TABLE notices ADD COLUMN IF NOT EXISTS
    author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
COMMENT ON COLUMN notices.author_id IS 'FK to user_profiles for the notice author';

-- Attendance.logged_by_id → FK to user_profiles (which coach logged this record)
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS
    logged_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
COMMENT ON COLUMN attendance.logged_by_id IS 'FK to user_profiles for the coach who marked this record';

-- Swimmers.swimmer_user_id → FK to user_profiles (the swimmer's own login account)
ALTER TABLE swimmers ADD COLUMN IF NOT EXISTS
    swimmer_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
COMMENT ON COLUMN swimmers.swimmer_user_id IS 'FK to user_profiles for the swimmer child account (role=Swimmer)';

-- Index new FK columns
CREATE INDEX IF NOT EXISTS idx_swimmers_parent_id ON swimmers(parent_id);
CREATE INDEX IF NOT EXISTS idx_swimmers_swimmer_user_id ON swimmers(swimmer_user_id);
CREATE INDEX IF NOT EXISTS idx_notices_author_id ON notices(author_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logged_by ON attendance(logged_by_id);

-- ========================================
-- POST-SETUP INSTRUCTIONS FOR ADMIN USER
-- ========================================

-- IMPORTANT: To create your admin user (athalshatrading36@gmail.com), follow OPTION 1 or OPTION 2:

-- ----------------------------------------
-- OPTION 1: Sign up through the app (RECOMMENDED)
-- ----------------------------------------
-- 1. Go to your app at http://localhost:5173/signup
-- 2. Sign up with:
--    Email: athalshatrading36@gmail.com
--    Password: Reshan@1234
-- 3. After signup, run this SQL command in Supabase SQL Editor to promote to admin:

UPDATE user_profiles 
SET role = 'Admin', 
    status = 'approved',
    updated_at = NOW()
WHERE email = 'athalshatrading36@gmail.com';

-- ----------------------------------------
-- OPTION 2: If user already exists in Supabase Auth
-- ----------------------------------------
-- If you've already created the user through Supabase Dashboard or the app,
-- find the user ID in Authentication -> Users, then run:

-- Step 1: Find your user ID by running this:
-- SELECT id, email FROM auth.users WHERE email = 'athalshatrading36@gmail.com';

-- Step 2: Use the ID from above and run:
-- INSERT INTO user_profiles (id, email, full_name, role, status)
-- VALUES (
--   'YOUR-ACTUAL-USER-ID-HERE',              -- Replace with ID from Step 1
--   'athalshatrading36@gmail.com',
--   'Admin User',
--   'Admin',
--   'approved'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   status = 'approved',
--   role = 'Admin',
--   updated_at = NOW();

-- ----------------------------------------
-- VERIFY ADMIN ACCESS
-- ----------------------------------------
-- After completing either option above, verify by running:
-- SELECT * FROM user_profiles WHERE email = 'athalshatrading36@gmail.com';
-- You should see role = 'Admin' and status = 'approved'
