-- Seed data for development
-- Note: You'll need to create a test user through Supabase Auth first,
-- then update the user_id values below with the actual UUID.

-- This file is meant to be run manually after creating test users.
-- Replace 'YOUR_TEST_USER_ID' with actual user UUIDs from auth.users.

-- Example entries (uncomment and update after creating test user):

/*
-- Insert sample entries for testing
INSERT INTO entries (user_id, entry_date, raw_entry, refined_entry, tldr, key_moments, score, ai_suggested_score, score_justification, input_method)
VALUES
    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '6 days',
     'Had a productive morning, finished the project I''ve been working on. Felt really accomplished.',
     'Today marked a significant milestone as I completed the project that has occupied my focus recently. The sense of accomplishment was palpable.',
     'Completed a major project and felt accomplished',
     '["Finished project", "Felt accomplished"]'::jsonb,
     8, 8, 'High productivity and clear sense of achievement indicate a very positive day.', 'text'),

    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '5 days',
     'Regular day at work. Nothing special happened. Had lunch with a colleague which was nice.',
     'A steady day with routine work activities. The highlight was sharing lunch with a colleague, adding a pleasant social element to an otherwise ordinary day.',
     'Ordinary workday with a nice lunch with a colleague',
     '["Lunch with colleague"]'::jsonb,
     5, 5, 'A neutral day with one positive social interaction.', 'text'),

    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '4 days',
     'Struggled with motivation today. Couldn''t focus on anything. Ended up just watching TV.',
     'Today was challenging in terms of motivation. Focus was elusive, and the day concluded with passive entertainment rather than productive activities.',
     'Low motivation day, ended up watching TV',
     '["Struggled with motivation", "Watched TV"]'::jsonb,
     3, 3, 'Low energy and lack of productivity suggest a below-average day.', 'text'),

    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '3 days',
     'Great workout in the morning. Energy levels were high all day. Made progress on my side project.',
     'Started the day strong with an energizing workout that set a positive tone. This energy carried through, enabling meaningful progress on a personal side project.',
     'Energetic day with good workout and side project progress',
     '["Great workout", "High energy", "Side project progress"]'::jsonb,
     8, 8, 'Physical activity combined with productive creative work indicates a very good day.', 'text'),

    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '2 days',
     'Received some criticism at work that bothered me. Tried to use it constructively but still felt down.',
     'Faced challenging feedback at work today. While attempting to channel it constructively, the emotional impact lingered, affecting my overall mood.',
     'Received work criticism, tried to be constructive but felt down',
     '["Work criticism", "Felt down", "Attempted constructive response"]'::jsonb,
     4, 4, 'Challenging feedback with attempted positive reframing, but negative emotions persisted.', 'text'),

    ('YOUR_TEST_USER_ID', CURRENT_DATE - INTERVAL '1 day',
     'Spent time with family. Had a lovely dinner together. Feeling grateful for these moments.',
     'A heartwarming day centered around family time. The shared dinner brought moments of connection and gratitude.',
     'Quality family time and grateful feelings',
     '["Family time", "Lovely dinner", "Gratitude"]'::jsonb,
     9, 9, 'Strong positive emotions from meaningful social connections.', 'text');

-- Update user profile stats (would normally be done by triggers/functions)
UPDATE user_profiles
SET
    total_entries = 6,
    current_streak = 6,
    longest_streak = 6,
    avg_score_7_day = 6.17,
    avg_score_all_time = 6.17
WHERE user_id = 'YOUR_TEST_USER_ID';
*/
