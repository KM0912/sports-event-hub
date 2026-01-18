-- Seed data for development environment
-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create test users in auth.users (profiles will be auto-created via trigger)
-- Note: These are test users for local development only
DO $$
DECLARE
    test_user1_id UUID;
    test_user2_id UUID;
    test_user3_id UUID;
BEGIN
    -- Check if test user 1 already exists
    SELECT id INTO test_user1_id FROM auth.users WHERE email = 'test1@example.com';
    
    -- Create test user 1 if it doesn't exist
    IF test_user1_id IS NULL THEN
        test_user1_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            test_user1_id,
            'authenticated',
            'authenticated',
            'test1@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"テストユーザー1"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    END IF;

    -- Check if test user 2 already exists
    SELECT id INTO test_user2_id FROM auth.users WHERE email = 'test2@example.com';
    
    -- Create test user 2 if it doesn't exist
    IF test_user2_id IS NULL THEN
        test_user2_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            test_user2_id,
            'authenticated',
            'authenticated',
            'test2@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"テストユーザー2"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    END IF;

    -- Check if test user 3 already exists
    SELECT id INTO test_user3_id FROM auth.users WHERE email = 'test3@example.com';
    
    -- Create test user 3 if it doesn't exist
    IF test_user3_id IS NULL THEN
        test_user3_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            test_user3_id,
            'authenticated',
            'authenticated',
            'test3@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"テストユーザー3"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;

-- Insert sample events (using profiles that were auto-created via trigger)
-- Only insert if profiles exist
DO $$
DECLARE
    host_user_id UUID;
BEGIN
    -- Get first profile ID
    SELECT id INTO host_user_id FROM public.profiles LIMIT 1;
    
    -- Only insert events if we have at least one profile
    IF host_user_id IS NOT NULL THEN
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
            chat_expires_at,
            status
        ) VALUES (
            gen_random_uuid(),
            host_user_id,
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
            NOW() + INTERVAL '30 days',
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
            chat_expires_at,
            status
        ) VALUES (
            gen_random_uuid(),
            host_user_id,
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
            NOW() + INTERVAL '37 days',
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
            chat_expires_at,
            status
        ) VALUES (
            gen_random_uuid(),
            host_user_id,
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
            NOW() + INTERVAL '44 days',
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
            chat_expires_at,
            status
        ) VALUES (
            gen_random_uuid(),
            host_user_id,
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
            NOW() + INTERVAL '33 days',
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
            chat_expires_at,
            status
        ) VALUES (
            gen_random_uuid(),
            host_user_id,
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
            NOW() + INTERVAL '16 days',
            'published'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

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

