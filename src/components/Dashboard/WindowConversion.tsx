import type { WindowStat } from '../../lib/api'
import { WINDOWS } from '../../lib/value-engine'

const TARGETS: Record<'window1' | 'window2' | 'window3', number> = {
  window1: 0.1,
  window2: 0.2,
  window3: 0.35,
}

const COLORS: Record<'window1' | 'window2' | 'window3', string> = {
  window1: 'bg-nyt-blue text-nyt-blue',
  window2: 'bg-nyt-red text-nyt-red',
  window3: 'bg-nyt-plum text-nyt-plum',
}

export function WindowConversion({ windowStats }: { windowStats: Record<'window1' | 'window2' | 'window3', WindowStat> }) {
  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(WINDOWS) as ('window1' | 'window2' | 'window3')[]).map((id) => {
        const stat = windowStats[id]
        const rate = stat?.conversionRate ?? 0
        const target = TARGETS[id]
        const hitTarget = rate >= target
        const [barColor, textColor] = COLORS[id].split(' ')

        return (
          <div key={id} className="rounded-lg bg-nyt-paper border border-nyt-line p-3">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-head text-[11px] font-semibold ${textColor}`}>{WINDOWS[id].cta}</span>
              <span className="font-body text-xs text-nyt-sub">
                {stat?.converted ?? 0} / {stat?.shown ?? 0} shown
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-nyt-line/40 overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, rate * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-head text-[10px] font-semibold text-nyt-ink">{(rate * 100).toFixed(1)}%</span>
              <span className={`font-body text-[10px] ${hitTarget ? 'text-nyt-green' : 'text-nyt-sub'}`}>
                target {(target * 100).toFixed(0)}% {hitTarget ? '✓' : ''}
              </span>
            </div>
            {stat?.avgVpAtConversion ? (
              <p className="font-body text-[10px] text-nyt-sub mt-1">Avg VP at conversion: {stat.avgVpAtConversion}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
