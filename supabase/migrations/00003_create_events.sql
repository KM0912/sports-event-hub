CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL CHECK (char_length(venue_name) BETWEEN 1 AND 100),
  venue_address TEXT NOT NULL CHECK (char_length(venue_address) BETWEEN 1 AND 200),
  municipality TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'all')),
  level_note TEXT CHECK (level_note IS NULL OR char_length(level_note) <= 200),
  capacity INTEGER NOT NULL CHECK (capacity >= 1),
  fee INTEGER NOT NULL CHECK (fee >= 0),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 2000),
  rules TEXT CHECK (rules IS NULL OR char_length(rules) <= 1000),
  equipment TEXT CHECK (equipment IS NULL OR char_length(equipment) <= 500),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  deadline_hours_before INTEGER CHECK (deadline_hours_before IS NULL OR deadline_hours_before BETWEEN 1 AND 72),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT events_end_after_start CHECK (end_datetime > start_datetime)
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 検索用インデックス
CREATE INDEX idx_events_start_datetime ON events (start_datetime);
CREATE INDEX idx_events_municipality ON events (municipality);
CREATE INDEX idx_events_level ON events (level);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_organizer_id ON events (organizer_id);
