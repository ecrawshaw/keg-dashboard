// Database Types

export interface Keg {
  id: string
  name: string
  beer_name: string | null
  brewery: string | null
  style: string | null
  abv: number | null
  ibu: number | null
  description: string | null
  srm: number | null
  full_weight_grams: number
  empty_weight_grams: number
  capacity_liters: number
  is_active: boolean
  device_id: string
  tapped_at: string | null
  kicked_at: string | null
  created_at: string
  updated_at: string
}

export interface WeightMeasurement {
  id: number
  device_id: string
  mac_address: string | null
  keg_id: string | null
  weight_grams: number
  temperature_celsius: number | null
  esp32_timestamp: number
  created_at: string
}

export interface Device {
  id: string
  device_id: string
  name: string
  calibration_factor: number
  tare_offset: number
  smoothing_factor: number
  num_readings: number
  reading_interval: number
  is_online: boolean
  last_seen_at: string | null
  ip_address: string | null
  mac_address: string | null
  firmware_version: string | null
  created_at: string
  updated_at: string
}

export interface KegSession {
  id: string
  keg_id: string
  beer_name: string
  brewery: string | null
  style: string | null
  abv: number | null
  ibu: number | null
  full_weight_grams: number
  empty_weight_grams: number
  capacity_liters: number | null
  tapped_at: string
  kicked_at: string | null
  total_pours: number
  total_consumed_liters: number | null
  average_pour_liters: number | null
  created_at: string
}

export interface CurrentKegStatus {
  id: string
  name: string
  beer_name: string | null
  brewery: string | null
  style: string | null
  abv: number | null
  ibu: number | null
  description: string | null
  srm: number | null
  device_id: string
  full_weight_grams: number
  empty_weight_grams: number
  capacity_liters: number
  tapped_at: string | null
  kicked_at: string | null
  current_weight_grams: number | null
  last_reading_at: string | null
  seconds_since_reading: number | null
  beer_weight_grams: number
  full_beer_weight_grams: number
  percentage_full: number
  liters_remaining: number
  pints_remaining: number
  status: 'no_data' | 'empty' | 'low' | 'ok' | 'full'
}

export interface ConsumptionData {
  time_bucket: string
  avg_weight: number
  liters_consumed: number
}

// Form Types
export interface KegFormData {
  name: string
  beer_name: string
  brewery: string
  style: string
  abv: number | null
  ibu: number | null
  description: string
  srm: number | null
  full_weight_grams: number
  empty_weight_grams: number
  capacity_liters: number
  device_id: string
  tapped_at: string | null
}

// SRM Color mapping
export function getSrmColor(srm: number | null): string {
  if (!srm) return '#FFE699'

  const srmColors: Record<number, string> = {
    1: '#FFE699',
    2: '#FFD878',
    3: '#FFCA5A',
    4: '#FFBF42',
    5: '#FBB123',
    6: '#F8A600',
    8: '#F39C00',
    10: '#EA8F00',
    13: '#E58500',
    17: '#DD7900',
    20: '#D26900',
    24: '#CA6500',
    29: '#BF5B00',
    35: '#B54C00',
    40: '#A64200',
  }

  // Find the closest SRM value
  const srmKeys = Object.keys(srmColors).map(Number).sort((a, b) => a - b)
  const closest = srmKeys.reduce((prev, curr) =>
    Math.abs(curr - srm) < Math.abs(prev - srm) ? curr : prev
  )

  return srmColors[closest]
}

// Status color mapping
export function getStatusColor(status: CurrentKegStatus['status']): string {
  const statusColors = {
    no_data: '#94a3b8', // gray
    empty: '#ef4444',   // red
    low: '#f59e0b',     // orange
    ok: '#3b82f6',      // blue
    full: '#10b981',    // green
  }

  return statusColors[status]
}

// Format helpers
export function formatVolume(liters: number): string {
  return `${liters.toFixed(1)}L`
}

export function formatPints(pints: number): string {
  return `${Math.floor(pints)} pints`
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

export function formatAbv(abv: number | null): string {
  return abv ? `${abv.toFixed(1)}% ABV` : 'N/A'
}

export function formatIbu(ibu: number | null): string {
  return ibu ? `${ibu} IBU` : 'N/A'
}
