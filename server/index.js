import express from 'express'
import cors from 'cors'
import { loadStore, saveStore } from './store.js'

const WINDOW_DEFS = {
  window1: { threshold: 20, destination: 'web_trial' },
  window2: { threshold: 50, destination: 'web_subscription' },
  window3: { threshold: 100, destination: 'app_download' },
}

const app = express()
app.use(cors())
app.use(express.json())

// -- POST /api/events -- records behavioral signals and conversion events
app.post('/api/events', async (req, res) => {
  const event = req.body
  if (!event || !event.userId || !event.signal) {
    return res.status(400).json({ error: 'userId and signal are required' })
  }
  const store = await loadStore()
  store.events.push({ ...event, timestamp: event.timestamp ?? Date.now() })
  await saveStore(store)
  res.status(201).json({ ok: true })
})

// -- GET/POST /api/scores/:userId -- high score and VP persistence
app.get('/api/scores/:userId', async (req, res) => {
  const store = await loadStore()
  const state = store.scores[req.params.userId]
  if (!state) return res.status(404).json({ error: 'not found' })
  res.json(state)
})

app.post('/api/scores/:userId', async (req, res) => {
  const store = await loadStore()
  store.scores[req.params.userId] = req.body
  await saveStore(store)
  res.json({ ok: true })
})

// -- GET /api/windows/:userId -- returns current window eligibility and history
app.get('/api/windows/:userId', async (req, res) => {
  const store = await loadStore()
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
app.get('/api/results', async (_req, res) => {
  const store = await loadStore()
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
app.post('/api/reset', async (_req, res) => {
  await saveStore({ scores: {}, events: [] })
  res.json({ ok: true })
})

// Vercel runs this file as a serverless function per-request and manages the
// server lifecycle itself, so only listen when running as a normal Node
// process (i.e. `npm run server` locally).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Scramblr API listening on http://localhost:${PORT}`)
  })
}

export default app
