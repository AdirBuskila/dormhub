-- Create dorm_events table for calendar activities
CREATE TABLE dorm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('party', 'game_night', 'drinking_night', 'study_group', 'movie_night', 'sports', 'food', 'other')),
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_cancelled BOOLEAN DEFAULT FALSE,
  attendee_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  tags TEXT[] DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create attendees table to track who's going
CREATE TABLE dorm_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES dorm_events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only have one status per event
  UNIQUE(event_id, profile_id)
);

-- Create indexes for better performance
CREATE INDEX idx_dorm_events_start_time ON dorm_events(start_time);
CREATE INDEX idx_dorm_events_event_type ON dorm_events(event_type);
CREATE INDEX idx_dorm_events_created_by ON dorm_events(created_by);
CREATE INDEX idx_dorm_event_attendees_event_id ON dorm_event_attendees(event_id);
CREATE INDEX idx_dorm_event_attendees_profile_id ON dorm_event_attendees(profile_id);

-- Create function to update attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE dorm_events
    SET attendee_count = (
      SELECT COUNT(*)
      FROM dorm_event_attendees
      WHERE event_id = NEW.event_id AND status = 'going'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE dorm_events
    SET attendee_count = (
      SELECT COUNT(*)
      FROM dorm_event_attendees
      WHERE event_id = OLD.event_id AND status = 'going'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update attendee count
CREATE TRIGGER trigger_update_attendee_count
AFTER INSERT OR UPDATE OR DELETE ON dorm_event_attendees
FOR EACH ROW
EXECUTE FUNCTION update_event_attendee_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dorm_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_dorm_events_updated_at
BEFORE UPDATE ON dorm_events
FOR EACH ROW
EXECUTE FUNCTION update_dorm_events_updated_at();

-- Enable RLS
ALTER TABLE dorm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dorm_event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dorm_events
-- Everyone can read events
CREATE POLICY "Anyone can view events"
  ON dorm_events FOR SELECT
  USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON dorm_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own events
CREATE POLICY "Users can update own events"
  ON dorm_events FOR UPDATE
  TO authenticated
  USING (created_by IN (
    SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON dorm_events FOR DELETE
  TO authenticated
  USING (created_by IN (
    SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS Policies for dorm_event_attendees
-- Everyone can view attendees
CREATE POLICY "Anyone can view attendees"
  ON dorm_event_attendees FOR SELECT
  USING (true);

-- Authenticated users can add themselves as attendees
CREATE POLICY "Users can manage their attendance"
  ON dorm_event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Users can update their own attendance
CREATE POLICY "Users can update own attendance"
  ON dorm_event_attendees FOR UPDATE
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Users can delete their own attendance
CREATE POLICY "Users can delete own attendance"
  ON dorm_event_attendees FOR DELETE
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Grant permissions
GRANT ALL ON dorm_events TO authenticated;
GRANT ALL ON dorm_event_attendees TO authenticated;
GRANT SELECT ON dorm_events TO anon;
GRANT SELECT ON dorm_event_attendees TO anon;

