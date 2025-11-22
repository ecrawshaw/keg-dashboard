'use client'

import { useState } from 'react'
import type { Keg, KegFormData } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import styles from './KegForm.module.scss'

interface KegFormProps {
  keg?: Keg
  onSuccess: () => void
  onCancel: () => void
}

export default function KegForm({ keg, onSuccess, onCancel }: KegFormProps) {
  const isEditing = !!keg

  const [formData, setFormData] = useState<KegFormData>({
    name: keg?.name || '',
    beer_name: keg?.beer_name || '',
    brewery: keg?.brewery || '',
    style: keg?.style || '',
    abv: keg?.abv || null,
    ibu: keg?.ibu || null,
    description: keg?.description || '',
    srm: keg?.srm || null,
    full_weight_grams: keg?.full_weight_grams || 70000,
    empty_weight_grams: keg?.empty_weight_grams || 15000,
    capacity_liters: keg?.capacity_liters || 58.67,
    device_id: keg?.device_id || 'keg-scale-1',
    tapped_at: keg?.tapped_at || new Date().toISOString(),
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing keg
        const { error: updateError } = await supabase
          .from('kegs')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', keg.id)

        if (updateError) throw updateError
      } else {
        // Create new keg
        const { error: insertError } = await supabase
          .from('kegs')
          .insert([formData])

        if (insertError) throw insertError
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving keg:', err)
      setError(err.message || 'Failed to save keg')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{isEditing ? 'Edit Keg' : 'Add New Keg'}</h2>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Keg Identification */}
      <div className={styles.section}>
        <h3>Keg Information</h3>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Keg Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Tap 1"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="device_id">Device ID *</label>
            <input
              type="text"
              id="device_id"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              required
              placeholder="keg-scale-1"
            />
          </div>
        </div>
      </div>

      {/* Beer Details */}
      <div className={styles.section}>
        <h3>Beer Details</h3>

        <div className={styles.formGroup}>
          <label htmlFor="beer_name">Beer Name</label>
          <input
            type="text"
            id="beer_name"
            name="beer_name"
            value={formData.beer_name}
            onChange={handleChange}
            placeholder="Hazy IPA"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="brewery">Brewery</label>
            <input
              type="text"
              id="brewery"
              name="brewery"
              value={formData.brewery}
              onChange={handleChange}
              placeholder="Local Brewery"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="style">Style</label>
            <input
              type="text"
              id="style"
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="New England IPA"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="abv">ABV (%)</label>
            <input
              type="number"
              id="abv"
              name="abv"
              value={formData.abv || ''}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="20"
              placeholder="6.5"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ibu">IBU</label>
            <input
              type="number"
              id="ibu"
              name="ibu"
              value={formData.ibu || ''}
              onChange={handleChange}
              step="1"
              min="0"
              max="150"
              placeholder="45"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="srm">SRM (Color)</label>
            <input
              type="number"
              id="srm"
              name="srm"
              value={formData.srm || ''}
              onChange={handleChange}
              step="1"
              min="1"
              max="40"
              placeholder="6"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Crisp and refreshing with notes of citrus..."
          />
        </div>
      </div>

      {/* Weight Calibration */}
      <div className={styles.section}>
        <h3>Weight Calibration</h3>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="empty_weight_grams">Empty Weight (grams) *</label>
            <input
              type="number"
              id="empty_weight_grams"
              name="empty_weight_grams"
              value={formData.empty_weight_grams}
              onChange={handleChange}
              required
              step="10"
              min="0"
              placeholder="15000"
            />
            <small>Weight of empty keg</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="full_weight_grams">Full Weight (grams) *</label>
            <input
              type="number"
              id="full_weight_grams"
              name="full_weight_grams"
              value={formData.full_weight_grams}
              onChange={handleChange}
              required
              step="10"
              min="0"
              placeholder="70000"
            />
            <small>Weight when full</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity_liters">Capacity (liters) *</label>
            <input
              type="number"
              id="capacity_liters"
              name="capacity_liters"
              value={formData.capacity_liters}
              onChange={handleChange}
              required
              step="0.1"
              min="0"
              placeholder="58.67"
            />
            <small>Half barrel = 58.67L</small>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Keg' : 'Create Keg'}
        </button>
      </div>
    </form>
  )
}
