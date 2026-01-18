-- Seed data for development environment
-- Note: This seed file assumes that auth.users are created manually or via the application
-- To create test users, you can use Supabase Studio or the auth API

-- Insert sample profiles
-- Note: These UUIDs should match actual auth.users IDs
-- For development, you can create users via the app and then update these UUIDs
-- Or use the Supabase Studio to create users and copy their IDs here

-- Sample profile data (replace these UUIDs with actual user IDs from auth.users)
-- You can get user IDs by creating users via the app or Supabase Studio

-- Example: If you have created users with emails like test1@example.com, test2@example.com, etc.
-- You can query their IDs and use them here:
-- SELECT id FROM auth.users WHERE email = 'test1@example.com';

-- For now, we'll create seed data that can be used after creating users manually
-- Or you can use the Supabase CLI to create users programmatically

-- Insert sample events (these will work once you have actual user IDs in profiles)
-- The following is a template - you'll need to replace the host_user_id with actual UUIDs

-- Sample event 1: Upcoming event
INSERT INTO public.events (
    id,
    host_user_id,
    title,
    description,
    start_at,
    end_at,
    venue_name,
    address,
    city,
    fee,
    visitor_capacity,
    level,
    level_notes,
    equipment,
    participation_rules,
    notes,
    application_deadline,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.profiles LIMIT 1), -- Use first profile as host
    '初心者歓迎！バドミントン交流会',
    '初心者から中級者まで楽しめるバドミントン交流会です。ラケットはレンタル可能です。',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
    'スポーツセンター',
    '東京都渋谷区1-1-1',
    '東京都',
    500,
    8,
    'beginner',
    '初心者でも安心して参加できます',
    'ラケット、シューズ（体育館用）',
    '参加費は当日現金でお支払いください。',
    'お水やタオルをお持ちください。',
    NOW() + INTERVAL '5 days',
    'published'
) ON CONFLICT DO NOTHING;

-- Sample event 2: Intermediate level event
INSERT INTO public.events (
    id,
    host_user_id,
    title,
    description,
    start_at,
    end_at,
    venue_name,
    address,
    city,
    fee,
    visitor_capacity,
    level,
    level_notes,
    equipment,
    participation_rules,
    notes,
    application_deadline,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.profiles LIMIT 1 OFFSET 1), -- Use second profile as host (if exists)
    '中級者向けバドミントン練習会',
    '中級者向けの練習会です。ダブルスを中心に練習します。',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
    '区民体育館',
    '東京都新宿区2-2-2',
    '東京都',
    800,
    12,
    'intermediate',
    '中級者以上を想定しています',
    'ラケット、シューズ、タオル',
    '参加費は事前振込をお願いします。',
    '水分補給を忘れずに。',
    NOW() + INTERVAL '12 days',
    'published'
) ON CONFLICT DO NOTHING;

-- Sample event 3: Advanced level event
INSERT INTO public.events (
    id,
    host_user_id,
    title,
    description,
    start_at,
    end_at,
    venue_name,
    address,
    city,
    fee,
    visitor_capacity,
    level,
    level_notes,
    equipment,
    participation_rules,
    notes,
    application_deadline,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.profiles LIMIT 1), -- Use first profile as host
    '上級者向けバドミントン大会',
    '上級者向けの大会形式のイベントです。シングルスとダブルスを行います。',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
    '都立体育館',
    '東京都港区3-3-3',
    '東京都',
    1500,
    16,
    'advanced',
    '上級者限定です',
    'ラケット、シューズ、ユニフォーム',
    '参加費は事前振込必須です。',
    '審判も行います。',
    NOW() + INTERVAL '18 days',
    'published'
) ON CONFLICT DO NOTHING;

-- Sample event 4: All levels welcome
INSERT INTO public.events (
    id,
    host_user_id,
    title,
    description,
    start_at,
    end_at,
    venue_name,
    address,
    city,
    fee,
    visitor_capacity,
    level,
    level_notes,
    equipment,
    participation_rules,
    notes,
    application_deadline,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.profiles LIMIT 1), -- Use first profile as host
    '誰でも参加OK！バドミントンサークル',
    'レベル問わず誰でも参加できるサークル活動です。',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '2.5 hours',
    'コミュニティセンター',
    '東京都世田谷区4-4-4',
    '東京都',
    300,
    20,
    'all',
    '初心者から上級者まで歓迎',
    'ラケット、シューズ',
    '参加費は当日現金でお支払いください。',
    'お気軽にご参加ください！',
    NOW() + INTERVAL '8 days',
    'published'
) ON CONFLICT DO NOTHING;

-- Sample event 5: Past event (for testing)
INSERT INTO public.events (
    id,
    host_user_id,
    title,
    description,
    start_at,
    end_at,
    venue_name,
    address,
    city,
    fee,
    visitor_capacity,
    level,
    level_notes,
    equipment,
    participation_rules,
    notes,
    application_deadline,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.profiles LIMIT 1), -- Use first profile as host
    '過去のイベント（テスト用）',
    'これは過去のイベントのサンプルです。',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '2 hours',
    'テスト体育館',
    '東京都千代田区5-5-5',
    '東京都',
    500,
    8,
    'beginner',
    NULL,
    'ラケット、シューズ',
    '参加費は当日現金でお支払いください。',
    NULL,
    NOW() - INTERVAL '10 days',
    'published'
) ON CONFLICT DO NOTHING;

-- Insert sample applications (only if we have events and multiple profiles)
-- These will be created for events that exist and users that exist
DO $$
DECLARE
    event1_id UUID;
    event2_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- Get first event ID
    SELECT id INTO event1_id FROM public.events ORDER BY created_at DESC LIMIT 1;
    
    -- Get second event ID
    SELECT id INTO event2_id FROM public.events ORDER BY created_at DESC OFFSET 1 LIMIT 1;
    
    -- Get user IDs (excluding the host)
    SELECT id INTO user1_id FROM public.profiles ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.profiles ORDER BY created_at OFFSET 1 LIMIT 1;
    SELECT id INTO user3_id FROM public.profiles ORDER BY created_at OFFSET 2 LIMIT 1;
    
    -- Insert applications if we have enough users
    IF event1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO public.applications (event_id, user_id, status, comment)
        VALUES (event1_id, user2_id, 'pending', '参加希望です！')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF event1_id IS NOT NULL AND user3_id IS NOT NULL THEN
        INSERT INTO public.applications (event_id, user_id, status, comment)
        VALUES (event1_id, user3_id, 'approved', 'よろしくお願いします！')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF event2_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO public.applications (event_id, user_id, status, comment)
        VALUES (event2_id, user2_id, 'approved', '楽しみにしています')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Note: To use this seed file effectively:
-- 1. First, create some test users via the application or Supabase Studio
-- 2. The seed file will then create events using those users as hosts
-- 3. Applications will be created if there are multiple users

-- Alternative: You can manually insert profiles with specific UUIDs if you know the auth.users IDs
-- Example:
-- INSERT INTO public.profiles (id, display_name) VALUES
--   ('<user-uuid-1>', 'テストユーザー1'),
--   ('<user-uuid-2>', 'テストユーザー2'),
--   ('<user-uuid-3>', 'テストユーザー3')
-- ON CONFLICT (id) DO NOTHING;
