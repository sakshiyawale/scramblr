import { useState } from 'react'
import type { Plan } from '../../lib/types'
import { WINDOWS } from '../../lib/value-engine'
import { PromptModal } from './PromptModal'
import { PaymentForm } from './PaymentForm'

export function Window2Prompt({
  onConvert,
  onDismiss,
}: {
  onConvert: (plan: Plan) => void
  onDismiss: () => void
}) {
  const def = WINDOWS.window2
  const [success, setSuccess] = useState<Plan | null>(null)

  return (
    <PromptModal onClose={onDismiss} accent="pink">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-arcade text-[10px] text-arcade-pink">GAMES+ SUBSCRIPTION</span>
        <h3 className="font-display font-extrabold text-xl text-white">{def.headline}</h3>
        <p className="text-white/50 text-xs font-display">{def.rationale}</p>

        {success ? (
          <p className="font-arcade text-arcade-lime text-xs animate-popin">EXPERT MODE UNLOCKED! 🔓</p>
        ) : (
          <div className="w-full">
            <PaymentForm
              initialPlan="games_plus_monthly"
              submitLabel={def.cta.toUpperCase()}
              onSuccess={(plan) => {
                setSuccess(plan)
                setTimeout(() => onConvert(plan), 500)
              }}
            />
          </div>
        )}

        <button type="button" onClick={onDismiss} className="text-white/30 text-[11px] font-display hover:text-white/60">
          Not now
        </button>
      </div>
    </PromptModal>
  )
}
