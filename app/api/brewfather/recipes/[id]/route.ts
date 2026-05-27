import { NextResponse } from 'next/server'

const BREWFATHER_BASE = 'https://api.brewfather.app/v1/recipes'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

const cache = new Map<string, { data: unknown; expires: number }>()

function getAuthHeader() {
  const user = process.env.BREWFATHER_USERNAME
  const key = process.env.BREWFATHER_API_KEY
  if (!user || !key) {
    throw new Error('Brewfather credentials not configured')
  }
  return `Basic ${Buffer.from(`${user}:${key}`).toString('base64')}`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hit = cache.get(id)
    if (hit && hit.expires > Date.now()) {
      return NextResponse.json(hit.data)
    }

    const auth = getAuthHeader()

    const res = await fetch(`${BREWFATHER_BASE}/${encodeURIComponent(id)}`, {
      headers: { Authorization: auth },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Brewfather API error: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    cache.set(id, { data, expires: Date.now() + CACHE_TTL_MS })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
