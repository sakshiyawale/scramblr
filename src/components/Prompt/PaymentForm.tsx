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
              plan === p ? 'border-nyt-gold bg-nyt-gold/10' : 'border-nyt-line hover:border-nyt-sub'
            }`}
          >
            <div className="font-head text-[10px] font-semibold text-nyt-ink">{PLANS[p].label}</div>
            <div className="font-body font-bold text-nyt-gold text-sm">
              {PLANS[p].price} <span className="text-[10px] text-nyt-sub">{PLANS[p].billingNote}</span>
            </div>
          </button>
        ))}
      </div>

      <ul className="text-[11px] font-body text-nyt-sub list-disc list-inside">
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
        className="font-body px-3 py-2 rounded-lg bg-white border-2 border-nyt-line text-nyt-ink placeholder-nyt-sub focus:outline-none focus:border-nyt-blue"
      />
      <div className="flex gap-2">
        <input
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          placeholder="MM/YY"
          maxLength={5}
          className="font-body flex-1 px-3 py-2 rounded-lg bg-white border-2 border-nyt-line text-nyt-ink placeholder-nyt-sub focus:outline-none focus:border-nyt-blue"
        />
        <input
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          placeholder="CVC"
          inputMode="numeric"
          maxLength={4}
          className="font-body flex-1 px-3 py-2 rounded-lg bg-white border-2 border-nyt-line text-nyt-ink placeholder-nyt-sub focus:outline-none focus:border-nyt-blue"
        />
      </div>

      {error && <p className="text-nyt-red text-xs font-body">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="font-head font-bold text-xs px-4 py-3 rounded-xl bg-nyt-green text-white shadow-raised hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? 'Processing…' : submitLabel ?? `Pay ${details.price} ${details.billingNote}`}
      </button>
      <p className="text-[10px] text-nyt-sub font-body text-center">
        Demo checkout -- no real payment is processed.
      </p>
    </form>
  )
}
