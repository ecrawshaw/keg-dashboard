import { getSrmColor } from '@/lib/types'

interface BeerGlassProps {
  srm: number | null
  size?: number
}

export default function BeerGlass({ srm, size = 80 }: BeerGlassProps) {
  const beerColor = getSrmColor(srm)
  const foamColor = '#fdf6e3'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={srm ? `Beer glass, SRM ${srm}` : 'Beer glass'}
    >
      <defs>
        <linearGradient id={`beer-${srm ?? 'none'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={beerColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={beerColor} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Glass outline (pint glass shape) */}
      <path
        d="M 22 15 L 30 110 L 70 110 L 78 15 Z"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Beer fill */}
      <path
        d="M 23.5 25 L 31 108.5 L 69 108.5 L 76.5 25 Z"
        fill={`url(#beer-${srm ?? 'none'})`}
      />

      {/* Foam head */}
      <ellipse cx="50" cy="22" rx="27" ry="6" fill={foamColor} />
      <ellipse cx="40" cy="18" rx="6" ry="3" fill={foamColor} opacity="0.9" />
      <ellipse cx="58" cy="20" rx="5" ry="2.5" fill={foamColor} opacity="0.9" />
      <ellipse cx="50" cy="16" rx="5" ry="2.5" fill={foamColor} opacity="0.85" />

      {/* Glass shine */}
      <path
        d="M 28 30 L 33 100"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
