-- sports_event_hub スキーマを作成
CREATE SCHEMA IF NOT EXISTS sports_event_hub;

-- anon / authenticated ロールにスキーマの使用権限とテーブルアクセス権限を付与
GRANT USAGE ON SCHEMA sports_event_hub TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA sports_event_hub
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
