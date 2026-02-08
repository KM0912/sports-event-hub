-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Profiles: 全ユーザー閲覧可、本人のみ作成・更新
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events: 全ユーザー閲覧可、認証済みユーザーが作成、主催者のみ更新
CREATE POLICY "events_select" ON events
  FOR SELECT USING (true);

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Applications: 申請者本人または主催者が閲覧、認証済みユーザーが作成、本人または主催者が更新
CREATE POLICY "applications_select" ON applications
  FOR SELECT USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (
      SELECT organizer_id FROM events WHERE id = event_id
    )
  );

CREATE POLICY "applications_insert" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "applications_update" ON applications
  FOR UPDATE USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (
      SELECT organizer_id FROM events WHERE id = event_id
    )
  );

-- Chat Messages: 送信者または受信者のみ閲覧、認証済みユーザーが作成、受信者のみ更新（既読）
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "chat_messages_update" ON chat_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Blocks: ブロックした主催者のみ閲覧・作成・削除
CREATE POLICY "blocks_select" ON blocks
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "blocks_insert" ON blocks
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "blocks_delete" ON blocks
  FOR DELETE USING (auth.uid() = organizer_id);
