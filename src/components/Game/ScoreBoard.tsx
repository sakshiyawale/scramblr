import type { ValueState } from '../../lib/types'

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-arcade-panel border-2 border-white/10 min-w-[84px]">
      <span className="font-arcade text-[9px] text-white/50">{label}</span>
      <span className={`font-arcade text-lg ${color}`}>{value}</span>
    </div>
  )
}

export function ScoreBoard({ score, value }: { score: number; value: ValueState }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Stat label="SCORE" value={score} color="text-arcade-cyan" />
      <Stat label="BEST" value={value.personalBest} color="text-arcade-pink" />
      <Stat label="VP" value={value.vp} color="text-arcade-yellow" />
      <Stat label="GAMES" value={value.gamesPlayed} color="text-arcade-lime" />
    </div>
  )
}
