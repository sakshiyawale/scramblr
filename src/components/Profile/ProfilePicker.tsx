import { useState } from 'react'
import { initialsFor, verifyPin, type Profile } from '../../lib/profile'
import { ProfileSetup } from './ProfileSetup'

export function ProfilePicker({
  profiles,
  onUnlock,
  onCreate,
  onDelete,
}: {
  profiles: Profile[]
  onUnlock: (profile: Profile) => void
  onCreate: (name: string, pin: string) => void
  onDelete: (id: string) => void
}) {
  const [creating, setCreating] = useState(profiles.length === 0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selected = profiles.find((p) => p.id === selectedId) ?? null

  function selectProfile(p: Profile) {
    setSelectedId(p.id)
    setPin('')
    setError(null)
  }

  function handleUnlock() {
    if (!selected) return
    if (verifyPin(selected, pin)) {
      onUnlock(selected)
    } else {
      setError('Incorrect PIN.')
    }
  }

  function handleDelete() {
    if (!selected) return
    if (!verifyPin(selected, pin)) {
      setError('Enter the correct PIN to delete this profile.')
      return
    }
    if (window.confirm(`Delete profile "${selected.name}"? This cannot be undone.`)) {
      onDelete(selected.id)
      setSelectedId(null)
      setPin('')
    }
  }

  if (creating) {
    return (
      <ProfileSetup
        onCreate={(name, newPin) => {
          onCreate(name, newPin)
          setCreating(false)
        }}
        onCancel={profiles.length > 0 ? () => setCreating(false) : undefined}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-arcade-panel border-4 border-arcade-cyan shadow-neon-lg p-6 flex flex-col items-center gap-5 animate-popin">
        <h1 className="font-arcade text-arcade-cyan text-lg text-center drop-shadow-neon">
          🔤 SCRAM<span className="text-arcade-pink">BLR</span>
        </h1>
        <p className="font-display text-white/60 text-sm text-center">Choose your profile</p>

        <div className="flex flex-col gap-2 w-full">
          {profiles.map((p) => (
            <div key={p.id}>
              <button
                type="button"
                onClick={() => selectProfile(p)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-colors ${
                  selectedId === p.id ? 'border-arcade-cyan bg-black/30' : 'border-white/15 hover:border-white/30'
                }`}
              >
                <span className="grid place-items-center w-8 h-8 rounded-full bg-arcade-cyan text-arcade-bg text-xs font-arcade shrink-0">
                  {initialsFor(p.name)}
                </span>
                <span className="font-display text-white/90">{p.name}</span>
              </button>

              {selectedId === p.id && (
                <div className="mt-2 flex flex-col gap-2 px-1">
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
                    autoFocus
                    className="font-display text-center tracking-[0.5em] px-3 py-2 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
                  />
                  {error && <p className="text-arcade-pink text-xs font-display text-center">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUnlock}
                      disabled={pin.length !== 4}
                      className="flex-1 font-arcade text-[10px] px-3 py-2 rounded-lg bg-arcade-lime text-arcade-bg shadow-neon disabled:opacity-40"
                    >
                      ▶ UNLOCK
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={pin.length !== 4}
                      className="font-arcade text-[10px] px-3 py-2 rounded-lg border-2 border-arcade-pink text-arcade-pink hover:bg-arcade-pink hover:text-white transition-colors disabled:opacity-40"
                    >
                      🗑 DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="font-arcade text-[10px] px-4 py-3 rounded-xl border-2 border-arcade-lime text-arcade-lime hover:bg-arcade-lime hover:text-arcade-bg transition-colors w-full"
        >
          + NEW PROFILE
        </button>
      </div>
    </div>
  )
}
