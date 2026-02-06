-- Enable RLS on all tables
ALTER TABLE sports_event_hub.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_event_hub.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_event_hub.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_event_hub.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_event_hub.blocks ENABLE ROW LEVEL SECURITY;

-- Profiles: 全ユーザー閲覧可、本人のみ作成・更新
CREATE POLICY "profiles_select" ON sports_event_hub.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON sports_event_hub.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON sports_event_hub.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events: 全ユーザー閲覧可、認証済みユーザーが作成、主催者のみ更新
CREATE POLICY "events_select" ON sports_event_hub.events
  FOR SELECT USING (true);

CREATE POLICY "events_insert" ON sports_event_hub.events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update" ON sports_event_hub.events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Applications: 申請者本人または主催者が閲覧、認証済みユーザーが作成、本人または主催者が更新
CREATE POLICY "applications_select" ON sports_event_hub.applications
  FOR SELECT USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (
      SELECT organizer_id FROM sports_event_hub.events WHERE id = event_id
    )
  );

CREATE POLICY "applications_insert" ON sports_event_hub.applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "applications_update" ON sports_event_hub.applications
  FOR UPDATE USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (
      SELECT organizer_id FROM sports_event_hub.events WHERE id = event_id
    )
  );

-- Chat Messages: 送信者または受信者のみ閲覧、認証済みユーザーが作成、受信者のみ更新（既読）
CREATE POLICY "chat_messages_select" ON sports_event_hub.chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "chat_messages_insert" ON sports_event_hub.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "chat_messages_update" ON sports_event_hub.chat_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Blocks: ブロックした主催者のみ閲覧・作成・削除
CREATE POLICY "blocks_select" ON sports_event_hub.blocks
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "blocks_insert" ON sports_event_hub.blocks
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "blocks_delete" ON sports_event_hub.blocks
  FOR DELETE USING (auth.uid() = organizer_id);
