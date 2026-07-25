import { useCallback, useEffect, useState } from 'react'
import { fetchResults, resetDemo, type ResultsResponse } from '../../lib/api'
import { VPHistogram } from './VPHistogram'
import { WindowConversion } from './WindowConversion'

const DEST_LABEL: Record<string, string> = {
  web_trial: 'Free trial (web)',
  web_subscription: 'Subscription (web)',
  app_download: 'App download',
  unknown: 'Unknown',
}

export function ExperimentStats({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchResults().then((r) => {
      setResults(r)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleReset() {
    await resetDemo()
    load()
  }

  const totalConversions = results ? Object.values(results.destinationBreakdown).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="fixed inset-0 z-40 bg-arcade-bg/98 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-arcade text-arcade-yellow text-lg sm:text-xl drop-shadow-neon">📊 ANALYTICS DASHBOARD</h2>
          <button type="button" onClick={onClose} className="font-arcade text-xs text-white/60 hover:text-white">
            ✕ CLOSE
          </button>
        </div>

        {loading || !results ? (
          <p className="font-display text-white/50 text-center py-10">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Players" value={results.totalPlayers} color="text-arcade-cyan" />
              <StatCard label="Events" value={results.totalEvents} color="text-arcade-lime" />
              <StatCard label="Conversions" value={totalConversions} color="text-arcade-pink" />
              <StatCard
                label="Window 3 App %"
                value={
                  totalConversions > 0
                    ? `${(((results.destinationBreakdown.app_download ?? 0) / totalConversions) * 100).toFixed(0)}%`
                    : '—'
                }
                color="text-arcade-purple"
              />
            </div>

            <section className="rounded-xl border-2 border-arcade-cyan/40 p-4">
              <h3 className="font-arcade text-arcade-cyan text-xs mb-3">VP DISTRIBUTION</h3>
              <VPHistogram distribution={results.vpDistribution} />
            </section>

            <section className="rounded-xl border-2 border-arcade-pink/40 p-4">
              <h3 className="font-arcade text-arcade-pink text-xs mb-3">CONVERSION RATE PER WINDOW</h3>
              <WindowConversion windowStats={results.windowStats} />
            </section>

            <div className="grid sm:grid-cols-2 gap-4">
              <section className="rounded-xl border-2 border-arcade-lime/40 p-4">
                <h3 className="font-arcade text-arcade-lime text-xs mb-3">DESTINATION BREAKDOWN</h3>
                <ul className="flex flex-col gap-2">
                  {Object.entries(results.destinationBreakdown).map(([dest, count]) => (
                    <li key={dest} className="flex justify-between font-display text-sm text-white/70">
                      <span>{DEST_LABEL[dest] ?? dest}</span>
                      <span className="text-arcade-lime font-bold">{count}</span>
                    </li>
                  ))}
                  {Object.keys(results.destinationBreakdown).length === 0 && (
                    <li className="font-display text-white/30 text-sm">No conversions yet.</li>
                  )}
                </ul>
              </section>

              <section className="rounded-xl border-2 border-arcade-orange/40 p-4">
                <h3 className="font-arcade text-arcade-orange text-xs mb-3">PLATFORM BREAKDOWN</h3>
                <ul className="flex flex-col gap-2">
                  <li className="flex justify-between font-display text-sm text-white/70">
                    <span>Desktop</span>
                    <span className="text-arcade-orange font-bold">{results.platformBreakdown.desktop}</span>
                  </li>
                  <li className="flex justify-between font-display text-sm text-white/70">
                    <span>Mobile</span>
                    <span className="text-arcade-orange font-bold">{results.platformBreakdown.mobile}</span>
                  </li>
                </ul>
              </section>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="self-center font-arcade text-[10px] px-5 py-3 rounded-xl bg-arcade-pink/20 border-2 border-arcade-pink text-arcade-pink hover:bg-arcade-pink hover:text-white transition-colors"
            >
              ↺ RESET DEMO DATA
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg bg-arcade-panel border-2 border-white/10 p-3 text-center">
      <div className="font-arcade text-[9px] text-white/40">{label}</div>
      <div className={`font-arcade text-lg ${color}`}>{value}</div>
    </div>
  )
}
