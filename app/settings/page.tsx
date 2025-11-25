'use client'

import { useState, useEffect } from 'react'
import {
  getKegPresets,
  saveKegPresets,
  resetKegPresets,
  DEFAULT_KEG_PRESETS,
  type KegPresetKey,
  type KegPreset
} from '@/lib/kegPresets'
import styles from './page.module.scss'

export default function SettingsPage() {
  const [presets, setPresets] = useState(getKegPresets())
  const [editingKey, setEditingKey] = useState<KegPresetKey | null>(null)
  const [editForm, setEditForm] = useState<KegPreset | null>(null)

  const handleEdit = (key: KegPresetKey) => {
    if (key === 'custom') return // Don't allow editing custom preset
    setEditingKey(key)
    setEditForm({ ...presets[key] })
  }

  const handleSave = () => {
    if (!editingKey || !editForm) return

    const updated = {
      ...presets,
      [editingKey]: editForm
    }

    setPresets(updated)
    saveKegPresets(updated)
    setEditingKey(null)
    setEditForm(null)
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditForm(null)
  }

  const handleReset = () => {
    if (!confirm('Reset all presets to default values?')) return
    resetKegPresets()
    setPresets(getKegPresets())
    setEditingKey(null)
    setEditForm(null)
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1>Keg Preset Settings</h1>
          <p className="text-muted">
            Adjust default weights for keg types
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset to Defaults
        </button>
      </div>

      <div className={styles.presetGrid}>
        {Object.entries(presets).map(([key, preset]) => {
          if (key === 'custom') return null // Skip custom preset

          const isEditing = editingKey === key
          const displayPreset = isEditing && editForm ? editForm : preset

          return (
            <div key={key} className={styles.presetCard}>
              <div className={styles.presetHeader}>
                <div>
                  <h3>{preset.name}</h3>
                  <p className="text-muted">{preset.description}</p>
                </div>
                {!isEditing && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(key as KegPresetKey)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing && editForm ? (
                <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className={styles.formGroup}>
                    <label>Capacity (liters)</label>
                    <input
                      type="number"
                      value={editForm.capacity_liters}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        capacity_liters: parseFloat(e.target.value)
                      })}
                      step="0.1"
                      required
                    />
                    <small>{(editForm.capacity_liters * 0.264172).toFixed(2)} gallons</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Empty Weight (grams)</label>
                    <input
                      type="number"
                      value={editForm.empty_weight_grams}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        empty_weight_grams: parseFloat(e.target.value)
                      })}
                      step="10"
                      required
                    />
                    <small>{(editForm.empty_weight_grams / 1000).toFixed(2)} kg</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Full Weight (grams)</label>
                    <input
                      type="number"
                      value={editForm.full_weight_grams}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        full_weight_grams: parseFloat(e.target.value)
                      })}
                      step="10"
                      required
                    />
                    <small>{(editForm.full_weight_grams / 1000).toFixed(2)} kg</small>
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.presetDetails}>
                  <div className={styles.detailRow}>
                    <span className="text-muted">Capacity:</span>
                    <span>
                      {displayPreset.capacity_liters.toFixed(1)}L
                      ({(displayPreset.capacity_liters * 0.264172).toFixed(1)} gal)
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className="text-muted">Empty:</span>
                    <span>
                      {displayPreset.empty_weight_grams}g
                      ({(displayPreset.empty_weight_grams / 1000).toFixed(1)} kg)
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className="text-muted">Full:</span>
                    <span>
                      {displayPreset.full_weight_grams}g
                      ({(displayPreset.full_weight_grams / 1000).toFixed(1)} kg)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
