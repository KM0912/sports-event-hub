-- 開発用シードデータ
-- supabase db reset で自動適用される

-- =============================================================================
-- テストユーザー作成 (Supabase Auth)
-- =============================================================================
-- ユーザー1: 主催者（太郎）
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'taro@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '', '',
  '', '', '', 0,
  NULL, '', '', '',
  false, false,
  '{"provider":"email","providers":["email"]}',
  '{}'
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a1111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'taro@example.com'),
  'email', 'a1111111-1111-1111-1111-111111111111',
  now(), now(), now()
);

-- ユーザー2: 参加者（花子）
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'hanako@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '', '',
  '', '', '', 0,
  NULL, '', '', '',
  false, false,
  '{"provider":"email","providers":["email"]}',
  '{}'
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'b2222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'hanako@example.com'),
  'email', 'b2222222-2222-2222-2222-222222222222',
  now(), now(), now()
);

-- ユーザー3: 参加者（次郎）
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c3333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'jiro@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '', '',
  '', '', '', 0,
  NULL, '', '', '',
  false, false,
  '{"provider":"email","providers":["email"]}',
  '{}'
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'c3333333-3333-3333-3333-333333333333',
  jsonb_build_object('sub', 'c3333333-3333-3333-3333-333333333333', 'email', 'jiro@example.com'),
  'email', 'c3333333-3333-3333-3333-333333333333',
  now(), now(), now()
);

-- =============================================================================
-- プロフィール
-- =============================================================================
INSERT INTO sports_event_hub.profiles (id, display_name) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'バド太郎'),
  ('b2222222-2222-2222-2222-222222222222', 'バド花子'),
  ('c3333333-3333-3333-3333-333333333333', 'バド次郎');

-- =============================================================================
-- イベント（未来日のイベントを中心に作成）
-- =============================================================================
INSERT INTO sports_event_hub.events (
  id, organizer_id, title, start_datetime, end_datetime,
  venue_name, venue_address, municipality, level, level_note,
  capacity, fee, description, rules, equipment, notes, deadline_hours_before, status
) VALUES
-- イベント1: 仙台市青葉区 / 初心者歓迎
(
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  '仙台バドミントン初心者練習会',
  now() + interval '7 days' + time '09:00',
  now() + interval '7 days' + time '12:00',
  '仙台市体育館',
  '仙台市青葉区本町3-8-1',
  '仙台市青葉区',
  'beginner',
  '未経験者〜始めて1年以内の方',
  8,
  500,
  '初心者向けの練習会です。基礎打ちから丁寧に教えます。ラケットの貸し出しもあります。',
  '室内シューズ必須。飲み物持参。',
  'ラケット（貸出あり）、室内シューズ、タオル、飲み物',
  '駐車場あり（無料）',
  24,
  'published'
),
-- イベント2: 仙台市宮城野区 / 中級
(
  'e2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  '宮城野区ダブルス練習会',
  now() + interval '10 days' + time '18:00',
  now() + interval '10 days' + time '21:00',
  '宮城野体育館',
  '仙台市宮城野区新田東4-1-1',
  '仙台市宮城野区',
  'intermediate',
  '試合経験のある方。ダブルスメイン。',
  12,
  800,
  'ダブルスを中心とした練習会です。ゲーム形式で回します。レベルが合えばどなたでもOK。',
  '遅刻厳禁。開始時間にコートに立てるように集合してください。',
  'ラケット、室内シューズ、タオル、飲み物、替えのシャツ',
  NULL,
  12,
  'published'
),
-- イベント3: 名取市 / すべてのレベル
(
  'e3333333-3333-3333-3333-333333333333',
  'b2222222-2222-2222-2222-222222222222',
  '名取バドミントンオープン練習会',
  now() + interval '14 days' + time '13:00',
  now() + interval '14 days' + time '17:00',
  '名取市民体育館',
  '名取市増田字柳田520',
  '名取市',
  'all',
  NULL,
  16,
  300,
  '誰でも参加OKのオープン練習会です！レベル別にコートを分けて練習します。',
  NULL,
  NULL,
  NULL,
  NULL,
  'published'
),
-- イベント4: 多賀城市 / 上級
(
  'e4444444-4444-4444-4444-444444444444',
  'b2222222-2222-2222-2222-222222222222',
  '多賀城ガチ練習会',
  now() + interval '3 days' + time '19:00',
  now() + interval '3 days' + time '21:30',
  '多賀城市総合体育館',
  '多賀城市大代5-3-1',
  '多賀城市',
  'advanced',
  '県大会出場経験のある方',
  6,
  1000,
  '高レベルのシングルス・ダブルス練習会です。試合形式中心。',
  'ウォーミングアップは各自で済ませてください。',
  'ラケット、室内シューズ、タオル、飲み物、替えのシャツ',
  'シャトルは主催者が用意します。',
  48,
  'published'
),
-- イベント5: 仙台市泉区 / 初級（キャンセル済み）
(
  'e5555555-5555-5555-5555-555555555555',
  'a1111111-1111-1111-1111-111111111111',
  '泉区バドミントン練習会【中止】',
  now() + interval '5 days' + time '10:00',
  now() + interval '5 days' + time '13:00',
  '泉総合運動場',
  '仙台市泉区野村字新桂島前20',
  '仙台市泉区',
  'elementary',
  NULL,
  10,
  600,
  '初級者向けの練習会でしたが、施設の都合により中止となりました。',
  NULL,
  NULL,
  NULL,
  NULL,
  'cancelled'
);

-- =============================================================================
-- 申請データ
-- =============================================================================
INSERT INTO sports_event_hub.applications (id, event_id, applicant_id, comment, status) VALUES
-- 花子がイベント1に申請 → 承認済み
(
  'd1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'バドミントン始めたばかりです。よろしくお願いします！',
  'approved'
),
-- 次郎がイベント1に申請 → 保留中
(
  'd2222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333',
  '初心者ですが参加したいです。',
  'pending'
),
-- 次郎がイベント2に申請 → 承認済み
(
  'd3333333-3333-3333-3333-333333333333',
  'e2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'ダブルスの練習がしたいです。',
  'approved'
),
-- 太郎がイベント3に申請 → 承認済み
(
  'd4444444-4444-4444-4444-444444444444',
  'e3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  NULL,
  'approved'
),
-- 花子がイベント4に申請 → 拒否
(
  'd5555555-5555-5555-5555-555555555555',
  'e4444444-4444-4444-4444-444444444444',
  'b2222222-2222-2222-2222-222222222222',
  '上級練習会に挑戦したいです。',
  'rejected'
);

-- =============================================================================
-- チャットメッセージ（承認済みの関係者間のみ）
-- =============================================================================
INSERT INTO sports_event_hub.chat_messages (event_id, sender_id, receiver_id, content, is_read) VALUES
-- イベント1: 太郎（主催者）↔ 花子（承認済み参加者）
(
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  '申請ありがとうございます！承認しました。当日お待ちしています。',
  true
),
(
  'e1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  'ありがとうございます！ラケットをお借りできますか？',
  true
),
(
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'もちろんです！貸出用のラケットを用意しておきますね。',
  false
),
-- イベント3: 花子（主催者）↔ 太郎（承認済み参加者）
(
  'e3333333-3333-3333-3333-333333333333',
  'b2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  '参加ありがとうございます！レベル分けの参考にしたいのですが、経験年数を教えていただけますか？',
  true
),
(
  'e3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  '5年ほどやっています。中級〜上級くらいだと思います。',
  false
);
