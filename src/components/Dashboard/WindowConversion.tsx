import type { WindowStat } from '../../lib/api'
import { WINDOWS } from '../../lib/value-engine'

const TARGETS: Record<'window1' | 'window2' | 'window3', number> = {
  window1: 0.1,
  window2: 0.2,
  window3: 0.35,
}

const COLORS: Record<'window1' | 'window2' | 'window3', string> = {
  window1: 'bg-arcade-cyan text-arcade-cyan',
  window2: 'bg-arcade-pink text-arcade-pink',
  window3: 'bg-arcade-purple text-arcade-purple',
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
          <div key={id} className="rounded-lg bg-black/30 border-2 border-white/10 p-3">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-arcade text-[10px] ${textColor}`}>{WINDOWS[id].cta}</span>
              <span className="font-display text-xs text-white/50">
                {stat?.converted ?? 0} / {stat?.shown ?? 0} shown
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden">
              <div className={`h-full ${barColor} shadow-neon`} style={{ width: `${Math.min(100, rate * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-arcade text-[9px] text-white">{(rate * 100).toFixed(1)}%</span>
              <span className={`font-display text-[10px] ${hitTarget ? 'text-arcade-lime' : 'text-white/40'}`}>
                target {(target * 100).toFixed(0)}% {hitTarget ? '✓' : ''}
              </span>
            </div>
            {stat?.avgVpAtConversion ? (
              <p className="font-display text-[10px] text-white/40 mt-1">Avg VP at conversion: {stat.avgVpAtConversion}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
