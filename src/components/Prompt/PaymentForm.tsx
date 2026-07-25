import { useState, type FormEvent } from 'react'
import type { Plan } from '../../lib/types'
import { PLANS } from '../../lib/value-engine'

const PAYABLE_PLANS: Plan[] = ['games_plus_monthly', 'games_plus_annual']

/**
 * Simulated checkout only -- PRD marks real payment processing out of scope for v1.
 * No card data leaves the browser; this exists purely to demo the "ask payment
 * depending on plan" flow before granting the upgrade.
 */
export function PaymentForm({
  initialPlan = 'games_plus_monthly',
  onSuccess,
  submitLabel,
}: {
  initialPlan?: Plan
  onSuccess: (plan: Plan) => void
  submitLabel?: string
}) {
  const [plan, setPlan] = useState<Plan>(initialPlan)
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const details = PLANS[plan]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = card.replace(/\s/g, '')
    if (digits.length !== 16 || !/^\d+$/.test(digits)) {
      setError('Enter a 16-digit card number.')
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Expiry must be MM/YY.')
      return
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVC must be 3-4 digits.')
      return
    }
    setError(null)
    setSubmitting(true)
    // Simulated processing delay -- no real payment gateway in v1.
    setTimeout(() => {
      setSubmitting(false)
      onSuccess(plan)
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        {PAYABLE_PLANS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            className={`flex-1 rounded-lg border-2 px-2 py-2 text-left transition-colors ${
              plan === p ? 'border-arcade-yellow bg-arcade-yellow/10' : 'border-white/15 hover:border-white/30'
            }`}
          >
            <div className="font-arcade text-[9px] text-white/80">{PLANS[p].label}</div>
            <div className="font-display font-bold text-arcade-yellow text-sm">
              {PLANS[p].price} <span className="text-[10px] text-white/50">{PLANS[p].billingNote}</span>
            </div>
          </button>
        ))}
      </div>

      <ul className="text-[11px] font-display text-white/60 list-disc list-inside">
        {details.perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>

      <input
        value={card}
        onChange={(e) => setCard(e.target.value)}
        placeholder="Card number"
        inputMode="numeric"
        maxLength={19}
        className="font-display px-3 py-2 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
      />
      <div className="flex gap-2">
        <input
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          placeholder="MM/YY"
          maxLength={5}
          className="font-display flex-1 px-3 py-2 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
        />
        <input
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          placeholder="CVC"
          inputMode="numeric"
          maxLength={4}
          className="font-display flex-1 px-3 py-2 rounded-lg bg-black/40 border-2 border-arcade-cyan text-white placeholder-white/30 focus:outline-none focus:shadow-neon"
        />
      </div>

      {error && <p className="text-arcade-pink text-xs font-display">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="font-arcade text-xs px-4 py-3 rounded-xl bg-arcade-lime text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
      >
        {submitting ? 'PROCESSING…' : submitLabel ?? `PAY ${details.price} ${details.billingNote.toUpperCase()}`}
      </button>
      <p className="text-[10px] text-white/30 font-display text-center">
        Demo checkout -- no real payment is processed.
      </p>
    </form>
  )
}
