import { useState, type FormEvent } from 'react'

export function ProfileSetup({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-arcade-panel border-4 border-arcade-cyan shadow-neon-lg p-6 flex flex-col items-center gap-5 animate-popin">
        <h1 className="font-arcade text-arcade-cyan text-lg text-center drop-shadow-neon">
          🔤 SCRAM<span className="text-arcade-pink">BLR</span>
        </h1>
        <p className="font-display text-white/60 text-sm text-center">
          Pick a name to save your scores and streaks. No signup, no password.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            maxLength={24}
            className="font-display text-center px-3 py-3 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="font-arcade text-xs px-4 py-3 rounded-xl bg-arcade-lime text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            ▶ START PLAYING
          </button>
        </form>
      </div>
    </div>
  )
}
