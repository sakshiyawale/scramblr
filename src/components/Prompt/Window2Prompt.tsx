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
    <PromptModal onClose={onDismiss} accent="red">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-head text-[11px] font-bold text-nyt-red">GAMES+ SUBSCRIPTION</span>
        <h3 className="font-head font-extrabold text-xl text-nyt-ink">{def.headline}</h3>
        <p className="text-nyt-sub text-xs font-body">{def.rationale}</p>

        {success ? (
          <p className="font-head text-nyt-green text-xs animate-popin">Expert mode unlocked! 🔓</p>
        ) : (
          <div className="w-full">
            <PaymentForm
              initialPlan="games_plus_monthly"
              submitLabel={def.cta}
              onSuccess={(plan) => {
                setSuccess(plan)
                setTimeout(() => onConvert(plan), 500)
              }}
            />
          </div>
        )}

        <button type="button" onClick={onDismiss} className="text-nyt-sub text-[11px] font-body hover:text-nyt-ink">
          Not now
        </button>
      </div>
    </PromptModal>
  )
}
