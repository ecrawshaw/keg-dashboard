'use client'

import { useEffect, useState } from 'react'
import type { Device } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import styles from './page.module.scss'

interface DeviceWithWeight extends Device {
  current_weight?: number | null
  weight_updated_at?: string | null
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceWithWeight[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDevice, setEditingDevice] = useState<DeviceWithWeight | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchDevices = async () => {
    try {
      // Fetch devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (devicesError) throw devicesError

      const devices = devicesData as Device[] | null

      // Fetch latest weight for each device
      const devicesWithWeight: DeviceWithWeight[] = await Promise.all(
        (devices || []).map(async (device) => {
          const { data: weightData } = await supabase
            .from('weight_measurements')
            .select('weight_grams, created_at')
            .eq('device_id', device.device_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const weight = weightData as { weight_grams: number; created_at: string } | null
          return {
            ...device,
            current_weight: weight?.weight_grams ?? null,
            weight_updated_at: weight?.created_at ?? null,
          }
        })
      )

      setDevices(devicesWithWeight)
    } catch (err) {
      console.error('Error fetching devices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()

    // Subscribe to real-time weight updates
    const channel = supabase
      .channel('device-weights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weight_measurements',
        },
        (payload) => {
          // Update the weight for the relevant device
          setDevices((prev) =>
            prev.map((device) =>
              device.device_id === payload.new.device_id
                ? {
                    ...device,
                    current_weight: payload.new.weight_grams,
                    weight_updated_at: payload.new.created_at,
                  }
                : device
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleEdit = (device: Device) => {
    setEditingDevice({ ...device })
  }

  const handleCancel = () => {
    setEditingDevice(null)
  }

  const handleSave = async () => {
    if (!editingDevice) return

    setSaving(true)
    try {
      const { error } = await (supabase
        .from('devices') as any)
        .update({
          name: editingDevice.name,
          calibration_factor: editingDevice.calibration_factor,
          tare_offset: editingDevice.tare_offset,
          smoothing_factor: editingDevice.smoothing_factor,
          num_readings: editingDevice.num_readings,
          reading_interval: editingDevice.reading_interval,
        })
        .eq('id', editingDevice.id)

      if (error) throw error

      setEditingDevice(null)
      fetchDevices()
    } catch (err) {
      console.error('Error saving device:', err)
      alert('Failed to save device settings')
    } finally {
      setSaving(false)
    }
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading devices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1>Device Settings</h1>
          <p className="text-muted">
            Configure your ESP32 scale devices. Changes take effect on next device boot or when you press 'F' on the device.
          </p>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className={styles.empty}>
          <h2>No Devices Found</h2>
          <p className="text-muted">
            Run the SQL in <code>supabase/devices_table.sql</code> to create the devices table and add your first device.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {devices.map((device) => (
            <div key={device.id} className={styles.deviceCard}>
              <div className={styles.deviceHeader}>
                <div>
                  <h3>{device.name}</h3>
                  <p className="text-muted">{device.device_id}</p>
                </div>
                <span className={`status ${device.is_online ? 'ok' : ''}`}>
                  {device.is_online ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className={styles.currentWeight}>
                <span className={styles.weightLabel}>Current Weight</span>
                <span className={styles.weightValue}>
                  {device.current_weight != null
                    ? `${device.current_weight.toFixed(1)} g`
                    : 'No data'}
                </span>
              </div>

              {editingDevice?.id === device.id ? (
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Name</label>
                    <input
                      type="text"
                      value={editingDevice.name}
                      onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Calibration Factor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingDevice.calibration_factor}
                      onChange={(e) => setEditingDevice({ ...editingDevice, calibration_factor: parseFloat(e.target.value) })}
                    />
                    <span className={styles.hint}>Adjust if weight readings are off</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Smoothing Factor</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="1"
                      value={editingDevice.smoothing_factor}
                      onChange={(e) => setEditingDevice({ ...editingDevice, smoothing_factor: parseFloat(e.target.value) })}
                    />
                    <span className={styles.hint}>0.1 = very smooth, 0.5 = responsive</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Samples per Reading</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editingDevice.num_readings}
                      onChange={(e) => setEditingDevice({ ...editingDevice, num_readings: parseInt(e.target.value) })}
                    />
                    <span className={styles.hint}>More samples = more stable but slower</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Reading Interval (ms)</label>
                    <input
                      type="number"
                      step="1000"
                      min="1000"
                      value={editingDevice.reading_interval}
                      onChange={(e) => setEditingDevice({ ...editingDevice, reading_interval: parseInt(e.target.value) })}
                    />
                    <span className={styles.hint}>How often to send data (1000ms = 1 second)</span>
                  </div>

                  <div className={styles.formActions}>
                    <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.deviceDetails}>
                    <div className={styles.detailRow}>
                      <span className="text-muted">Calibration:</span>
                      <span>{device.calibration_factor.toFixed(2)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className="text-muted">Smoothing:</span>
                      <span>{device.smoothing_factor}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className="text-muted">Samples:</span>
                      <span>{device.num_readings}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className="text-muted">Interval:</span>
                      <span>{device.reading_interval}ms</span>
                    </div>
                    {device.ip_address && (
                      <div className={styles.detailRow}>
                        <span className="text-muted">IP:</span>
                        <span>{device.ip_address}</span>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className="text-muted">Last seen:</span>
                      <span>{formatLastSeen(device.last_seen_at)}</span>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button className="btn btn-primary" onClick={() => handleEdit(device)}>
                      Edit Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
