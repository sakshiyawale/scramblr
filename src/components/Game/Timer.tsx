import { useEffect, useRef, useState } from 'react'

export function Timer({
  seconds,
  running,
  onExpire,
  resetKey,
}: {
  seconds: number
  running: boolean
  onExpire: () => void
  resetKey: string | number
}) {
  const [remaining, setRemaining] = useState(seconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds, resetKey])

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining])

  const pct = Math.max(0, (remaining / seconds) * 100)
  const danger = pct <= 30

  return (
    <div className="w-full">
      <div className="flex justify-between font-arcade text-[10px] text-arcade-cyan mb-1">
        <span>TIME</span>
        <span className={danger ? 'text-arcade-pink animate-flicker' : ''}>{remaining}s</span>
      </div>
      <div className="h-4 w-full rounded-full bg-black/40 border-2 border-arcade-cyan overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            danger ? 'bg-arcade-pink shadow-neon text-arcade-pink' : 'bg-arcade-lime shadow-neon text-arcade-lime'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
