import { useState, type FormEvent } from 'react'
import { WINDOWS } from '../../lib/value-engine'
import { PromptModal } from './PromptModal'

export function Window1Prompt({ onConvert, onDismiss }: { onConvert: () => void; onDismiss: () => void }) {
  const def = WINDOWS.window1
  const [email, setEmail] = useState('')
  const [started, setStarted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setStarted(true)
    setTimeout(onConvert, 500)
  }

  return (
    <PromptModal onClose={onDismiss} accent="cyan">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-arcade text-[10px] text-arcade-cyan">FREE TRIAL</span>
        <h3 className="font-display font-extrabold text-xl text-white">{def.headline}</h3>
        <p className="text-white/50 text-xs font-display">{def.rationale}</p>

        {started ? (
          <p className="font-arcade text-arcade-lime text-xs animate-popin">TRIAL STARTED! 🎉</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
              className="font-display px-3 py-2 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
            />
            <button
              type="submit"
              className="font-arcade text-xs px-4 py-3 rounded-xl bg-arcade-cyan text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
            >
              {def.cta}
            </button>
          </form>
        )}

        <button type="button" onClick={onDismiss} className="text-white/30 text-[11px] font-display hover:text-white/60">
          Maybe later
        </button>
      </div>
    </PromptModal>
  )
}
