import {
  createInitialState,
  getConversionWindow,
  recordExpertAttempted,
  recordGameEnd,
  recordHintUsed,
  recordScoreShared,
  recordSessionStart,
  recordWindowCrossings,
  pruneExpiredWindows,
  markWindowSeen,
  WINDOW_OPEN_MS,
  VP_RULES,
  WINDOWS,
} from '../src/lib/value-engine'

describe('getConversionWindow', () => {
  const unseen = { window1: false, window2: false, window3: false }
  const { threshold: T1 } = WINDOWS.window1
  const { threshold: T2 } = WINDOWS.window2
  const { threshold: T3 } = WINDOWS.window3

  it('returns null below all thresholds', () => {
    expect(getConversionWindow(0, unseen)).toBeNull()
    expect(getConversionWindow(T1 - 1, unseen)).toBeNull()
  })

  it('returns window1 at its threshold', () => {
    expect(getConversionWindow(T1, unseen)).toBe('window1')
  })

  it('returns window2 at its threshold', () => {
    expect(getConversionWindow(T2, unseen)).toBe('window2')
  })

  it('returns window3 at its threshold', () => {
    expect(getConversionWindow(T3, unseen)).toBe('window3')
  })

  it('prioritizes higher windows when multiple thresholds are crossed at once', () => {
    // PRD 3.3: a player who jumps straight past window1's threshold skips it for window2.
    expect(getConversionWindow(T2 + 5, unseen)).toBe('window2')
    expect(getConversionWindow(T3 + 20, unseen)).toBe('window3')
  })

  it('skips windows already marked as seen', () => {
    expect(getConversionWindow(T1, { window1: true, window2: false, window3: false })).toBeNull()
    expect(getConversionWindow(T3 + 20, { window1: true, window2: true, window3: false })).toBe('window3')
    expect(getConversionWindow(T3 + 20, { window1: true, window2: true, window3: true })).toBeNull()
  })
})

describe('VP scoring', () => {
  it('awards +2 VP for a completed game', () => {
    const state = createInitialState()
    const { state: next } = recordGameEnd(state, 3)
    expect(next.vp).toBe(VP_RULES.game_completed)
  })

  it('awards an additional +5 VP for beating the personal best', () => {
    const state = { ...createInitialState(), personalBest: 3 }
    const { state: next, beatPersonalBest } = recordGameEnd(state, 5)
    expect(beatPersonalBest).toBe(true)
    expect(next.vp).toBe(VP_RULES.game_completed + VP_RULES.personal_best_beaten)
    expect(next.personalBest).toBe(5)
  })

  it('does not award the personal-best bonus when the score does not beat it', () => {
    const state = { ...createInitialState(), personalBest: 10 }
    const { state: next, beatPersonalBest } = recordGameEnd(state, 5)
    expect(beatPersonalBest).toBe(false)
    expect(next.vp).toBe(VP_RULES.game_completed)
    expect(next.personalBest).toBe(10)
  })

  it('awards +1 VP per hint used', () => {
    const state = createInitialState()
    const next = recordHintUsed(state)
    expect(next.vp).toBe(VP_RULES.hint_used)
  })

  it('awards +3 VP for sharing a score', () => {
    const state = createInitialState()
    const next = recordScoreShared(state)
    expect(next.vp).toBe(VP_RULES.score_shared)
  })

  it('awards +10 VP for attempting Expert mode, only once', () => {
    const state = createInitialState()
    const once = recordExpertAttempted(state)
    expect(once.vp).toBe(VP_RULES.expert_attempted)
    const twice = recordExpertAttempted(once)
    expect(twice.vp).toBe(VP_RULES.expert_attempted)
  })

  it('awards +8 VP the first time a 3-day return streak is reached', () => {
    let state = createInitialState()
    state = recordSessionStart(state, '2026-07-20')
    state = recordSessionStart(state, '2026-07-21')
    expect(state.vp).toBe(0)
    state = recordSessionStart(state, '2026-07-22')
    expect(state.returnStreakDays).toBe(3)
    expect(state.vp).toBe(VP_RULES.return_streak_3day)
  })

  it('resets the streak when a day is skipped', () => {
    let state = createInitialState()
    state = recordSessionStart(state, '2026-07-20')
    state = recordSessionStart(state, '2026-07-22') // gap: skipped the 21st
    expect(state.returnStreakDays).toBe(1)
  })
})

describe('window expiry (PRD 3.2: window closes after 3 days)', () => {
  it('stays open for a conversion within 3 days', () => {
    let state = createInitialState()
    state = { ...state, vp: 20 }
    const crossedAt = Date.now() - (WINDOW_OPEN_MS - 1000)
    state = { ...state, windowCrossedAt: { window1: crossedAt } }
    const pruned = pruneExpiredWindows(state)
    expect(pruned.seen.window1).toBe(false)
  })

  it('closes a window that was never shown within 3 days', () => {
    let state = createInitialState()
    state = { ...state, vp: 20 }
    const crossedAt = Date.now() - (WINDOW_OPEN_MS + 1000)
    state = { ...state, windowCrossedAt: { window1: crossedAt } }
    const pruned = pruneExpiredWindows(state)
    expect(pruned.seen.window1).toBe(true)
    expect(getConversionWindow(pruned.vp, pruned.seen)).toBeNull()
  })

  it('does not touch a window that was already converted/seen', () => {
    let state = createInitialState()
    state = { ...state, vp: 20, seen: { ...state.seen, window1: true } }
    const crossedAt = Date.now() - (WINDOW_OPEN_MS + 1000)
    state = { ...state, windowCrossedAt: { window1: crossedAt } }
    const pruned = pruneExpiredWindows(state)
    expect(pruned).toEqual(state)
  })
})

describe('recordWindowCrossings', () => {
  it('stamps the crossing time only once per window', () => {
    let state = createInitialState()
    state = { ...state, vp: 20 }
    const first = recordWindowCrossings(state, 1000)
    expect(first.windowCrossedAt.window1).toBe(1000)
    const second = recordWindowCrossings(first, 2000)
    expect(second.windowCrossedAt.window1).toBe(1000)
  })
})

describe('markWindowSeen', () => {
  it('marks only the given window as seen', () => {
    const state = createInitialState()
    const next = markWindowSeen(state, 'window2')
    expect(next.seen).toEqual({ window1: false, window2: true, window3: false })
  })
})
