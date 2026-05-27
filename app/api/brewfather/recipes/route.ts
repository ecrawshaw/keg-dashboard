import { NextResponse } from 'next/server'

const BREWFATHER_BASE = 'https://api.brewfather.app/v1/recipes'

function getAuthHeader() {
  const user = process.env.BREWFATHER_USERNAME
  const key = process.env.BREWFATHER_API_KEY
  if (!user || !key) {
    throw new Error('Brewfather credentials not configured')
  }
  return `Basic ${Buffer.from(`${user}:${key}`).toString('base64')}`
}

const MAX_PAGES = 20
const PAGE_SIZE = 50
const PAGE_TIMEOUT_MS = 15_000
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let cache: { data: unknown[]; expires: number } | null = null

async function fetchWithTimeout(url: string, auth: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS)
  try {
    return await fetch(url, {
      headers: { Authorization: auth },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.data)
  }

  try {
    const auth = getAuthHeader()
    const all: Array<{ _id: string }> = []

    for (let i = 0; i < MAX_PAGES; i++) {
      const url = new URL(BREWFATHER_BASE)
      url.searchParams.set('limit', String(PAGE_SIZE))
      url.searchParams.set('offset', String(i * PAGE_SIZE))

      const res = await fetchWithTimeout(url.toString(), auth)

      if (!res.ok) {
        return NextResponse.json(
          { error: `Brewfather API error: ${res.status}` },
          { status: res.status }
        )
      }

      const page = (await res.json()) as Array<{ _id: string }>
      console.log(`[brewfather] page ${i + 1}: got ${page.length} recipes`)

      if (page.length === 0) break
      all.push(...page)
      if (page.length < PAGE_SIZE) break
    }

    cache = { data: all, expires: Date.now() + CACHE_TTL_MS }
    return NextResponse.json(all)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[brewfather] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
