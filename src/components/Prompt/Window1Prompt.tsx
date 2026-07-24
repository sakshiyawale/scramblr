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
    <PromptModal onClose={onDismiss} accent="blue">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-head text-[11px] font-bold text-nyt-blue">FREE TRIAL</span>
        <h3 className="font-head font-extrabold text-xl text-nyt-ink">{def.headline}</h3>
        <p className="text-nyt-sub text-xs font-body">{def.rationale}</p>

        {started ? (
          <p className="font-head text-nyt-green text-xs animate-popin">Trial started! 🎉</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
              className="font-body px-3 py-2 rounded-lg bg-white border-2 border-nyt-line text-nyt-ink placeholder-nyt-sub focus:outline-none focus:border-nyt-blue"
            />
            <button
              type="submit"
              className="font-head font-bold text-xs px-4 py-3 rounded-xl bg-nyt-blue text-white shadow-raised hover:opacity-90 transition-opacity"
            >
              {def.cta}
            </button>
          </form>
        )}

        <button type="button" onClick={onDismiss} className="text-nyt-sub text-[11px] font-body hover:text-nyt-ink">
          Maybe later
        </button>
      </div>
    </PromptModal>
  )
}
