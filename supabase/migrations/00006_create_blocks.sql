CREATE TABLE sports_event_hub.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES sports_event_hub.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES sports_event_hub.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blocks_no_self_block CHECK (organizer_id != blocked_user_id),
  CONSTRAINT blocks_unique_pair UNIQUE (organizer_id, blocked_user_id)
);
