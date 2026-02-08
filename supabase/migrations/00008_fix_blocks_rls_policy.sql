-- ブロック対象ユーザーも自分のブロックレコードを確認できるように修正
-- Server Actionのブロックチェックが正しく動作するために必要
DROP POLICY "blocks_select" ON blocks;

CREATE POLICY "blocks_select" ON blocks
  FOR SELECT USING (
    auth.uid() = organizer_id
    OR auth.uid() = blocked_user_id
  );
