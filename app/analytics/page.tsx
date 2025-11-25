'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CurrentKegStatus } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import styles from './page.module.scss'

interface ConsumptionData {
  time: string
  liters: number
  weight: number
}

export default function AnalyticsPage() {
  const [kegs, setKegs] = useState<CurrentKegStatus[]>([])
  const [selectedKegId, setSelectedKegId] = useState<string>('')
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch kegs
  useEffect(() => {
    const fetchKegs = async () => {
      const { data } = await supabase
        .from('current_keg_status')
        .select('*')
        .order('name')

      const kegsData = data as CurrentKegStatus[] | null
      if (kegsData && kegsData.length > 0) {
        setKegs(kegsData)
        setSelectedKegId(kegsData[0].id)
      }
      setLoading(false)
    }

    fetchKegs()
  }, [])

  // Fetch consumption data when keg changes
  useEffect(() => {
    if (!selectedKegId) return

    const fetchConsumptionData = async () => {
      const hours = 24 // Only keeping 24 hours of data

      const { data } = await supabase
        .from('weight_measurements')
        .select('weight_grams, created_at')
        .eq('keg_id', selectedKegId)
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      const measurements = data as { weight_grams: number; created_at: string }[] | null
      if (measurements) {
        // Group by hour
        const grouped = measurements.reduce((acc: Record<string, { sum: number; count: number }>, item) => {
          const hour = new Date(item.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
          })

          if (!acc[hour]) {
            acc[hour] = { sum: 0, count: 0 }
          }

          acc[hour].sum += item.weight_grams
          acc[hour].count += 1

          return acc
        }, {})

        const chartData = Object.entries(grouped).map(([time, { sum, count }]) => ({
          time,
          weight: Math.round(sum / count),
          liters: Math.round((sum / count) / 1000 * 10) / 10,
        }))

        setConsumptionData(chartData)
      }
    }

    fetchConsumptionData()
  }, [selectedKegId])

  const selectedKeg = kegs.find((k) => k.id === selectedKegId)

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (kegs.length === 0) {
    return (
      <div className="container">
        <div className={styles.empty}>
          <h2>No Kegs Available</h2>
          <p className="text-muted">
            Add a keg to view analytics.
          </p>
          <a href="/manage" className="btn btn-primary">
            Manage Kegs
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <h1>Analytics</h1>

        <div className={styles.controls}>
          <select
            value={selectedKegId}
            onChange={(e) => setSelectedKegId(e.target.value)}
            className={styles.select}
          >
            {kegs.map((keg) => (
              <option key={keg.id} value={keg.id}>
                {keg.name} - {keg.beer_name || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedKeg && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Current Level</h3>
            <p className={styles.statValue}>{selectedKeg.percentage_full.toFixed(1)}%</p>
            <p className="text-muted">{selectedKeg.liters_remaining.toFixed(1)}L remaining</p>
          </div>

          <div className={styles.statCard}>
            <h3>Pints Remaining</h3>
            <p className={styles.statValue}>{selectedKeg.pints_remaining.toFixed(1)}</p>
            <p className="text-muted">US pints (473ml)</p>
          </div>

          <div className={styles.statCard}>
            <h3>Status</h3>
            <p className={styles.statValue}>
              <span className={`status ${selectedKeg.status}`}>
                {selectedKeg.status}
              </span>
            </p>
            <p className="text-muted">Current state</p>
          </div>

          <div className={styles.statCard}>
            <h3>Last Update</h3>
            <p className={styles.statValue}>
              {selectedKeg.last_reading_at
                ? new Date(selectedKeg.last_reading_at).toLocaleTimeString()
                : 'N/A'}
            </p>
            <p className="text-muted">
              {selectedKeg.seconds_since_reading
                ? `${Math.round(selectedKeg.seconds_since_reading)}s ago`
                : ''}
            </p>
          </div>
        </div>
      )}

      {consumptionData.length > 0 ? (
        <div className={styles.charts}>
          <div className={styles.chartCard}>
            <h3>Weight Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#d97706"
                  strokeWidth={2}
                  name="Weight (g)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3>Volume Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="liters" fill="#10b981" name="Liters" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className={styles.noData}>
          <p>No data available for selected time range</p>
        </div>
      )}
    </div>
  )
}
