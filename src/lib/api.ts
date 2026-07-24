import type { ValueState } from './types'

const API_BASE = '/api'

export async function fetchScores(userId: string): Promise<Partial<ValueState> | null> {
  try {
    const res = await fetch(`${API_BASE}/scores/${userId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function saveScores(userId: string, state: ValueState): Promise<void> {
  try {
    await fetch(`${API_BASE}/scores/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
  } catch {
    // Local state remains source of truth for the current session if the API is unreachable.
  }
}

export interface WindowStat {
  shown: number
  converted: number
  conversionRate: number
  avgVpAtConversion: number
  byPlatform: { desktop: number; mobile: number }
}

export interface ResultsResponse {
  vpDistribution: Record<string, number>
  windowStats: Record<'window1' | 'window2' | 'window3', WindowStat>
  destinationBreakdown: Record<string, number>
  platformBreakdown: { desktop: number; mobile: number }
  totalPlayers: number
  totalEvents: number
  generatedAt: number
}

export async function fetchResults(): Promise<ResultsResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/results`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function resetDemo(): Promise<void> {
  try {
    await fetch(`${API_BASE}/reset`, { method: 'POST' })
  } catch {
    // no-op if API is unreachable
  }
}
