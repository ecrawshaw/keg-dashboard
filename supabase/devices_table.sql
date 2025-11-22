-- Devices table for storing ESP32 scale configuration
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,  -- e.g., 'keg-scale-1'
  name TEXT NOT NULL,              -- Friendly name for display

  -- Calibration settings
  calibration_factor FLOAT DEFAULT -19.17,
  tare_offset FLOAT DEFAULT 0,

  -- Smoothing settings
  smoothing_factor FLOAT DEFAULT 0.2,
  num_readings INT DEFAULT 20,

  -- Reading interval (milliseconds)
  reading_interval INT DEFAULT 5000,

  -- Device status
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  ip_address TEXT,
  mac_address TEXT,
  firmware_version TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by device_id
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS devices_updated_at ON devices;
CREATE TRIGGER devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_devices_updated_at();

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for ESP32 to fetch config)
CREATE POLICY "Allow public read access" ON devices
  FOR SELECT USING (true);

-- Policy: Allow public insert/update (for ESP32 to register and update status)
CREATE POLICY "Allow public insert" ON devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON devices
  FOR UPDATE USING (true);

-- Insert default device for keg-scale-1
INSERT INTO devices (device_id, name, calibration_factor, smoothing_factor, num_readings, reading_interval)
VALUES ('keg-scale-1', 'Keg Scale 1', -19.17, 0.2, 20, 5000)
ON CONFLICT (device_id) DO NOTHING;
