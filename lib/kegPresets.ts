// Keg preset types and default values
export interface KegPreset {
  name: string
  capacity_liters: number
  empty_weight_grams: number
  full_weight_grams: number
  description: string
}

export type KegPresetKey = 'half-barrel' | 'quarter-barrel' | 'sixth-barrel' | 'cornelius' | 'custom'

// Default preset values
export const DEFAULT_KEG_PRESETS: Record<KegPresetKey, KegPreset> = {
  'half-barrel': {
    name: 'Half Barrel',
    capacity_liters: 58.67,
    empty_weight_grams: 13500,
    full_weight_grams: 72800,
    description: '15.5 gallons (standard US keg)'
  },
  'quarter-barrel': {
    name: 'Quarter Barrel',
    capacity_liters: 29.34,
    empty_weight_grams: 8200,
    full_weight_grams: 38100,
    description: '7.75 gallons (pony keg)'
  },
  'sixth-barrel': {
    name: 'Sixth Barrel',
    capacity_liters: 19.53,
    empty_weight_grams: 6800,
    full_weight_grams: 26600,
    description: '5.16 gallons (sixtel)'
  },
  'cornelius': {
    name: 'Cornelius Keg',
    capacity_liters: 19.0,
    empty_weight_grams: 4000,
    full_weight_grams: 23000,
    description: '5 gallons (homebrew keg)'
  },
  'custom': {
    name: 'Custom',
    capacity_liters: 58.67,
    empty_weight_grams: 13500,
    full_weight_grams: 72800,
    description: 'Enter custom values'
  }
}

const STORAGE_KEY = 'keg-presets'

// Get keg presets (from localStorage or defaults)
export function getKegPresets(): Record<KegPresetKey, KegPreset> {
  if (typeof window === 'undefined') {
    return DEFAULT_KEG_PRESETS
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all presets exist
      return { ...DEFAULT_KEG_PRESETS, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load keg presets:', error)
  }

  return DEFAULT_KEG_PRESETS
}

// Save keg presets to localStorage
export function saveKegPresets(presets: Record<KegPresetKey, KegPreset>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch (error) {
    console.error('Failed to save keg presets:', error)
  }
}

// Update a single preset
export function updateKegPreset(key: KegPresetKey, preset: Partial<KegPreset>): void {
  const presets = getKegPresets()
  presets[key] = { ...presets[key], ...preset }
  saveKegPresets(presets)
}

// Reset presets to defaults
export function resetKegPresets(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
