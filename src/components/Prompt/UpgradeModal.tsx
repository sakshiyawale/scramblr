import { useState } from 'react'
import type { Plan } from '../../lib/types'
import { PLANS } from '../../lib/value-engine'
import { PromptModal } from './PromptModal'
import { PaymentForm } from './PaymentForm'

export function UpgradeModal({
  currentPlan,
  onUpgrade,
  onDismiss,
}: {
  currentPlan: Plan
  onUpgrade: (plan: Plan) => void
  onDismiss: () => void
}) {
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)
  const [success, setSuccess] = useState<Plan | null>(null)

  if (success) {
    return (
      <PromptModal onClose={onDismiss} accent="blue">
        <div className="flex flex-col items-center gap-3 text-center py-4">
          <span className="font-head text-nyt-green text-sm animate-popin">You're upgraded! 🎉</span>
          <p className="font-body text-nyt-sub text-sm">Welcome to {PLANS[success].label}.</p>
        </div>
      </PromptModal>
    )
  }

  if (checkoutPlan) {
    return (
      <PromptModal onClose={onDismiss} accent="blue">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="font-head text-[11px] font-bold text-nyt-blue">CHECKOUT</span>
          <h3 className="font-head font-extrabold text-xl text-nyt-ink">Upgrade to {PLANS[checkoutPlan].label}</h3>
          <div className="w-full">
            <PaymentForm
              initialPlan={checkoutPlan}
              onSuccess={(plan) => {
                setSuccess(plan)
                setTimeout(() => onUpgrade(plan), 700)
              }}
            />
          </div>
        </div>
      </PromptModal>
    )
  }

  return (
    <PromptModal onClose={onDismiss} accent="blue">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-head text-[11px] font-bold text-nyt-blue">CHOOSE YOUR PLAN</span>
        <h3 className="font-head font-extrabold text-xl text-nyt-ink">Level up your game</h3>

        <div className="flex flex-col gap-3 w-full">
          {(Object.values(PLANS) as (typeof PLANS)[Plan][]).map((p) => {
            const isCurrent = p.id === currentPlan
            return (
              <div
                key={p.id}
                className={`rounded-xl border-2 p-3 text-left ${
                  isCurrent ? 'border-nyt-green bg-nyt-green/10' : 'border-nyt-line'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-head text-[12px] font-bold text-nyt-ink">{p.label}</span>
                  <span className="font-body font-bold text-nyt-gold">
                    {p.price} <span className="text-[10px] text-nyt-sub">{p.billingNote}</span>
                  </span>
                </div>
                <ul className="mt-1 text-[11px] font-body text-nyt-sub list-disc list-inside">
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                {isCurrent ? (
                  <p className="mt-2 font-head text-[10px] font-bold text-nyt-green">CURRENT PLAN</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => (p.id === 'free' ? onUpgrade('free') : setCheckoutPlan(p.id))}
                    className="mt-2 w-full font-head text-[11px] font-bold px-3 py-2 rounded-lg bg-nyt-red text-white shadow-card hover:opacity-90 transition-opacity"
                  >
                    {p.id === 'free' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </PromptModal>
  )
}
