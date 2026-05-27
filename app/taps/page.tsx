'use client'

import { useEffect, useState } from 'react'
import TapTower from '@/components/TapTower/TapTower'
import type { CurrentKegStatus } from '@/lib/types'
import { supabase, subscribeToKegChanges, subscribeToMeasurementChanges } from '@/lib/supabase'
import styles from './page.module.scss'

const TOWERS = [1, 2]
const TAPS_PER_TOWER = 3

export default function TapsPage() {
  const [kegs, setKegs] = useState<CurrentKegStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleKegUpdate = (kegId: string, updates: Partial<CurrentKegStatus>) => {
    setKegs((prev) =>
      prev.map((keg) =>
        keg.id === kegId ? { ...keg, ...updates } : keg
      )
    )
  }

  const handleKegKick = async (kegId: string) => {
    try {
      const { error } = await supabase
        .from('kegs')
        .update({ is_active: false, kicked_at: new Date().toISOString() })
        .eq('id', kegId)

      if (error) throw error

      // Immediately reflect in local state while realtime subscription catches up
      setKegs((prev) =>
        prev.map((keg) =>
          keg.id === kegId ? { ...keg, is_active: false, kicked_at: new Date().toISOString() } : keg
        )
      )

      // Re-fetch to get clean state from server (realtime may refetch too)
      await fetchKegs()
    } catch (err) {
      console.error('Error kicking keg:', err)
      alert('Failed to kick keg')
    }
  }

  const fetchKegs = async () => {
    try {
      const { data, error } = await supabase
        .from('current_keg_status')
        .select('*')

      if (error) throw error
      setKegs((data || []) as CurrentKegStatus[])
      setError(null)
    } catch (err) {
      console.error('Error fetching kegs:', err)
      setError('Failed to load tap data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKegs()

    const kegsChannel = subscribeToKegChanges(() => fetchKegs())
    const measurementsChannel = subscribeToMeasurementChanges(null, () => fetchKegs())

    return () => {
      supabase.removeChannel(kegsChannel)
      supabase.removeChannel(measurementsChannel)
    }
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading taps...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchKegs}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <h1>On Tap</h1>
        <p className="text-muted">What's pouring across your towers</p>
      </div>

      <div className={styles.towers}>
        {TOWERS.map((towerNumber) => {
          const taps: (CurrentKegStatus | null)[] = []
          for (let pos = 1; pos <= TAPS_PER_TOWER; pos++) {
            const keg = kegs.find(
              (k) => k.tower_number === towerNumber && k.tap_position === pos
            )
            taps.push(keg ?? null)
          }
          return <TapTower key={towerNumber} towerNumber={towerNumber} taps={taps} onKegUpdate={handleKegUpdate} onKegKick={handleKegKick} />
        })}
      </div>
    </div>
  )
}
