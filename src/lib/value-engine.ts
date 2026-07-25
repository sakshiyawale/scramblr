import type { Plan, ValueState, WindowDefinition, WindowHistory, WindowId } from './types'

export const VP_RULES = {
  game_completed: 2,
  personal_best_beaten: 5,
  return_streak_3day: 8,
  hint_used: 1,
  expert_attempted: 10,
  score_shared: 3,
} as const

export const WINDOWS: Record<WindowId, WindowDefinition> = {
  window1: {
    id: 'window1',
    threshold: 10,
    headline: "You've played a few games free. Want unlimited?",
    cta: 'Try Games+ Free',
    destination: 'web_trial',
    rationale: 'Low-commitment ask, free trial lowers the barrier.',
  },
  window2: {
    id: 'window2',
    threshold: 25,
    headline: "You're clearly a word person. Games+ was made for you.",
    cta: 'Unlock Expert Mode',
    destination: 'web_subscription',
    rationale: 'Player has demonstrated real skill; Expert mode is a genuine unlock.',
  },
  window3: {
    id: 'window3',
    threshold: 50,
    headline: "You've beaten your personal best multiple times. You're leaving Expert mode on the table.",
    cta: 'Get the App',
    destination: 'app_download',
    rationale: 'Power users are the most likely to download the app.',
  },
}

export const WINDOW_ORDER: WindowId[] = ['window3', 'window2', 'window1']

/** 3-day open window per PRD 3.2 -- kept here so callers can filter "closed" windows. */
export const WINDOW_OPEN_MS = 3 * 24 * 60 * 60 * 1000

export interface PlanDetails {
  id: Plan
  label: string
  price: string
  billingNote: string
  perks: string[]
}

export const PLANS: Record<Plan, PlanDetails> = {
  free: {
    id: 'free',
    label: 'Free',
    price: '$0',
    billingNote: 'forever',
    perks: ['Easy / Medium / Hard tiers', 'Daily best tracking', 'Score sharing'],
  },
  games_plus_monthly: {
    id: 'games_plus_monthly',
    label: 'Games+ Monthly',
    price: '$5.99',
    billingNote: 'per month',
    perks: ['Everything in Free', 'Expert tier unlocked', 'No ads', 'Cancel anytime'],
  },
  games_plus_annual: {
    id: 'games_plus_annual',
    label: 'Games+ Annual',
    price: '$49.99',
    billingNote: 'per year (save 30%)',
    perks: ['Everything in Monthly', 'Best value', 'Priority new word packs'],
  },
}

export function createInitialState(): ValueState {
  return {
    vp: 0,
    seen: { window1: false, window2: false, window3: false },
    windowCrossedAt: {},
    personalBest: 0,
    gamesPlayed: 0,
    returnStreakDays: 1,
    lastPlayedDate: null,
    expertAttempted: false,
    plan: 'free',
  }
}

/** Advances the day-over-day return streak based on today's date vs. the last recorded session. */
export function recordSessionStart(state: ValueState, today: string): ValueState {
  if (state.lastPlayedDate === today) return state
  const yesterday = new Date(new Date(`${today}T00:00:00Z`).getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const nextStreak = state.lastPlayedDate === yesterday ? state.returnStreakDays + 1 : 1
  return recordReturnStreak({ ...state, lastPlayedDate: today }, nextStreak)
}

/** Stamps the moment each threshold is first crossed, so the 3-day window can later expire. */
export function recordWindowCrossings(state: ValueState, now: number = Date.now()): ValueState {
  let crossedAt = state.windowCrossedAt
  let changed = false
  for (const id of WINDOW_ORDER) {
    const def = WINDOWS[id]
    if (state.vp >= def.threshold && !state.seen[id] && crossedAt[id] === undefined) {
      if (!changed) crossedAt = { ...crossedAt }
      crossedAt[id] = now
      changed = true
    }
  }
  return changed ? { ...state, windowCrossedAt: crossedAt } : state
}

/** Closes any window whose 3-day open period (PRD 3.2) has elapsed without being shown/converted. */
export function pruneExpiredWindows(state: ValueState, now: number = Date.now()): ValueState {
  let seen = state.seen
  let changed = false
  for (const id of WINDOW_ORDER) {
    const crossedAt = state.windowCrossedAt[id]
    if (crossedAt !== undefined && !state.seen[id] && now - crossedAt > WINDOW_OPEN_MS) {
      if (!changed) seen = { ...seen }
      seen[id] = true
      changed = true
    }
  }
  return changed ? { ...state, seen } : state
}

/**
 * Higher windows take priority: a player who jumps from 15 VP to 55 VP in one
 * session skips Window 1 and goes straight to Window 2 (PRD 3.3).
 */
export function getConversionWindow(vp: number, seen: WindowHistory): WindowId | null {
  for (const id of WINDOW_ORDER) {
    const def = WINDOWS[id]
    if (vp >= def.threshold && !seen[id]) return id
  }
  return null
}

export function addVp(state: ValueState, delta: number): ValueState {
  return { ...state, vp: state.vp + delta }
}

export function markWindowSeen(state: ValueState, window: WindowId): ValueState {
  return { ...state, seen: { ...state.seen, [window]: true } }
}

export function recordGameEnd(
  state: ValueState,
  finalScore: number,
): { state: ValueState; beatPersonalBest: boolean } {
  const hadPriorBest = state.personalBest > 0
  const isNewBest = finalScore > state.personalBest
  const beatPersonalBest = hadPriorBest && isNewBest
  let next = addVp(state, VP_RULES.game_completed)
  if (beatPersonalBest) {
    next = addVp(next, VP_RULES.personal_best_beaten)
  }
  if (isNewBest) {
    next = { ...next, personalBest: finalScore }
  }
  next = { ...next, gamesPlayed: next.gamesPlayed + 1 }
  return { state: next, beatPersonalBest }
}

export function recordHintUsed(state: ValueState): ValueState {
  return addVp(state, VP_RULES.hint_used)
}

export function recordScoreShared(state: ValueState): ValueState {
  return addVp(state, VP_RULES.score_shared)
}

export function recordExpertAttempted(state: ValueState): ValueState {
  if (state.expertAttempted) return state
  return { ...addVp(state, VP_RULES.expert_attempted), expertAttempted: true }
}

export function recordReturnStreak(state: ValueState, streakDays: number): ValueState {
  const crossed3Day = streakDays >= 3 && state.returnStreakDays < 3
  const next = { ...state, returnStreakDays: streakDays }
  return crossed3Day ? addVp(next, VP_RULES.return_streak_3day) : next
}
