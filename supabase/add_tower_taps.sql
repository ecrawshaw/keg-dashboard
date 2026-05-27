-- Add tower/tap positioning and logo URL to kegs
-- Run this in your Supabase SQL Editor

ALTER TABLE kegs
  ADD COLUMN IF NOT EXISTS tower_number INTEGER,
  ADD COLUMN IF NOT EXISTS tap_position INTEGER,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Optional uniqueness: only one active keg per (tower, tap)
CREATE UNIQUE INDEX IF NOT EXISTS idx_kegs_active_tower_tap
  ON kegs (tower_number, tap_position)
  WHERE is_active = true
    AND tower_number IS NOT NULL
    AND tap_position IS NOT NULL;

-- Recreate the view to expose the new columns
DROP VIEW IF EXISTS current_keg_status;

CREATE VIEW current_keg_status AS
WITH latest_weights AS (
  SELECT DISTINCT ON (keg_id)
    keg_id,
    weight_grams,
    created_at
  FROM weight_measurements
  ORDER BY keg_id, created_at DESC
)
SELECT
  k.id,
  k.name,
  k.beer_name,
  k.brewery,
  k.style,
  k.abv,
  k.ibu,
  k.description,
  k.srm,
  k.logo_url,
  k.tower_number,
  k.tap_position,
  k.device_id,
  k.full_weight_grams,
  k.empty_weight_grams,
  k.capacity_liters,
  k.tapped_at,
  k.kicked_at,
  lw.weight_grams AS current_weight_grams,
  lw.created_at AS last_reading_at,
  EXTRACT(EPOCH FROM (NOW() - lw.created_at))::INTEGER AS seconds_since_reading,
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    ELSE lw.weight_grams - k.empty_weight_grams
  END AS beer_weight_grams,
  (k.full_weight_grams - k.empty_weight_grams) AS full_beer_weight_grams,
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE LEAST(100,
      ((lw.weight_grams - k.empty_weight_grams)::FLOAT /
       (k.full_weight_grams - k.empty_weight_grams)::FLOAT * 100)
    )
  END AS percentage_full,
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE (lw.weight_grams - k.empty_weight_grams)::FLOAT / 1000 *
         (k.capacity_liters / ((k.full_weight_grams - k.empty_weight_grams)::FLOAT / 1000))
  END AS liters_remaining,
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE (lw.weight_grams - k.empty_weight_grams)::FLOAT / 1000 *
         (k.capacity_liters / ((k.full_weight_grams - k.empty_weight_grams)::FLOAT / 1000)) / 0.473
  END AS pints_remaining,
  CASE
    WHEN lw.weight_grams IS NULL THEN 'no_data'
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 'empty'
    WHEN ((lw.weight_grams - k.empty_weight_grams)::FLOAT /
          NULLIF((k.full_weight_grams - k.empty_weight_grams)::FLOAT, 0) * 100) < 10 THEN 'low'
    WHEN ((lw.weight_grams - k.empty_weight_grams)::FLOAT /
          NULLIF((k.full_weight_grams - k.empty_weight_grams)::FLOAT, 0) * 100) > 90 THEN 'full'
    ELSE 'ok'
  END AS status
FROM kegs k
LEFT JOIN latest_weights lw ON lw.keg_id = k.id
WHERE k.is_active = true;
