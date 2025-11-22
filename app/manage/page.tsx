'use client'

import { useEffect, useState } from 'react'
import type { Keg } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import KegForm from '@/components/KegForm/KegForm'
import { getSrmColor, formatAbv, formatIbu } from '@/lib/types'
import styles from './page.module.scss'

export default function ManagePage() {
  const [kegs, setKegs] = useState<Keg[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingKeg, setEditingKeg] = useState<Keg | undefined>()

  const fetchKegs = async () => {
    try {
      const { data, error } = await supabase
        .from('kegs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKegs(data || [])
    } catch (err) {
      console.error('Error fetching kegs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKegs()
  }, [])

  const handleAdd = () => {
    setEditingKeg(undefined)
    setShowForm(true)
  }

  const handleEdit = (keg: Keg) => {
    setEditingKeg(keg)
    setShowForm(true)
  }

  const handleDelete = async (keg: Keg) => {
    if (!confirm(`Delete "${keg.name}"? This cannot be undone.`)) return

    try {
      const { error } = await (supabase
        .from('kegs') as any)
        .delete()
        .eq('id', keg.id)

      if (error) throw error
      fetchKegs()
    } catch (err) {
      console.error('Error deleting keg:', err)
      alert('Failed to delete keg')
    }
  }

  const handleToggleActive = async (keg: Keg) => {
    try {
      const { error } = await (supabase
        .from('kegs') as any)
        .update({ is_active: !keg.is_active })
        .eq('id', keg.id)

      if (error) throw error
      fetchKegs()
    } catch (err) {
      console.error('Error toggling keg status:', err)
      alert('Failed to update keg status')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingKeg(undefined)
    fetchKegs()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingKeg(undefined)
  }

  if (showForm) {
    return (
      <div className="container">
        <KegForm
          keg={editingKeg}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1>Manage Kegs</h1>
          <p className="text-muted">
            {kegs.length} {kegs.length === 1 ? 'keg' : 'kegs'} in system
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Keg
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading kegs...</p>
        </div>
      ) : kegs.length === 0 ? (
        <div className={styles.empty}>
          <h2>No Kegs Yet</h2>
          <p className="text-muted">
            Add your first keg to start monitoring.
          </p>
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Keg
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {kegs.map((keg) => (
            <div key={keg.id} className={styles.kegItem}>
              <div className={styles.kegHeader}>
                <div>
                  <h3>{keg.name}</h3>
                  <p className="text-muted">{keg.beer_name || 'No beer assigned'}</p>
                </div>
                <div className={styles.badges}>
                  <span className={`status ${keg.is_active ? 'ok' : ''}`}>
                    {keg.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className={styles.kegDetails}>
                <div className={styles.detailRow}>
                  <span className="text-muted">Device:</span>
                  <span>{keg.device_id}</span>
                </div>

                {keg.brewery && (
                  <div className={styles.detailRow}>
                    <span className="text-muted">Brewery:</span>
                    <span>{keg.brewery}</span>
                  </div>
                )}

                {keg.style && (
                  <div className={styles.detailRow}>
                    <span className="text-muted">Style:</span>
                    <span>{keg.style}</span>
                  </div>
                )}

                {keg.srm && (
                  <div className={styles.detailRow}>
                    <span className="text-muted">Color:</span>
                    <div className={styles.srmIndicator}>
                      <div
                        className={styles.srmColor}
                        style={{ backgroundColor: getSrmColor(keg.srm) }}
                      />
                      <span>SRM {keg.srm}</span>
                    </div>
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span className="text-muted">Specs:</span>
                  <span>
                    {formatAbv(keg.abv)} • {formatIbu(keg.ibu)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className="text-muted">Capacity:</span>
                  <span>{keg.capacity_liters.toFixed(1)}L</span>
                </div>

                <div className={styles.detailRow}>
                  <span className="text-muted">Empty:</span>
                  <span>{(keg.empty_weight_grams / 1000).toFixed(1)}kg</span>
                </div>

                <div className={styles.detailRow}>
                  <span className="text-muted">Full:</span>
                  <span>{(keg.full_weight_grams / 1000).toFixed(1)}kg</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleToggleActive(keg)}
                >
                  {keg.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEdit(keg)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleDelete(keg)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
