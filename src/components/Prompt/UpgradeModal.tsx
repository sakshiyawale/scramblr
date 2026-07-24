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
      <PromptModal onClose={onDismiss} accent="cyan">
        <div className="flex flex-col items-center gap-3 text-center py-4">
          <span className="font-arcade text-arcade-lime text-sm animate-popin">YOU'RE UPGRADED! 🎉</span>
          <p className="font-display text-white/60 text-sm">Welcome to {PLANS[success].label}.</p>
        </div>
      </PromptModal>
    )
  }

  if (checkoutPlan) {
    return (
      <PromptModal onClose={onDismiss} accent="cyan">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="font-arcade text-[10px] text-arcade-cyan">CHECKOUT</span>
          <h3 className="font-display font-extrabold text-xl text-white">Upgrade to {PLANS[checkoutPlan].label}</h3>
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
    <PromptModal onClose={onDismiss} accent="cyan">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-arcade text-[10px] text-arcade-cyan">CHOOSE YOUR PLAN</span>
        <h3 className="font-display font-extrabold text-xl text-white">Level up your game</h3>

        <div className="flex flex-col gap-3 w-full">
          {(Object.values(PLANS) as (typeof PLANS)[Plan][]).map((p) => {
            const isCurrent = p.id === currentPlan
            return (
              <div
                key={p.id}
                className={`rounded-xl border-2 p-3 text-left ${
                  isCurrent ? 'border-arcade-lime bg-arcade-lime/10' : 'border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-arcade text-[11px] text-white">{p.label}</span>
                  <span className="font-display font-bold text-arcade-yellow">
                    {p.price} <span className="text-[10px] text-white/50">{p.billingNote}</span>
                  </span>
                </div>
                <ul className="mt-1 text-[11px] font-display text-white/50 list-disc list-inside">
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                {isCurrent ? (
                  <p className="mt-2 font-arcade text-[9px] text-arcade-lime">CURRENT PLAN</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => (p.id === 'free' ? onUpgrade('free') : setCheckoutPlan(p.id))}
                    className="mt-2 w-full font-arcade text-[10px] px-3 py-2 rounded-lg bg-arcade-pink text-white shadow-neon hover:scale-105 active:scale-95 transition-transform"
                  >
                    {p.id === 'free' ? 'DOWNGRADE' : 'UPGRADE'}
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
