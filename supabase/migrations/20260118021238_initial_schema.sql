-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    fee INTEGER NOT NULL CHECK (fee >= 0),
    visitor_capacity INTEGER NOT NULL CHECK (visitor_capacity > 0),
    level TEXT NOT NULL CHECK (level = ANY (ARRAY['beginner'::text, 'novice'::text, 'intermediate'::text, 'advanced'::text, 'all'::text])),
    level_notes TEXT,
    equipment TEXT,
    participation_rules TEXT NOT NULL,
    notes TEXT,
    application_deadline TIMESTAMPTZ,
    chat_expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status = ANY (ARRAY['published'::text, 'canceled'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (end_at > start_at)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'canceled'::text])),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, participant_user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create host_blocks table
CREATE TABLE IF NOT EXISTS public.host_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(host_user_id, blocked_user_id),
    CHECK (host_user_id <> blocked_user_id)
);

-- Create function to get approved count
CREATE OR REPLACE FUNCTION public.get_approved_count(event_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.applications
  WHERE event_id = event_uuid AND status = 'approved';
$$;

-- Create function to check if user can apply
CREATE OR REPLACE FUNCTION public.can_apply_to_event(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record RECORD;
  is_blocked BOOLEAN;
  already_applied BOOLEAN;
  spots_available BOOLEAN;
BEGIN
  -- Get event info
  SELECT * INTO event_record FROM events WHERE id = event_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if event is published
  IF event_record.status != 'published' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if deadline passed
  IF event_record.application_deadline IS NOT NULL AND NOW() > event_record.application_deadline THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is blocked
  SELECT EXISTS(
    SELECT 1 FROM host_blocks 
    WHERE host_user_id = event_record.host_user_id 
    AND blocked_user_id = user_uuid
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already applied
  SELECT EXISTS(
    SELECT 1 FROM applications 
    WHERE event_id = event_uuid 
    AND user_id = user_uuid 
    AND status NOT IN ('canceled', 'rejected')
  ) INTO already_applied;
  
  IF already_applied THEN
    RETURN FALSE;
  END IF;
  
  -- Check spots available
  SELECT (get_approved_count(event_uuid) < event_record.visitor_capacity) INTO spots_available;
  
  RETURN spots_available;
END;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger function for chat_expires_at
CREATE OR REPLACE FUNCTION public.set_chat_expires_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.chat_expires_at = NEW.end_at + INTERVAL '48 hours';
  RETURN NEW;
END;
$$;

-- Create view for events with remaining spots
CREATE OR REPLACE VIEW public.events_with_spots AS
SELECT 
    e.id,
    e.host_user_id,
    e.title,
    e.start_at,
    e.end_at,
    e.chat_expires_at,
    e.venue_name,
    e.address,
    e.city,
    e.level,
    e.fee,
    e.visitor_capacity,
    e.description,
    e.participation_rules,
    e.equipment,
    e.notes,
    e.application_deadline,
    e.status,
    e.created_at,
    e.updated_at,
    e.level_notes,
    p.display_name AS host_display_name,
    (e.visitor_capacity - get_approved_count(e.id)) AS remaining_spots
FROM public.events e
JOIN public.profiles p ON e.host_user_id = p.id;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust as needed)
-- Profiles: users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Events: everyone can read published events, hosts can manage their own
CREATE POLICY "Published events are viewable by everyone" ON public.events
    FOR SELECT USING (status = 'published' OR host_user_id = auth.uid());

CREATE POLICY "Hosts can insert their own events" ON public.events
    FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can update their own events" ON public.events
    FOR UPDATE USING (host_user_id = auth.uid());

CREATE POLICY "Hosts can delete their own events" ON public.events
    FOR DELETE USING (host_user_id = auth.uid());

-- Applications: users can view their own applications, hosts can view applications for their events
CREATE POLICY "Users can view their own applications" ON public.applications
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events WHERE id = applications.event_id AND host_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own applications" ON public.applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hosts can update applications for their events" ON public.applications
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.events WHERE id = applications.event_id AND host_user_id = auth.uid()
    ));

-- Conversations: participants can view their conversations
CREATE POLICY "Participants can view their conversations" ON public.conversations
    FOR SELECT USING (host_user_id = auth.uid() OR participant_user_id = auth.uid());

CREATE POLICY "Participants can insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (host_user_id = auth.uid() OR participant_user_id = auth.uid());

-- Messages: participants can view and insert messages in their conversations
CREATE POLICY "Participants can view messages" ON public.messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (host_user_id = auth.uid() OR participant_user_id = auth.uid())
    ));

CREATE POLICY "Participants can insert messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_user_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = messages.conversation_id 
            AND (host_user_id = auth.uid() OR participant_user_id = auth.uid())
        )
    );

-- Host blocks: users can manage their own blocks
CREATE POLICY "Users can view their own blocks" ON public.host_blocks
    FOR SELECT USING (host_user_id = auth.uid());

CREATE POLICY "Users can insert their own blocks" ON public.host_blocks
    FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Users can delete their own blocks" ON public.host_blocks
    FOR DELETE USING (host_user_id = auth.uid());

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_events_chat_expires_at
    BEFORE INSERT OR UPDATE OF end_at ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.set_chat_expires_at();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_host_user_id ON public.events(host_user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_applications_event_id ON public.applications(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_conversations_event_id ON public.conversations(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
