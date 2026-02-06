CREATE TABLE sports_event_hub.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES sports_event_hub.events(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES sports_event_hub.profiles(id) ON DELETE CASCADE,
  comment TEXT CHECK (comment IS NULL OR char_length(comment) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON sports_event_hub.applications
  FOR EACH ROW EXECUTE FUNCTION sports_event_hub.update_updated_at();

-- 同一ユーザーが同一イベントにpending/approvedの申請を複数持てない
CREATE UNIQUE INDEX unique_active_application
  ON sports_event_hub.applications (event_id, applicant_id)
  WHERE status IN ('pending', 'approved');

CREATE INDEX idx_applications_event_id ON sports_event_hub.applications (event_id);
CREATE INDEX idx_applications_applicant_id ON sports_event_hub.applications (applicant_id);
