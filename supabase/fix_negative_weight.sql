-- Fix for negative weight showing as full
-- Run this in your Supabase SQL Editor

-- Must drop first due to column order mismatch
DROP VIEW IF EXISTS current_keg_status;

-- Recreate the view with proper negative handling
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
  k.device_id,
  k.full_weight_grams,
  k.empty_weight_grams,
  k.capacity_liters,
  k.tapped_at,
  k.kicked_at,
  lw.weight_grams AS current_weight_grams,
  lw.created_at AS last_reading_at,
  EXTRACT(EPOCH FROM (NOW() - lw.created_at))::INTEGER AS seconds_since_reading,
  -- Beer weight: if current weight is below empty weight, show 0
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    ELSE lw.weight_grams - k.empty_weight_grams
  END AS beer_weight_grams,
  -- Full beer weight
  (k.full_weight_grams - k.empty_weight_grams) AS full_beer_weight_grams,
  -- Percentage: explicit 0 for negative/empty, clamped to 100 max
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE LEAST(100,
      ((lw.weight_grams - k.empty_weight_grams)::FLOAT /
       (k.full_weight_grams - k.empty_weight_grams)::FLOAT * 100)
    )
  END AS percentage_full,
  -- Liters remaining
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE (lw.weight_grams - k.empty_weight_grams)::FLOAT / 1000 *
         (k.capacity_liters / ((k.full_weight_grams - k.empty_weight_grams)::FLOAT / 1000))
  END AS liters_remaining,
  -- Pints remaining (1 pint = 0.473 liters)
  CASE
    WHEN lw.weight_grams IS NULL THEN 0
    WHEN lw.weight_grams <= k.empty_weight_grams THEN 0
    WHEN k.full_weight_grams <= k.empty_weight_grams THEN 0
    ELSE (lw.weight_grams - k.empty_weight_grams)::FLOAT / 1000 *
         (k.capacity_liters / ((k.full_weight_grams - k.empty_weight_grams)::FLOAT / 1000)) / 0.473
  END AS pints_remaining,
  -- Status
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
