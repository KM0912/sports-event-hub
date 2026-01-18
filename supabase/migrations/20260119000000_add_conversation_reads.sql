-- 会話の既読管理テーブル
CREATE TABLE IF NOT EXISTS public.conversation_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(conversation_id, user_id)
);

-- RLS有効化
ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own reads" ON public.conversation_reads
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own reads" ON public.conversation_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reads" ON public.conversation_reads
    FOR UPDATE USING (user_id = auth.uid());

-- インデックス
CREATE INDEX idx_conversation_reads_user_id ON public.conversation_reads(user_id);
CREATE INDEX idx_conversation_reads_conversation_id ON public.conversation_reads(conversation_id);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_reads;
