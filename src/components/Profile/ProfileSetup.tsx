import { useState, type FormEvent } from 'react'

export function ProfileSetup({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, pin: string) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a name.')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.')
      return
    }
    onCreate(trimmed, pin)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-arcade-panel border-4 border-arcade-cyan shadow-neon-lg p-6 flex flex-col items-center gap-5 animate-popin">
        <h1 className="font-arcade text-arcade-cyan text-lg text-center drop-shadow-neon">
          🔤 SCRAM<span className="text-arcade-pink">BLR</span>
        </h1>
        <p className="font-display text-white/60 text-sm text-center">
          Pick a name and a 4-digit PIN to protect your scores. No signup, no password.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder="Your name"
            autoFocus
            maxLength={24}
            className="font-display text-center px-3 py-3 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
          />
          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError(null)
            }}
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit PIN"
            className="font-display text-center tracking-[0.5em] px-3 py-3 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
          />
          {error && <p className="text-arcade-pink text-xs font-display text-center">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || pin.length !== 4}
            className="font-arcade text-xs px-4 py-3 rounded-xl bg-arcade-lime text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            ▶ START PLAYING
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-white/40 text-xs font-display hover:text-white/70 text-center"
            >
              Back to profiles
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
