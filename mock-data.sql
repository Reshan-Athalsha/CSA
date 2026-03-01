-- Ceylon Swimming Academy - Clear All Data
-- Run this in Supabase SQL Editor to remove all mock/demo data
-- After running this, you can add your real data

-- Delete in correct order to respect foreign key constraints
-- (child tables first, then parent tables)

-- 1. Delete race times (references swimmers and meets)
DELETE FROM racetimes;

-- 2. Delete attendance records (references swimmers)
DELETE FROM attendance;

-- 3. Delete notices
DELETE FROM notices;

-- 4. Delete trial requests
DELETE FROM trialrequests;

-- 5. Delete swimmers
DELETE FROM swimmers;

-- 6. Delete meets
DELETE FROM meets;

-- Verify all tables are empty
SELECT 'Swimmers:' as table_name, COUNT(*) as row_count FROM swimmers
UNION ALL SELECT 'Meets:', COUNT(*) FROM meets
UNION ALL SELECT 'Race times:', COUNT(*) FROM racetimes
UNION ALL SELECT 'Attendance:', COUNT(*) FROM attendance
UNION ALL SELECT 'Notices:', COUNT(*) FROM notices
UNION ALL SELECT 'Trial requests:', COUNT(*) FROM trialrequests;

