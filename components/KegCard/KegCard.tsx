'use client'

import { useState } from 'react'
import type { CurrentKegStatus } from '@/lib/types'
import { getSrmColor, formatAbv, formatIbu, formatVolume, formatPints, formatPercentage } from '@/lib/types'
import styles from './KegCard.module.scss'

interface KegCardProps {
  keg: CurrentKegStatus
}

export default function KegCard({ keg }: KegCardProps) {
  const [showDescription, setShowDescription] = useState(false)

  const statusClass = `status ${keg.status}`
  const srmColor = getSrmColor(keg.srm)
  const fillPercentage = keg.percentage_full

  return (
    <div className={styles.kegCard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.beerName}>{keg.beer_name || 'Unknown Beer'}</h2>
          <span className={statusClass}>{keg.status}</span>
        </div>
        {keg.brewery && (
          <p className={styles.brewery}>{keg.brewery}</p>
        )}
      </div>

      {/* Beer Specs */}
      <div className={styles.specs}>
        <div className={styles.specRow}>
          {keg.style && (
            <span className={styles.style}>{keg.style}</span>
          )}
          {keg.srm && (
            <div className={styles.srmIndicator}>
              <div
                className={styles.srmColor}
                style={{ backgroundColor: srmColor }}
                title={`SRM: ${keg.srm}`}
              />
              <span className={styles.srmValue}>SRM {keg.srm}</span>
            </div>
          )}
        </div>

        <div className={styles.specGrid}>
          {keg.abv && (
            <div className={styles.spec}>
              <span className={styles.specLabel}>ABV</span>
              <span className={styles.specValue}>{formatAbv(keg.abv)}</span>
            </div>
          )}
          {keg.ibu && (
            <div className={styles.spec}>
              <span className={styles.specLabel}>IBU</span>
              <span className={styles.specValue}>{formatIbu(keg.ibu)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fill Level Gauge */}
      <div className={styles.gauge}>
        <div className={styles.gaugeLabel}>
          <span>{formatPercentage(fillPercentage)} Full</span>
          <span className={styles.volumeLabel}>
            {formatVolume(keg.liters_remaining)} • {formatPints(keg.pints_remaining)}
          </span>
        </div>
        <div className={styles.gaugeBar}>
          <div
            className={styles.gaugeFill}
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: getStatusColor(keg.status),
            }}
          />
        </div>
        <div className={styles.gaugeLabels}>
          <span>Empty</span>
          <span>{formatVolume(keg.capacity_liters)}</span>
        </div>
      </div>

      {/* Description */}
      {keg.description && (
        <div className={styles.description}>
          <button
            className={styles.descriptionToggle}
            onClick={() => setShowDescription(!showDescription)}
          >
            {showDescription ? '▼' : '▶'} Description
          </button>
          {showDescription && (
            <p className={styles.descriptionText}>{keg.description}</p>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <span className={styles.kegName}>{keg.name}</span>
          {keg.last_reading_at && (
            <span className={styles.lastUpdate}>
              Updated {getTimeAgo(keg.last_reading_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function getStatusColor(status: CurrentKegStatus['status']): string {
  const statusColors = {
    no_data: '#94a3b8',
    empty: '#ef4444',
    low: '#f59e0b',
    ok: '#3b82f6',
    full: '#10b981',
  }
  return statusColors[status]
}
