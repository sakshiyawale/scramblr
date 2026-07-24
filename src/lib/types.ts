export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type WindowId = 'window1' | 'window2' | 'window3'

export type Plan = 'free' | 'games_plus_monthly' | 'games_plus_annual'

export type Platform = 'desktop' | 'mobile'

export interface WindowHistory {
  window1: boolean
  window2: boolean
  window3: boolean
}

export interface WindowDefinition {
  id: WindowId
  threshold: number
  headline: string
  cta: string
  destination: 'web_trial' | 'web_subscription' | 'app_download'
  rationale: string
}

export interface ValueState {
  vp: number
  seen: WindowHistory
  /** Timestamp a window's VP threshold was first crossed; used to close the window after 3 days (PRD 3.2). */
  windowCrossedAt: Partial<Record<WindowId, number>>
  personalBest: number
  gamesPlayed: number
  returnStreakDays: number
  /** ISO date (YYYY-MM-DD) of the last session, used to compute the return streak across days. */
  lastPlayedDate: string | null
  expertAttempted: boolean
  plan: Plan
}

export type SignalName =
  | 'value_points'
  | 'personal_best'
  | 'current_score'
  | 'return_streak_days'
  | 'games_played'
  | 'expert_attempted'
  | 'platform'
  | 'conversion_window'
  | 'converted'

export interface BehavioralEvent {
  userId: string
  signal: SignalName
  value: number | string | boolean
  timestamp: number
  window?: WindowId
  destination?: string
  plan?: Plan
  vp?: number
  platform?: Platform
}
