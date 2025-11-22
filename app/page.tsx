'use client'

import { useEffect, useState } from 'react'
import KegCard from '@/components/KegCard/KegCard'
import type { CurrentKegStatus } from '@/lib/types'
import { supabase, subscribeToKegChanges, subscribeToMeasurementChanges } from '@/lib/supabase'
import styles from './page.module.scss'

export default function Home() {
  const [kegs, setKegs] = useState<CurrentKegStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch kegs data
  const fetchKegs = async () => {
    try {
      const { data, error } = await supabase
        .from('current_keg_status')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setKegs(data || [])
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching kegs:', err)
      setError('Failed to load keg data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchKegs()

    // Set up real-time subscriptions
    const kegsChannel = subscribeToKegChanges(() => {
      console.log('Kegs table changed, refetching...')
      fetchKegs()
    })

    const measurementsChannel = subscribeToMeasurementChanges(null, () => {
      console.log('New measurement received, refetching...')
      fetchKegs()
    })

    // Auto-refresh every 5 seconds as fallback
    const interval = setInterval(fetchKegs, 5000)

    // Cleanup
    return () => {
      clearInterval(interval)
      supabase.removeChannel(kegsChannel)
      supabase.removeChannel(measurementsChannel)
    }
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading keg data...</p>
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
          <button className="btn btn-primary" onClick={fetchKegs}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1>Keg Dashboard</h1>
          <p className="text-muted">
            {kegs.length} active {kegs.length === 1 ? 'keg' : 'kegs'}
          </p>
        </div>
        <div className={styles.lastUpdate}>
          <span className="text-muted">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {kegs.length === 0 ? (
        <div className={styles.empty}>
          <h2>No Kegs Found</h2>
          <p className="text-muted">
            No active kegs in the system. Add a keg in the management interface.
          </p>
          <a href="/manage" className="btn btn-primary">
            Manage Kegs
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {kegs.map((keg) => (
            <KegCard key={keg.id} keg={keg} />
          ))}
        </div>
      )}
    </div>
  )
}
