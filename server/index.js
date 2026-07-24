import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json')

const WINDOW_DEFS = {
  window1: { threshold: 20, destination: 'web_trial' },
  window2: { threshold: 50, destination: 'web_subscription' },
  window3: { threshold: 100, destination: 'app_download' },
}
const WINDOW_OPEN_MS = 3 * 24 * 60 * 60 * 1000

function loadStore() {
  if (!fs.existsSync(DATA_FILE)) {
    return { scores: {}, events: [] }
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return { scores: {}, events: [] }
  }
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2))
}

let store = loadStore()

const app = express()
app.use(cors())
app.use(express.json())

// -- POST /api/events -- records behavioral signals and conversion events
app.post('/api/events', (req, res) => {
  const event = req.body
  if (!event || !event.userId || !event.signal) {
    return res.status(400).json({ error: 'userId and signal are required' })
  }
  store.events.push({ ...event, timestamp: event.timestamp ?? Date.now() })
  saveStore(store)
  res.status(201).json({ ok: true })
})

// -- GET/POST /api/scores/:userId -- high score and VP persistence
app.get('/api/scores/:userId', (req, res) => {
  const state = store.scores[req.params.userId]
  if (!state) return res.status(404).json({ error: 'not found' })
  res.json(state)
})

app.post('/api/scores/:userId', (req, res) => {
  store.scores[req.params.userId] = req.body
  saveStore(store)
  res.json({ ok: true })
})

// -- GET /api/windows/:userId -- returns current window eligibility and history
app.get('/api/windows/:userId', (req, res) => {
  const state = store.scores[req.params.userId]
  if (!state) return res.status(404).json({ error: 'not found' })
  const eligibility = Object.fromEntries(
    Object.entries(WINDOW_DEFS).map(([id, def]) => [
      id,
      { eligible: state.vp >= def.threshold, seen: Boolean(state.seen?.[id]) },
    ]),
  )
  res.json({ vp: state.vp, seen: state.seen, eligibility })
})

// -- GET /api/results -- conversion rate by window, platform breakdown, VP distribution
app.get('/api/results', (_req, res) => {
  const events = store.events

  const vpEvents = events.filter((e) => e.signal === 'value_points')
  const latestVpByUser = new Map()
  for (const e of vpEvents) {
    latestVpByUser.set(e.userId, Math.max(latestVpByUser.get(e.userId) ?? 0, Number(e.value) || 0))
  }
  const bucketSize = 10
  const vpDistribution = {}
  for (const vp of latestVpByUser.values()) {
    const bucket = Math.floor(vp / bucketSize) * bucketSize
    const key = `${bucket}-${bucket + bucketSize - 1}`
    vpDistribution[key] = (vpDistribution[key] ?? 0) + 1
  }

  const shown = events.filter((e) => e.signal === 'conversion_window')
  const converted = events.filter((e) => e.signal === 'converted' && e.window)

  const windowStats = {}
  for (const id of Object.keys(WINDOW_DEFS)) {
    const shownCount = shown.filter((e) => e.value === id || e.window === id).length
    const convertedForWindow = converted.filter((e) => e.window === id)
    const convertedCount = convertedForWindow.length
    const avgVp =
      convertedForWindow.length > 0
        ? convertedForWindow.reduce((sum, e) => sum + (Number(e.vp) || 0), 0) / convertedForWindow.length
        : 0
    const byPlatform = { desktop: 0, mobile: 0 }
    for (const e of convertedForWindow) {
      if (e.platform === 'mobile') byPlatform.mobile++
      else byPlatform.desktop++
    }
    windowStats[id] = {
      shown: shownCount,
      converted: convertedCount,
      conversionRate: shownCount > 0 ? convertedCount / shownCount : 0,
      avgVpAtConversion: Math.round(avgVp * 10) / 10,
      byPlatform,
    }
  }

  const destinationBreakdown = {}
  for (const e of converted) {
    destinationBreakdown[e.destination ?? 'unknown'] = (destinationBreakdown[e.destination ?? 'unknown'] ?? 0) + 1
  }

  const platformBreakdown = { desktop: 0, mobile: 0 }
  for (const e of converted) {
    if (e.platform === 'mobile') platformBreakdown.mobile++
    else platformBreakdown.desktop++
  }

  res.json({
    vpDistribution,
    windowStats,
    destinationBreakdown,
    platformBreakdown,
    totalPlayers: Object.keys(store.scores).length,
    totalEvents: events.length,
    generatedAt: Date.now(),
  })
})

// -- Reset button for demo purposes
app.post('/api/reset', (_req, res) => {
  store = { scores: {}, events: [] }
  saveStore(store)
  res.json({ ok: true })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Unscramble Race API listening on http://localhost:${PORT}`)
})
