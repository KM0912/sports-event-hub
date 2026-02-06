CREATE TABLE sports_event_hub.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES sports_event_hub.events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES sports_event_hub.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES sports_event_hub.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_event_id ON sports_event_hub.chat_messages (event_id);
CREATE INDEX idx_chat_messages_sender_id ON sports_event_hub.chat_messages (sender_id);
CREATE INDEX idx_chat_messages_receiver_id ON sports_event_hub.chat_messages (receiver_id);
