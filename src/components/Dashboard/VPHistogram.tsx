export function VPHistogram({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  const max = Math.max(1, ...entries.map(([, count]) => count))

  if (entries.length === 0) {
    return <p className="font-display text-white/40 text-sm text-center py-6">No player data yet.</p>
  }

  return (
    <div className="flex items-end gap-2 h-40 px-2">
      {entries.map(([bucket, count]) => (
        <div key={bucket} className="flex flex-col items-center gap-1 flex-1">
          <span className="font-arcade text-[9px] text-arcade-yellow">{count}</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-arcade-purple to-arcade-cyan shadow-neon"
            style={{ height: `${Math.max(6, (count / max) * 100)}%` }}
          />
          <span className="font-display text-[9px] text-white/40 rotate-0 whitespace-nowrap">{bucket}</span>
        </div>
      ))}
    </div>
  )
}
