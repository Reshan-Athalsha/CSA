-- Ceylon Swimming Academy - Mock Data Insert
-- Run this in Supabase SQL Editor to populate demo data

-- First, ensure all FK columns exist (safe to run multiple times)
ALTER TABLE swimmers ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE swimmers ADD COLUMN IF NOT EXISTS swimmer_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS logged_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- ========================================
-- INSERT SWIMMERS (using correct columns only)
-- ========================================
INSERT INTO swimmers (first_name, last_name, date_of_birth, squad, parent_name, parent_email, parent_phone, emergency_contact, medical_notes)
VALUES
('Kavith', 'Fernando', '2015-03-15'::date, 'Elite', 'Mr. Lakshan Fernando', 'kavith.fernando@example.com', '+94771234567', '+94771234567', ''),
('Amaya', 'Silva', '2016-07-22'::date, 'Intermediate', 'Mrs. Niluka Silva', 'amaya.silva@example.com', '+94772345678', '+94772345678', ''),
('Dineth', 'Perera', '2017-11-08'::date, 'Beginner', 'Mr. Chathura Perera', 'dineth.perera@example.com', '+94773456789', '+94773456789', 'Asthma - carries inhaler'),
('Tharindu', 'Jayasinghe', '2015-08-20'::date, 'Elite', 'Mrs. Samantha Jayasinghe', 'tharindu.jayasinghe@example.com', '+94774567890', '+94774567890', ''),
('Ruwan', 'Kumara', '2016-05-12'::date, 'Intermediate', 'Mr. Bandara Kumara', 'ruwan.kumara@example.com', '+94775678901', '+94775678901', 'Minor shoulder issue - monitor'),
('Hasini', 'De Silva', '2017-02-28'::date, 'Beginner', 'Mrs. Madhavi De Silva', 'hasini.desilva@example.com', '+94776789012', '+94776789012', ''),
('Namal', 'Ranasinghe', '2015-11-30'::date, 'Elite', 'Mr. Prasad Ranasinghe', 'namal.ranasinghe@example.com', '+94777890123', '+94777890123', ''),
('Dilini', 'Wijesinghe', '2016-09-14'::date, 'Intermediate', 'Mrs. Yasodha Wijesinghe', 'dilini.wijesinghe@example.com', '+94778901234', '+94778901234', ''),
('Kasun', 'Bandara', '2017-06-03'::date, 'Beginner', 'Mr. Upul Bandara', 'kasun.bandara@example.com', '+94779012345', '+94779012345', ''),
('Shalini', 'Gunawardena', '2015-12-10'::date, 'Elite', 'Mrs. Panditha Gunawardena', 'shalini.gunawardena@example.com', '+94770123456', '+94770123456', '')
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT MEETS
-- ========================================
INSERT INTO meets (meet_name, date, location, description, status)
VALUES
('District Championship 2026', '2026-03-15'::date, 'Colombo Swimming Complex', 'Annual district-level competition', 'Upcoming'),
('Spring Invitational', '2026-04-10'::date, 'Kandy Aquatic Center', 'Regional inter-club meet', 'Upcoming'),
('National Trials', '2026-05-20'::date, 'National Olympic Centre', 'Trials for national representation', 'Upcoming'),
('Coastal Open 2026', '2026-06-05'::date, 'Galle Sports Complex', 'Open meet for all levels', 'Upcoming'),
('Summer Relay Championship', '2026-07-25'::date, 'Colombo Swimming Complex', 'Team relay events', 'Upcoming')
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT RACE TIMES (using correct columns) - Extended with progression data
-- ========================================
INSERT INTO racetimes (swimmer_id, meet_id, event, time_seconds, stroke, distance, is_personal_best, date, notes)
SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 29.15, 'Freestyle', '50m', FALSE, '2026-01-10'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 28.60, 'Freestyle', '50m', FALSE, '2026-01-24'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 28.10, 'Freestyle', '50m', FALSE, '2026-02-07'::date, 'Good progress'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 27.45, 'Freestyle', '50m', TRUE, '2026-03-15'::date, 'Excellent start'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 62.30, 'Freestyle', '100m', FALSE, '2026-01-10'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 61.05, 'Freestyle', '100m', FALSE, '2026-01-24'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 59.40, 'Freestyle', '100m', FALSE, '2026-02-07'::date, 'Better pacing'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 58.20, 'Freestyle', '100m', TRUE, '2026-03-15'::date, 'Strong race'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 132.50, 'Freestyle', '200m', FALSE, '2026-01-10'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 129.80, 'Freestyle', '200m', FALSE, '2026-01-24'::date, 'Good progress'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 127.15, 'Freestyle', '200m', FALSE, '2026-02-07'::date, 'Getting faster'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 125.30, 'Freestyle', '200m', FALSE, '2026-03-15'::date, 'Tired in last 50m'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 31.80, 'Freestyle', '50m', FALSE, '2026-01-10'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 31.20, 'Freestyle', '50m', FALSE, '2026-01-24'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 30.50, 'Freestyle', '50m', FALSE, '2026-02-07'::date, 'Better form'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 29.80, 'Freestyle', '50m', TRUE, '2026-03-15'::date, 'Good acceleration'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 66.50, 'Freestyle', '100m', FALSE, '2026-01-10'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 65.10, 'Freestyle', '100m', FALSE, '2026-01-24'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 63.60, 'Freestyle', '100m', FALSE, '2026-02-07'::date, 'Better pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 62.15, 'Freestyle', '100m', FALSE, '2026-03-15'::date, 'Could improve finish'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 37.50, 'Breaststroke', '50m', FALSE, '2026-02-20'::date, 'New event'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 36.70, 'Breaststroke', '50m', FALSE, '2026-03-06'::date, 'Learning technique'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 35.90, 'Breaststroke', '50m', TRUE, '2026-04-10'::date, 'New event PB'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 36.80, 'Freestyle', '50m', FALSE, '2026-01-05'::date, 'Very early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 35.90, 'Freestyle', '50m', FALSE, '2026-01-19'::date, 'First improvement'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 34.60, 'Freestyle', '50m', FALSE, '2026-02-20'::date, 'Good progress'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 33.30, 'Freestyle', '50m', FALSE, '2026-03-01'::date, 'Improvement'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 32.10, 'Freestyle', '50m', TRUE, '2026-03-15'::date, 'First competition'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 75.30, 'Freestyle', '100m', FALSE, '2026-01-05'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 74.10, 'Freestyle', '100m', FALSE, '2026-01-19'::date, 'Getting stronger'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 72.50, 'Freestyle', '100m', FALSE, '2026-02-20'::date, 'Building endurance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 70.40, 'Freestyle', '100m', FALSE, '2026-03-01'::date, 'Getting faster'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Freestyle', 68.45, 'Freestyle', '100m', TRUE, '2026-03-15'::date, 'Building endurance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 160.80, 'Freestyle', '200m', FALSE, '2026-01-12'::date, 'New distance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 157.45, 'Freestyle', '200m', FALSE, '2026-02-02'::date, 'Learning pacing'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 152.90, 'Freestyle', '200m', FALSE, '2026-02-23'::date, 'Better endurance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '200m Freestyle', 148.50, 'Freestyle', '200m', TRUE, '2026-03-15'::date, 'Excellent progress'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 40.20, 'Breaststroke', '50m', FALSE, '2026-03-08'::date, 'New stroke'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 39.10, 'Breaststroke', '50m', FALSE, '2026-03-22'::date, 'Learning technique'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 37.85, 'Breaststroke', '50m', TRUE, '2026-04-10'::date, 'New stroke PB'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Breaststroke', 85.40, 'Breaststroke', '100m', FALSE, '2026-03-08'::date, 'Learning IM'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Breaststroke', 82.90, 'Breaststroke', '100m', FALSE, '2026-03-22'::date, 'Building confidence'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Breaststroke', 80.10, 'Breaststroke', '100m', TRUE, '2026-04-10'::date, 'Good pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Butterfly', 62.80, 'Butterfly', '100m', FALSE, '2026-02-07'::date, 'Early prep'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Butterfly', 61.00, 'Butterfly', '100m', FALSE, '2026-02-28'::date, 'Improving pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Butterfly', 59.30, 'Butterfly', '100m', FALSE, '2026-04-10'::date, 'Consistent pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '200m Individual Medley', 142.40, 'Individual Medley', '200m', FALSE, '2026-02-07'::date, 'Early prep'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '200m Individual Medley', 139.10, 'Individual Medley', '200m', FALSE, '2026-02-28'::date, 'Better transitions'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '200m Individual Medley', 135.80, 'Individual Medley', '200m', TRUE, '2026-04-10'::date, 'Strong stroke transitions'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Breaststroke', 73.20, 'Breaststroke', '100m', FALSE, '2026-02-07'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Breaststroke', 71.30, 'Breaststroke', '100m', FALSE, '2026-02-21'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '100m Breaststroke', 69.50, 'Breaststroke', '100m', TRUE, '2026-03-15'::date, 'Good technique'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 35.80, 'Breaststroke', '50m', FALSE, '2026-03-20'::date, 'First short course'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '50m Breaststroke', 34.20, 'Breaststroke', '50m', TRUE, '2026-04-10'::date, 'Improving pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 33.10, 'Freestyle', '50m', FALSE, '2026-02-20'::date, 'Building confidence'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 32.20, 'Freestyle', '50m', FALSE, '2026-03-01'::date, 'Improved form'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 31.45, 'Freestyle', '50m', TRUE, '2026-03-15'::date, 'Confident start'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Freestyle', 69.50, 'Freestyle', '100m', FALSE, '2026-03-20'::date, 'First long course'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Freestyle', 67.80, 'Freestyle', '100m', TRUE, '2026-04-10'::date, 'Building distance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Freestyle', 121.80, 'Freestyle', '200m', FALSE, '2026-02-14'::date, 'Good base'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Freestyle', 120.10, 'Freestyle', '200m', FALSE, '2026-03-28'::date, 'Getting closer'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Freestyle', 118.50, 'Freestyle', '200m', TRUE, '2026-05-20'::date, 'Top 8 finish'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '400m Freestyle', 264.60, 'Freestyle', '400m', FALSE, '2026-02-14'::date, 'Building base'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '400m Freestyle', 261.70, 'Freestyle', '400m', FALSE, '2026-03-28'::date, 'Improving endurance'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '400m Freestyle', 258.90, 'Freestyle', '400m', TRUE, '2026-05-20'::date, 'Excellent conditioning'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '100m Butterfly', 66.80, 'Butterfly', '100m', FALSE, '2026-04-18'::date, 'Early prep'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '100m Butterfly', 65.00, 'Butterfly', '100m', FALSE, '2026-05-18'::date, 'Getting faster'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '100m Butterfly', 63.40, 'Butterfly', '100m', TRUE, '2026-06-05'::date, 'Competitive time'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '200m Butterfly', 142.50, 'Butterfly', '200m', FALSE, '2026-04-18'::date, 'Building base'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '200m Butterfly', 140.10, 'Butterfly', '200m', FALSE, '2026-05-18'::date, 'Better second half'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Coastal Open 2026' LIMIT 1),
    '200m Butterfly', 137.80, 'Butterfly', '200m', FALSE, '2026-06-05'::date, 'Need to improve back half'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 35.40, 'Freestyle', '50m', FALSE, '2026-02-20'::date, 'Early season'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 34.20, 'Freestyle', '50m', FALSE, '2026-03-01'::date, 'Improving'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'District Championship 2026' LIMIT 1),
    '50m Freestyle', 33.20, 'Freestyle', '50m', TRUE, '2026-03-15'::date, 'Steady improvement'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Freestyle', 72.30, 'Freestyle', '100m', FALSE, '2026-03-27'::date, 'First long course'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'Spring Invitational' LIMIT 1),
    '100m Freestyle', 70.45, 'Freestyle', '100m', TRUE, '2026-04-10'::date, 'Better pacing'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '100m Backstroke', 63.50, 'Backstroke', '100m', FALSE, '2026-04-05'::date, 'Technical work'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '100m Backstroke', 62.30, 'Backstroke', '100m', FALSE, '2026-05-01'::date, 'Race pace'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '100m Backstroke', 61.20, 'Backstroke', '100m', TRUE, '2026-05-20'::date, 'Strong qualifier'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Backstroke', 136.40, 'Backstroke', '200m', FALSE, '2026-04-05'::date, 'Building base'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Backstroke', 134.90, 'Backstroke', '200m', FALSE, '2026-05-01'::date, 'Steady progress'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    (SELECT id FROM meets WHERE meet_name = 'National Trials' LIMIT 1),
    '200m Backstroke', 133.50, 'Backstroke', '200m', TRUE, '2026-05-20'::date, 'Consistent throughout'
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT ATTENDANCE RECORDS
-- ========================================
INSERT INTO attendance (swimmer_id, date, status, notes)
SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Good session'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kavith' AND last_name = 'Fernando' LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    'Present',
    'Worked on kick'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Started flip turn work'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Good technique development'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dineth' AND last_name = 'Perera' LIMIT 1),
    CURRENT_DATE - INTERVAL '5 days',
    'Excused',
    'Medical appointment'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Tharindu' AND last_name = 'Jayasinghe' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Worked on IM transitions'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Ruwan' AND last_name = 'Kumara' LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    'Present',
    'Breaststroke focus'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Hasini' AND last_name = 'De Silva' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Improving confidence'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Namal' AND last_name = 'Ranasinghe' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Distance training'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Dilini' AND last_name = 'Wijesinghe' LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    'Present',
    'Butterfly strength work'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Form improvement'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Kasun' AND last_name = 'Bandara' LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days',
    'Absent',
    'Sick'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days',
    'Present',
    'Backstroke drill work'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Shalini' AND last_name = 'Gunawardena' LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    'Present',
    'Open water prep'
UNION ALL SELECT
    (SELECT id FROM swimmers WHERE first_name = 'Amaya' AND last_name = 'Silva' LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days',
    'Present',
    'Great energy today'
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT NOTICES
-- ========================================
INSERT INTO notices (title, content, author_name, target_audience, priority)
VALUES
('Welcome to CSA 2026', 'Welcome to the new online portal! Here you can track all your training progress, race results, and upcoming meets.', 'Coach Indika Hewage', 'All', 'High'),
('District Championship Results', 'Congratulations to all swimmers who competed at District Championships! Excellent performances across the board. Individual results will be posted soon.', 'Coach Indika Hewage', 'All', 'Normal'),
('National Trials Qualifiers', 'The following swimmers have qualified for National Trials: Namal Ranasinghe, Shalini Gunawardena, Tharindu Jayasinghe. Training intensifies next week!', 'Coach Indika Hewage', 'All', 'High'),
('Pool Closure - 25 Feb', 'The pool will be closed on February 25-26 for maintenance. Session resumes February 27. No make-up sessions available.', 'Coach Indika Hewage', 'All', 'Normal'),
('Summer Camp Registration', 'Registration for Summer Swimming Camp (July 1-15) is now open! Limited spots available. Details and forms available in the office.', 'Coach Indika Hewage', 'All', 'Normal')
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT TRIAL REQUESTS (sample requests for new swimmers)
-- ========================================
INSERT INTO trialrequests (parent_name, child_name, child_age, email, phone, swimming_experience, message, status)
VALUES
('Mr. Jayawardena', 'Rishi Jayawardena', 8, 'rishi.parent@example.com', '+94781234567', 'Beginner', 'My son is interested in starting swimming. He has attended a few beginner lessons at another pool.', 'New'),
('Mrs. Wijewickrama', 'Tharusha Wijewickrama', 10, 'tharusha.parent@example.com', '+94782345678', 'Intermediate', 'Daughter is currently learning, would like to join your academy for more structured training.', 'New'),
('Mr. Alwis', 'Vikram Alwis', 12, 'vikram.parent@example.com', '+94783456789', 'Intermediate', 'Looking to improve his competitive times. Interested in elite program eventually.', 'Under Review'),
('Mrs. Kumari', 'Anushka Kumari', 7, 'anushka.parent@example.com', '+94784567890', 'Beginner', 'First-time swimmer. Very enthusiastic about learning. Available for weekday sessions.', 'New'),
('Mr. Dissanayake', 'Arjun Dissanayake', 11, 'arjun.parent@example.com', '+94785678901', 'Intermediate', 'Currently swimming, wants to focus on backstroke and IM. Can do weekends.', 'Approved')
ON CONFLICT DO NOTHING;

-- Verify inserts
SELECT 'Swimmers inserted:' as check_insert, COUNT(*) FROM swimmers;
SELECT 'Meets inserted:' as check_insert, COUNT(*) FROM meets;
SELECT 'Race times inserted:' as check_insert, COUNT(*) FROM racetimes;
SELECT 'Attendance records inserted:' as check_insert, COUNT(*) FROM attendance;
SELECT 'Notices inserted:' as check_insert, COUNT(*) FROM notices;
SELECT 'Trial requests inserted:' as check_insert, COUNT(*) FROM trialrequests;
