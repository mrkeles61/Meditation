-- Migration: Add auto-check columns to habits and habit_logs, create gym_locations table
-- Run this in the Supabase SQL editor

-- 1. Add auto-check columns to habits table
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS auto_check_type text
    CHECK (auto_check_type IN ('steps_daily', 'steps_morning', 'sleep_duration', 'gym_geofence')),
  ADD COLUMN IF NOT EXISTS auto_check_config jsonb;

-- 2. Add source tracking to habit_logs
ALTER TABLE habit_logs
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'voice', 'auto_detected')),
  ADD COLUMN IF NOT EXISTS source_metadata jsonb;

-- 3. Create gym_locations table for multi-gym support
CREATE TABLE IF NOT EXISTS gym_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    radius_meters integer NOT NULL DEFAULT 100,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS on gym_locations
ALTER TABLE gym_locations ENABLE ROW LEVEL SECURITY;

-- 5. RLS policy: users can only access their own gym locations
CREATE POLICY "Users can manage their own gym locations"
    ON gym_locations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Index for faster user queries
CREATE INDEX IF NOT EXISTS gym_locations_user_id_idx ON gym_locations(user_id);
