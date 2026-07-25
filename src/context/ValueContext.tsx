import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Plan, ValueState, WindowId } from '../lib/types'
import {
  createInitialState,
  getConversionWindow,
  markWindowSeen,
  pruneExpiredWindows,
  recordExpertAttempted,
  recordGameEnd,
  recordHintUsed,
  recordScoreShared,
  recordSessionStart,
  recordWindowCrossings,
  WINDOWS,
} from '../lib/value-engine'
import { fetchScores, saveScores } from '../lib/api'
import { detectPlatform, trackConversion, trackSignal, trackWindowShown } from '../lib/signals'

interface ValueContextShape {
  value: ValueState
  activeWindow: WindowId | null
  dismissActiveWindow: () => void
  onGameEnd: (finalScore: number) => void
  onHintUsed: () => void
  onScoreShared: () => void
  onExpertAttempted: () => void
  convert: (window: WindowId, plan?: Plan) => void
  upgradePlan: (plan: Plan) => void
  resetAll: () => void
}

const ValueContext = createContext<ValueContextShape | null>(null)

/** Runs threshold-crossing bookkeeping and opens a prompt if a window is eligible. */
function settleWindow(userId: string, state: ValueState, setActiveWindow: (w: WindowId | null) => void): ValueState {
  const now = Date.now()
  let next = recordWindowCrossings(state, now)
  next = pruneExpiredWindows(next, now)
  const win = getConversionWindow(next.vp, next.seen)
  if (win) {
    setActiveWindow(win)
    trackWindowShown(userId, win, detectPlatform())
  }
  return next
}

export function ValueProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [value, setValue] = useState<ValueState>(createInitialState)
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    fetchScores(userId).then((saved) => {
      const today = new Date().toISOString().slice(0, 10)
      setValue((prev) => {
        const merged: ValueState = saved ? { ...prev, ...saved } : prev
        const withStreak = recordSessionStart(merged, today)
        return settleWindow(userId, withStreak, setActiveWindow)
      })
      setHydrated(true)
    })
    trackSignal(userId, 'platform', detectPlatform())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveScores(userId, value)
    trackSignal(userId, 'value_points', value.vp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hydrated])

  const onGameEnd = useCallback(
    (finalScore: number) => {
      setValue((prev) => {
        const { state } = recordGameEnd(prev, finalScore)
        trackSignal(userId, 'personal_best', state.personalBest)
        trackSignal(userId, 'games_played', state.gamesPlayed)
        return settleWindow(userId, state, setActiveWindow)
      })
    },
    [userId],
  )

  const onHintUsed = useCallback(() => {
    setValue((prev) => recordHintUsed(prev))
  }, [])

  const onScoreShared = useCallback(() => {
    setValue((prev) => recordScoreShared(prev))
  }, [])

  const onExpertAttempted = useCallback(() => {
    setValue((prev) => {
      const state = recordExpertAttempted(prev)
      trackSignal(userId, 'expert_attempted', true)
      return settleWindow(userId, state, setActiveWindow)
    })
  }, [userId])

  const dismissActiveWindow = useCallback(() => {
    if (activeWindow) {
      setValue((prev) => markWindowSeen(prev, activeWindow))
    }
    setActiveWindow(null)
  }, [activeWindow])

  const convert = useCallback(
    (window: WindowId, plan?: Plan) => {
      const destination = WINDOWS[window].destination
      trackConversion(userId, window, destination, value.vp, detectPlatform(), plan)
      setValue((prev) => {
        const withSeen = markWindowSeen(prev, window)
        return plan ? { ...withSeen, plan } : withSeen
      })
      setActiveWindow(null)
    },
    [value.vp, userId],
  )

  const upgradePlan = useCallback(
    (plan: Plan) => {
      trackSignal(userId, 'converted', plan)
      setValue((prev) => ({ ...prev, plan }))
    },
    [userId],
  )

  const resetAll = useCallback(() => {
    setValue(createInitialState())
    setActiveWindow(null)
  }, [])

  const ctx = useMemo<ValueContextShape>(
    () => ({
      value,
      activeWindow,
      dismissActiveWindow,
      onGameEnd,
      onHintUsed,
      onScoreShared,
      onExpertAttempted,
      convert,
      upgradePlan,
      resetAll,
    }),
    [value, activeWindow, dismissActiveWindow, onGameEnd, onHintUsed, onScoreShared, onExpertAttempted, convert, upgradePlan, resetAll],
  )

  return <ValueContext.Provider value={ctx}>{children}</ValueContext.Provider>
}

export function useValue(): ValueContextShape {
  const ctx = useContext(ValueContext)
  if (!ctx) throw new Error('useValue must be used within a ValueProvider')
  return ctx
}
