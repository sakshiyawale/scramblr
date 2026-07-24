import type { BehavioralEvent, SignalName, WindowId, Plan } from './types'

const API_BASE = '/api'

export function detectPlatform(): 'desktop' | 'mobile' {
  if (typeof navigator === 'undefined') return 'desktop'
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
}

async function postEvent(event: Omit<BehavioralEvent, 'timestamp'>) {
  const body: BehavioralEvent = { ...event, timestamp: Date.now() }
  try {
    await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // Best-effort telemetry; game must keep working offline/without a server.
  }
}

export function trackSignal(userId: string, signal: SignalName, value: number | string | boolean) {
  return postEvent({ userId, signal, value })
}

export function trackWindowShown(userId: string, window: WindowId, platform: 'desktop' | 'mobile') {
  return postEvent({ userId, signal: 'conversion_window', value: window, window, platform })
}

export function trackConversion(
  userId: string,
  window: WindowId,
  destination: string,
  vp: number,
  platform: 'desktop' | 'mobile',
  plan?: Plan,
) {
  return postEvent({ userId, signal: 'converted', value: true, window, destination, plan, vp, platform })
}
